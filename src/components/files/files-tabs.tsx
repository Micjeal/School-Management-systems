"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type FilesTabsProps = {
  activeTab: string;
  schoolName: string;
  hasRoleFiles: boolean;
  hasAdministration: boolean;
  hasActivity?: boolean;
};

export function FilesTabs({
  activeTab,
  schoolName,
  hasRoleFiles,
  hasAdministration,
  hasActivity = false,
}: FilesTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`/app/files?${params.toString()}`);
  };

  const tabs = [
    { id: "my-files", label: "My files" },
    ...(hasRoleFiles ? [{ id: "role-files", label: "Role files" }] : []),
    ...(hasAdministration ? [{ id: "administration", label: "Administration" }] : []),
    ...(hasActivity ? [{ id: "activity", label: "Activity" }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-muted-foreground">
        {schoolName}
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
