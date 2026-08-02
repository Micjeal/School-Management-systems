"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

export async function publishTimetableVersion(formData: FormData) {
  const context = await requireUserContext("academics.manage");
  const supabase = await createClient();
  
  const versionId = formData.get("version_id") as string;

  if (!versionId) {
    redirect("/app/academics/timetable?error=Invalid request");
  }

  const { error } = await supabase.rpc("publish_timetable_version" as any, {
    target_timetable_version_id: versionId,
  } as any);

  if (error) {
    redirect(`/app/academics/timetable/${versionId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/academics/timetable");
  redirect(`/app/academics/timetable/${versionId}?message=Timetable published`);
}
