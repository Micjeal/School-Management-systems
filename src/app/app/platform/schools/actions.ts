"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createSchool(formData: FormData) {
  const context = await requireUserContext();

  if (!context.is_platform_admin) {
    redirect("/access-denied");
  }

  const supabase = await createClient();

  const schoolName = value(formData, "name");

  const requestedSlug = value(formData, "slug") || schoolName;
  const schoolSlug = slugify(requestedSlug);

  if (!schoolName) {
    redirect(
      "/app/platform/schools/new?error=" +
        encodeURIComponent("School name is required."),
    );
  }

  if (!schoolSlug) {
    redirect(
      "/app/platform/schools/new?error=" +
        encodeURIComponent("Enter a valid school URL slug."),
    );
  }

  const { data: existingSchool, error: lookupError } = await supabase
    .from("schools")
    .select("id")
    .eq("slug", schoolSlug)
    .maybeSingle();

  if (lookupError) {
    redirect(
      "/app/platform/schools/new?error=" +
        encodeURIComponent(lookupError.message),
    );
  }

  if (existingSchool) {
    redirect(
      "/app/platform/schools/new?error=" +
        encodeURIComponent(
          `The URL slug "${schoolSlug}" is already used by another school.`,
        ),
    );
  }

  const { data, error } = await (supabase.rpc as any)("create_school", {
    school_name: schoolName,
    school_slug: schoolSlug,
    school_code: value(formData, "code") || null,
    school_email: value(formData, "email") || null,
    school_phone: value(formData, "phone") || null,
    school_address: value(formData, "address") || null,
    country_code: value(formData, "country_code") || "UG",
    timezone: value(formData, "timezone") || "Africa/Kampala",
    currency_code: value(formData, "currency_code") || "UGX",
    main_campus_name: value(formData, "campus_name") || "Main Campus",
  });

  if (error) {
    let message = error.message;

    if (error.message.includes("schools_slug_uq")) {
      message = `The URL slug "${schoolSlug}" is already used by another school.`;
    } else if (error.message.includes("schools_slug_format")) {
      message = "The school URL slug may contain only lowercase letters, numbers and single hyphens.";
    }

    redirect(
      "/app/platform/schools/new?error=" +
        encodeURIComponent(message),
    );
  }

  revalidatePath("/app/platform/schools");

  redirect(
    `/app/platform/schools/${data}?message=` +
      encodeURIComponent("School created successfully"),
  );
}

export async function updateSchool(id: string, f: FormData) {
  const c = await requireUserContext("settings.manage");
  if (!c.is_platform_admin && c.active_school_id !== id) redirect("/access-denied");
  const s = await createClient();
  const { error } = await (s.from("schools") as any).update({
    name: value(f, "name"),
    legal_name: value(f, "legal_name") || null,
    email: value(f, "email") || null,
    phone: value(f, "phone") || null,
    website: value(f, "website") || null,
    status: value(f, "status"),
    subscription_status: value(f, "subscription_status"),
    timezone: value(f, "timezone") || "Africa/Kampala",
    currency_code: value(f, "currency_code") || "UGX",
    country_code: value(f, "country_code") || "UG"
  }).eq("id", id);
  if (error) redirect(`/app/platform/schools/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/app/platform/schools/${id}`);
  redirect(`/app/platform/schools/${id}?message=School%20updated`);
}
