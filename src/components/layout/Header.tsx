"use client";

import { clsx } from "clsx";
import { ArrowRight, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { RemotePhoto } from "@/components/RemotePhoto";
import { Sheet } from "@/components/ui/Sheet";
import { siteConfig } from "@/lib/config";
import type { Photo } from "@/lib/media";
import { cartCount, useCart } from "@/store/cart";

export interface NavCategory {
  name: string;
  slug: string;
}

const PRIMARY = [
  { href: "/shop?tag=new", label: "New Drop" },
  { href: "/shop?category=hoodies", label: "Hoodies" },
  { href: "/shop?category=oversized-tees", label: "Tees" },
  { href: "/about", label: "Our Story" },
];

export function Header({ categories, menuPhotos }: { categories: NavCategory[]; menuPhotos: { hoodies: Photo; tees: Photo } }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openCart = useCart((s) => s.open);
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const count = hydrated ? cartCount(lines) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close any open menu when the route changes (adjusting state during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
    setMegaOpen(false);
  }

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-50 border-b transition-colors duration-300",
          scrolled ? "border-line bg-ink/85 backdrop-blur-xl" : "border-transparent bg-ink",
        )}
      >
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-[72px]">
          {/* Left */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="-ml-2 grid size-10 place-items-center lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <nav className="hidden items-center lg:flex" aria-label="Main">
              <div
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <Link
                  href="/shop"
                  className="flex h-[72px] items-center px-3 font-display text-[0.72rem] font-medium uppercase tracking-[0.22em] text-bone/90 hover:text-bone"
                  aria-expanded={megaOpen}
                  onFocus={() => setMegaOpen(true)}
                >
                  Shop
                </Link>
              </div>
              {PRIMARY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-[72px] items-center px-3 font-display text-[0.72rem] font-medium uppercase tracking-[0.22em] text-bone/70 transition-colors hover:text-bone"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center */}
          <Link href="/" className="flex items-center text-[22px] lg:text-[26px]" aria-label={`${siteConfig.name} home`}>
            <Logo />
          </Link>

          {/* Right */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center text-bone/85 hover:text-bone"
              aria-label="Search"
            >
              <Search className="size-[19px]" />
            </button>
            <Link
              href="/account"
              className="hidden size-10 place-items-center text-bone/85 hover:text-bone sm:grid"
              aria-label="Account"
            >
              <User className="size-[19px]" />
            </Link>
            <Link
              href="/wishlist"
              className="hidden size-10 place-items-center text-bone/85 hover:text-bone sm:grid"
              aria-label="Wishlist"
            >
              <Heart className="size-[19px]" />
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative -mr-2 grid size-10 place-items-center text-bone/85 hover:text-bone"
              aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="size-[19px]" />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-blood px-1 text-[10px] font-bold leading-[18px] text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mega menu (desktop) */}
        <div
          onMouseEnter={() => setMegaOpen(true)}
          onMouseLeave={() => setMegaOpen(false)}
          className={clsx(
            "absolute inset-x-0 top-full hidden border-b border-line bg-coal/98 backdrop-blur-xl transition-all duration-300 lg:block",
            megaOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
          )}
        >
          <div className="container-x grid grid-cols-12 gap-10 py-10">
            <div className="col-span-3">
              <p className="eyebrow mb-5">Shop by category</p>
              <ul className="space-y-3">
                <li>
                  <Link href="/shop" className="font-display text-lg font-semibold uppercase tracking-wide hover:text-blood">
                    Shop all
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop?category=${c.slug}`}
                      className="font-display text-lg font-semibold uppercase tracking-wide text-bone/80 hover:text-blood"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-3">
              <p className="eyebrow mb-5">Collections</p>
              <ul className="space-y-3 text-sm text-mist">
                <li><Link href="/shop?tag=new" className="hover:text-bone">New arrivals</Link></li>
                <li><Link href="/shop?tag=bestseller" className="hover:text-bone">Bestsellers</Link></li>
                <li><Link href="/shop?tag=limited" className="hover:text-bone">Limited edition</Link></li>
                <li><Link href="/shop?tag=betta" className="hover:text-bone">The Betta series</Link></li>
                <li><Link href="/shop?tag=essential" className="hover:text-bone">Essentials</Link></li>
              </ul>
            </div>
            <Link href="/shop?category=hoodies" className="group relative col-span-3 aspect-[4/3] overflow-hidden bg-char">
              <RemotePhoto photo={menuPhotos.hoodies} sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink to-transparent p-4 font-display text-sm font-semibold uppercase tracking-[0.2em]">
                Hoodies <ArrowRight className="size-4" />
              </span>
            </Link>
            <Link href="/shop?category=oversized-tees" className="group relative col-span-3 aspect-[4/3] overflow-hidden bg-char">
              <RemotePhoto photo={menuPhotos.tees} sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink to-transparent p-4 font-display text-sm font-semibold uppercase tracking-[0.2em]">
                Oversized tees <ArrowRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} side="left" title="Menu" hideHeader>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <span className="text-xl">
            <Logo />
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="-mr-2 grid size-10 place-items-center text-mist hover:text-bone"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
          <ul className="space-y-1">
            <li>
              <Link href="/shop" className="flex items-center justify-between py-3 font-display text-2xl font-bold italic uppercase">
                Shop all <ArrowRight className="size-5 text-blood" />
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="block py-3 font-display text-2xl font-bold italic uppercase text-bone/85"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-2 border-t border-line pt-6 text-sm">
            <Link href="/shop?tag=new" className="py-2 text-mist hover:text-bone">New arrivals</Link>
            <Link href="/shop?tag=bestseller" className="py-2 text-mist hover:text-bone">Bestsellers</Link>
            <Link href="/about" className="py-2 text-mist hover:text-bone">Our story</Link>
            <Link href="/contact" className="py-2 text-mist hover:text-bone">Contact</Link>
            <Link href="/faq" className="py-2 text-mist hover:text-bone">FAQ</Link>
            <Link href="/shipping-returns" className="py-2 text-mist hover:text-bone">Shipping &amp; returns</Link>
          </div>
        </nav>
        <div className="grid grid-cols-2 gap-2 border-t border-line p-5">
          <Link href="/account" className="flex h-12 items-center justify-center gap-2 border border-line text-sm">
            <User className="size-4" /> Account
          </Link>
          <Link href="/wishlist" className="flex h-12 items-center justify-center gap-2 border border-line text-sm">
            <Heart className="size-4" /> Wishlist
          </Link>
        </div>
      </Sheet>

      <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

const POPULAR = ["Hoodies", "Oversized tee", "Betta", "Blood moon", "Joggers"];

function SearchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    onClose();
    router.push(`/shop?q=${encodeURIComponent(t)}`);
  };

  return (
    <Sheet open={open} onClose={onClose} side="top" title="Search" hideHeader>
      <div className="container-x py-6 sm:py-10">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            go(q);
          }}
          className="flex items-center gap-3 border-b-2 border-bone/80 pb-3"
        >
          <Search className="size-6 shrink-0 text-mist" />
          <input
            ref={inputRef}
            data-autofocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search hoodies, tees, drops…"
            aria-label="Search products"
            maxLength={80}
            className="min-w-0 flex-1 bg-transparent font-display text-xl font-semibold tracking-wide outline-none placeholder:text-ash sm:text-3xl"
          />
          <button type="button" onClick={onClose} className="grid size-10 place-items-center text-mist hover:text-bone" aria-label="Close search">
            <X className="size-5" />
          </button>
        </form>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">Popular</span>
          {POPULAR.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => go(term)}
              className="border border-line px-3 py-1.5 text-xs text-mist transition-colors hover:border-bone hover:text-bone"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
