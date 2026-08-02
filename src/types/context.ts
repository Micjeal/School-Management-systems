export type RoleSummary = { id: string; code: string; name: string };
export type MembershipSummary = {
  membership_id: string;
  school_id: string;
  school_name: string;
  school_slug: string;
  school_status: string;
  subscription_status: string;
  campus_id: string | null;
  status: string;
  roles: RoleSummary[];
};
export type FeatureSummary = { code: string; enabled: boolean; config: unknown };
export type ProfileSummary = {
  id?: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  must_change_password?: boolean;
  is_active?: boolean;
};
export type UserContext = {
  user_id: string;
  profile: ProfileSummary;
  is_platform_admin: boolean;
  platform_roles: RoleSummary[];
  memberships: MembershipSummary[];
  active_school: Record<string, unknown> | null;
  permissions: string[];
  features: FeatureSummary[];
  active_school_id: string | null;
};
