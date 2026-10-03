export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";
export type AnnouncementStatus = "draft" | "scheduled" | "published" | "expired" | "cancelled";
export type AudienceType = "all" | "role" | "campus" | "class" | "user" | "staff" | "students" | "guardians";

export type AnnouncementActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

export type AnnouncementRecord = {
  id: string;
  school_id: string;
  title: string;
  body: string;
  category: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  starts_at: string | null;
  expires_at: string | null;
  published_at: string | null;
  published_by: string | null;
  requires_acknowledgement: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  school_name?: string | null;
};
