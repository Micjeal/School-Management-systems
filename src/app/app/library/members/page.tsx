import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Input } from "@/components/ui/input";

export default async function LibraryMembers({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const c = await requireUserContext("library.read");
  if (!c.active_school_id)
    return (
      <PageContainer>
        <EmptyState title="Select a school" />
      </PageContainer>
    );
  const { q = "" } = await searchParams;
  const s = await createClient();

  // Get students and employees who are library members
  const [{ data: studentMembers }, { data: employeeMembers }] = await Promise.all([
    (s.from("students") as any)
      .select(
        "id,admission_number,people(first_name,last_name,primary_phone),student_library_memberships(membership_type,status,joined_at)"
      )
      .eq("school_id", c.active_school_id)
      .not("student_library_memberships", "is", null),
    (s.from("employees") as any)
      .select(
        "id,employee_number,people(first_name,last_name,primary_phone),employee_library_memberships(membership_type,status,joined_at)"
      )
      .eq("school_id", c.active_school_id)
      .not("employee_library_memberships", "is", null)
  ]);

  const allMembers = [
    ...(studentMembers ?? []).map((m: any) => ({
      ...m,
      member_type: "student",
      identifier: m.admission_number,
      membership: m.student_library_memberships?.[0]
    })),
    ...(employeeMembers ?? []).map((m: any) => ({
      ...m,
      member_type: "employee",
      identifier: m.employee_number,
      membership: m.employee_library_memberships?.[0]
    }))
  ];

  const filtered = q
    ? allMembers.filter(
        (m: any) =>
          m.people?.first_name?.toLowerCase().includes(q.toLowerCase()) ||
          m.people?.last_name?.toLowerCase().includes(q.toLowerCase()) ||
          m.identifier?.toLowerCase().includes(q.toLowerCase())
      )
    : allMembers;

  return (
    <PageContainer>
      <PageHeader
        title="Library Members"
        description="Manage student and employee library memberships."
        backHref="/app/library"
      />
      <form className="mb-5 max-w-lg">
        <Input name="q" defaultValue={q} placeholder="Search by name or ID…" />
      </form>
      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member: any) => (
            <Card key={member.id} className="h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {member.people?.first_name} {member.people?.last_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{member.identifier}</p>
                  </div>
                  <Badge variant={member.member_type === "student" ? "default" : "secondary"}>
                    {member.member_type}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">{member.membership?.membership_type}</Badge>
                  <Badge>{member.membership?.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Member since: {new Date(member.membership?.joined_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </PageContainer>
  );
}
