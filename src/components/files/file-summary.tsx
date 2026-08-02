import {
  BadgeCheck,
  Clock3,
  Files,
  History,
} from "lucide-react";

import type {
  FileSummary as FileSummaryData,
} from "@/lib/files/file-types";

type FileSummaryProps = {
  summary: FileSummaryData;
};

export function FileSummary({
  summary,
}: FileSummaryProps) {
  const cards = [
    {
      label: "All files",
      value: summary.allFiles,
      icon: Files,
    },
    {
      label: "Verified documents",
      value:
        summary.verifiedDocuments,
      icon: BadgeCheck,
    },
    {
      label: "Expiring soon",
      value: summary.expiringSoon,
      icon: Clock3,
    },
    {
      label: "Recent files",
      value: summary.recentFiles,
      icon: History,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>

              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}