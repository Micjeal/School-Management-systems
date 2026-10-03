import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const migrationDir = path.join(process.cwd(), "supabase/migrations");
const files = fs
  .readdirSync(migrationDir)
  .filter((file: string) => file.endsWith(".sql"))
  .sort();
const sql = files
  .map((file: string) => fs.readFileSync(path.join(migrationDir, file), "utf8"))
  .join("\n");

describe("application migrations", () => {
  it("uses unique, strictly increasing migration timestamps", () => {
    expect(files.length).toBeGreaterThanOrEqual(12);
    const timestamps = files.map((file: string) => file.match(/^(\d{12}|\d{14})_/)?.[1]);
    expect(timestamps.every(Boolean)).toBe(true);
    expect(new Set(timestamps).size).toBe(timestamps.length);
    timestamps.slice(1).forEach((timestamp, index) => {
      expect(timestamp! > timestamps[index]!).toBe(true);
    });
  });

  it("revokes anonymous execution for workflow RPCs", () => {
    for (const fn of [
      "create_student_with_enrolment",
      "save_attendance_records",
      "save_mark_entries",
      "record_stock_movement",
      "create_invoice_with_lines",
      "calculate_payroll_run",
      "submit_approval_request",
      "decide_approval_step",
      "create_purchase_order_with_items",
      "post_goods_receipt",
      "create_refund_request",
      "process_refund",
      "approve_payroll_run",
      "post_payroll_run",
      "check_timetable_conflicts",
      "publish_timetable_version",
      "create_conversation_with_members",
      "send_conversation_message",
      "process_import_batch"
    ]) {
      expect(sql).toContain(`revoke all on function public.${fn}`);
      expect(sql).toContain("from public, anon");
    }
  });
});
