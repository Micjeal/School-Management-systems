import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { isUuid } from "@/lib/auth/access-errors";

export default async function EditAnnouncementPage({
  params
}: {
  params: Promise<{ announcementId: string }>;
}) {
  const context = await requireUserContext("communications.send");
  const { announcementId } = await params;
  if (!isUuid(announcementId) || !context.active_school_id) notFound();
  const supabase = await createClient();

  const { data: announcement } = await (supabase.from("announcements") as any)
    .select("id,title,body,priority,status,starts_at,expires_at,published_at")
    .eq("id", announcementId)
    .eq("school_id", context.active_school_id)
    .maybeSingle();

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit announcement"
        description="Update title, body, schedule and audience configuration in the approved school scope."
        backHref={`/app/announcements/${announcementId}`}
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Edit controls are intentionally server-scoped and restricted to authorized communication
        managers.
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" size="sm">
            Save changes
          </Button>
          <Button variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
