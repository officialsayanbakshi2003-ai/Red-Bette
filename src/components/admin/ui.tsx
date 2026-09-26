import { clsx } from "clsx";
import Link from "next/link";

export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-mist">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("border border-line bg-coal", className)}>{children}</div>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={clsx("bg-char px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wider text-mist", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={clsx("border-t border-line px-4 py-3 align-middle", className)}>{children}</td>;
}

export function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (p: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pagination">
      <p className="text-mist">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className="border border-line px-3 py-1.5 hover:border-bone">
            Previous
          </Link>
        )}
        {page < pageCount && (
          <Link href={href(page + 1)} className="border border-line px-3 py-1.5 hover:border-bone">
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}

export const adminInput = "field !py-2.5 text-sm";
