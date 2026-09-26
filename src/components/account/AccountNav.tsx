"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/account", label: "Overview" },
    { href: "/account/orders", label: "Orders" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/account/addresses", label: "Addresses" },
    { href: "/account/settings", label: "Settings" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin dashboard" }] : []),
  ];
  return (
    <nav aria-label="Account" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
      {items.map((item) => {
        const active = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "shrink-0 px-4 py-2.5 font-display text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors lg:border-l-2",
              active
                ? "bg-smoke text-bone lg:border-blood lg:bg-transparent"
                : "text-mist hover:text-bone lg:border-transparent",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
