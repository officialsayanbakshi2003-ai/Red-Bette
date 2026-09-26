import { Plus } from "lucide-react";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { AdminHeader, Pagination, Table, Td, Th, adminInput } from "@/components/admin/ui";
import { ProductImage } from "@/components/product/ProductImage";
import { buttonClass } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Products" };
const PER_PAGE = 25;

type Props = { searchParams: Promise<{ q?: string; page?: string; status?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const where: Prisma.ProductWhereInput = {
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }] } : {}),
    ...(sp.status === "archived" ? { isActive: false } : sp.status === "active" ? { isActive: true } : {}),
  };
  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: { select: { name: true } }, variants: { select: { stock: true } } },
    }),
  ]);

  return (
    <div>
      <AdminHeader
        title="Products"
        description={`${total} product${total === 1 ? "" : "s"}`}
        action={
          <Link href="/admin/products/new" className={buttonClass({ size: "sm" })}>
            <Plus className="size-4" /> New product
          </Link>
        }
      />
      <form className="mb-5 flex flex-wrap gap-2" action="/admin/products">
        <input name="q" defaultValue={q} placeholder="Search by name or SKU" className={adminInput + " sm:w-72"} aria-label="Search products" />
        <select name="status" defaultValue={sp.status ?? ""} className={adminInput + " w-auto"} aria-label="Filter by status">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <button type="submit" className="border border-line px-4 text-sm hover:border-bone">
          Filter
        </button>
      </form>
      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>Stock</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stock = p.variants.reduce((n, v) => n + v.stock, 0);
            return (
              <tr key={p.id} className="hover:bg-char/60">
                <Td>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-blood">
                    <span className="relative aspect-[4/5] w-10 shrink-0 overflow-hidden bg-char">
                      <ProductImage src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="font-medium">{p.name}</span>
                  </Link>
                </Td>
                <Td className="text-mist">{p.category.name}</Td>
                <Td className="tabular-nums">{formatINR(p.price)}</Td>
                <Td className={stock === 0 ? "text-blood" : stock <= 10 ? "text-amber-700" : "text-mist"}>
                  {stock} in {p.variants.length} variant{p.variants.length === 1 ? "" : "s"}
                </Td>
                <Td>
                  <span className={"border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider " + (p.isActive ? "border-emerald-600/40 text-emerald-700" : "border-line text-ash")}>
                    {p.isActive ? "Active" : "Archived"}
                  </span>
                  {p.isFeatured && <span className="ml-2 text-[0.68rem] uppercase tracking-wider text-blood">Featured</span>}
                </Td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <Td className="py-10 text-center text-mist">No products found.</Td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PER_PAGE))}
        href={(n) => `/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), ...(sp.status ? { status: sp.status } : {}), page: String(n) })}`}
      />
    </div>
  );
}
