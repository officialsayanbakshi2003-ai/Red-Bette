import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/forms/AuthShell";
import { LoginForm } from "@/components/forms/AuthForms";
import { getCurrentUser, safeNextPath } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const safeNext = next ? safeNextPath(next) : undefined;
  const user = await getCurrentUser();
  if (user) redirect(safeNext ?? (user.role === "ADMIN" ? "/admin" : "/account"));
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to track orders, save favourites and check out faster.">
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
