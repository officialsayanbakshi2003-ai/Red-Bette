import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminHeader } from "@/components/admin/ui";
import { sizeRank } from "@/lib/config";
import { db } from "@/lib/db";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { variants: true } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();
  const variants = [...product.variants].sort((a, b) => sizeRank(a.size) - sizeRank(b.size));
  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-xs text-mist hover:text-bone">
        <ArrowLeft className="size-3.5" /> All products
      </Link>
      <AdminHeader
        title={product.name}
        action={
          product.isActive ? (
            <Link href={`/products/${product.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs text-mist hover:text-bone">
              View in store <ExternalLink className="size-3.5" />
            </Link>
          ) : undefined
        }
      />
      <ProductForm
        key={product.updatedAt.toISOString()}
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          details: product.details,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          categoryId: product.categoryId,
          images: product.images,
          tags: product.tags,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          variants: variants.map((v) => ({ id: v.id, size: v.size, color: v.color, sku: v.sku, stock: v.stock })),
        }}
      />
    </div>
  );
}
