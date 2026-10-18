# Maaz Ahmed — Portfolio

**Live:** https://maazahmed-nu.vercel.app

Portfolio of a senior React & Next.js developer: a scroll-driven 3D device
showcase, case studies for ten client products, and a services section.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · React Three Fiber

PageSpeed Insights, mobile: **94** performance · **100** accessibility ·
**100** best practices · **100** SEO.

---

## Commands

This project uses pnpm through corepack, which ships with Node:

| Command | What it does |
|---|---|
| `corepack pnpm@9.15.4 install` | Install dependencies |
| `corepack pnpm@9.15.4 run dev` | Dev server |
| `corepack pnpm@9.15.4 run build` | Production build |
| `corepack pnpm@9.15.4 run start` | Serve the production build |
| `corepack pnpm@9.15.4 run typecheck` | `tsc --noEmit` |
| `corepack pnpm@9.15.4 run textures` | Regenerate the 3D screen textures |

## Structure

```
app/
  layout.tsx            fonts, metadata, JSON-LD Person schema, skip link
  page.tsx              homepage composition
  work/[slug]/page.tsx  case studies (statically generated)
  opengraph-image.png   social preview card
  sitemap.ts, robots.ts generated from content/
  globals.css           design tokens + component classes
components/
  sections/             Hero, Showcase, AlsoBuilt, Services, Experience, Skills, Contact, Footer
  three/DeviceScene.tsx the WebGL laptop + tablet
  ui/                   Nav, Loader, Reveal, Parallax, SectionHeading
content/
  profile.ts            bio, experience, skills, contact links
  projects.ts           project catalogue (single source of truth)
  services.ts           services and how a project runs
  site.ts               canonical URL
public/work/<slug>/     screenshots, 01.png … 05.png
public/tex/             generated WebGL screen textures
```

All copy lives in `content/`. Edit those files, not the components.

## The 3D showcase

`components/sections/Showcase.tsx` is a tall scroll track with a pinned
`sticky` stage. As you scroll, `components/three/DeviceScene.tsx` turns a
laptop and tablet rig and crossfades each project onto both screens, while the
copy beneath swaps project by project.

- **Devices are built from primitives**, not a downloaded model: extruded
  rounded slabs for the bodies, rounded planes for glass and screens, and an
  instanced mesh for the keyboard. A GLTF would add hundreds of KB for what is
  geometrically a few boxes.
- **Studio lighting is generated locally** with drei `Lightformer`s, so the
  aluminium has something to reflect without fetching an HDR file.
- **The rig auto-fits** by projecting its bounds through the camera at every
  rotation the scroll can reach, so nothing clips at any viewport size.

### Screen textures

`scripts/make-textures.mjs` turns each project's screenshots into two 16:10
screens:

- **Laptop:** the page at full width inside a macOS desktop (menu bar, browser
  window, Dock). Desktop captures put logos and buttons at the edges, so the
  page is never cropped at the sides.
- **Tablet:** a different page of the same project in a landscape browser.

Re-run `textures` whenever a screenshot changes. Drop a real landscape tablet
capture at `public/work/<slug>/tablet.png` and it is used as-is.

## Performance and accessibility decisions

- **Server-rendered first.** The hero is plain HTML/CSS because it is the LCP
  element; nothing in it waits on JavaScript.
- **The 3D scene is lazy.** three.js is code-split, its code starts loading on
  the visitor's first scroll or touch, and the scene and its textures mount
  only when the showcase enters the viewport.
- **Capability gates.** Low core count, low memory, `saveData`, 2G, missing
  WebGL or `prefers-reduced-motion` all get a static layout instead of a
  stuttering canvas.
- **Short intro.** The loader shows on the home page once per session, and
  case studies open immediately.
- **No layout shift.** `scrollbar-gutter: stable`, intrinsic image sizes on
  case studies, and fonts via `next/font`.
- **Accessible by default.** Skip link, `:focus-visible` rings, reduced-motion
  support throughout, content visible without JavaScript, and contrast checked
  against WCAG AA on the dark theme.

## Deploying

Deployed on Vercel. The canonical URL comes from `content/site.ts`: Vercel's
production URL automatically, or `NEXT_PUBLIC_SITE_URL` once a custom domain is
set.
