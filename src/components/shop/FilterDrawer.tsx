"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";

export function FilterDrawer({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Close after a filter link is followed.
  const location = `${pathname}?${searchParams.toString()}`;
  const [lastLocation, setLastLocation] = useState(location);
  if (location !== lastLocation) {
    setLastLocation(location);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 border border-line px-4 font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] hover:border-bone/50"
      >
        <SlidersHorizontal className="size-3.5" />
        Filter
        {activeCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-blood text-[0.6rem] text-white">{activeCount}</span>
        )}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="left" title="Filter">
        <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
      </Sheet>
    </>
  );
}
