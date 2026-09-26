import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/brand/Logo";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Red Betta" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const unread = await db.contactMessage.count({ where: { isRead: false } });
  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-coal lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-4 lg:px-5">
          <Link href="/admin" className="text-lg" aria-label="Admin dashboard">
            <Logo />
          </Link>
          <span className="bg-blood px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">Admin</span>
        </div>
        <div className="px-2 pb-3 lg:px-3">
          <AdminNav unread={unread} />
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-mist lg:hidden">
          <Link href="/" className="flex items-center gap-1.5 hover:text-bone">
            <ExternalLink className="size-3.5" /> View store
          </Link>
          <form action={logout}>
            <button type="submit" className="flex items-center gap-1.5 hover:text-bone">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </form>
        </div>
        <div className="hidden border-t border-line p-4 text-xs text-mist lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="truncate">{admin.email}</p>
          <div className="mt-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 hover:text-bone">
              <ExternalLink className="size-3.5" /> View store
            </Link>
            <form action={logout}>
              <button type="submit" className="flex items-center gap-1.5 hover:text-bone">
                <LogOut className="size-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
