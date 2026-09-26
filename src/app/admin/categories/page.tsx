import { CategoryManager } from "@/components/admin/CategoryManager";
import { AdminHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <div>
      <AdminHeader title="Categories" description="Group products in the shop and navigation." />
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          sortOrder: c.sortOrder,
          count: c._count.products,
        }))}
      />
    </div>
  );
}
