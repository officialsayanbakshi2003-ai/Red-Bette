"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/actions/admin";
import type { FormState } from "@/actions/contact";
import { Field } from "@/components/forms/Field";
import { useFormAction } from "@/components/forms/useFormAction";
import { buttonClass } from "@/components/ui/button";
import { toast } from "@/store/toast";
import { adminInput } from "./ui";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  count: number;
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);
  const { state, pending, formProps } = useFormAction<FormState>(saveCategory, {}, {
    resetOnSuccess: true,
    onSuccess: (result) => {
      toast(result.message ?? "Saved", "success");
      setEditing(null);
    },
  });
  const [deleting, startDelete] = useTransition();

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="overflow-x-auto border border-line xl:col-span-2">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="bg-char text-[0.68rem] uppercase tracking-wider text-mist">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-mist">{c.slug}</td>
                <td className="px-4 py-3 text-mist">{c.count}</td>
                <td className="px-4 py-3 text-mist">{c.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setEditing(c)} className="mr-1 inline-grid size-8 place-items-center text-mist hover:text-bone" aria-label={`Edit ${c.name}`}>
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => {
                      if (!confirm(`Delete ${c.name}?`)) return;
                      startDelete(async () => {
                        const res = await deleteCategory(c.id);
                        toast(res.ok ? "Category deleted" : res.message ?? "Could not delete", res.ok ? "success" : "error");
                      });
                    }}
                    className="inline-grid size-8 place-items-center text-mist hover:text-blood"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form key={editing?.id ?? "new"} {...formProps} className="h-fit space-y-4 border border-line bg-coal p-5">
        <h2 className="text-sm font-semibold">{editing ? `Edit ${editing.name}` : "New category"}</h2>
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <Field label="Name" name="name" error={state.errors?.name}>
          <input id="name" name="name" defaultValue={editing?.name} maxLength={60} className={adminInput} />
        </Field>
        <Field label="Slug" name="slug" error={state.errors?.slug} hint="Used in URLs, e.g. oversized-tees">
          <input id="slug" name="slug" defaultValue={editing?.slug} maxLength={100} className={adminInput} />
        </Field>
        <Field label="Description" name="description" optional>
          <textarea id="description" name="description" defaultValue={editing?.description ?? ""} rows={3} maxLength={300} className={adminInput} />
        </Field>
        <Field label="Sort order" name="sortOrder" error={state.errors?.sortOrder}>
          <input id="sortOrder" name="sortOrder" type="number" min={0} max={1000} defaultValue={editing?.sortOrder ?? 0} className={adminInput} />
        </Field>
        {state.message && !state.ok && <p className="text-sm text-blood">{state.message}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className={buttonClass({ variant: "light", className: "flex-1" })}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : editing ? "Save" : "Create"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className={buttonClass({ variant: "outline" })}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
