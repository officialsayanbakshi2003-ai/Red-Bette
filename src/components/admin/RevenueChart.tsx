"use client";

import { useState } from "react";
import { formatINR } from "@/lib/money";

export interface RevenuePoint {
  date: string; // YYYY-MM-DD (IST)
  label: string; // e.g. "26 Sep"
  revenue: number; // paise
  orders: number;
}

/** Picks a clean axis step (1, 2, 2.5 or 5 × 10ⁿ rupees) so four gridlines cover the data. */
function niceStep(maxPaise: number): number {
  const rough = Math.max(maxPaise / 100 / 4, 250);
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= rough) ?? 10;
  return step * pow * 100;
}

const compact = (paise: number) => {
  const r = paise / 100;
  if (r >= 100000) return `₹${(r / 100000).toFixed(r % 100000 === 0 ? 0 : 1)}L`;
  if (r >= 1000) return `₹${(r / 1000).toFixed(r % 1000 === 0 ? 0 : 1)}K`;
  return `₹${r}`;
};

/** Daily revenue columns with a per-column tooltip and an accessible table. */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const step = niceStep(Math.max(...data.map((d) => d.revenue)));
  const max = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => step * i);
  const H = 200;

  return (
    <figure>
      <div className="relative flex gap-3">
        {/* Y axis */}
        <div className="relative w-12 shrink-0 text-right text-[0.65rem] tabular-nums text-ash" style={{ height: H }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 leading-none" style={{ bottom: `calc(${(t / max) * 100}% - 0.35em)` }}>
              {compact(t)}
            </span>
          ))}
        </div>
        {/* Plot */}
        <div className="relative flex-1" style={{ height: H }} onMouseLeave={() => setActive(null)}>
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 h-px bg-line" style={{ bottom: `${(t / max) * 100}%` }} aria-hidden="true" />
          ))}
          <div className="absolute inset-0 flex items-end" aria-hidden="true">
            {data.map((d, i) => {
              const h = (d.revenue / max) * 100;
              return (
                <div
                  key={d.date}
                  className="relative flex h-full flex-1 cursor-default items-end justify-center px-[1px]"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <div
                    className="w-full max-w-6 rounded-t-[4px] bg-blood transition-opacity"
                    style={{ height: `${h}%`, minHeight: d.revenue > 0 ? 2 : 0, opacity: active === null || active === i ? 1 : 0.45 }}
                  />
                </div>
              );
            })}
          </div>
          {active !== null && data[active] && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap border border-line bg-ink px-3 py-2 text-xs shadow-xl"
              style={{
                left: `${((active + 0.5) / data.length) * 100}%`,
                bottom: `${Math.min(88, (data[active].revenue / max) * 100 + 6)}%`,
              }}
            >
              <p className="text-mist">{data[active].label}</p>
              <p className="mt-0.5 font-semibold text-bone">{formatINR(data[active].revenue)}</p>
              <p className="text-mist">
                {data[active].orders} order{data[active].orders === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* X axis */}
      <div className="ml-[60px] mt-2 flex text-[0.65rem] text-ash" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.date} className="flex-1 text-center">
            {i % 2 === 0 || data.length <= 7 ? d.label.split(" ")[0] : ""}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">Daily revenue for the last {data.length} days</figcaption>
      <details className="mt-4 text-xs text-mist">
        <summary className="cursor-pointer hover:text-bone">View as table</summary>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="text-ash">
              <th className="py-1 font-normal">Date</th>
              <th className="py-1 font-normal">Orders</th>
              <th className="py-1 text-right font-normal">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-t border-line">
                <td className="py-1.5">{d.label}</td>
                <td className="py-1.5 tabular-nums">{d.orders}</td>
                <td className="py-1.5 text-right tabular-nums">{formatINR(d.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
