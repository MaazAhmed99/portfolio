/**
 * Generates the screen textures for the WebGL showcase.
 *
 * WebGL textures bypass <Image> entirely — three.js fetches the raw file — so
 * the source screenshots (1-3 MB PNGs) must be reduced here. Each texture is
 * a whole screen: the page inside a browser, inside the device's OS.
 *
 * Run:  corepack pnpm@9.15.4 --dir . run textures
 */
import { readdir, readFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WORK_DIR = path.join(process.cwd(), "public", "work");
const OUT_DIR = path.join(process.cwd(), "public", "tex");

// Both screens are 16:10, matching the panels in DeviceScene.tsx.
//
// LAPTOP: the page is fitted to the FULL screen width — never cropped at the
// sides — because desktop captures put logos and nav buttons at the very
// edges, and a side crop cut them off. Fitting a ~2.1:1 capture to a 16:10
// screen leaves height spare, which is filled the way a real Mac fills it:
// menu bar on top, browser tabs and toolbar, the Dock below the window.
const LAPTOP = { width: 1440, height: 900, menu: 26, tabs: 40, toolbar: 40, dock: 80 };

// TABLET: held in LANDSCAPE with a full-screen browser. A portrait tablet can
// only show a vertical slice of a desktop capture, which looked like exactly
// what it was: a crop. In landscape, only ~8% is trimmed per side, and the
// tablet shows mid-page sections whose edges are page margin.
const TABLET = { width: 1280, height: 800, bar: 74 };

// The tablet shows a different page of the same project than the laptop, so
// the pair reads as two views of one product instead of the same image twice.
// `position` anchors the side trim when a page has content at one edge.
// Unlisted projects use 02.png when it is a full-viewport capture, else 01.
const TABLET_SHOT = {
  "travel-booking-marketplace": { file: "05.png" },
  "community-social-platform": { file: "02.png" },
  // headline starts at the very left edge; trim from the right instead
  "web3-collectibles-platform": { file: "04.png", position: "left top" },
  "tax-filing-saas": { file: "03.png" },
  "wellness-food-platform": { file: "02.png" },
  "home-services-booking": { file: "02.png" },
};

const CHROME_BG = "#1d1f24";
const TAB_STRIP_BG = "#121418";
const PILL_BG = "#2c2f36";
const ICON = "#8b919c";
const FONT = `font-family="Segoe UI, Helvetica, Arial, sans-serif"`;

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** slug -> project title, read from the catalogue so tab titles stay in sync. */
async function projectTitles() {
  const src = await readFile(
    path.join(process.cwd(), "content", "projects.ts"),
    "utf8",
  );
  const titles = {};
  for (const m of src.matchAll(/slug:\s*"([^"]+)",\s*title:\s*"([^"]+)"/g)) {
    titles[m[1]] = m[2];
  }
  return titles;
}

/** Dark wallpaper in the site's palette, the menu bar, and the Dock. */
function macDesktop({ width: w, height: h, menu, dock }) {
  const menuItems = ["File", "Edit", "View", "History", "Bookmarks", "Window", "Help"];
  let mx = 112;
  const menuText = menuItems
    .map((item) => {
      const t = `<text x="${mx}" y="18" ${FONT} font-size="13" fill="#e5e7eb">${item}</text>`;
      mx += item.length * 7.4 + 20;
      return t;
    })
    .join("");

  const icons = [
    ["#60a5fa", "#1d4ed8"],
    ["#f8fafc", "#94a3b8"],
    ["#4ade80", "#15803d"],
    ["#fb923c", "#c2410c"],
    ["#c084fc", "#6d28d9"],
    ["#38bdf8", "#0369a1"],
    ["#fb7185", "#be123c"],
    ["#94a3b8", "#334155"],
    ["#fde047", "#ca8a04"],
  ];
  const size = 48;
  const gap = 10;
  const dockW = icons.length * size + (icons.length - 1) * gap + 28;
  const dockH = size + 18;
  const dx = (w - dockW) / 2;
  const dy = h - dockH - 8;
  const iconDefs = icons
    .map(
      ([a, b], i) =>
        `<linearGradient id="i${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`,
    )
    .join("");
  const iconRects = icons
    .map((_, i) => {
      const x = dx + 14 + i * (size + gap);
      return `<rect x="${x}" y="${dy + 9}" width="${size}" height="${size}" rx="11" fill="url(#i${i})"/>
        <rect x="${x}" y="${dy + 9}" width="${size}" height="${size / 2}" rx="11" fill="#fff" fill-opacity="0.08"/>`;
    })
    .join("");
  // running-app dot under the browser icon
  const runX = dx + 14 + 1 * (size + gap) + size / 2;

  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0b1230"/>
        <stop offset="0.55" stop-color="#1e1b4b"/>
        <stop offset="1" stop-color="#0c4a6e"/>
      </linearGradient>
      ${iconDefs}
    </defs>
    <rect width="${w}" height="${h}" fill="url(#wall)"/>
    <rect width="${w}" height="${menu}" fill="#0a0c14" fill-opacity="0.82"/>
    <circle cx="26" cy="${menu / 2}" r="6" fill="#e5e7eb"/>
    <text x="44" y="18" ${FONT} font-size="13" font-weight="700" fill="#f9fafb">Chrome</text>
    ${menuText}
    <path d="M${w - 152} 15 a8 8 0 0 1 11 0 M${w - 155} 11.5 a12.5 12.5 0 0 1 17 0" stroke="#e5e7eb" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    <circle cx="${w - 146.5}" cy="17.5" r="1.5" fill="#e5e7eb"/>
    <rect x="${w - 124}" y="8" width="23" height="11" rx="3" fill="none" stroke="#e5e7eb" stroke-width="1.3"/>
    <rect x="${w - 121.5}" y="10.5" width="15" height="6" rx="1.3" fill="#e5e7eb"/>
    <text x="${w - 90}" y="18" ${FONT} font-size="13" fill="#e5e7eb">Mon 9:41</text>
    <rect x="${dx}" y="${dy}" width="${dockW}" height="${dockH}" rx="18" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.22"/>
    ${iconRects}
    <circle cx="${runX}" cy="${dy + dockH - 4}" r="2" fill="#e5e7eb"/>
  </svg>`);
}

/** Chrome-style window top: tab strip with one active tab, then toolbar. */
function laptopWindowChrome({ width: w, tabs, toolbar }, title) {
  const h = tabs + toolbar;
  const tabW = 240;
  const tabX = 92;
  const ty = toolbar / 2 + tabs;
  const label = escapeXml(title.length > 26 ? `${title.slice(0, 25)}…` : title);
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${tabs}" fill="${TAB_STRIP_BG}"/>
    <circle cx="22" cy="${tabs / 2}" r="6.5" fill="#ff5f57"/>
    <circle cx="42" cy="${tabs / 2}" r="6.5" fill="#febc2e"/>
    <circle cx="62" cy="${tabs / 2}" r="6.5" fill="#28c840"/>
    <path d="M${tabX} ${tabs} q8 0 8 -8 v-18 q0 -6 6 -6 h${tabW - 28} q6 0 6 6 v18 q0 8 8 8 z" fill="${CHROME_BG}"/>
    <circle cx="${tabX + 24}" cy="${tabs / 2 + 3}" r="6" fill="#38bdf8"/>
    <text x="${tabX + 38}" y="${tabs / 2 + 8}" ${FONT} font-size="12.5" fill="#d1d5db">${label}</text>
    <path d="M${tabX + tabW - 22} ${tabs / 2 - 1} l8 8 m0 -8 l-8 8" stroke="${ICON}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M${tabX + tabW + 18} ${tabs / 2 + 3} h12 M${tabX + tabW + 24} ${tabs / 2 - 3} v12" stroke="${ICON}" stroke-width="1.8" stroke-linecap="round"/>
    <rect y="${tabs}" width="${w}" height="${toolbar}" fill="${CHROME_BG}"/>
    <rect y="${h - 1}" width="${w}" height="1" fill="#000" fill-opacity="0.5"/>
    <path d="M28 ${ty - 6} l-6 6 l6 6 M48 ${ty - 6} l6 6 l-6 6" stroke="${ICON}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M86 ${ty + 1} a7 7 0 1 0 2.2 -5.6 M88 ${ty - 9} v4.5 h-4.5" stroke="${ICON}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="110" y="${ty - 14}" width="${w - 190}" height="28" rx="14" fill="${PILL_BG}"/>
    <rect x="128" y="${ty - 2}" width="10" height="8" rx="2" fill="${ICON}"/>
    <path d="M130 ${ty - 2} v-2.5 a3 3 0 0 1 6 0 v2.5" stroke="${ICON}" stroke-width="1.8" fill="none"/>
    <rect x="150" y="${ty - 3.5}" width="170" height="7" rx="3.5" fill="${ICON}" fill-opacity="0.45"/>
    <circle cx="${w - 48}" cy="${ty}" r="11" fill="#4f46e5"/>
    <path d="M${w - 22} ${ty - 7} v0.1 M${w - 22} ${ty} v0.1 M${w - 22} ${ty + 7} v0.1" stroke="${ICON}" stroke-width="3.2" stroke-linecap="round"/>
  </svg>`);
}

/** Tablet browser: status bar strip, then a toolbar with a centred URL pill. */
function tabletChrome({ width: w, bar: h }) {
  const status = 24;
  const pillW = 460;
  const px = (w - pillW) / 2;
  const cy = status + (h - status) / 2;
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${CHROME_BG}"/>
    <rect y="${h - 1}" width="${w}" height="1" fill="#000" fill-opacity="0.55"/>
    <text x="22" y="17" ${FONT} font-size="13" font-weight="600" fill="#e5e7eb">9:41</text>
    <rect x="${w - 52}" y="8" width="26" height="12" rx="3.5" fill="none" stroke="#c9ced6" stroke-width="1.4"/>
    <rect x="${w - 49.5}" y="10.5" width="17" height="7" rx="1.5" fill="#c9ced6"/>
    <rect x="${w - 24.5}" y="12" width="2" height="4" rx="1" fill="#c9ced6"/>
    <path d="M${w - 82} 18 a9 9 0 0 1 12 0 M${w - 85} 14.5 a13.5 13.5 0 0 1 18 0" stroke="#c9ced6" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="${w - 76}" cy="20.5" r="1.6" fill="#c9ced6"/>
    <rect x="22" y="${cy - 9}" width="22" height="18" rx="3.5" stroke="${ICON}" stroke-width="2" fill="none"/>
    <path d="M30 ${cy - 9} v18" stroke="${ICON}" stroke-width="2"/>
    <path d="M70 ${cy - 7} l-7 7 l7 7 M94 ${cy - 7} l7 7 l-7 7" stroke="${ICON}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="${px}" y="${cy - 17}" width="${pillW}" height="34" rx="11" fill="${PILL_BG}"/>
    <rect x="${px + 18}" y="${cy - 2}" width="11" height="9" rx="2" fill="${ICON}"/>
    <path d="M${px + 20.5} ${cy - 2} v-3 a3 3 0 0 1 6 0 v3" stroke="${ICON}" stroke-width="2" fill="none"/>
    <rect x="${px + 40}" y="${cy - 3.5}" width="150" height="7" rx="3.5" fill="${ICON}" fill-opacity="0.45"/>
    <path d="M${w - 104} ${cy + 3} v-14 M${w - 110} ${cy - 5} l6 -6 l6 6 M${w - 112} ${cy - 1} v10 h16 v-10" stroke="${ICON}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${w - 64} ${cy} h14 M${w - 57} ${cy - 7} v14" stroke="${ICON}" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="${w - 36}" y="${cy - 8}" width="14" height="14" rx="3" stroke="${ICON}" stroke-width="2" fill="none"/>
  </svg>`);
}

/** Rounded-rectangle alpha mask, for clipping a window's corners. */
const roundedMask = (w, h, r) =>
  Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`,
  );

/**
 * Laptop screen: macOS desktop with a maximised browser window. The page is
 * fitted to the full width; only an unusually tall capture is trimmed, and
 * then from the bottom, never the sides.
 */
async function laptopScreen(src, title, out) {
  const L = LAPTOP;
  const chromeH = L.tabs + L.toolbar;
  const maxPageH = L.height - L.menu - chromeH - L.dock;

  const meta = await sharp(src).metadata();
  const naturalH = Math.round(L.width * ((meta.height ?? 1) / (meta.width ?? 1)));
  const pageH = Math.min(naturalH, maxPageH);

  const page = await sharp(src)
    .resize({ width: L.width, height: pageH, fit: "cover", position: "top" })
    .toBuffer();

  const winH = chromeH + pageH;
  const win = await sharp({
    create: { width: L.width, height: winH, channels: 4, background: CHROME_BG },
  })
    .composite([
      { input: laptopWindowChrome(L, title), top: 0, left: 0 },
      { input: page, top: chromeH, left: 0 },
      { input: roundedMask(L.width, winH, 12), blend: "dest-in" },
    ])
    .png()
    .toBuffer();

  await sharp(macDesktop(L))
    .composite([{ input: win, top: L.menu, left: 0 }])
    .flatten({ background: "#000" })
    .webp({ quality: 84 })
    .toFile(out);
}

/** Tablet screen: full-screen browser, page trimmed to fit at the sides. */
async function tabletScreen(src, position, out) {
  const T = TABLET;
  const page = await sharp(src)
    .resize({
      width: T.width,
      height: T.height - T.bar,
      fit: "cover",
      position: position ?? "top",
    })
    .toBuffer();

  await sharp({
    create: { width: T.width, height: T.height, channels: 3, background: CHROME_BG },
  })
    .composite([
      { input: tabletChrome(T), top: 0, left: 0 },
      { input: page, top: T.bar, left: 0 },
    ])
    .webp({ quality: 84 })
    .toFile(out);
}

/** The page the tablet shows: override, else a full-viewport 02, else 01. */
async function tabletSource(slug) {
  const dir = path.join(WORK_DIR, slug);
  // Drop a genuine landscape tablet capture here and it is used verbatim.
  const real = path.join(dir, "tablet.png");
  if (await exists(real)) return { src: real, real: true };

  const pick = TABLET_SHOT[slug];
  if (pick && (await exists(path.join(dir, pick.file)))) {
    return { src: path.join(dir, pick.file), position: pick.position, real: false };
  }

  const second = path.join(dir, "02.png");
  if (await exists(second)) {
    const m = await sharp(second).metadata();
    const aspect = (m.width ?? 0) / (m.height ?? 1);
    if ((m.width ?? 0) >= 1400 && aspect >= 1.6 && aspect <= 2.4) {
      return { src: second, real: false };
    }
  }
  return { src: path.join(dir, "01.png"), real: false };
}

await mkdir(OUT_DIR, { recursive: true });

const titles = await projectTitles();

const slugs = (await readdir(WORK_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let real = 0;
let derived = 0;

for (const slug of slugs) {
  try {
    await laptopScreen(
      path.join(WORK_DIR, slug, "01.png"),
      titles[slug] ?? slug,
      path.join(OUT_DIR, `${slug}-desktop.webp`),
    );

    const tablet = await tabletSource(slug);
    await tabletScreen(
      tablet.src,
      tablet.position,
      path.join(OUT_DIR, `${slug}-tablet.webp`),
    );

    if (tablet.real) real += 1;
    else derived += 1;
    console.log(`  ✓ ${slug}  (tablet: ${path.basename(tablet.src)})`);
  } catch (err) {
    console.warn(`  ✗ ${slug}: ${err.message}`);
  }
}

console.log(
  `\n${real} real tablet capture(s), ${derived} from desktop screenshots.\n` +
    `To use a real one: capture the site at 1280x726 (landscape tablet),\n` +
    `save as public/work/<slug>/tablet.png, then re-run.`,
);

/* ------------------------------------------------------------------------- *
 * Hero portrait
 *
 * Input:  public/maaz-raw.png   (full-body studio shot)
 * Output: public/maaz-portrait.webp
 *
 * Cropped to head-and-chest so the hands are excluded, then faded out along
 * the bottom so it dissolves into the hero gradient instead of ending on a
 * hard horizontal cut.
 * ------------------------------------------------------------------------- */
const RAW = path.join(process.cwd(), "public", "maaz-raw.png");
const PORTRAIT_OUT = path.join(process.cwd(), "public", "maaz-portrait.webp");

if (await exists(RAW)) {
  try {
    const m = await sharp(RAW).metadata();
    const W = m.width ?? 1333;
    const H = m.height ?? 2000;

    // Subject sits centre-right in the frame. Chest line is ~40% down; hands
    // are ~55% down, so cutting at 0.40 keeps them out.
    const crop = {
      left: Math.round(W * 0.34),
      top: Math.round(H * 0.06),
      width: Math.round(W * 0.55),
      height: Math.round(H * 0.36),
    };
    crop.width = Math.min(crop.width, W - crop.left);
    crop.height = Math.min(crop.height, H - crop.top);

    const cropped = await sharp(RAW)
      .extract(crop)
      .resize({ width: 820, withoutEnlargement: false })
      .ensureAlpha()
      .toBuffer();

    const cm = await sharp(cropped).metadata();
    const cw = cm.width ?? 820;
    const ch = cm.height ?? 820;

    const fade = Buffer.from(
      `<svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
         <defs>
           <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0.00" stop-color="#fff" stop-opacity="1"/>
             <stop offset="0.62" stop-color="#fff" stop-opacity="1"/>
             <stop offset="1.00" stop-color="#fff" stop-opacity="0"/>
           </linearGradient>
         </defs>
         <rect width="100%" height="100%" fill="url(#g)"/>
       </svg>`,
    );

    await sharp(cropped)
      .composite([{ input: fade, blend: "dest-in" }])
      .webp({ quality: 88, alphaQuality: 90 })
      .toFile(PORTRAIT_OUT);

    console.log(`\n  ✓ hero portrait -> public/maaz-portrait.webp`);
  } catch (err) {
    console.warn(`\n  ✗ hero portrait: ${err.message}`);
  }
} else {
  console.log(
    `\n  – hero portrait skipped: save your photo as public/maaz-raw.png,\n` +
      `    then re-run. The hero renders without it until then.`,
  );
}
