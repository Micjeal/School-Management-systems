import { notFound } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publishTimetableVersion } from "@/app/app/academics/timetable/actions";

export default async function TimetableDetailPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const context = await requireUserContext("academics.manage");
  const supabase = await createClient();
  
  const { data: version } = await (supabase.from("timetable_versions") as any)
    .select("*,academic_years(name),terms(name)")
    .eq("id", versionId)
    .eq("school_id", context.active_school_id)
    .single();
    
  if (!version) notFound();

  const { data: conflicts } = await supabase.rpc("check_timetable_conflicts" as any, {
    target_timetable_version_id: versionId,
  } as any) as any;

  const { data: entries } = await (supabase.from("timetable_entries") as any)
    .select("*,class_sections(name,code),rooms(name),teachers(people(first_name,last_name))")
    .eq("timetable_version_id", versionId)
    .order("weekday,starts_at");

  return (
    <div>
      <PageHeader 
        title={version.name}
        description={`${version.academic_years?.name} - ${version.terms?.name || "All year"}`}
        backHref="/app/academics/timetable"
      />
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Status</h2>
            <Badge>{version.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {version.status === "draft" && (
            <div className="space-y-4">
              {conflicts && conflicts.length > 0 && (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="font-medium text-red-900">Conflicts detected ({conflicts.length})</p>
                  <ul className="mt-2 space-y-1 text-sm text-red-800">
                    {conflicts.slice(0, 5).map((c: any, i: number) => (
                      <li key={i}>
                        {c.conflict_type} conflict between entries {c.entry_id} and {c.conflicting_entry_id}
                      </li>
                    ))}
                    {conflicts.length > 5 && <li>...and {conflicts.length - 5} more</li>}
                  </ul>
                </div>
              )}
              <form action={publishTimetableVersion}>
                <input type="hidden" name="version_id" value={versionId} />
                <Button 
                  type="submit" 
                  disabled={conflicts && conflicts.length > 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Publish Timetable
                </Button>
              </form>
            </div>
          )}
          {version.status === "published" && (
            <p className="text-sm text-slate-600">
              Published on {new Date(version.published_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Timetable Entries</h2>
            {version.status === "draft" && (
              <Button size="sm">Add Entry</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {entries && entries.length > 0 ? (
            <div className="space-y-2">
              {entries.map((entry: any) => (
                <div key={entry.id} className="flex justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">
                      {entry.class_sections?.code || "Unknown"} - {entry.class_sections?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Day {entry.weekday} · {entry.starts_at} - {entry.ends_at}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{entry.rooms?.name || "No room"}</p>
                    <p className="text-slate-500">{entry.teachers?.people?.first_name} {entry.teachers?.people?.last_name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No entries yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
