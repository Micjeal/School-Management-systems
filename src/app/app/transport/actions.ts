"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";
import { isUuid } from "@/lib/auth/access-errors";

const v = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function createTransportAssignment(f: FormData) {
  const c = await requireUserContext("transport.manage");
  if (!c.active_school_id) redirect("/app/transport/assignments?error=Select+a+school");
  const s = await createClient();
  const studentId = v(f, "student_id");
  const routeId = v(f, "route_id");
  const stopId = v(f, "stop_id");
  if (!isUuid(studentId)) redirect("/app/transport/assignments/new?error=Invalid+student");
  if (!isUuid(routeId)) redirect("/app/transport/assignments/new?error=Invalid+route");
  await requireSchoolRecord(s, "students", studentId, c.active_school_id);
  await requireSchoolRecord(s, "transport_routes", routeId, c.active_school_id);
  if (stopId && isUuid(stopId)) await requireSchoolRecord(s, "transport_stops", stopId, c.active_school_id);
  const { error } = await (s.from("student_transport_assignments") as any).insert({
    student_id: studentId,
    transport_route_id: routeId,
    transport_stop_id: stopId || null,
    school_id: c.active_school_id,
    effective_from: v(f, "effective_from") || new Date().toISOString().slice(0, 10),
    status: "active",
  });
  if (error) {
    redirect(`/app/transport/assignments/new?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/app/transport/assignments");
  redirect("/app/transport/assignments?message=Transport+assignment+created");
}

export async function assignDriver(f: FormData) {
  const c = await requireUserContext("transport.manage");
  if (!c.active_school_id) redirect("/app/transport/routes?error=Select+a+school");
  const s = await createClient();
  const routeId = v(f, "route_id");
  const employeeId = v(f, "employee_id");
  if (!isUuid(routeId) || !isUuid(employeeId))
    redirect(`/app/transport/routes/${routeId}?error=Invalid+parameters`);
  await requireSchoolRecord(s, "transport_routes", routeId, c.active_school_id);
  await requireSchoolRecord(s, "employees", employeeId, c.active_school_id);
  const { error } = await (s.from("transport_routes") as any)
    .update({ default_driver_employee_id: employeeId })
    .eq("id", routeId)
    .eq("school_id", c.active_school_id);
  if (error) redirect(`/app/transport/routes/${routeId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/transport/routes/${routeId}`);
  redirect(`/app/transport/routes/${routeId}?message=Driver+assigned`);
}
