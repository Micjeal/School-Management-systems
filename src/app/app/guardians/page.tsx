import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Input } from "@/components/ui/input";

export default async function Guardians({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const c = await requireUserContext("guardians.read");
  if (!c.active_school_id)
    return (
      <PageContainer>
        <EmptyState title="Select a school" />
      </PageContainer>
    );
  const { q = "" } = await searchParams;
  const s = await createClient();
  let req = (s.from("guardians") as any)
    .select(
      "id,status,portal_enabled,people(first_name,middle_name,last_name,primary_phone,primary_email)"
    )
    .eq("school_id", c.active_school_id)
    .order("created_at", { ascending: false })
    .range(0, 24);
  if (q)
    req = req.or(
      `people.first_name.ilike.%${q}%,people.last_name.ilike.%${q}%,people.primary_phone.ilike.%${q}%,people.primary_email.ilike.%${q}%`
    );
  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return (
    <PageContainer>
      <PageHeader
        title="Guardians"
        description="Parent and guardian profiles with student relationships and portal access."
        actionHref="/app/guardians/new"
        actionLabel="Add guardian"
      />
      <form className="mb-5 max-w-lg">
        <Input name="q" defaultValue={q} placeholder="Search by name, phone, or email…" />
      </form>
      {data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((guardian: any) => (
            <Link href={`/app/guardians/${guardian.id}`} key={guardian.id}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold">
                        {guardian.people?.first_name} {guardian.people?.middle_name}{" "}
                        {guardian.people?.last_name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {guardian.people?.primary_phone ?? "No contact number"}
                      </p>
                    </div>
                    <Badge>{guardian.status}</Badge>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Badge variant={guardian.portal_enabled ? "default" : "secondary"}>
                      {guardian.portal_enabled ? "Portal enabled" : "Portal disabled"}
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">
                    {guardian.people?.primary_email ?? "No email"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState actionHref="/app/guardians/new" actionLabel="Add first guardian" />
      )}
    </PageContainer>
  );
}
