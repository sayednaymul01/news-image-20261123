// news-image-20261123: "Sum up 23 November's world news in one image."
//
// The picture itself is the entry.png beside this file: a poster drawn for
// Monday 23 November 2026 (COP31's collapse in Antalya, Iran's strikes on
// Bahrain, the war in Ukraine, Jensen Huang's return to Nvidia, the Kospi
// chip rout, the capture of "El Chapo Isidro", the Nigeria boat disaster and
// the end of the US penny). This program's whole job is to deliver those
// exact bytes to the output directory, unchanged, on every run.
//
// Before writing, it checks the image against the gate's own limits — a
// whole PNG or JPEG, at most 1 MiB and at most 1024 by 1024 pixels — so a
// corrupt or oversized asset fails loudly here instead of at the gate.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 1_048_576; // 1 MiB
const MAX_SIDE = 1024;

const bytes = readFileSync(new URL('./entry.png', import.meta.url));

if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB gate limit`);
}

const isPng = bytes.subarray(0, 8).equals(
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
);
const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;

if (isPng) {
  // The IHDR chunk follows the 8-byte signature: width and height are the
  // big-endian uint32s at offsets 16 and 20.
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > MAX_SIDE || height > MAX_SIDE) {
    throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate limit`);
  }
} else if (!isJpeg) {
  throw new Error('entry.png is neither a PNG nor a JPEG');
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
writeFileSync(join(outDir, 'entry.png'), bytes);
