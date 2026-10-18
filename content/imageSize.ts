import { closeSync, openSync, readSync } from "node:fs";
import path from "node:path";

const PNG_SIGNATURE = "89504e470d0a1a0a";

/**
 * Intrinsic size of a PNG under /public, read from its IHDR header (bytes
 * 16–23), so case-study screenshots render at their real aspect ratio instead
 * of being cropped into a fixed box. Server-only; runs at build time.
 */
export function pngSize(publicSrc: string): { width: number; height: number } {
  const fallback = { width: 1600, height: 1000 };
  let fd: number | undefined;
  try {
    fd = openSync(path.join(process.cwd(), "public", publicSrc), "r");
    const header = Buffer.alloc(24);
    readSync(fd, header, 0, 24, 0);
    if (header.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) return fallback;
    return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
  } catch {
    return fallback;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}
