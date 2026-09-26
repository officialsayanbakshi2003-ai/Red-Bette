import { clsx } from "clsx";

export function Field({
  label,
  name,
  error,
  hint,
  className,
  children,
  optional,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={name} className="text-xs font-medium text-mist">
        {label}
        {optional && <span className="ml-1 text-ash">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="text-xs text-blood">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ash">{hint}</p>
      ) : null}
    </div>
  );
}
