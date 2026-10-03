import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default async function ClassTimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ class_section_id?: string }>;
}) {
  const c = await requireUserContext("academics.manage");

  if (!c.active_school_id) {
    return (
      <div>
        <PageHeader title="Class Timetable" description="View timetable by class section" />
        <EmptyState title="Select a school" />
      </div>
    );
  }

  const supabase = await createClient();

  // Load all class sections for the selector
  const { data: classSections } = await (supabase.from("class_sections") as any)
    .select("id,name,code,class_groups(name)")
    .eq("school_id", c.active_school_id)
    .order("name", { ascending: true });

  const { class_section_id: selectedSectionId } = await searchParams;

  const sectionSelectorCard = (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="font-semibold">Select Class Section</h2>
      </CardHeader>
      <CardContent>
        <form method="GET" className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="class_section_id">Class section</Label>
            <Select
              id="class_section_id"
              name="class_section_id"
              defaultValue={selectedSectionId ?? ""}
            >
              <option value="" disabled>
                Choose a class section…
              </option>
              {(classSections ?? []).map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.class_groups?.name ? `${s.class_groups.name} – ` : ""}
                  {s.name} ({s.code})
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">View</Button>
        </form>
      </CardContent>
    </Card>
  );

  if (!selectedSectionId) {
    return (
      <div>
        <PageHeader
          title="Class Timetable"
          description="Select a class section to view its timetable."
          backHref="/app/academics/timetable"
        />
        {sectionSelectorCard}
      </div>
    );
  }

  // Resolve selected section name for header
  const selectedSection = (classSections ?? []).find(
    (s: any) => s.id === selectedSectionId
  );

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
          title="Class Timetable"
          description={selectedSection ? selectedSection.name : "Class timetable"}
          backHref="/app/academics/timetable"
        />
        {sectionSelectorCard}
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
    .eq("class_section_id", selectedSectionId)
    .eq("timetable_version_id", version.id)
    .eq("school_id", c.active_school_id)
    .order("weekday", { ascending: true })
    .order("starts_at", { ascending: true });

  const publishedDate = version.published_at
    ? new Date(version.published_at).toLocaleDateString()
    : "Unknown date";

  return (
    <div>
      <PageHeader
        title="Class Timetable"
        description={
          selectedSection
            ? `${selectedSection.name} · ${version.name} · Published ${publishedDate}`
            : `${version.name} · Published ${publishedDate}`
        }
        backHref="/app/academics/timetable"
      />
      {sectionSelectorCard}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Weekly Schedule</h2>
        </CardHeader>
        <CardContent>{renderWeekdayGrid(entries ?? [])}</CardContent>
      </Card>
    </div>
  );
}
