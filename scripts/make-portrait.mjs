/**
 * Builds the hero portrait from the raw studio photo.
 *
 *   in:  public/maaz-raw.png     (full-body, white studio backdrop)
 *   out: public/maaz-portrait.webp
 *
 * Three things happen here:
 *
 * 1. CROP to head-and-chest. The subject's hands sit around 55% down the
 *    frame, so the cut lands at 42% to keep them out.
 *
 * 2. KEY OUT the white backdrop. This is a flood fill seeded from the image
 *    border, NOT a global brightness threshold — a threshold would also erase
 *    the subject's white shirt, which is just as bright as the backdrop. Only
 *    white *connected to the edge* is treated as background.
 *
 * 3. FEATHER + FADE. The alpha channel is blurred slightly so the cut-out
 *    doesn't have a hard jagged edge, then ramped to zero at the bottom so the
 *    portrait dissolves into the hero gradient.
 *
 * Run:  corepack pnpm@9.15.4 --dir . run portrait
 */
import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAW = path.join(process.cwd(), "public", "maaz-raw.png");
const OUT = path.join(process.cwd(), "public", "maaz-portrait.webp");

const TARGET_WIDTH = 900;
/** A pixel this bright on all channels is a backdrop candidate. */
const WHITE = 208;
/** Alpha ramp: fully opaque above this fraction, gone by the bottom. */
const FADE_START = 0.74;

try {
  await access(RAW);
} catch {
  console.error(`✗ ${RAW} not found.`);
  process.exit(1);
}

const meta = await sharp(RAW).metadata();
const W = meta.width ?? 4000;
const H = meta.height ?? 6000;

// Measured from a content profile of the source, not guessed:
//   head      occupies  10-25% of height, x 53-72%
//   shoulders occupy    25-45% of height, x 42-83%
// So 7% -> 47% covers head through chest, and x 36-88% frames it with margin.
const crop = {
  left: Math.round(W * 0.36),
  top: Math.round(H * 0.07),
  width: Math.round(W * 0.52),
  height: Math.round(H * 0.335),
};
crop.width = Math.min(crop.width, W - crop.left);
crop.height = Math.min(crop.height, H - crop.top);

const { data, info } = await sharp(RAW)
  .extract(crop)
  .resize({ width: TARGET_WIDTH })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const ch = info.channels; // 4

const isWhite = (i) => {
  const o = i * ch;
  return data[o] >= WHITE && data[o + 1] >= WHITE && data[o + 2] >= WHITE;
};

// ---- flood fill from the border -------------------------------------------
const bg = new Uint8Array(w * h);
const stack = [];

const seed = (x, y) => {
  const i = y * w + x;
  if (!bg[i] && isWhite(i)) {
    bg[i] = 1;
    stack.push(i);
  }
};

for (let x = 0; x < w; x++) {
  seed(x, 0);
  seed(x, h - 1);
}
for (let y = 0; y < h; y++) {
  seed(0, y);
  seed(w - 1, y);
}

while (stack.length) {
  const i = stack.pop();
  const x = i % w;
  const y = (i - x) / w;

  if (x > 0) seed(x - 1, y);
  if (x < w - 1) seed(x + 1, y);
  if (y > 0) seed(x, y - 1);
  if (y < h - 1) seed(x, y + 1);
}

const removed = bg.reduce((a, v) => a + v, 0);

// ---- alpha: feather the cut-out, then ramp out at the bottom ---------------
const alpha = Buffer.alloc(w * h);
for (let i = 0; i < w * h; i++) alpha[i] = bg[i] ? 0 : 255;

// sharp may hand back a 3-channel buffer even for 1-channel raw input, so the
// stride must be checked rather than assumed. Assuming 1 here misaligns the
// alpha against the RGB and produces horizontal striping.
const blurred = await sharp(alpha, {
  raw: { width: w, height: h, channels: 1 },
})
  .blur(1.1)
  .raw()
  .toBuffer({ resolveWithObject: true });

const bStride = blurred.info.channels;
let feathered;
if (bStride === 1) {
  feathered = blurred.data;
} else {
  feathered = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) feathered[i] = blurred.data[i * bStride];
}

for (let y = 0; y < h; y++) {
  const t = y / h;
  const fade =
    t < FADE_START ? 1 : Math.max(0, 1 - (t - FADE_START) / (1 - FADE_START));
  if (fade === 1) continue;
  for (let x = 0; x < w; x++) {
    const i = y * w + x;
    feathered[i] = Math.round(feathered[i] * fade);
  }
}

// ---- recombine -------------------------------------------------------------
const rgb = Buffer.alloc(w * h * 3);
for (let i = 0; i < w * h; i++) {
  rgb[i * 3] = data[i * ch];
  rgb[i * 3 + 1] = data[i * ch + 1];
  rgb[i * 3 + 2] = data[i * ch + 2];
}

await sharp(rgb, { raw: { width: w, height: h, channels: 3 } })
  .joinChannel(feathered, { raw: { width: w, height: h, channels: 1 } })
  .webp({ quality: 90, alphaQuality: 95 })
  .toFile(OUT);

console.log(
  `✓ ${w}x${h} -> public/maaz-portrait.webp\n` +
    `  backdrop removed: ${((removed / (w * h)) * 100).toFixed(1)}% of pixels`,
);
