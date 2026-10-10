import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SketchCard({
  title,
  subtitle,
  icon,
  action,
  className,
  children,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
  icon?: ReactNode | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
}) {
  return (
    <section className={cn("nb-card p-4 sm:p-5", className)}>
      {(title || action) && (
        <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b-2 border-border pb-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon ? (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-base border-2 border-border bg-main text-main-foreground [&_svg]:h-4 [&_svg]:w-4">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold leading-tight text-foreground sm:text-xl">
                {title}
              </h2>
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
