import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCategories } from "@/lib/catalog";
import { getStorefrontMedia } from "@/lib/site-media";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, media] = await Promise.all([getCategories(), getStorefrontMedia()]);
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] bg-bone px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        menuPhotos={{ hoodies: media.catHoodies, tees: media.catTees }}
      />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
