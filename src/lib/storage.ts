import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Product image uploads. With BLOB_READ_WRITE_TOKEN set (Vercel), files go to
// Vercel Blob. Otherwise they are written to UPLOAD_DIR on disk and served by
// /api/uploads/[file], suitable for a VPS/Docker deployment with a volume.

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const SIGNATURES: { type: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { type: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: "image/png",
    ext: "png",
    test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    type: "image/webp",
    ext: "webp",
    test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  { type: "image/avif", ext: "avif", test: (b) => b.subarray(4, 12).toString("ascii").startsWith("ftypavi") },
];

/** Detects the real image type from the file's bytes rather than trusting its name or MIME header. */
export function sniffImageType(bytes: Buffer): { type: string; ext: string } | null {
  const match = SIGNATURES.find((s) => s.test(bytes));
  return match ? { type: match.type, ext: match.ext } : null;
}

// Uploads live outside the build, so tell the bundler not to trace this path.
export function uploadDir(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "uploads");
}

export const SAFE_UPLOAD_NAME = /^[a-z0-9]{24}\.(jpg|png|webp|avif)$/;

export async function storeImage(file: File): Promise<string> {
  if (file.size === 0) throw new Error("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 5 MB or smaller.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const kind = sniffImageType(bytes);
  if (!kind) throw new Error("Only JPG, PNG, WebP and AVIF images are allowed.");

  const name = `${randomBytes(12).toString("hex")}.${kind.ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${name}`, bytes, { access: "public", contentType: kind.type });
    return blob.url;
  }

  const dir = uploadDir();
  await mkdir(/*turbopackIgnore: true*/ dir, { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ dir, name), bytes);
  return `/api/uploads/${name}`;
}

export async function readLocalUpload(name: string): Promise<{ bytes: Buffer; type: string } | null> {
  if (!SAFE_UPLOAD_NAME.test(name)) return null;
  try {
    const bytes = await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ uploadDir(), name));
    const kind = sniffImageType(bytes);
    return kind ? { bytes, type: kind.type } : null;
  } catch {
    return null;
  }
}
