/**
 * CampusPilot brand asset generator.
 *
 * The master artwork (logo.png) is a 1254x1254 RGB PNG with an opaque
 * near-white background. This script derives every branding asset the app
 * needs (transparent marks, favicons, PWA/maskable icons, apple-touch-icon,
 * Open Graph preview) using only Node's built-in modules.
 *
 * Run with:  node scripts/generate-brand-assets.cjs
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "logo.png");
const OUT = path.join(ROOT, "public");

// ─────────────────────────────────────────────────────────────────────────────
// PNG decoding
// ────────────────────────────────────────────────────────────────────────────

const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** Decode an 8-bit, non-interlaced PNG into straight RGBA pixels. */
function decodePng(buf) {
  let off = 8;
  let ihdr = null;
  const idat = [];

  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.slice(off + 4, off + 8).toString("ascii");
    const data = buf.slice(off + 8, off + 8 + len);
    if (type === "IHDR") {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    off += 12 + len;
  }

  if (!ihdr) throw new Error("Invalid PNG: no IHDR chunk");
  if (ihdr.bitDepth !== 8) throw new Error("Only 8-bit PNGs are supported");
  if (ihdr.interlace !== 0) throw new Error("Interlaced PNGs are not supported");

  const bpp = CHANNELS[ihdr.colorType];
  if (!bpp || ihdr.colorType === 3) {
    throw new Error("Unsupported PNG colour type: " + ihdr.colorType);
  }

  const { width: w, height: h } = ihdr;
  const srcStride = w * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const flat = Buffer.alloc(h * srcStride);

  let pos = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[pos++];
    const line = raw.slice(pos, pos + srcStride);
    pos += srcStride;
    for (let x = 0; x < srcStride; x++) {
      const a = x >= bpp ? flat[y * srcStride + x - bpp] : 0;
      const b = y > 0 ? flat[(y - 1) * srcStride + x] : 0;
      const c = x >= bpp && y > 0 ? flat[(y - 1) * srcStride + x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) v += paeth(a, b, c);
      flat[y * srcStride + x] = v & 0xff;
    }
  }

  // Normalise to RGBA
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const s = i * bpp;
    const d = i * 4;
    if (bpp === 4) {
      rgba[d] = flat[s];
      rgba[d + 1] = flat[s + 1];
      rgba[d + 2] = flat[s + 2];
      rgba[d + 3] = flat[s + 3];
    } else if (bpp === 3) {
      rgba[d] = flat[s];
      rgba[d + 1] = flat[s + 1];
      rgba[d + 2] = flat[s + 2];
      rgba[d + 3] = 255;
    } else if (bpp === 1) {
      rgba[d] = rgba[d + 1] = rgba[d + 2] = flat[s];
      rgba[d + 3] = 255;
    } else {
      // greyscale + alpha
      rgba[d] = rgba[d + 1] = rgba[d + 2] = flat[s];
      rgba[d + 3] = flat[s + 1];
    }
  }

  return { width: w, height: h, data: rgba };
}

// ─────────────────────────────────────────────────────────────────────────────
// PNG encoding
// ─────────────────────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Encode straight RGBA pixels as an 8-bit RGBA PNG. */
function encodePng(width, height, rgba) {
  const signature = Buffer.from("89504e470d0a1a0a", "hex");

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0 (None)
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Background removal — flood-fill the outer near-white region (connected to
// the border) to transparent, then fade whitish anti-alias halos adjacent to
// the removed region. Interior white strokes stay opaque by design.
// ────────────────────────────────────────────────────────────────────────────

function keyOutBackground(img, threshold) {
  const { width: w, height: h, data } = img;
  const removed = new Uint8Array(w * h);

  function isBg(x, y) {
    const i = (y * w + x) * 4;
    return data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold;
  }

  // BFS flood fill from every border pixel.
  const queue = [];
  for (let x = 0; x < w; x++) {
    queue.push([x, 0], [x, h - 1]);
  }
  for (let y = 1; y < h - 1; y++) {
    queue.push([0, y], [w - 1, y]);
  }
  while (queue.length > 0) {
    const [cx, cy] = queue.pop();
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const idx = cy * w + cx;
    if (removed[idx] || !isBg(cx, cy)) continue;
    removed[idx] = 1;
    queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }

  for (let i = 0; i < w * h; i++) {
    if (removed[i]) data[i * 4 + 3] = 0;
  }

  // De-alias: fade whitish halos that touch the transparent region.
  const hasTNeighbour = (x, y) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) return true;
        if (data[(ny * w + nx) * 4 + 3] === 0) return true;
      }
    }
    return false;
  };

  const FLOOR = 200;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] === 0) continue;
      if (!hasTNeighbour(x, y)) continue;
      const mn = Math.min(data[i], data[i + 1], data[i + 2]);
      const mx = Math.max(data[i], data[i + 1], data[i + 2]);
      if (mx - mn <= 26 && mn >= FLOOR) {
        const t = Math.min(1, Math.max(0, (255 - mn) / (255 - FLOOR)));
        data[i + 3] = Math.round(255 * t);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Trim + square-pad (no stretch, no crop)
// ─────────────────────────────────────────────────────────────────────────────

function trimToSquare(img) {
  const { width: w, height: h, data } = img;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) throw new Error("No opaque content found after keying");

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const side = Math.max(bw, bh);
  const padExtra = Math.max(2, Math.round(side * 0.02));
  const size = side + padExtra * 2;

  const out = Buffer.alloc(size * size * 4);
  const offX = Math.floor((size - bw) / 2);
  const offY = Math.floor((size - bh) / 2);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const s = ((minY + y) * w + (minX + x)) * 4;
      const d = ((offY + y) * size + (offX + x)) * 4;
      out[d] = data[s];
      out[d + 1] = data[s + 1];
      out[d + 2] = data[s + 2];
      out[d + 3] = data[s + 3];
    }
  }
  return { size, data: out };
}

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

/** High-quality area-average downscale with premultiplied-alpha blending. */
function resizeArea(src, sw, sh, dw, dh) {
  const out = Buffer.alloc(dw * dh * 4);
  for (let dy = 0; dy < dh; dy++) {
    const sy0 = (dy * sh) / dh;
    const sy1 = ((dy + 1) * sh) / dh;
    const y0 = Math.floor(sy0);
    const y1 = Math.min(sh - 1, Math.ceil(sy1) - 1);
    for (let dx = 0; dx < dw; dx++) {
      const sx0 = (dx * sw) / dw;
      const sx1 = ((dx + 1) * sw) / dw;
      const x0 = Math.floor(sx0);
      const x1 = Math.min(sw - 1, Math.ceil(sx1) - 1);
      let r = 0, g = 0, b = 0, a = 0, wsum = 0;
      for (let y = y0; y <= y1; y++) {
        const wy = Math.min(y + 1, sy1) - Math.max(y, sy0);
        if (wy <= 0) continue;
        for (let x = x0; x <= x1; x++) {
          const wx = Math.min(x + 1, sx1) - Math.max(x, sx0);
          if (wx <= 0) continue;
          const wt = wx * wy;
          const i = (y * sw + x) * 4;
          const al = src[i + 3] / 255;
          r += src[i] * al * wt;
          g += src[i + 1] * al * wt;
          b += src[i + 2] * al * wt;
          a += src[i + 3] * wt;
          wsum += wt;
        }
      }
      const o = (dy * dw + dx) * 4;
      const aAvg = wsum > 0 ? a / wsum : 0;
      const af = aAvg / 255;
      out[o] = af > 0 ? clampByte(r / (wsum * af)) : 0;
      out[o + 1] = af > 0 ? clampByte(g / (wsum * af)) : 0;
      out[o + 2] = af > 0 ? clampByte(b / (wsum * af)) : 0;
      out[o + 3] = clampByte(aAvg);
    }
  }
  return out;
}

/** Alpha-composite an image over a solid background. */
function overSolid(img, w, h, bg) {
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const a = img[i * 4 + 3] / 255;
    out[i * 4] = Math.round(img[i * 4] * a + bg[0] * (1 - a));
    out[i * 4 + 1] = Math.round(img[i * 4 + 1] * a + bg[1] * (1 - a));
    out[i * 4 + 2] = Math.round(img[i * 4 + 2] * a + bg[2] * (1 - a));
    out[i * 4 + 3] = 255;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICO container (embeds PNG blobs — supported by all modern browsers/OS)
// ─────────────────────────────────────────────────────────────────────────────

function writeIco(pngs) {
  // pngs: [{width, height, data}]
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + 16 * count;
  const blobs = [];
  for (const p of pngs) {
    const e = Buffer.alloc(16);
    e[0] = p.width >= 256 ? 0 : p.width;
    e[1] = p.height >= 256 ? 0 : p.height;
    e[2] = 0; // colours
    e[3] = 0; // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(p.data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += p.data.length;
    entries.push(e);
    blobs.push(p.data);
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Compositing helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Alpha-blend `img` (iw×ih) onto `base` (bw×bh) at (dx, dy). */
function drawOver(base, bw, bh, img, iw, ih, dx, dy) {
  for (let y = 0; y < ih; y++) {
    const by = dy + y;
    if (by < 0 || by >= bh) continue;
    for (let x = 0; x < iw; x++) {
      const bx = dx + x;
      if (bx < 0 || bx >= bw) continue;
      const s = (y * iw + x) * 4;
      const d = (by * bw + bx) * 4;
      const a = img[s + 3] / 255;
      base[d] = Math.round(img[s] * a + base[d] * (1 - a));
      base[d + 1] = Math.round(img[s + 1] * a + base[d + 1] * (1 - a));
      base[d + 2] = Math.round(img[s + 2] * a + base[d + 2] * (1 - a));
      base[d + 3] = 255;
    }
  }
}

/** Vertical linear-gradient RGBA canvas. */
function gradientCanvas(w, h, top, bottom) {
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const t = h <= 1 ? 0 : y / (h - 1);
    const r = Math.round(top[0] + (bottom[0] - top[0]) * t);
    const g = Math.round(top[1] + (bottom[1] - top[1]) * t);
    const b = Math.round(top[2] + (bottom[2] - top[2]) * t);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = 255;
    }
  }
  return out;
}

/** Add a soft radial brand glow in-place. */
function addGlow(canvas, w, h, cx, cy, radius, colour, strength) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      const d2 = dx * dx + dy * dy;
      if (d2 > 1) continue;
      const fall = Math.pow(1 - d2, 2) * strength;
      const i = (y * w + x) * 4;
      canvas[i] = clampByte(canvas[i] + (colour[0] - canvas[i]) * fall);
      canvas[i + 1] = clampByte(canvas[i + 1] + (colour[1] - canvas[i + 1]) * fall);
      canvas[i + 2] = clampByte(canvas[i + 2] + (colour[2] - canvas[i + 2]) * fall);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function write(name, buf) {
  const p = path.join(OUT, name);
  fs.writeFileSync(p, buf);
  console.log("wrote", name, (buf.length / 1024).toFixed(1) + " KB");
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log("decoding", SRC);
  const img = decodePng(fs.readFileSync(SRC));
  console.log("source:", img.width + "x" + img.height);

  console.log("keying out background…");
  keyOutBackground(img, 238);

  console.log("trimming to square…");
  const master = trimToSquare(img);
  const note = "master: " + master.size + "x" + master.size + " (square, transparent)";
  console.log(note);

  const resized = (s) => resizeArea(master.data, master.size, master.size, s, s);

  // Transparent brand marks (in-app use)
  write("logo-mark.png", encodePng(master.size, master.size, master.data));
  write("logo-mark-512.png", encodePng(512, 512, resized(512)));
  write("logo-mark-256.png", encodePng(256, 256, resized(256)));
  write("logo-mark-128.png", encodePng(128, 128, resized(128)));
  write("logo-mark-96.png", encodePng(96, 96, resized(96)));

  // Favicons (transparent mark — browsers composite on tab colour)
  const fav16 = encodePng(16, 16, resized(16));
  const fav32 = encodePng(32, 32, resized(32));
  const fav48 = encodePng(48, 48, resized(48));
  write("favicon-16x16.png", fav16);
  write("favicon-32x32.png", fav32);
  write("favicon-48x48.png", fav48);
  write(
    "favicon.ico",
    writeIco([
      { width: 16, height: 16, data: fav16 },
      { width: 32, height: 32, data: fav32 },
      { width: 48, height: 48, data: fav48 },
    ])
  );

  // Apple touch icon (solid white — iOS ignores alpha)
  const apple = overSolid(resized(180), 180, 180, [255, 255, 255]);
  write("apple-touch-icon.png", encodePng(180, 180, apple));

  // PWA icons (transparent, purpose "any")
  write("pwa-192x192.png", encodePng(192, 192, resized(192)));
  write("pwa-512x512.png", encodePng(512, 512, resized(512)));

  // Maskable icon: brand-blue canvas, mark inset to ~64% (safe zone)
  const mask = Buffer.alloc(512 * 512 * 4);
  for (let i = 0; i < 512 * 512; i++) {
    mask[i * 4] = 29;
    mask[i * 4 + 1] = 78;
    mask[i * 4 + 2] = 216;
    mask[i * 4 + 3] = 255;
  }
  const mark328 = resized(328);
  drawOver(mask, 512, 512, mark328, 328, 328, 92, 92);
  write("pwa-maskable-512x512.png", encodePng(512, 512, mask));

  // Open Graph / Twitter preview (1200×630)
  const og = gradientCanvas(1200, 630, [248, 250, 255], [229, 238, 254]);
  addGlow(og, 1200, 630, 600, 330, 420, [59, 130, 246], 0.28);
  const ogMark = resized(400);
  drawOver(og, 1200, 630, ogMark, 400, 400, 400, 105);
  write("og-image.png", encodePng(1200, 630, og));

  // ── verification pass ──
  console.log("verifying…");
  const verify = decodePng(fs.readFileSync(path.join(OUT, "logo-mark-512.png")));
  let clear = 0, solid = 0;
  for (let i = 0; i < 512 * 512; i++) {
    const a = verify.data[i * 4 + 3];
    if (a === 0) clear++;
    else if (a === 255) solid++;
  }
  console.log("logo-mark-512: 512x512 | transparent px:", clear, "| opaque px:", solid);
  const ogCheck = decodePng(fs.readFileSync(path.join(OUT, "og-image.png")));
  console.log("og-image:", ogCheck.width + "x" + ogCheck.height);
  if (clear === 0) throw new Error("Transparency keying failed — no transparent pixels");
  console.log("ALL ASSETS OK");
}

main();