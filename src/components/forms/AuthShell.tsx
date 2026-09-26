import { RemotePhoto } from "@/components/RemotePhoto";
import { getStorefrontMedia } from "@/lib/site-media";

export async function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const media = await getStorefrontMedia();
  return (
    <div className="container-x grid grid-cols-1 gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-20">
      <div className="theme-dark relative hidden aspect-[4/5] overflow-hidden bg-char lg:block">
        <RemotePhoto photo={media.auth} sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <p className="display absolute bottom-8 left-8 text-5xl">
          Flow <span className="text-blood">your way.</span>
        </p>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-mist">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
