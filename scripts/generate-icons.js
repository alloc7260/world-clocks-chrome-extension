/**
 * Zero-dependency PNG Icon Generator for World Clocks Chrome Extension.
 * Generates 16x16, 32x32, 48x48, and 128x128 anti-aliased PNG icons in assets/icons/.
 *
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [16, 32, 48, 128];
const OUT_DIR = path.join(__dirname, '..', 'assets', 'icons');

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0 (None)
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', iend)
  ]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function roundedRectSDF(px, py, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(px - cx) - (halfW - r);
  const qy = Math.abs(py - cy) - (halfH - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

function blend(dst, src) {
  const sa = src[3];
  if (sa <= 0) return dst;
  if (sa >= 1) return [src[0], src[1], src[2], 1];
  const da = dst[3];
  const outA = sa + da * (1 - sa);
  if (outA === 0) return [0, 0, 0, 0];
  return [
    (src[0] * sa + dst[0] * da * (1 - sa)) / outA,
    (src[1] * sa + dst[1] * da * (1 - sa)) / outA,
    (src[2] * sa + dst[2] * da * (1 - sa)) / outA,
    outA
  ];
}

function smoothAlpha(sdf, aaWidth) {
  return Math.max(0, Math.min(1, 0.5 - sdf / aaWidth));
}

function renderIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const scale = size / 128;
  const aa = 1.25 / scale; // anti-aliasing feather in 128-coord space

  const ticks = [
    [64, 27, 64, 33],
    [101, 64, 95, 64],
    [64, 101, 64, 95],
    [27, 64, 33, 64]
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Sample in 128x128 coordinate space
      const px = (x + 0.5) / scale;
      const py = (y + 0.5) / scale;

      let pixel = [0, 0, 0, 0];

      // 1. Rounded squircle background
      const bgSdf = roundedRectSDF(px, py, 64, 64, 56, 56, 28);
      const bgAlpha = smoothAlpha(bgSdf, aa);
      if (bgAlpha > 0) {
        const gradT = Math.max(0, Math.min(1, ((px - 16) + (py - 12)) / 192));
        const r = Math.round(30 * (1 - gradT) + 15 * gradT);
        const g = Math.round(41 * (1 - gradT) + 23 * gradT);
        const b = Math.round(59 * (1 - gradT) + 42 * gradT);
        pixel = blend(pixel, [r, g, b, bgAlpha]);
      }

      // 2. Outer clock ring
      const distCenter = Math.hypot(px - 64, py - 64);
      const ringSdf = Math.abs(distCenter - 42) - 2.6;
      const ringAlpha = smoothAlpha(ringSdf, aa) * 0.94;
      if (ringAlpha > 0) {
        pixel = blend(pixel, [248, 250, 252, ringAlpha]);
      }

      // 3. Cardinal ticks (for sizes >= 32)
      if (size >= 32) {
        for (const [x1, y1, x2, y2] of ticks) {
          const tickSdf = distToSegment(px, py, x1, y1, x2, y2) - 1.75;
          const tickAlpha = smoothAlpha(tickSdf, aa);
          if (tickAlpha > 0) {
            pixel = blend(pixel, [148, 163, 184, tickAlpha]);
          }
        }
      }

      // 4. Hour hand
      const hourSdf = distToSegment(px, py, 64, 64, 46, 52) - 2.9;
      const hourAlpha = smoothAlpha(hourSdf, aa);
      if (hourAlpha > 0) {
        pixel = blend(pixel, [248, 250, 252, hourAlpha]);
      }

      // 5. Minute hand
      const minSdf = distToSegment(px, py, 64, 64, 86, 44) - 2.4;
      const minAlpha = smoothAlpha(minSdf, aa);
      if (minAlpha > 0) {
        pixel = blend(pixel, [248, 250, 252, minAlpha]);
      }

      // 6. Second hand (red accent)
      const secSdf = distToSegment(px, py, 67, 57, 54, 90) - 1.65;
      const secAlpha = smoothAlpha(secSdf, aa);
      if (secAlpha > 0) {
        pixel = blend(pixel, [239, 68, 68, secAlpha]);
      }

      // 7. Center cap
      const capSdf = distCenter - 4.5;
      const capAlpha = smoothAlpha(capSdf, aa);
      if (capAlpha > 0) {
        pixel = blend(pixel, [239, 68, 68, capAlpha]);
      }

      const idx = (y * size + x) * 4;
      rgba[idx] = Math.round(pixel[0]);
      rgba[idx + 1] = Math.round(pixel[1]);
      rgba[idx + 2] = Math.round(pixel[2]);
      rgba[idx + 3] = Math.round(pixel[3] * 255);
    }
  }

  return encodePNG(size, size, rgba);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  const pngBuffer = renderIcon(size);
  const outPath = path.join(OUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Generated ${outPath} (${pngBuffer.length} bytes)`);
}
