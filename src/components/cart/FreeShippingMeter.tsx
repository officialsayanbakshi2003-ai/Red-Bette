import { commerce } from "@/lib/config";
import { formatINR } from "@/lib/money";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const remaining = commerce.freeShippingThreshold - subtotal;
  const pct = Math.min(100, Math.round((subtotal / commerce.freeShippingThreshold) * 100));
  return (
    <div>
      <p className="text-xs text-mist">
        {remaining > 0 ? (
          <>
            You&apos;re <span className="font-semibold text-bone">{formatINR(remaining)}</span> away from{" "}
            <span className="text-bone">free shipping</span>
          </>
        ) : (
          <span className="text-bone">You&apos;ve unlocked free shipping.</span>
        )}
      </p>
      <div className="mt-2 h-[3px] w-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
        <div className="h-full bg-blood transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
