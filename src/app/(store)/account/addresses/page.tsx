import type { Metadata } from "next";
import { AddressBook } from "@/components/account/AddressBook";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return (
    <section>
      <h2 className="mb-6 font-display text-lg font-semibold uppercase tracking-[0.15em]">Saved addresses</h2>
      <AddressBook addresses={addresses} />
    </section>
  );
}
