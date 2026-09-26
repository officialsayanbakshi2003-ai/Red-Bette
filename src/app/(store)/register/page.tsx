import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/forms/AuthShell";
import { RegisterForm } from "@/components/forms/AuthForms";
import { getCurrentUser, safeNextPath } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const safeNext = next ? safeNextPath(next) : undefined;
  if (await getCurrentUser()) redirect(safeNext ?? "/account");
  return (
    <AuthShell title="Create account" subtitle="Create an account for early drop access, order tracking and faster checkout.">
      <RegisterForm next={safeNext} />
    </AuthShell>
  );
}
