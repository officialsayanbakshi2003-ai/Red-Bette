import { commerce } from "@/lib/config";
import { formatINR } from "@/lib/money";

const MESSAGES = [
  `Free shipping on orders over ${formatINR(commerce.freeShippingThreshold)}`,
  "Cash on delivery available",
  `${commerce.returnWindowDays}-day easy returns & exchanges`,
  "400 GSM heavyweight · Made in India",
  "Flow your way.",
];

export function AnnouncementBar() {
  const items = [...MESSAGES, ...MESSAGES];
  return (
    <div className="relative overflow-hidden bg-blood text-white" role="region" aria-label="Store announcements">
      <p className="sr-only">{MESSAGES.join(". ")}</p>
      <div className="flex w-max animate-marquee items-center py-2" aria-hidden="true">
        {items.map((m, i) => (
          <span key={i} className="flex items-center font-display text-[0.66rem] font-semibold uppercase tracking-[0.28em]">
            <span className="px-6">{m}</span>
            <span className="size-1 rotate-45 bg-white/80" />
          </span>
        ))}
      </div>
    </div>
  );
}
