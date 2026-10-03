import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StudentCreateForm } from "@/components/students/student-create-form";

export default async function NewStudent() {
  const context = await requireUserContext("students.create");
  if (!context.active_school_id) redirect("/app/select-school");
  const supabase = await createClient();
  const schoolId = context.active_school_id;
  const [{ data: campuses }, { data: years }, { data: terms }, { data: sections }] = await Promise.all([
    (supabase.from("campuses") as any).select("id,name").eq("school_id", schoolId).eq("is_active", true),
    (supabase.from("academic_years") as any).select("id,name").eq("school_id", schoolId).order("starts_on", { ascending: false }),
    (supabase.from("terms") as any).select("id,name").eq("school_id", schoolId).order("starts_on", { ascending: false }),
    (supabase.from("class_sections") as any).select("id,name,class_groups(name)").eq("school_id", schoolId).eq("status", "active")
  ]);
  return <div><PageHeader title="Admit student" description="Creates the person, student and optional class enrolment in one protected transaction." backHref="/app/students" /><StudentCreateForm campuses={campuses ?? []} years={years ?? []} terms={terms ?? []} sections={(sections ?? []).map((section: any) => ({ id: section.id, name: `${section.class_groups?.name ?? "Class"} — ${section.name}` }))} /></div>;
}
