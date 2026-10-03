"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/context";
import type { AnnouncementActionState } from "@/lib/announcements/types";

const VALID_PRIORITY = new Set(["low", "normal", "high", "urgent"]);
const VALID_STATUS = new Set(["draft", "scheduled", "published", "expired", "cancelled"]);
const VALID_AUDIENCE_TYPES = new Set([
  "all",
  "role",
  "campus",
  "class",
  "user",
  "staff",
  "students",
  "guardians",
]);

function getString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function ensureAudienceServerSide(formData: FormData) {
  const audienceType = getString(formData, "audience_type");
  if (!VALID_AUDIENCE_TYPES.has(audienceType)) {
    throw new Error("Invalid audience type.");
  }

  if (audienceType === "role" && !getString(formData, "role_id")) {
    throw new Error("role audience requires role_id.");
  }

  if (audienceType === "campus" && !getString(formData, "campus_id")) {
    throw new Error("campus audience requires campus_id.");
  }

  if (audienceType === "class" && !getString(formData, "class_section_id")) {
    throw new Error("class audience requires class_section_id.");
  }

  if (audienceType === "user" && !getString(formData, "user_id")) {
    throw new Error("user audience requires user_id.");
  }

  return {
    audience_type: audienceType,
    role_id: getString(formData, "role_id") || null,
    campus_id: getString(formData, "campus_id") || null,
    class_section_id: getString(formData, "class_section_id") || null,
    user_id: getString(formData, "user_id") || null,
  };
}

export async function createAnnouncementAction(
  previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const context = await requireUserContext("communications.send");
  const supabase = await createClient();

  const title = getString(formData, "title");
  const body = getString(formData, "body");
  const priority = getString(formData, "priority");
  const submitAction = getString(formData, "submit_action") || "draft";
  const status = submitAction === "publish"
    ? "published"
    : submitAction === "schedule"
      ? "scheduled"
      : "draft";
  const category = getString(formData, "category") || "general";
  // A selected tenant is authoritative. The target field is used only by the
  // explicitly platform-wide workflow, where no school has been selected.
  const targetSchoolId = context.active_school_id || getString(formData, "target_school_id");

  if (!title || title.length > 200) {
    return { error: "A title is required and must stay within 200 characters." };
  }

  if (!body) {
    return { error: "Announcement body is required." };
  }

  if (!VALID_PRIORITY.has(priority)) {
    return { error: "Priority must be one of low, normal, high or urgent." };
  }

  if (!VALID_STATUS.has(status)) {
    return { error: "Status must be one of draft, scheduled, published, expired or cancelled." };
  }

  if (!targetSchoolId) {
    return { error: "A target school is required when creating an announcement." };
  }

  const { data: school } = await (supabase.from("schools") as any)
    .select("id, name")
    .eq("id", targetSchoolId)
    .maybeSingle();

  if (!school) {
    return { error: "The selected school could not be verified." };
  }

  const startsAtValue = getString(formData, "starts_at");
  const expiresAtValue = getString(formData, "expires_at");
  const requiresAcknowledgement = getString(formData, "requires_acknowledgement") === "on";

  if (status === "scheduled" && !startsAtValue) {
    return { error: "Scheduled announcements require a starts_at value." };
  }

  if (startsAtValue && expiresAtValue && new Date(expiresAtValue) < new Date(startsAtValue)) {
    return { error: "expires_at must be after or equal to starts_at." };
  }

  let publishedAt = null;
  let publishedBy = null;
  if (status === "published") {
    publishedAt = new Date().toISOString();
    publishedBy = context.user_id;
  }

  const announcementId = crypto.randomUUID();
  const announcementPayload = {
    id: announcementId,
    school_id: targetSchoolId,
    title,
    body,
    category,
    priority,
    status,
    starts_at: startsAtValue ? new Date(startsAtValue).toISOString() : null,
    expires_at: expiresAtValue ? new Date(expiresAtValue).toISOString() : null,
    published_at: publishedAt,
    published_by: publishedBy,
    requires_acknowledgement: requiresAcknowledgement,
    metadata: {
      created_by: context.user_id,
      audience_type: getString(formData, "audience_type") || "all",
    },
    version: 1,
  };

  const { error: announcementError } = await (supabase.from("announcements") as any)
    .insert(announcementPayload);

  if (announcementError) {
    return { error: announcementError.message };
  }

  try {
    const audience = ensureAudienceServerSide(formData);

    const { error: audienceError } = await (supabase.from("announcement_audiences") as any)
      .insert({
        announcement_id: announcementId,
        school_id: targetSchoolId,
        audience_type: audience.audience_type,
        role_id: audience.role_id,
        campus_id: audience.campus_id,
        class_section_id: audience.class_section_id,
        user_id: audience.user_id,
      });

    if (audienceError) {
      await (supabase.from("announcements") as any)
        .delete()
        .eq("id", announcementId);
      return { error: audienceError.message };
    }
  } catch (error) {
    await (supabase.from("announcements") as any)
      .delete()
      .eq("id", announcementId);
    return { error: error instanceof Error ? error.message : "Invalid audience configuration." };
  }

  revalidatePath("/app/announcements");
  revalidatePath(`/app/announcements/${announcementId}`);
  redirect(`/app/announcements?message=${encodeURIComponent(`${title} was created for ${school.name}.`)}`);
}

// Wrapper for direct form action usage
export async function createAnnouncementDirectAction(formData: FormData): Promise<void> {
  const result = await createAnnouncementAction({ error: undefined, ok: false, message: undefined }, formData);
  if (result?.error) {
    redirect(`/app/announcements/new?error=${encodeURIComponent(result.error)}`);
  }
}

export async function acknowledgeAnnouncementAction(
  previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const context = await requireUserContext();
  const supabase = await createClient();
  const announcementId = getString(formData, "announcement_id");

  if (!announcementId) {
    return { error: "Announcement identifier is required." };
  }

  const { data: announcement } = await (supabase.from("announcements") as any)
    .select("id, school_id, status, requires_acknowledgement, starts_at, expires_at")
    .eq("id", announcementId)
    .maybeSingle();

  if (!announcement) {
    return { error: "Announcement not found." };
  }

  const now = new Date();
  const startsAt = announcement.starts_at ? new Date(announcement.starts_at) : null;
  const expiresAt = announcement.expires_at ? new Date(announcement.expires_at) : null;
  const published = announcement.status === "published" && (!startsAt || startsAt <= now) && (!expiresAt || expiresAt > now);

  if (!published || !announcement.requires_acknowledgement) {
    return { error: "This announcement is not currently open for acknowledgement." };
  }

  const { error: acknowledgementError } = await (supabase.from("announcement_acknowledgements") as any)
    .insert({
      announcement_id: announcementId,
      user_id: context.user_id,
      acknowledged_at: new Date().toISOString(),
    })
    .select("announcement_id")
    .maybeSingle();

  if (acknowledgementError) {
    return { error: acknowledgementError.message };
  }

  revalidatePath("/app/announcements");
  return { ok: true, message: "Acknowledgement recorded." };
}
