import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { createAnnouncementDirectAction } from "@/app/app/announcements/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { loadSchoolsForPlatformTargeting } from "@/lib/announcements/queries";

export default async function NewAnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();
  const qp = await searchParams;

  if (!context.active_school_id && !context.is_platform_admin) {
    redirect("/access-denied");
  }

  const platformSchools = context.is_platform_admin ? await loadSchoolsForPlatformTargeting() : [];
  const activeSchoolName = context.active_school_id
    ? context.memberships.find((membership) => membership.school_id === context.active_school_id)?.school_name ?? "Active school"
    : null;

  const { data: campusRows } = await (supabase.from("campuses") as any)
    .select("id, name")
    .eq("school_id", context.active_school_id ?? platformSchools[0]?.id ?? "")
    .order("name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create announcement"
        description="Create a school-scoped announcement with validated audience targeting."
        backHref="/app/announcements"
      />

      <form action={createAnnouncementDirectAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {qp.error ? (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{qp.error}</p>
        ) : null}
        {context.is_platform_admin ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="target_school_id">Target school</label>
            <select id="target_school_id" name="target_school_id" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" defaultValue="">
              <option value="">Select a school</option>
              {platformSchools.map((school: { id: string; name: string }) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            Target school: {activeSchoolName}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="title">Title</label>
            <input id="title" name="title" required maxLength={200} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="category">Category</label>
            <input id="category" name="category" defaultValue="general" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="priority">Priority</label>
            <select id="priority" name="priority" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" defaultValue="normal">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Action</span>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" name="submit_action" value="draft" variant="secondary">Save draft</Button>
              <Button type="submit" name="submit_action" value="schedule" variant="outline">Schedule</Button>
              <Button type="submit" name="submit_action" value="publish" variant="primary">Publish now</Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="body">Body</label>
          <textarea id="body" name="body" required rows={6} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="audience_type">Audience</label>
            <select id="audience_type" name="audience_type" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" defaultValue="all">
              <option value="all">All school users</option>
              <option value="staff">Staff</option>
              <option value="students">Students</option>
              <option value="guardians">Guardians</option>
              <option value="role">Role</option>
              <option value="campus">Campus</option>
              <option value="class">Class</option>
              <option value="user">Individual user</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="requires_acknowledgement">Acknowledgement requirement</label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <input id="requires_acknowledgement" name="requires_acknowledgement" type="checkbox" />
              Recipients must confirm that they have read this announcement.
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="starts_at">Starts at</label>
            <input id="starts_at" name="starts_at" type="datetime-local" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="expires_at">Expires at</label>
            <input id="expires_at" name="expires_at" type="datetime-local" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input name="role_id" placeholder="Role ID" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <select name="campus_id" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" defaultValue="">
            <option value="">Campus</option>
            {(campusRows ?? []).map((campus: any) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
          <input name="class_section_id" placeholder="Class section ID" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input name="user_id" placeholder="User ID" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <div className="flex items-center gap-3" />
      </form>
    </div>
  );
}
