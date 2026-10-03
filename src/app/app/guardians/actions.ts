"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import { requireSchoolRecord } from "@/lib/access/records";

const val = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function createGuardian(formData: FormData) {
  const c = await requireUserContext("guardians.create");
  if (!c.active_school_id) redirect("/app/guardians/new?error=Select%20a%20school");
  const s = await createClient();

  const { data: person, error: personError } = await (s.from("people") as any)
    .insert({
      school_id: c.active_school_id,
      first_name: val(formData, "first_name"),
      middle_name: val(formData, "middle_name") || null,
      last_name: val(formData, "last_name"),
      gender: val(formData, "gender") || null,
      date_of_birth: val(formData, "date_of_birth") || null,
      nationality_code: val(formData, "nationality_code") || "UG",
      primary_email: val(formData, "primary_email") || null,
      primary_phone: val(formData, "primary_phone") || null,
      address: val(formData, "address") || null
    })
    .select("id")
    .single();

  if (personError) {
    redirect(`/app/guardians/new?error=${encodeURIComponent(personError.message)}`);
  }

  const { error: guardianError } = await (s.from("guardians") as any).insert({
    school_id: c.active_school_id,
    person_id: person.id,
    status: val(formData, "status") || "active",
    portal_enabled: formData.get("portal_enabled") === "on",
    preferred_contact_method: val(formData, "preferred_contact_method") || "phone",
    occupation: val(formData, "occupation") || null,
    employer: val(formData, "employer") || null
  });

  if (guardianError) {
    redirect(`/app/guardians/new?error=${encodeURIComponent(guardianError.message)}`);
  }

  revalidatePath("/app/guardians");
  redirect(`/app/guardians/${person.id}?message=Guardian%20created`);
}

export async function updateGuardian(guardianId: string, formData: FormData) {
  const c = await requireUserContext("guardians.manage");
  const s = await createClient();
  await requireSchoolRecord(s, "guardians", guardianId, c.active_school_id);

  const { data: guardian } = await (s.from("guardians") as any)
    .select("person_id")
    .eq("id", guardianId)
    .eq("school_id", c.active_school_id)
    .single();

  if (!guardian) redirect("/app/guardians");

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    (s.from("people") as any)
      .update({
        first_name: val(formData, "first_name"),
        middle_name: val(formData, "middle_name") || null,
        last_name: val(formData, "last_name"),
        gender: val(formData, "gender") || null,
        date_of_birth: val(formData, "date_of_birth") || null,
        primary_email: val(formData, "primary_email") || null,
        primary_phone: val(formData, "primary_phone") || null,
        address: val(formData, "address") || null
      })
      .eq("id", guardian.person_id)
      .eq("school_id", c.active_school_id),
    (s.from("guardians") as any)
      .update({
        status: val(formData, "status"),
        portal_enabled: formData.get("portal_enabled") === "on",
        preferred_contact_method: val(formData, "preferred_contact_method"),
        occupation: val(formData, "occupation") || null,
        employer: val(formData, "employer") || null
      })
      .eq("id", guardianId)
      .eq("school_id", c.active_school_id)
  ]);

  if (e1 || e2) {
    redirect(`/app/guardians/${guardianId}?error=${encodeURIComponent((e1 || e2).message)}`);
  }

  revalidatePath(`/app/guardians/${guardianId}`);
  redirect(`/app/guardians/${guardianId}?message=Guardian%20updated`);
}
