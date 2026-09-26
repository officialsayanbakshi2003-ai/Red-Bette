export function ContentPage({
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-x py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">
          {title} {accent && <span className="text-blood">{accent}</span>}
        </h1>
        {intro && <p className="mt-6 text-base leading-relaxed text-mist sm:text-lg">{intro}</p>}
      </header>
      <div className="mt-12 max-w-3xl">{children}</div>
    </div>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 text-[0.95rem] leading-relaxed text-bone/80 [&_a]:text-bone [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-[0.12em] [&_h2]:text-bone [&_li]:pl-1 [&_strong]:text-bone [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}
