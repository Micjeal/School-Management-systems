import { PageHeader } from "@/components/layout/page-header";

export default function LoadingAnnouncements() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Loading announcement administration..."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        Loading announcements...
      </div>
    </div>
  );
}
