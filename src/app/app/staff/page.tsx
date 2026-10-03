import Link from "next/link";
import { getAccessContext } from "@/lib/auth/get-access-context";
import { getAuthorizedStaffDirectory } from "@/lib/staff/queries";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Input } from "@/components/ui/input";

export default async function Staff({
  searchParams
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const context = await getAccessContext("staff.read");
  if (!context.activeSchoolId)
    return (
      <PageContainer>
        <EmptyState title="Select a school" />
      </PageContainer>
    );
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { rows, count } = await getAuthorizedStaffDirectory(context, { page, search: params.q });
  return (
    <PageContainer>
      <PageHeader
        title="Staff and HR"
        description="Active-school employee directory."
        actionHref="/app/staff/new"
        actionLabel="Onboard employee"
      />
      <form className="mb-5 max-w-lg">
        <Input name="q" defaultValue={params.q} placeholder="Search employee number…" />
      </form>
      {rows.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((employee: any) => {
              const assignment =
                employee.employee_assignments?.find((item: any) => item.is_primary) ??
                employee.employee_assignments?.[0];
              return (
                <Link key={employee.id} href={`/app/staff/${employee.id}`}>
                  <Card className="h-full hover:shadow-md">
                    <CardContent>
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold">
                            {employee.people?.first_name} {employee.people?.last_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {employee.employee_number} · {assignment?.job_title ?? "Unassigned"}
                          </p>
                        </div>
                        <Badge>{employee.status}</Badge>
                      </div>
                      <p className="mt-4 text-sm">
                        {assignment?.departments?.name ?? "No department"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {employee.people?.primary_phone ??
                          employee.people?.primary_email ??
                          "No contact"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Page {page} · {count} records
          </p>
        </>
      ) : (
        <EmptyState />
      )}
    </PageContainer>
  );
}
