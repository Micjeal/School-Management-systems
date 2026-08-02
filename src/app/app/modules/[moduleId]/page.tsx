import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { moduleById, moduleWritePermission } from "@/config/modules";
import { requireUserContext } from "@/lib/auth/context";
import { listModuleRecords } from "@/lib/data/module-data";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { Input } from "@/components/ui/input";

export default async function ModuleListPage({
  params,
  searchParams,
}: {
  params: Promise<{ moduleId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { moduleId } = await params;
  const queryParams = await searchParams;
  const moduleConfig = moduleById(moduleId);
  if (!moduleConfig) notFound();
  if (moduleConfig.workflowHref) redirect(moduleConfig.workflowHref);

  const context = await requireUserContext(moduleConfig.permission);
  if (moduleConfig.platformOnly && !context.is_platform_admin) redirect("/access-denied");
  if (moduleConfig.schoolScoped && !context.active_school_id) {
    return <EmptyState title="Select a school" description="Choose an active school from the header before opening this module." />;
  }

  const writePermission = moduleWritePermission(moduleConfig);
  const canWrite = !moduleConfig.readOnly && (
    context.is_platform_admin || !writePermission || context.permissions.includes(writePermission)
  );
  const page = Math.max(1, Number(queryParams.page ?? 1));
  const q = queryParams.q ?? "";
  const { rows, count } = await listModuleRecords(moduleConfig, context, page, q);
  const base = `/app/modules/${moduleConfig.id}`;
  const createHref = canWrite && moduleConfig.fields?.length ? `${base}/new` : undefined;

  return <div>
    <PageHeader title={moduleConfig.label} description={moduleConfig.description} actionHref={createHref} />
    {queryParams.message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{queryParams.message}</p> : null}
    <form className="mb-4 flex max-w-lg gap-2">
      <Input name="q" defaultValue={q} placeholder={`Search ${moduleConfig.label.toLowerCase()}…`} />
      <button className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold">Search</button>
    </form>
    {rows.length ? <>
      <DataTable rows={rows} columns={moduleConfig.columns} detailBase={base} />
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{count} records</span>
        <div className="flex gap-2">
          {page > 1 ? <Link className="rounded-lg border bg-white px-3 py-2" href={`${base}?page=${page - 1}&q=${encodeURIComponent(q)}`}>Previous</Link> : null}
          {page * 25 < count ? <Link className="rounded-lg border bg-white px-3 py-2" href={`${base}?page=${page + 1}&q=${encodeURIComponent(q)}`}>Next</Link> : null}
        </div>
      </div>
    </> : <EmptyState actionHref={createHref} />}
  </div>;
}
