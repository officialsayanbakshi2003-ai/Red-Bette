import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-xs text-mist hover:text-bone">
        <ArrowLeft className="size-3.5" /> All products
      </Link>
      <AdminHeader title="New product" />
      {categories.length === 0 ? (
        <p className="text-sm text-mist">
          Create a <Link href="/admin/categories" className="text-bone underline">category</Link> first.
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
