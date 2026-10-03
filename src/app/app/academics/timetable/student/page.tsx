import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function renderWeekdayGrid(entries: any[]) {
  const grouped = entries.reduce((acc: Record<number, any[]>, entry: any) => {
    const d = entry.weekday as number;
    if (!acc[d]) acc[d] = [];
    acc[d].push(entry);
    return acc;
  }, {});

  const days = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  if (days.length === 0)
    return <p className="text-sm text-slate-500">No lessons scheduled.</p>;

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <div key={day}>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            {WEEKDAYS[day - 1] ?? `Day ${day}`} ({grouped[day]?.length ?? 0})
          </h3>
          <div className="space-y-2">
            {(grouped[day] ?? []).map((entry: any) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {entry.subjects?.name || entry.entry_type}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.starts_at?.slice(0, 5)} – {entry.ends_at?.slice(0, 5)} ·{" "}
                    {entry.rooms?.name || "No room"}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  {entry.teachers?.people ? (
                    <p className="text-xs">
                      {entry.teachers.people.first_name} {entry.teachers.people.last_name}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function StudentTimetablePage() {
  const c = await requireUserContext("students.read");

  if (!c.active_school_id) {
    return (
      <div>
        <PageHeader title="My Timetable" description="Your class schedule" />
        <EmptyState title="Select a school" />
      </div>
    );
  }

  const supabase = await createClient();

  // Find student record linked to this user
  const { data: student } = await (supabase.from("students") as any)
    .select("id,admission_number")
    .eq("school_id", c.active_school_id)
    .eq("user_id", c.user_id)
    .maybeSingle();

  if (!student) {
    return (
      <div>
        <PageHeader title="My Timetable" description="Your class schedule" />
        <Card>
          <CardContent>
            <p className="text-sm text-slate-600">
              No student record linked. Please contact your school administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find active enrolment
  const { data: enrolment } = await (supabase.from("student_enrolments") as any)
    .select("id,class_section_id,class_sections(id,name,code)")
    .eq("student_id", student.id)
    .eq("school_id", c.active_school_id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!enrolment) {
    return (
      <div>
        <PageHeader title="My Timetable" description="Your class schedule" />
        <Card>
          <CardContent>
            <p className="text-sm text-slate-600">No active enrolment found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find published timetable version
  const { data: version } = await (supabase.from("timetable_versions") as any)
    .select("id,name,published_at")
    .eq("school_id", c.active_school_id)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!version) {
    return (
      <div>
        <PageHeader
          title="My Timetable"
          description={enrolment.class_sections?.name ?? "Your class schedule"}
        />
        <Card>
          <CardContent>
            <p className="text-sm text-slate-600">No published timetable found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: entries } = await (supabase.from("timetable_entries") as any)
    .select(
      "id,weekday,starts_at,ends_at,subjects(name),rooms(name),teachers:teacher_employee_id(people(first_name,last_name))"
    )
    .eq("class_section_id", enrolment.class_section_id)
    .eq("timetable_version_id", version.id)
    .eq("school_id", c.active_school_id)
    .order("weekday", { ascending: true })
    .order("starts_at", { ascending: true });

  const classSection = enrolment.class_sections;
  const publishedDate = version.published_at
    ? new Date(version.published_at).toLocaleDateString()
    : "Unknown date";

  return (
    <div>
      <PageHeader
        title="My Timetable"
        description={
          classSection
            ? `${classSection.name} · ${version.name} · Published ${publishedDate}`
            : `${version.name} · Published ${publishedDate}`
        }
      />
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Weekly Schedule</h2>
        </CardHeader>
        <CardContent>{renderWeekdayGrid(entries ?? [])}</CardContent>
      </Card>
    </div>
  );
}
