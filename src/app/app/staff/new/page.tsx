import { requireUserContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { TeacherCreateForm } from "@/components/staff/teacher-create-form";

export default async function NewEmployee(){
  const c=await requireUserContext("staff.manage"); const s=await createClient();
  const [{data:campuses},{data:departments}]=await Promise.all([(s.from("campuses") as any).select("id,name").eq("school_id",c.active_school_id),(s.from("departments") as any).select("id,name").eq("school_id",c.active_school_id)]);
  return <div><PageHeader title="Add staff member" description="Create an employee, or create a teacher and optionally enable portal access." backHref="/app/staff"/><TeacherCreateForm campuses={campuses??[]} departments={departments??[]}/></div>;
}
