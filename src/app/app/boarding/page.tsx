import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Building2, Users, BedDouble, ClipboardList, LogOut, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/formatting";

export default async function BoardingHub() {
  const c = await requireUserContext("boarding.manage");
  if (!c.active_school_id)
    return (
      <PageContainer>
        <EmptyState title="Select a school" description="Choose a school to manage boarding." />
      </PageContainer>
    );

  const sid = c.active_school_id;
  const s = await createClient();

  const [
    { count: hostelCount },
    { count: boardingStudentCount },
    { count: activeAssignmentCount },
    { data: recentAssignments },
  ] = await Promise.all([
    (s.from("hostels") as any)
      .select("id", { count: "exact", head: true })
      .eq("school_id", sid)
      .eq("status", "active"),
    (s.from("students") as any)
      .select("id", { count: "exact", head: true })
      .eq("school_id", sid)
      .in("boarding_status", ["boarding", "weekly_boarding"]),
    (s.from("boarding_assignments") as any)
      .select("id", { count: "exact", head: true })
      .eq("school_id", sid)
      .eq("status", "active"),
    (s.from("boarding_assignments") as any)
      .select(
        "id,starts_on,status,students(people(first_name,last_name)),boarding_beds(bed_number,hostel_rooms(name,hostels(name)))"
      )
      .eq("school_id", sid)
      .eq("status", "active")
      .order("starts_on", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Active Dormitories", value: hostelCount ?? 0, icon: Building2 },
    { label: "Boarding Students", value: boardingStudentCount ?? 0, icon: Users },
    { label: "Active Assignments", value: activeAssignmentCount ?? 0, icon: BedDouble },
  ];

  const hubLinks = [
    {
      href: "/app/boarding/dormitories",
      label: "Dormitories",
      description: "Manage hostels and rooms",
      icon: Building2,
    },
    {
      href: "/app/boarding/assignments",
      label: "Assignments",
      description: "Bed allocations for students",
      icon: BedDouble,
    },
    {
      href: "/app/boarding/roll-call",
      label: "Roll Call",
      description: "Daily attendance registers",
      icon: ClipboardList,
    },
    {
      href: "/app/boarding/leave",
      label: "Leave",
      description: "Exeat and leave requests",
      icon: LogOut,
    },
    {
      href: "/app/boarding/incidents",
      label: "Incidents",
      description: "Discipline and welfare incidents",
      icon: AlertTriangle,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Boarding"
        description="Manage dormitories, bed assignments, roll call, leave, and incidents."
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hub links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hubLinks.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-start gap-3 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{label}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent active assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAssignments && recentAssignments.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {recentAssignments.map((a: any) => {
                const person = a.students?.people;
                const name = person
                  ? `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim()
                  : "Unknown student";
                const hostelName = a.boarding_beds?.hostel_rooms?.hostels?.name ?? "—";
                const roomName = a.boarding_beds?.hostel_rooms?.name ?? "—";
                const bedNumber = a.boarding_beds?.bed_number ?? "—";
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">
                        {hostelName} · {roomName} · Bed {bedNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(a.starts_on)}</span>
                      <Badge>{a.status}</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">No active assignments yet.</p>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
