import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPriority, formatStatus } from "@/lib/announcements/queries";
import { isUuid } from "@/lib/auth/access-errors";

export default async function AnnouncementDetailPage({
  params
}: {
  params: Promise<{ announcementId: string }>;
}) {
  const context = await requireUserContext();
  const { announcementId } = await params;
  if (!isUuid(announcementId)) notFound();
  const supabase = await createClient();

  if (!context.active_school_id && !context.is_platform_admin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Select a school to view announcements.
      </div>
    );
  }

  let request = (supabase.from("announcements") as any)
    .select("id,school_id,title,body,priority,status,starts_at,expires_at,published_at,schools(name),announcement_audiences(id,audience_type,audience_id)")
    .eq("id", announcementId);
  request = context.active_school_id
    ? request.eq("school_id", context.active_school_id)
    : request.is("school_id", null);
  if (!context.permissions.includes("communications.read") && !context.permissions.includes("communications.send")) {
    const now = new Date().toISOString();
    request = request.eq("status", "published").or(`starts_at.is.null,starts_at.lte.${now}`).or(`expires_at.is.null,expires_at.gte.${now}`);
  }
  const { data: announcement } = await request.maybeSingle();

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={announcement.title}
        description="Announcement detail and delivery context"
        backHref="/app/announcements"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <a href={`/app/announcements/${announcementId}/edit`}>Edit</a>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="text-sm text-slate-500">School</div>
          <div className="font-semibold">
            {announcement.schools?.name ?? announcement.school_id}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="text-sm text-slate-500">Audience</div>
          <div className="font-semibold">
            {announcement.announcement_audiences?.length
              ? announcement.announcement_audiences[0].audience_type
              : "All school users"}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="text-sm text-slate-500">Priority</div>
          <Badge>{formatPriority(announcement.priority)}</Badge>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="text-sm text-slate-500">Status</div>
          <Badge>{formatStatus(announcement.status)}</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Body</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{announcement.body}</p>
      </div>
    </div>
  );
}
