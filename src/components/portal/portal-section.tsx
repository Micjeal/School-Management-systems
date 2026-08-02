import type { ReactNode } from "react";

type PortalSectionProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PortalSection({ title, icon, children, className = "" }: PortalSectionProps) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
