import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { MAX_UPLOAD_BYTES, storeImage } from "@/lib/storage";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return jsonError("Not found", 404);
  if (!rateLimit(`upload:${user.id}`, 60, 10 * 60_000).success) return jsonError("Too many uploads.", 429);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) return jsonError("Images must be 5 MB or smaller.", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid upload.", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("No file received.", 400);

  try {
    const url = await storeImage(file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Upload failed.", 400);
  }
}
