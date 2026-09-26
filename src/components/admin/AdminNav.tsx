"use client";

import { clsx } from "clsx";
import { Boxes, Image as ImageIcon, LayoutDashboard, Mail, Package, Tags, TicketPercent, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/storefront", label: "Storefront", icon: ImageIcon },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm transition-colors",
              active ? "bg-smoke text-bone" : "text-mist hover:bg-char hover:text-bone",
            )}
          >
            <Icon className="size-4" />
            {label}
            {label === "Messages" && unread > 0 && (
              <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-blood px-1.5 text-[0.65rem] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
