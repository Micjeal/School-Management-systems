import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(import.meta.url);
let ts;
for (const candidate of ["typescript", "/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js"]) {
  try { ts = require(candidate); break; } catch {}
}
if (!ts) throw new Error("TypeScript is required for the static source check.");

const failures = [];
const info = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  if (["node_modules", ".next", ".git", "coverage", "playwright-report", "test-results"].includes(entry.name)) return [];
  return entry.isDirectory() ? walk(full) : [full];
});

const sourceFiles = walk(path.join(root, "src")).filter((f) => /\.(ts|tsx)$/.test(f) && !f.endsWith(".d.ts"));
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      isolatedModules: true,
    },
    fileName: file,
    reportDiagnostics: true,
  });
  for (const diagnostic of result.diagnostics ?? []) {
    if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    failures.push(`${path.relative(root, file)}: ${message}`);
  }
}
info.push(`${sourceFiles.length} TypeScript source files parsed`);

const modulesText = fs.readFileSync(path.join(root, "src/config/modules.ts"), "utf8");
const modulesDeclaration = modulesText.indexOf("export const MODULES");
const modulesArray = modulesText.indexOf("[", modulesDeclaration);
const modulePart = modulesText.slice(modulesArray);
const moduleIds = [...modulePart.matchAll(/"id"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
const duplicates = moduleIds.filter((id, index) => moduleIds.indexOf(id) !== index);
if (moduleIds.length !== 139) failures.push(`Expected 139 module screens, found ${moduleIds.length}`);
if (duplicates.length) failures.push(`Duplicate module IDs: ${[...new Set(duplicates)].join(", ")}`);
info.push(`${moduleIds.length} unique module screens registered`);

const requiredRoutes = [
  "src/app/(auth)/login/page.tsx",
  "src/app/change-password/page.tsx",
  "src/app/app/page.tsx",
  "src/app/app/students/page.tsx",
  "src/app/app/staff/page.tsx",
  "src/app/app/admissions/page.tsx",
  "src/app/app/attendance/page.tsx",
  "src/app/app/assessments/page.tsx",
  "src/app/app/finance/invoices/page.tsx",
  "src/app/app/payroll/page.tsx",
  "src/app/app/library/circulation/page.tsx",
  "src/app/app/inventory/movements/page.tsx",
  "src/app/app/platform/schools/page.tsx",
  "src/app/app/platform/users/page.tsx",
  "src/app/app/portal/page.tsx",
  "src/app/api/health/route.ts",
];
for (const route of requiredRoutes) if (!fs.existsSync(path.join(root, route))) failures.push(`Missing route: ${route}`);
info.push(`${requiredRoutes.length} principal routes present`);

const migrationDir = path.join(root, "supabase/migrations");
const migrations = fs.readdirSync(migrationDir).filter((f) => f.endsWith(".sql")).sort();

if (migrations.length < 12) failures.push(`Expected at least migrations 011–022, found ${migrations.length} files`);
const migrationNumbers = migrations.map((file) => Number(file.match(/240(\d{3})_/)?.[1]));
for (let index = 0; index < migrationNumbers.length; index += 1) {
  const expected = 11 + index;
  if (migrationNumbers[index] !== expected) failures.push(`Migration sequence gap: expected ${expected}, found ${migrationNumbers[index]}`);
}
const migrationSql = migrations.map((f) => fs.readFileSync(path.join(migrationDir, f), "utf8")).join("\n");
const requiredFunctions = [
  "get_my_context", "create_student_with_enrolment", "convert_application_to_student",
  "create_employee_with_assignment", "open_attendance_session", "save_attendance_records",
  "lock_attendance_session", "save_mark_entries", "moderate_assessment_marks",
  "calculate_class_results", "withdraw_class_results", "issue_library_item",
  "return_library_item", "record_stock_movement", "create_invoice_with_lines",
  "create_payment_with_allocations", "post_manual_journal", "calculate_payroll_run",
  "submit_approval_request", "get_my_pending_approvals", "decide_approval_step",
  "create_purchase_order_with_items", "set_purchase_order_status", "post_goods_receipt", "create_goods_receipt_with_items",
  "create_refund_request", "decide_refund_request", "process_refund",
  "configure_payroll_accounts", "approve_payroll_run", "post_payroll_run", "pay_payroll_run",
  "check_timetable_conflicts", "publish_timetable_version",
  "create_conversation_with_members", "send_conversation_message", "mark_conversation_read", "set_conversation_closed",
  "process_import_batch",
];
for (const fn of requiredFunctions) if (!migrationSql.includes(`function public.${fn}`)) failures.push(`Missing migration function: ${fn}`);
info.push(`${migrations.length} versioned application migrations and ${requiredFunctions.length} workflow functions present`);

const edgeFunctions = ["admin-users", "notification-worker", "webhook-worker", "report-worker"];
for (const fn of edgeFunctions) if (!fs.existsSync(path.join(root, `supabase/functions/${fn}/index.ts`))) failures.push(`Missing Edge Function: ${fn}`);
info.push(`${edgeFunctions.length} Edge Functions present`);

for (const file of walk(root)) {
  const rel = path.relative(root, file);
  if (rel === ".env.local" || rel === "scripts/static-check.mjs" || rel.startsWith("node_modules/") || rel.startsWith(".next/") || rel.startsWith("supabase/functions/")) continue;
  if (!/\.(ts|tsx|js|mjs|json|md|sql|example|yml|yaml)$/.test(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (/admin123|sb_secret_[A-Za-z0-9_-]+/.test(text)) failures.push(`Forbidden secret/password pattern in ${rel}`);
  if (/SUPABASE_SERVICE_ROLE_KEY[ \t]*=[ \t]*[^\s#]+/.test(text) && rel !== ".env.example") failures.push(`Committed service-role value in ${rel}`);
}
info.push("Repository secret-pattern scan completed");

if (failures.length) {
  console.error("Static verification failed:\n" + failures.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}
console.log("SchoolDB static verification passed:\n" + info.map((x) => `- ${x}`).join("\n"));
