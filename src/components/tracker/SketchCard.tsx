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
    <section className={cn("sketch sketch-hover p-4 sm:p-5", className)}>
      {(title || action) && (
        <header className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon ? <span className="shrink-0 text-ink-soft">{icon}</span> : null}
            <div className="min-w-0">
              <h2 className="hand truncate text-2xl leading-tight text-foreground">{title}</h2>
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
