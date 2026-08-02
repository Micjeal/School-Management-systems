import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { moduleById, moduleWritePermission } from "@/config/modules";
import { requireUserContext } from "@/lib/auth/context";
import { getModuleRecord, getRelationOptions } from "@/lib/data/module-data";
import { ModuleForm } from "@/components/forms/module-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { displayValue, titleCase } from "@/lib/formatting";
import { deleteModuleRecord, saveModuleRecord } from "../../actions";

export default async function ModuleRecord({
  params,
  searchParams,
}: {
  params: Promise<{ moduleId: string; recordId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { moduleId, recordId } = await params;
  const queryParams = await searchParams;
  const moduleConfig = moduleById(moduleId);
  if (!moduleConfig) notFound();
  if (moduleConfig.workflowHref) redirect(moduleConfig.workflowHref);

  const context = await requireUserContext(moduleConfig.permission);
  if (moduleConfig.platformOnly && !context.is_platform_admin) redirect("/access-denied");
  const record = await getModuleRecord(moduleConfig, context, recordId);
  if (!record) notFound();

  const writePermission = moduleWritePermission(moduleConfig);
  const canWrite = !moduleConfig.readOnly && (
    context.is_platform_admin || !writePermission || context.permissions.includes(writePermission)
  );
  const relations = canWrite ? await getRelationOptions(moduleConfig.fields ?? [], context) : {};

  return <div>
    <PageHeader title={`${moduleConfig.label} record`} description={`Record ${recordId}`} backHref={`/app/modules/${moduleConfig.id}`} />
    {queryParams.message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{queryParams.message}</p> : null}
    {queryParams.error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{queryParams.error}</p> : null}
    
    {/* Add Manage permissions button for roles module */}
    {moduleConfig.id === "roles" && (
      <div className="mb-4">
        <Link href={`/app/platform/roles/${recordId}/permissions`}>
          <Button variant="secondary">Manage permissions</Button>
        </Link>
      </div>
    )}
    
    {canWrite && moduleConfig.fields?.length ? <Card>
      <CardHeader><h2 className="font-semibold">Edit record</h2></CardHeader>
      <CardContent><ModuleForm fields={moduleConfig.fields} defaults={record} relations={relations} action={saveModuleRecord.bind(null, moduleConfig.id, recordId)} submitLabel="Save changes" /></CardContent>
    </Card> : <Card><CardContent><dl className="grid gap-5 sm:grid-cols-2">
      {Object.entries(record).map(([key, value]) => <div key={key}>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titleCase(key)}</dt>
        <dd className="mt-1 break-words text-sm text-slate-900">{displayValue(value)}</dd>
      </div>)}
    </dl></CardContent></Card>}
    {canWrite ? <form action={deleteModuleRecord.bind(null, moduleConfig.id, recordId)} className="mt-6 flex justify-end">
      <Button variant="danger" type="submit">Delete record</Button>
    </form> : null}
  </div>;
}
