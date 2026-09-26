"use client";

import { ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { resetStorefrontImage, setStorefrontImage } from "@/actions/admin";
import { RemotePhoto } from "@/components/RemotePhoto";
import type { Photo } from "@/lib/media";
import { toast } from "@/store/toast";
import { adminInput } from "./ui";

export function StorefrontMediaEditor({
  slot,
  label,
  hint,
  photo,
  isCustom,
}: {
  slot: string;
  label: string;
  hint: string;
  photo: Photo;
  isCustom: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function apply(src: string) {
    const res = await setStorefrontImage(slot, src);
    toast(res.ok ? `${label} updated` : res.message ?? "Could not update", res.ok ? "success" : "error");
  }

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error ?? "Upload failed", "error");
        return;
      }
      await apply(data.url);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="border border-line bg-coal">
      <div className="relative aspect-[16/10] overflow-hidden bg-char">
        <RemotePhoto key={photo.src} photo={photo} sizes="400px" className="object-cover" fallbackClassName="object-contain p-6" />
        <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider backdrop-blur">
          {isCustom ? "Custom" : "Default"}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-mist">{hint}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || pending}
            className="flex flex-1 items-center justify-center gap-2 border border-line py-2 text-xs hover:border-bone"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />} Upload
          </button>
          {isCustom && (
            <button
              type="button"
              onClick={() => start(() => resetStorefrontImage(slot))}
              disabled={busy || pending}
              className="flex items-center gap-1.5 border border-line px-3 py-2 text-xs text-mist hover:border-bone hover:text-bone"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="or paste https:// URL" className={adminInput + " !py-2 text-xs"} aria-label={`${label} image URL`} />
          <button
            type="button"
            disabled={!url.trim() || pending}
            onClick={() => start(async () => { await apply(url.trim()); setUrl(""); })}
            className="border border-line px-3 text-xs hover:border-bone disabled:opacity-40"
          >
            Set
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => upload(e.target.files)} />
      </div>
    </div>
  );
}
