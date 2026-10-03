import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canManageAnnouncements, canReadAnnouncements, isRecipientFeedView } from "@/lib/announcements/permissions";
import { formatPriority, formatStatus, loadAnnouncementRows } from "@/lib/announcements/queries";

export default async function AnnouncementsPage() {
  const context = await requireUserContext();
  const supabase = await createClient();

  if (!context.active_school_id && !context.is_platform_admin) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Announcements"
          description="Select a school to view announcements."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
          Select a school to view announcements.
        </div>
      </div>
    );
  }

  const announcements = await loadAnnouncementRows(context);
  const schoolSwitchLabel = context.is_platform_admin && !context.active_school_id
    ? "Platform Announcement Administration"
    : context.memberships.find((membership) => membership.school_id === context.active_school_id)?.school_name ?? "Announcements";

  const canManage = canManageAnnouncements(context, context.active_school_id);
  const canRead = canReadAnnouncements(context, context.active_school_id);
  const viewAsRecipient = isRecipientFeedView(context, context.active_school_id);

  if (context.is_platform_admin && !context.active_school_id) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Announcement Administration"
          description="Review and manage school announcements across SchoolDB."
          actionHref="/app/announcements/new"
          actionLabel="Create announcement"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Total announcements</p><p className="mt-2 text-2xl font-bold">{announcements.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Published now</p><p className="mt-2 text-2xl font-bold">{announcements.filter((item: any) => item.status === "published").length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Scheduled</p><p className="mt-2 text-2xl font-bold">{announcements.filter((item: any) => item.status === "scheduled").length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Urgent</p><p className="mt-2 text-2xl font-bold">{announcements.filter((item: any) => item.priority === "urgent").length}</p></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3 font-semibold">Announcements by school</div>
          <div className="divide-y divide-slate-100">
            {(announcements ?? []).map((announcement: any) => (
              <div key={announcement.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Link href={`/app/announcements/${announcement.id}`} className="font-semibold text-blue-700">{announcement.title}</Link>
                  <div className="text-sm text-slate-500">{announcement.school_name ?? "Unknown school"} · {formatStatus(announcement.status)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{formatPriority(announcement.priority)}</Badge>
                  <Badge>{formatStatus(announcement.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewAsRecipient) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Announcements"
          description="New announcements intended for you will appear here."
        />
        <div className="space-y-4">
          {(announcements ?? []).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No announcements.</div>
          ) : (announcements ?? []).map((announcement: any) => (
            <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{announcement.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{announcement.body}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{formatPriority(announcement.priority)}</Badge>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={context.is_platform_admin ? `Announcements — ${schoolSwitchLabel}` : `Announcements — ${schoolSwitchLabel}`}
        description={context.is_platform_admin ? "Create, schedule and review announcements for the selected school." : "Review and manage communication updates for the active school."}
        actionHref="/app/announcements/new"
        actionLabel="New announcement"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">All announcements</p><p className="mt-2 text-2xl font-bold">{announcements.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Published now</p><p className="mt-2 text-2xl font-bold">{announcements.filter((item: any) => item.status === "published").length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Scheduled</p><p className="mt-2 text-2xl font-bold">{announcements.filter((item: any) => item.status === "scheduled").length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Drafts</p><p className="mt-2 text-2xl font-bold">{announcements.filter((item: any) => item.status === "draft").length}</p></div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold">Announcements</div>
        <div className="divide-y divide-slate-100">
          {(announcements ?? []).length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-500">No announcements for {schoolSwitchLabel}. Create a draft, schedule an announcement or publish an update for this school.</div>
          ) : (announcements ?? []).map((announcement: any) => (
            <div key={announcement.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <Link href={`/app/announcements/${announcement.id}`} className="font-semibold text-blue-700">{announcement.title}</Link>
                <div className="text-sm text-slate-500">{formatStatus(announcement.status)} · {formatPriority(announcement.priority)} · {announcement.school_name ?? schoolSwitchLabel}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{formatPriority(announcement.priority)}</Badge>
                <Badge>{formatStatus(announcement.status)}</Badge>
                {announcement.requires_acknowledgement ? <Badge>Requires acknowledgement</Badge> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
