import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
  backHref?: string;
  actions?: ReactNode;
  breadcrumbs?: readonly BreadcrumbItem[];
};

export function PageHeader({
  title,
  description,
  eyebrow,
  actionHref,
  actionLabel = "New record",
  backHref,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  const defaultAction = actionHref ? (
    <Link
      href={actionHref}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <Plus aria-hidden="true" className="h-4 w-4" />
      {actionLabel}
    </Link>
  ) : null;

  return (
    <header className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-slate-500"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                ) : null}

                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-slate-900">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-slate-900" : undefined}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      ) : backHref ? (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back
        </Link>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>

        {actions || defaultAction ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions ?? defaultAction}
          </div>
        ) : null}
      </div>
    </header>
  );
}