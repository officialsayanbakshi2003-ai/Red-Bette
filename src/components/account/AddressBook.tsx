"use client";

import { Plus } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { deleteAddress, setDefaultAddress } from "@/actions/account";
import { buttonClass } from "@/components/ui/button";
import { AddressForm } from "./AccountForms";

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const [adding, setAdding] = useState(addresses.length === 0);
  const [pending, startTransition] = useTransition();
  const done = useCallback(() => setAdding(false), []);

  return (
    <div className="space-y-8">
      {addresses.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-col border border-line p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{a.fullName}</p>
                {a.isDefault && (
                  <span className="bg-bone px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink">Default</span>
                )}
              </div>
              <address className="mt-2 flex-1 text-sm not-italic leading-relaxed text-mist">
                {a.line1}
                {a.line2 && <>, {a.line2}</>}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                +91 {a.phone}
              </address>
              <div className="mt-4 flex gap-4 text-xs">
                {!a.isDefault && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => setDefaultAddress(a.id))}
                    className="text-bone underline-offset-4 hover:underline"
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (confirm("Delete this address?")) startTransition(() => deleteAddress(a.id));
                  }}
                  className="text-blood underline-offset-4 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <div className="border border-line p-5 sm:p-6">
          <h3 className="mb-5 font-display text-sm font-semibold uppercase tracking-[0.18em]">New address</h3>
          <AddressForm onDone={done} />
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={buttonClass({ variant: "outline" })}>
          <Plus className="size-4" /> Add address
        </button>
      )}
    </div>
  );
}
