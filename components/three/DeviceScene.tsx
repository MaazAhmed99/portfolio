"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Laptop + tablet rendered from primitives — no GLTF, no external asset fetch.
 *
 * SIZING: the rig auto-fits by projecting its real bounding box through the
 * camera. Earlier versions computed a flat 2D bounding box and scaled from
 * that, which kept clipping: the laptop's keyboard deck extends ~2 units
 * toward the camera, and perspective magnifies that by cameraZ/(cameraZ - z)
 * — roughly 1.45x — so the on-screen size was always larger than the maths
 * predicted. Projecting to NDC accounts for perspective exactly.
 */

export type FitInfo = {
  /** Final scale applied to the rig. */
  scale: number;
  /** Worst projected NDC magnitude after fitting; must be <= NDC_MARGIN. */
  ndc: number;
  /** Stage size in world units. */
  vw: number;
  vh: number;
};

type Props = {
  slugs: string[];
  index: number;
  progress: number;
  active: boolean;
  /** Dev instrumentation: reports the computed fit so it can be verified. */
  onFit?: (info: FitInfo) => void;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Laptop: thin-bezel lid around a 16:10 panel, MacBook-style proportions.
const LAPTOP_W = 3.36;
const LID_H = 2.2;
const LID_T = 0.045;
const LID_TILT = 0.22; // radians past vertical, about a 103° opening
const LAPTOP_SCREEN_W = 3.16;
const LAPTOP_SCREEN_H = 1.975; // 16:10
const BASE_D = 2.3;
const BASE_T = 0.085;

// Tablet: held in landscape, 16:10 panel, even bezels. Landscape because the
// screenshots are desktop captures; see scripts/make-textures.mjs.
const TABLET_W = 2.06;
const TABLET_H = 1.36;
const TABLET_T = 0.05;
const TABLET_SCREEN_W = 1.9;
const TABLET_SCREEN_H = 1.1875; // 16:10

// Keyboard, in key units (u). Rows sum to 14.5u like a real laptop layout.
const KEY_U = 0.195;
const KEY_GAP = 0.03;
const KEY_H = 0.012;
const KEY_ROWS: { d: number; keys: number[] }[] = [
  { d: 0.5, keys: Array(14).fill(14.5 / 14) },
  { d: 1, keys: [...Array(13).fill(1), 1.5] },
  { d: 1, keys: [1.5, ...Array(13).fill(1)] },
  { d: 1, keys: [1.75, ...Array(11).fill(1), 1.75] },
  { d: 1, keys: [2.25, ...Array(10).fill(1), 2.25] },
  { d: 1, keys: [1, 1, 1, 1.25, 5, 1.25, 1, 1, 1, 1] },
];
const KB_W = 14.5 * KEY_U;
const KB_D = KEY_ROWS.reduce((sum, r) => sum + r.d, 0) * KEY_U;
const KB_Z = 0.17; // distance of the keyboard's back edge from the hinge

// Metal takes its colour from what it reflects multiplied by this albedo, so a
// "space grey" body needs a mid grey here — a dark value renders near-black.
const ALUMINIUM = { color: "#9aa0a9", metalness: 0.85, roughness: 0.32 };

/**
 * The whole rig leans toward the camera by this much. The fit pushes the rig
 * up into the top of the stage (the copy owns the bottom band), which puts the
 * keyboard deck above eye level — without the lean you see the base from
 * underneath. The lid tilt and the tablet tilt cancel it so both screens
 * still face the viewer.
 */
const RIG_TILT = 0.16;
const GLASS = { color: "#050608", metalness: 0.3, roughness: 0.12 };

/** Rotation extremes the fit must survive, matching the scroll sweep. */
const ROT_SAMPLES = [-0.24, 0, 0.24];

/**
 * NDC bounds the rig must fit inside. Asymmetric on purpose: the copy strip is
 * overlaid across the bottom of the stage, so the rig is allowed to run almost
 * to the top edge but must stay clear of the lower band. Being able to use the
 * top 96% instead of a symmetric 90% is most of the size win.
 */
const NDC_X = 0.97;
const NDC_TOP = 0.97;
const NDC_BOTTOM = 0.46;

/** Rounded rectangle centred on the origin, with true circular corners. */
function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/**
 * Flat rounded rectangle. ShapeGeometry's UVs are raw shape coordinates, so
 * they are remapped to 0..1 or a texture would tile instead of fitting.
 */
function roundedPlane(w: number, h: number, r: number): THREE.ShapeGeometry {
  const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 12);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  }
  uv.needsUpdate = true;
  return geo;
}

/**
 * Device body: a rounded slab with softened edges, `depth` thick along z and
 * centred on the origin. RoundedBox can't do this — its corner radius is
 * capped at half the thickness, which makes a thin device look boxy.
 */
function roundedSlab(
  w: number,
  h: number,
  r: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const bevel = Math.min(depth * 0.3, r * 0.5);
  const geo = new THREE.ExtrudeGeometry(
    roundedRectShape(w - bevel * 2, h - bevel * 2, r - bevel),
    {
      depth: depth - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 4,
      curveSegments: 16,
    },
  );
  geo.center();
  return geo;
}

/** Faint diagonal reflection, drawn once, laid over each screen. */
function useGlareTexture(): THREE.Texture | null {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, "rgba(255,255,255,0.09)");
    grad.addColorStop(0.38, "rgba(255,255,255,0.025)");
    grad.addColorStop(0.39, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

function Screen({
  textures,
  index,
  geometry,
  glare,
}: {
  textures: THREE.Texture[];
  index: number;
  geometry: THREE.BufferGeometry;
  glare: THREE.Texture | null;
}) {
  const frontRef = useRef<THREE.MeshBasicMaterial>(null);
  const backRef = useRef<THREE.MeshBasicMaterial>(null);
  const prevIndex = useRef(index);
  const mix = useRef(1);

  useEffect(() => {
    if (prevIndex.current !== index) mix.current = 0;
  }, [index]);

  useFrame((_, delta) => {
    mix.current = Math.min(1, mix.current + delta * 2.8);
    const eased = mix.current * mix.current * (3 - 2 * mix.current);
    if (frontRef.current) frontRef.current.opacity = eased;
    if (backRef.current) backRef.current.opacity = 1 - eased;
    if (mix.current >= 1) prevIndex.current = index;
  });

  const outgoing = textures[prevIndex.current] ?? textures[0];
  const incoming = textures[index] ?? textures[0];

  return (
    <group>
      <mesh geometry={geometry} position={[0, 0, 0.001]} renderOrder={1}>
        <meshBasicMaterial
          ref={backRef}
          map={outgoing}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={geometry} position={[0, 0, 0.002]} renderOrder={2}>
        <meshBasicMaterial
          ref={frontRef}
          map={incoming}
          transparent
          toneMapped={false}
        />
      </mesh>
      {glare && (
        <mesh geometry={geometry} position={[0, 0, 0.003]} renderOrder={3}>
          <meshBasicMaterial
            map={glare}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

/** Instanced key caps laid out row by row from KEY_ROWS. */
function Keyboard() {
  const ref = useRef<THREE.InstancedMesh>(null);

  const keys = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number }[] = [];
    let z = KB_Z;
    for (const row of KEY_ROWS) {
      let x = -KB_W / 2;
      for (const units of row.keys) {
        out.push({
          x: x + (units * KEY_U) / 2,
          z: z + (row.d * KEY_U) / 2,
          w: units * KEY_U - KEY_GAP,
          d: row.d * KEY_U - KEY_GAP,
        });
        x += units * KEY_U;
      }
      z += row.d * KEY_U;
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    keys.forEach((k, i) => {
      m.compose(
        new THREE.Vector3(k.x, KEY_H / 2 + 0.002, k.z),
        q,
        new THREE.Vector3(k.w, 1, k.d),
      );
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [keys]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, keys.length]}>
      <boxGeometry args={[1, KEY_H, 1]} />
      <meshStandardMaterial color="#0e0f12" metalness={0.2} roughness={0.45} />
    </instancedMesh>
  );
}

function Laptop({
  textures,
  index,
  x,
  glare,
}: {
  textures: THREE.Texture[];
  index: number;
  x: number;
  glare: THREE.Texture | null;
}) {
  const geo = useMemo(
    () => ({
      lid: roundedSlab(LAPTOP_W, LID_H, 0.09, LID_T),
      glass: roundedPlane(LAPTOP_W - 0.03, LID_H - 0.03, 0.075),
      screen: roundedPlane(LAPTOP_SCREEN_W, LAPTOP_SCREEN_H, 0.022),
      base: roundedSlab(LAPTOP_W, BASE_D, 0.1, BASE_T),
      trackpad: roundedPlane(1.36, 0.8, 0.05),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(geo).forEach((g) => g.dispose()),
    [geo],
  );

  // Origin is the hinge: the lid rises from it and tilts back, the base runs
  // forward from it toward the camera.
  return (
    <group position={[x, -0.46, 0]}>
      <group rotation={[-LID_TILT, 0, 0]}>
        <mesh geometry={geo.lid} position={[0, LID_H / 2, -LID_T / 2]}>
          <meshStandardMaterial {...ALUMINIUM} />
        </mesh>
        <mesh geometry={geo.glass} position={[0, LID_H / 2, 0.0015]}>
          <meshStandardMaterial {...GLASS} />
        </mesh>
        {/* slightly deeper chin than top bezel, like the real thing */}
        <group position={[0, LID_H / 2 + 0.0125, 0.002]}>
          <Screen
            textures={textures}
            index={index}
            geometry={geo.screen}
            glare={glare}
          />
        </group>
        <mesh position={[0, LID_H - 0.05, 0.003]}>
          <circleGeometry args={[0.012, 20]} />
          <meshStandardMaterial color="#1a1f2a" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>

      {/* Keyboard deck.
          `fitIgnore` excludes it from the auto-fit bounds. It extends ~2 units
          toward the camera, where perspective magnifies it ~1.45x, so it was
          the binding constraint on the whole rig — the screen was being shrunk
          to keep the base in frame. Letting the base run off the bottom edge is
          both the conventional hero-shot crop and worth ~1.5x on the screen. */}
      <group userData={{ fitIgnore: true }}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.01, -0.012]}>
          <cylinderGeometry args={[0.032, 0.032, LAPTOP_W * 0.8, 24]} />
          <meshStandardMaterial color="#16181d" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh
          geometry={geo.base}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -BASE_T / 2, BASE_D / 2]}
        >
          <meshStandardMaterial {...ALUMINIUM} />
        </mesh>
        {/* keys sit straight on the aluminium, which shows between them */}
        <Keyboard />
        <mesh
          geometry={geo.trackpad}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, KB_Z + KB_D + 0.12 + 0.4]}
        >
          <meshStandardMaterial
            color="#8c929b"
            metalness={0.75}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

function Tablet({
  textures,
  index,
  x,
  y,
  z,
  glare,
}: {
  textures: THREE.Texture[];
  index: number;
  x: number;
  y: number;
  z: number;
  glare: THREE.Texture | null;
}) {
  const ref = useRef<THREE.Group>(null);

  const geo = useMemo(
    () => ({
      body: roundedSlab(TABLET_W, TABLET_H, 0.12, TABLET_T),
      glass: roundedPlane(TABLET_W - 0.02, TABLET_H - 0.02, 0.11),
      screen: roundedPlane(TABLET_SCREEN_W, TABLET_SCREEN_H, 0.05),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(geo).forEach((g) => g.dispose()),
    [geo],
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = y + Math.sin(t * 0.9) * 0.04;
    ref.current.rotation.z = Math.sin(t * 0.6) * 0.012;
  });

  const front = TABLET_T / 2;

  return (
    <group ref={ref} position={[x, y, z]} rotation={[-RIG_TILT - 0.02, 0.3, 0]}>
      <mesh geometry={geo.body}>
        <meshStandardMaterial {...ALUMINIUM} />
      </mesh>
      <mesh geometry={geo.glass} position={[0, 0, front + 0.001]}>
        <meshStandardMaterial {...GLASS} />
      </mesh>
      <group position={[0, 0, front + 0.002]}>
        <Screen
          textures={textures}
          index={index}
          geometry={geo.screen}
          glare={glare}
        />
      </group>
      {/* front camera on the long edge, where landscape-first tablets put it */}
      <mesh position={[0, TABLET_H / 2 - 0.043, front + 0.003]}>
        <circleGeometry args={[0.01, 20]} />
        <meshStandardMaterial color="#1a1f2a" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * World-space bounds, skipping any subtree flagged `fitIgnore`.
 *
 * Box3.setFromObject() has no exclusion mechanism, so this walks the tree
 * manually and prunes ignored branches before they contribute.
 */
function fitBounds(root: THREE.Object3D, box: THREE.Box3): void {
  if (root.userData?.fitIgnore) return;

  const mesh = root as THREE.Mesh;
  if (mesh.isMesh && mesh.geometry) {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const local = mesh.geometry.boundingBox;
    if (local) box.union(local.clone().applyMatrix4(mesh.matrixWorld));
  }

  for (const child of root.children) fitBounds(child, box);
}

/** World-space corners of a Box3. */
function corners(box: THREE.Box3): THREE.Vector3[] {
  const { min, max } = box;
  return [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];
}

function Rig({ slugs, index, progress, onFit }: Omit<Props, "active">) {
  const fitRef = useRef<THREE.Group>(null);
  const rotRef = useRef<THREE.Group>(null);
  const { camera, viewport, invalidate } = useThree();

  const desktopUrls = useMemo(
    () => slugs.map((s) => `/tex/${s}-desktop.webp`),
    [slugs],
  );
  const tabletUrls = useMemo(
    () => slugs.map((s) => `/tex/${s}-tablet.webp`),
    [slugs],
  );

  const desktopTex = useTexture(desktopUrls);
  const tabletTex = useTexture(tabletUrls);

  const glare = useGlareTexture();

  useEffect(() => {
    for (const t of [...desktopTex, ...tabletTex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
  }, [desktopTex, tabletTex]);

  // Laptop right of centre, tablet in front of it on the left with a clear
  // gap between them — overlapping, they read as one cluttered object. The
  // gap is sized for the worst case of the scroll sweep, when the rig turns
  // and perspective pushes the keyboard deck's front corner outward. Stacks
  // on a narrow stage.
  const layout = useMemo(() => {
    const stacked = viewport.width < 6.2;
    // tabletY sits high on purpose: the tablet's bottom edge is the lowest
    // fitted point, and every unit it hangs below the lid's hinge comes
    // straight out of the rig's scale against the reserved bottom band.
    return stacked
      ? { laptopX: 0, tabletX: 0.3, tabletY: -2.1, tabletZ: 0.7 }
      : { laptopX: 1.15, tabletX: -2.1, tabletY: 0.02, tabletZ: 0.9 };
  }, [viewport.width]);

  /**
   * Auto-fit. Scales the rig so its projected bounds sit inside NDC_MARGIN at
   * every rotation the scroll sweep can reach. Perspective makes this
   * non-linear, so it iterates — four passes converge well under a pixel.
   */
  useEffect(() => {
    const fit = fitRef.current;
    const rot = rotRef.current;
    if (!fit || !rot) return;

    const cam = camera as THREE.PerspectiveCamera;
    const halfFov = THREE.MathUtils.degToRad(cam.fov) / 2;

    const restore = rot.rotation.y;
    // Measure at the lean the frame loop settles on, not the mount-time 0.
    rot.rotation.x = RIG_TILT;
    fit.scale.setScalar(1);
    fit.position.y = 0;
    let lastWorst = 0;

    // The usable NDC band is asymmetric (top 0.97, bottom -0.46) because the
    // copy strip is overlaid across the bottom. Centring the rig in that band
    // before scaling is what makes the fit optimal rather than merely safe:
    // without it, content that sits low in local space wastes the entire
    // headroom above it.
    const bandTop = NDC_TOP;
    const bandBottom = -NDC_BOTTOM;
    const bandCentre = (bandTop + bandBottom) / 2;
    const bandHalf = (bandTop - bandBottom) / 2;

    for (let pass = 0; pass < 6; pass++) {
      let minY = Infinity;
      let maxY = -Infinity;
      let maxAbsX = 0;
      let zSum = 0;
      let zCount = 0;

      for (const sample of ROT_SAMPLES) {
        rot.rotation.y = sample;
        fit.updateMatrixWorld(true);

        const box = new THREE.Box3().makeEmpty();
        fitBounds(fit, box);
        if (box.isEmpty()) continue;

        zSum += (box.min.z + box.max.z) / 2;
        zCount += 1;

        for (const corner of corners(box)) {
          const ndc = corner.clone().project(camera);
          minY = Math.min(minY, ndc.y);
          maxY = Math.max(maxY, ndc.y);
          maxAbsX = Math.max(maxAbsX, Math.abs(ndc.x));
        }
      }

      if (!Number.isFinite(minY) || zCount === 0) break;

      // 1. Recentre vertically. Converting an NDC delta to world units needs
      //    the depth, since perspective scale varies with distance.
      const avgZ = zSum / zCount;
      const worldPerNdcY = Math.tan(halfFov) * (cam.position.z - avgZ);
      const centreError = (maxY + minY) / 2 - bandCentre;
      fit.position.y -= centreError * worldPerNdcY;

      // 2. Scale so the taller of the two axes exactly meets its limit.
      const vFactor = (maxY - minY) / 2 / bandHalf;
      const hFactor = maxAbsX / NDC_X;
      const worst = Math.max(vFactor, hFactor);

      if (worst <= 0) break;
      fit.scale.setScalar(fit.scale.x / worst);
      lastWorst = worst;
    }

    rot.rotation.y = restore;
    fit.updateMatrixWorld(true);
    invalidate();

    onFit?.({
      scale: +fit.scale.x.toFixed(3),
      ndc: +(lastWorst > 0 ? NDC_TOP : 0).toFixed(3),
      vw: +viewport.width.toFixed(2),
      vh: +viewport.height.toFixed(2),
    });
  }, [
    camera,
    invalidate,
    onFit,
    viewport.width,
    viewport.height,
    layout,
    desktopTex,
    tabletTex,
  ]);

  useFrame((state, delta) => {
    const rot = rotRef.current;
    if (!rot) return;
    const t = state.clock.elapsedTime;

    const targetY = lerp(0.22, -0.22, progress);
    rot.rotation.y = lerp(
      rot.rotation.y,
      targetY + Math.sin(t * 0.4) * 0.02,
      Math.min(1, delta * 3.5),
    );
    rot.rotation.x = lerp(
      rot.rotation.x,
      RIG_TILT + Math.sin(t * 0.5) * 0.012,
      Math.min(1, delta * 3),
    );
    rot.position.y = Math.sin(t * 0.7) * 0.035;
  });

  return (
    <group ref={fitRef}>
      <group ref={rotRef}>
        <Laptop
          textures={desktopTex}
          index={index}
          x={layout.laptopX}
          glare={glare}
        />
        <Tablet
          textures={tabletTex}
          index={index}
          x={layout.tabletX}
          y={layout.tabletY}
          z={layout.tabletZ}
          glare={glare}
        />
      </group>
    </group>
  );
}

export default function DeviceScene({
  slugs,
  index,
  progress,
  active,
  onFit,
}: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.15, 8.2], fov: 30 }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Metal is mostly reflection, so the aluminium needs something to
          reflect: a studio environment built from Lightformers. It renders
          once, locally — no HDR file is fetched. The coloured panels match the
          radial glow behind the stage, so the edges pick up its sky-blue and
          indigo instead of reading as grey cut-outs in front of it. */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[0, 5, 2]}
          scale={[10, 3, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[0, 1, 7]}
          scale={[8, 4, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#38bdf8"
          position={[-6, 1, 1]}
          scale={[3, 6, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#818cf8"
          position={[6, 0, 1]}
          scale={[3, 6, 1]}
          target={[0, 0, 0]}
        />
      </Environment>

      <ambientLight intensity={0.3} />
      <directionalLight position={[3.5, 5, 4]} intensity={1.4} />
      <directionalLight position={[-4, 1.5, 2]} intensity={0.8} color="#38bdf8" />
      <pointLight position={[0, -2, 3]} intensity={14} color="#6366f1" />
      <pointLight position={[-3, -1, 2.5]} intensity={8} color="#22d3ee" />

      <Suspense fallback={null}>
        <Rig
          slugs={slugs}
          index={index}
          progress={progress}
          onFit={onFit}
        />
      </Suspense>
    </Canvas>
  );
}
