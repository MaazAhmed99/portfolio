/**
 * Builds the round hero avatar.
 *
 *   in:  public/avatar-raw.jpg   (any photo with a clear head-and-shoulders)
 *   out: public/avatar.webp      (square, 512x512)
 *
 * Output is a SQUARE, not a pre-masked circle. The circle is applied in CSS via
 * `rounded-full`, which keeps the ring, glow and hover states as CSS concerns
 * and avoids baking a hard anti-aliased edge into the file.
 *
 * FACE_X / FACE_Y are the face centre as a fraction of the source, and ZOOM is
 * the crop width as a fraction of the source width. Retune these three if you
 * swap the photo.
 *
 * Run:  corepack pnpm@9.15.4 --dir . run avatar
 */
import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAW = path.join(process.cwd(), "public", "avatar-raw.jpg");
const OUT = path.join(process.cwd(), "public", "avatar.webp");

const SIZE = 512;
const FACE_X = 0.51;
const FACE_Y = 0.47;
const ZOOM = 0.42;

try {
  await access(RAW);
} catch {
  console.error(`✗ ${RAW} not found.`);
  process.exit(1);
}

const meta = await sharp(RAW).metadata();
const W = meta.width ?? 3392;
const H = meta.height ?? 2544;

const side = Math.round(Math.min(W, H, W * ZOOM));

// Clamp so the square never runs off an edge — otherwise `extract` throws on
// a face near the frame border.
const left = Math.max(0, Math.min(W - side, Math.round(W * FACE_X - side / 2)));
const top = Math.max(0, Math.min(H - side, Math.round(H * FACE_Y - side / 2)));

await sharp(RAW)
  .extract({ left, top, width: side, height: side })
  .resize(SIZE, SIZE, { fit: "cover" })
  // Slight lift so the face reads clearly at 96px on a bright background.
  .modulate({ brightness: 1.04, saturation: 1.06 })
  .sharpen({ sigma: 0.6 })
  .webp({ quality: 88 })
  .toFile(OUT);

console.log(
  `✓ avatar ${SIZE}x${SIZE} -> public/avatar.webp\n` +
    `  cropped ${side}x${side} from (${left}, ${top}) of ${W}x${H}`,
);
