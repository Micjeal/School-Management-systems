import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

type ExportDefinition = { table: string; columns: string; requiredPermission: string };

const EXPORTS: Record<string, ExportDefinition> = {
  students: { table: "students", columns: "id,admission_number,student_number,admission_date,boarding_status,status,created_at", requiredPermission: "students.read" },
  invoices: { table: "invoices", columns: "id,student_id,invoice_number,invoice_date,due_date,currency_code,total_amount,paid_amount,balance_due,status", requiredPermission: "finance.read" },
  payments: { table: "payments", columns: "id,student_id,payment_reference,payment_date,currency_code,amount,allocated_amount,unallocated_amount,status", requiredPermission: "finance.read" },
  attendance: { table: "student_attendance_records", columns: "id,attendance_session_id,student_id,attendance_status,minutes_late,recorded_at", requiredPermission: "attendance.read" },
  results: { table: "subject_results", columns: "id,student_id,subject_id,academic_year_id,term_id,total_score,percentage_score,grade,status", requiredPermission: "reports.read" },
  library: { table: "library_loans", columns: "id,library_copy_id,borrower_type,borrowed_at,due_at,returned_at,status", requiredPermission: "library.manage" },
  inventory: { table: "inventory_items", columns: "id,code,name,item_type,unit_of_measure,reorder_level,status", requiredPermission: "inventory.manage" }
};

const csv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const quote = (value: unknown) => `"${String(typeof value === "object" ? JSON.stringify(value) : value ?? "").replaceAll('"', '""')}"`;
  return [keys.map(quote).join(","), ...rows.map((row) => keys.map((key) => quote(row[key])).join(","))].join("\n");
};

Deno.serve(async (request) => {
  let jobId: string | undefined;
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return new Response("Unauthorized", { status: 401 });
    const db = createClient(url, serviceKey, { auth: { persistSession: false } });
    let callerId: string | null = null;
    let userClient: ReturnType<typeof createClient> | null = null;
    let platformAdmin = token === serviceKey;
    if (!platformAdmin) {
      userClient = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
      const { data: { user }, error } = await userClient.auth.getUser(token);
      if (error || !user) return new Response("Unauthorized", { status: 401 });
      callerId = user.id;
      const { data: roles } = await db.from("platform_user_roles").select("role:roles(code)").eq("user_id", user.id);
      platformAdmin = (roles ?? []).some((entry: any) => ["super_admin", "platform_admin"].includes(entry.role?.code));
    }
    const body = await request.json();
    jobId = typeof body.jobId === "string" ? body.jobId : undefined;
    if (!jobId) return Response.json({ error: "Invalid request" }, { status: 400 });
    const { data: job, error } = await db.from("export_jobs").select("id,school_id,export_type,requested_by,status").eq("id", jobId).maybeSingle();
    if (error || !job) return new Response("Not found", { status: 404 });
    if (!platformAdmin) {
      if (job.requested_by !== callerId) return new Response("Forbidden", { status: 403 });
      const { data: membership } = await db.from("school_memberships").select("id").eq("school_id", job.school_id).eq("user_id", callerId).eq("status", "active").is("left_at", null).maybeSingle();
      if (!membership) return new Response("Forbidden", { status: 403 });
    }
    if (job.status !== "queued") return Response.json({ error: "Export is not queued" }, { status: 409 });
    const config = EXPORTS[job.export_type];
    if (!config) return Response.json({ error: "Unsupported export type" }, { status: 400 });
    if (!platformAdmin) {
      const { data: access, error: accessError } = await userClient!.rpc("get_my_context", { target_school_id: job.school_id });
      const permissions = Array.isArray(access?.permissions) ? access.permissions : [];
      if (accessError || access?.active_school_id !== job.school_id || !permissions.includes("reports.export") || !permissions.includes(config.requiredPermission)) {
        return new Response("Forbidden", { status: 403 });
      }
    }
    const { data: claimed } = await db.from("export_jobs").update({ status: "processing", started_at: new Date().toISOString() }).eq("id", job.id).eq("status", "queued").select("id").maybeSingle();
    if (!claimed) return Response.json({ error: "Export was already claimed" }, { status: 409 });
    const { data, error: queryError } = await db.from(config.table).select(config.columns).eq("school_id", job.school_id).limit(100000);
    if (queryError) throw queryError;
    const content = csv((data ?? []) as Record<string, unknown>[]);
    const path = `${job.school_id}/${job.id}.csv`;
    const { error: uploadError } = await db.storage.from("exports").upload(path, new Blob([content], { type: "text/csv" }), { upsert: true });
    if (uploadError) throw uploadError;
    await db.from("export_jobs").update({ status: "completed", completed_at: new Date().toISOString(), file_path: path, row_count: data?.length ?? 0 }).eq("id", job.id);
    return Response.json({ jobId: job.id, rows: data?.length ?? 0 });
  } catch (error) {
    console.error(JSON.stringify({ worker: "report", jobId, error: error instanceof Error ? error.message : "Unknown error" }));
    if (jobId) {
      const url = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (url && serviceKey) await createClient(url, serviceKey).from("export_jobs").update({ status: "failed", error_message: "Export processing failed" }).eq("id", jobId).eq("status", "processing");
    }
    return Response.json({ error: "Export processing failed" }, { status: 500 });
  }
});
