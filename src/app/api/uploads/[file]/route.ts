import { readLocalUpload } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const upload = await readLocalUpload(file);
  if (!upload) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(upload.bytes), {
    headers: {
      "Content-Type": upload.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    },
  });
}
