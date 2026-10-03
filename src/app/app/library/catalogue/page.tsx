import Link from "next/link";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Input } from "@/components/ui/input";

export default async function LibraryCatalogue({
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
  let req = (s.from("library_items") as any)
    .select(
      "id,title,author,isbn,publication_year,category,language,location,call_number,total_copies,available_copies,status"
    )
    .eq("school_id", c.active_school_id)
    .order("title", { ascending: true })
    .range(0, 49);
  if (q)
    req = req.or(
      `title.ilike.%${q}%,author.ilike.%${q}%,isbn.ilike.%${q}%,category.ilike.%${q}%`
    );
  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return (
    <PageContainer>
      <PageHeader
        title="Library Catalogue"
        description="Browse and search library items."
        backHref="/app/library"
      />
      <form className="mb-5 max-w-lg">
        <Input name="q" defaultValue={q} placeholder="Search by title, author, ISBN, or category…" />
      </form>
      {data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item: any) => (
            <Link href={`/app/library/catalogue/${item.id}`} key={item.id}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-2">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.author}</p>
                    </div>
                    <Badge>{item.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.isbn && <Badge variant="secondary">ISBN: {item.isbn}</Badge>}
                  </div>
                  <div className="mt-3 text-sm text-slate-500">
                    <p>Available: {item.available_copies} / {item.total_copies}</p>
                    <p className="text-xs">{item.location} · {item.call_number}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </PageContainer>
  );
}
