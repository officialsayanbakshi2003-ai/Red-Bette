import type { Metadata } from "next";
import { signOutEverywhere } from "@/actions/account";
import { PasswordForm, ProfileForm } from "@/components/account/AccountForms";
import { buttonClass } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Account settings", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requireUser("/account/settings");
  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-6 font-display text-lg font-semibold uppercase tracking-[0.15em]">Profile</h2>
        <ProfileForm name={user.name} email={user.email} phone={user.phone} />
      </section>
      <section className="border-t border-line pt-10">
        <h2 className="mb-6 font-display text-lg font-semibold uppercase tracking-[0.15em]">Password</h2>
        <PasswordForm />
      </section>
      <section className="border-t border-line pt-10">
        <h2 className="font-display text-lg font-semibold uppercase tracking-[0.15em]">Security</h2>
        <p className="mt-2 max-w-lg text-sm text-mist">
          Signed in somewhere you don&apos;t recognise? Sign out of every device, including this one.
        </p>
        <form action={signOutEverywhere} className="mt-5">
          <button type="submit" className={buttonClass({ variant: "danger" })}>
            Sign out everywhere
          </button>
        </form>
      </section>
    </div>
  );
}
