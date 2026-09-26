import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { AccountNav } from "@/components/account/AccountNav";
import { requireUser } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  return (
    <div className="container-x py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">
            Hey, <span className="text-blood">{user.name.split(" ")[0]}</span>
          </h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-mist hover:text-bone"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <aside>
          <AccountNav isAdmin={user.role === "ADMIN"} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
