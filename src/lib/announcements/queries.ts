import { createClient } from "@/lib/supabase/server";
import type { UserContext } from "@/types/context";

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  expired: "Expired",
  cancelled: "Cancelled",
};

export async function loadSchoolsForPlatformTargeting() {
  const supabase = await createClient();
  const { data } = await (supabase.from("schools") as any)
    .select("id, name")
    .eq("status", "active")
    .order("name");

  return (data ?? []).map((school: any) => ({
    id: school.id,
    name: school.name,
  }));
}

export async function loadAnnouncementRows(context: UserContext) {
  const supabase = await createClient();
  const activeSchoolId = context.active_school_id;
  const hasAdminRead = context.permissions.includes("communications.read") || context.permissions.includes("communications.send");
  const canManage = context.is_platform_admin || context.permissions.includes("communications.send");

  if (context.is_platform_admin && !activeSchoolId) {
    const { data } = await (supabase.from("announcements") as any)
      .select("id,school_id,title,priority,status,published_at,created_at,schools(name)")
      .order("created_at", { ascending: false })
      .limit(50);

    return (data ?? []).map((row: any) => ({
      ...row,
      school_name: row.schools?.name ?? null,
    }));
  }

  if (!activeSchoolId) {
    return [];
  }

  if (hasAdminRead || canManage) {
    const { data } = await (supabase.from("announcements") as any)
      .select("id,school_id,title,body,priority,status,published_at,starts_at,expires_at,created_at,schools(name)")
      .eq("school_id", activeSchoolId)
      .order("created_at", { ascending: false })
      .limit(50);

    return (data ?? []).map((row: any) => ({
      ...row,
      school_name: row.schools?.name ?? null,
    }));
  }

  const now = new Date().toISOString();
  const { data } = await (supabase.from("announcements") as any)
    .select("id,school_id,title,body,priority,status,published_at,starts_at,expires_at,created_at,schools(name)")
    .eq("school_id", activeSchoolId)
    .eq("status", "published")
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("published_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((row: any) => ({
    ...row,
    school_name: row.schools?.name ?? null,
  }));
}

export function formatPriority(priority: string) {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function formatStatus(status: string) {
  return STATUS_LABELS[status] ?? status;
}
