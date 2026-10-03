import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDate } from "@/lib/formatting";

export default async function LibraryReservations() {
  const c = await requireUserContext("library.read");
  if (!c.active_school_id)
    return (
      <PageContainer>
        <EmptyState title="Select a school" />
      </PageContainer>
    );
  const s = await createClient();

  const { data: reservations } = await (s.from("library_reservations" as any) as any)
    .select(
      "id,reserved_at,status,expires_at,student_id,employee_id,library_copies(accession_number,library_items(title)),students(admission_number,people(first_name,last_name)),employees(employee_number,people(first_name,last_name))"
    )
    .eq("school_id", c.active_school_id)
    .in("status", ["pending", "fulfilled", "cancelled"])
    .order("reserved_at", { ascending: false }) as any;

  return (
    <PageContainer>
      <PageHeader
        title="Library Reservations"
        description="Manage item reservations and fulfillment."
        backHref="/app/library"
      />
      {reservations?.length ? (
        <div className="grid gap-4">
          {reservations.map((reservation: any) => (
            <Card key={reservation.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {reservation.library_copies?.library_items?.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      Copy: {reservation.library_copies?.accession_number}
                    </p>
                  </div>
                  <Badge>{reservation.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {reservation.students
                    ? `${reservation.students?.admission_number} — ${reservation.students?.people?.first_name} ${reservation.students?.people?.last_name}`
                    : `${reservation.employees?.employee_number} — ${reservation.employees?.people?.first_name} ${reservation.employees?.people?.last_name}`}
                </p>
                <div className="mt-2 text-xs text-slate-500">
                  <p>Reserved: {formatDate(reservation.reserved_at)}</p>
                  {reservation.expires_at && <p>Expires: {formatDate(reservation.expires_at)}</p>}
                </div>
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
