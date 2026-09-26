"use client";

import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteProduct, duplicateProduct, saveProduct } from "@/actions/admin";
import { Field } from "@/components/forms/Field";
import { ProductImage } from "@/components/product/ProductImage";
import { buttonClass } from "@/components/ui/button";
import { SIZES, sizeLabel } from "@/lib/config";
import { toast } from "@/store/toast";
import { adminInput } from "./ui";

interface VariantRow {
  key: string;
  id?: string;
  size: string;
  color: string;
  sku: string;
  stock: string;
}

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  details: string[];
  price: number; // paise
  compareAtPrice: number | null;
  categoryId: string;
  images: string[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  variants: { id: string; size: string; color: string; sku: string; stock: number }[];
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

let rowSeq = 0;
const newKey = () => `row-${++rowSeq}`;

export function ProductForm({
  initial,
  categories,
}: {
  initial?: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [details, setDetails] = useState((initial?.details ?? []).join("\n"));
  const [price, setPrice] = useState(initial ? String(initial.price / 100) : "");
  const [compareAt, setCompareAt] = useState(initial?.compareAtPrice ? String(initial.compareAtPrice / 100) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [isFeatured, setFeatured] = useState(initial?.isFeatured ?? false);
  const [isActive, setActive] = useState(initial?.isActive ?? true);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({ key: newKey(), id: v.id, size: v.size, color: v.color, sku: v.sku, stock: String(v.stock) })) ?? [],
  );
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const skuPrefix = () => `RB-${slugify(name).split("-").map((w) => w.slice(0, 3)).join("").toUpperCase().slice(0, 9) || "ITEM"}`;

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 10)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast(data.error ?? `Could not upload ${file.name}`, "error");
          continue;
        }
        setImages((imgs) => [...imgs, data.url as string].slice(0, 10));
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const moveImage = (i: number, dir: -1 | 1) =>
    setImages((imgs) => {
      const next = [...imgs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return imgs;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  const addVariant = (size = "M") =>
    setVariants((vs) => [
      ...vs,
      { key: newKey(), size, color: vs[0]?.color ?? "Black", sku: `${skuPrefix()}-${size}`, stock: "0" },
    ]);

  const addStandardSizes = () => {
    const existing = new Set(variants.map((v) => v.size));
    const color = variants[0]?.color ?? "Black";
    setVariants((vs) => [
      ...vs,
      ...["XS", "S", "M", "L", "XL", "XXL"]
        .filter((s) => !existing.has(s))
        .map((size) => ({ key: newKey(), size, color, sku: `${skuPrefix()}-${size}`, stock: "0" })),
    ]);
  };

  const updateVariant = (key: string, patch: Partial<VariantRow>) =>
    setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErrors({});
    const toPaise = (v: string) => Math.round(Number.parseFloat(v || "0") * 100);
    const input = {
      name,
      slug,
      description,
      details: details.split("\n").map((d) => d.trim()).filter(Boolean),
      price: toPaise(price),
      compareAtPrice: compareAt ? toPaise(compareAt) : null,
      categoryId,
      images,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured,
      isActive,
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size as (typeof SIZES)[number],
        color: v.color,
        sku: v.sku,
        stock: Number.parseInt(v.stock || "0", 10) || 0,
      })),
    };
    startSaving(async () => {
      const res = await saveProduct(initial?.id ?? null, input);
      if (!res.ok) {
        setMessage(res.message);
        setErrors(res.errors ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      toast("Product saved", "success");
      if (!initial?.id) router.push(`/admin/products/${res.id}`);
      else router.refresh();
    });
  }

  const err = (k: string) => errors[k];

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-3" noValidate>
      <div className="space-y-6 xl:col-span-2">
        {message && <p role="alert" className="border border-blood/50 bg-blood/10 px-4 py-3 text-sm">{message}</p>}

        <section className="space-y-4 border border-line bg-coal p-5">
          <Field label="Product name" name="name" error={err("name")}>
            <input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              maxLength={120}
              className={adminInput}
              aria-invalid={!!err("name")}
            />
          </Field>
          <Field label="URL slug" name="slug" error={err("slug")} hint={`redbetta.in/products/${slug || "your-product"}`}>
            <input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              maxLength={100}
              className={adminInput}
              aria-invalid={!!err("slug")}
            />
          </Field>
          <Field label="Description" name="description" error={err("description")}>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={5000} className={adminInput} aria-invalid={!!err("description")} />
          </Field>
          <Field label="Details & fit" name="details" hint="One point per line, e.g. 400 GSM brushed-back fleece" error={err("details")}>
            <textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={5} className={adminInput} />
          </Field>
        </section>

        <section className="border border-line bg-coal p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Images</h2>
            <p className="text-xs text-mist">The first image is the main photo. The second shows on hover.</p>
          </div>
          {err("images") && <p className="mb-3 text-xs text-blood">{err("images")}</p>}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {images.map((src, i) => (
              <div key={src + i} className="group relative aspect-[4/5] overflow-hidden border border-line bg-char">
                <ProductImage src={src} alt="" fill sizes="160px" className="object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 bg-blood px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-white">Main</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/85 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="grid size-7 place-items-center hover:text-blood disabled:opacity-30" aria-label="Move left">
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))} className="grid size-7 place-items-center hover:text-blood" aria-label="Remove image">
                    <X className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="grid size-7 place-items-center hover:text-blood disabled:opacity-30" aria-label="Move right">
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {images.length < 10 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border border-dashed border-line text-xs text-mist hover:border-bone hover:text-bone"
              >
                {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                {uploading ? "Uploading…" : "Upload"}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            hidden
            onChange={(e) => uploadFiles(e.target.files)}
          />
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ash" />
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste an image URL (https://…)"
                className={adminInput + " pl-9"}
                aria-label="Image URL"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const url = imageUrl.trim();
                if (!url.startsWith("https://") && !url.startsWith("/")) {
                  toast("Image URLs must start with https://", "error");
                  return;
                }
                setImages((imgs) => [...imgs, url].slice(0, 10));
                setImageUrl("");
              }}
              className="border border-line px-4 text-sm hover:border-bone"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-xs text-ash">JPG, PNG, WebP or AVIF up to 5 MB. Portrait 4:5 photos (e.g. 1600 × 2000) look best.</p>
        </section>

        <section className="border border-line bg-coal p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Sizes, colours & stock</h2>
            <div className="flex gap-2">
              <button type="button" onClick={addStandardSizes} className="border border-line px-3 py-1.5 text-xs hover:border-bone">
                Add XS to XXL
              </button>
              <button type="button" onClick={() => addVariant()} className="flex items-center gap-1 border border-line px-3 py-1.5 text-xs hover:border-bone">
                <Plus className="size-3.5" /> Variant
              </button>
            </div>
          </div>
          {err("variants") && <p className="mb-3 text-xs text-blood">{err("variants")}</p>}
          {variants.length === 0 ? (
            <p className="text-sm text-mist">No variants yet. Add sizes so customers can buy this product.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-[0.68rem] uppercase tracking-wider text-mist">
                    <th className="pb-2 font-semibold">Size</th>
                    <th className="pb-2 font-semibold">Colour</th>
                    <th className="pb-2 font-semibold">SKU</th>
                    <th className="pb-2 font-semibold">Stock</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={v.key} className="align-top">
                      <td className="pb-2 pr-2">
                        <select value={v.size} onChange={(e) => updateVariant(v.key, { size: e.target.value })} className={adminInput + " w-28"} aria-label="Size">
                          {SIZES.map((s) => (
                            <option key={s} value={s}>{sizeLabel(s)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="pb-2 pr-2">
                        <input value={v.color} onChange={(e) => updateVariant(v.key, { color: e.target.value })} maxLength={40} className={adminInput} aria-label="Colour" aria-invalid={!!err(`variants.${i}.color`)} />
                      </td>
                      <td className="pb-2 pr-2">
                        <input value={v.sku} onChange={(e) => updateVariant(v.key, { sku: e.target.value.toUpperCase() })} maxLength={64} className={adminInput + " font-mono"} aria-label="SKU" aria-invalid={!!err(`variants.${i}.sku`)} />
                      </td>
                      <td className="pb-2 pr-2">
                        <input value={v.stock} onChange={(e) => updateVariant(v.key, { stock: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" className={adminInput + " w-24"} aria-label="Stock" />
                      </td>
                      <td className="pb-2">
                        <button type="button" onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))} className="grid size-10 place-items-center text-mist hover:text-blood" aria-label="Remove variant">
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 border border-line bg-coal p-5">
          <h2 className="text-sm font-semibold">Visibility</h2>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              Active
              <span className="block text-xs text-mist">Visible and purchasable in the store</span>
            </span>
            <input type="checkbox" checked={isActive} onChange={(e) => setActive(e.target.checked)} className="size-5 accent-[#e3141b]" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              Featured
              <span className="block text-xs text-mist">Shown in the homepage drop</span>
            </span>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setFeatured(e.target.checked)} className="size-5 accent-[#e3141b]" />
          </label>
        </section>

        <section className="space-y-4 border border-line bg-coal p-5">
          <h2 className="text-sm font-semibold">Pricing</h2>
          <Field label="Price (₹, incl. GST)" name="price" error={err("price")}>
            <input id="price" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className={adminInput} aria-invalid={!!err("price")} />
          </Field>
          <Field label="Compare-at price (₹)" name="compareAt" error={err("compareAtPrice")} hint="Optional. Shown struck through.">
            <input id="compareAt" value={compareAt} onChange={(e) => setCompareAt(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className={adminInput} aria-invalid={!!err("compareAtPrice")} />
          </Field>
        </section>

        <section className="space-y-4 border border-line bg-coal p-5">
          <h2 className="text-sm font-semibold">Organisation</h2>
          <Field label="Category" name="categoryId" error={err("categoryId")}>
            <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={adminInput}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Tags" name="tags" hint="Comma separated. Special: new, bestseller, limited, essential" error={err("tags")}>
            <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={adminInput} />
          </Field>
        </section>

        <div className="space-y-3 xl:sticky xl:top-6">
          <button type="submit" disabled={saving || uploading} className={buttonClass({ size: "lg", block: true })}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : initial?.id ? "Save changes" : "Create product"}
          </button>
          {initial?.id && (
            <button
              type="button"
              disabled={deleting || saving}
              onClick={() => startDeleting(() => duplicateProduct(initial.id!))}
              className={buttonClass({ variant: "outline", block: true })}
            >
              Duplicate as new design
            </button>
          )}
          {initial?.id && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                if (!confirm("Delete this product? Products with past orders are archived instead.")) return;
                startDeleting(() => deleteProduct(initial.id!));
              }}
              className={clsx(buttonClass({ variant: "danger", block: true }))}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : "Delete product"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
