import { notFound, redirect } from "next/navigation";
import { moduleById, moduleWritePermission } from "@/config/modules";
import { requireUserContext } from "@/lib/auth/context";
import { getRelationOptions } from "@/lib/data/module-data";
import { ModuleForm } from "@/components/forms/module-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { saveModuleRecord } from "../../actions";

export default async function NewModuleRecord({
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
  if (moduleConfig.readOnly || !moduleConfig.fields?.length) notFound();

  const context = await requireUserContext(moduleWritePermission(moduleConfig) ?? moduleConfig.permission);
  if (moduleConfig.platformOnly && !context.is_platform_admin) redirect("/access-denied");
  const relations = await getRelationOptions(moduleConfig.fields, context);
  const action = saveModuleRecord.bind(null, moduleConfig.id, null);

  return <div>
    <PageHeader title={`New ${moduleConfig.label}`} description={moduleConfig.description} backHref={`/app/modules/${moduleConfig.id}`} />
    {queryParams.error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{queryParams.error}</p> : null}
    <Card><CardContent><ModuleForm fields={moduleConfig.fields} relations={relations} action={action} /></CardContent></Card>
  </div>;
}
