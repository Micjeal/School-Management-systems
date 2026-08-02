import type { ReactNode } from "react";

type PortalEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PortalEmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: PortalEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
