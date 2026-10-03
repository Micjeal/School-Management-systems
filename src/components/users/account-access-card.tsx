import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnableSystemAccess } from "./enable-system-access";
import { StudentPortalManagement } from "./student-portal-management";

export function accountStatus(userId: string | null | undefined, profile?: { is_active: boolean; must_change_password: boolean } | null) {
  if (!userId) return "No system account";
  if (!profile) return "Invitation pending";
  if (!profile.is_active) return "Disabled";
  if (profile.must_change_password) return "Password change required";
  return "Active";
}

export function AccountAccessCard(props: { recordType: "student" | "employee" | "guardian"; recordId: string; personId: string; userId?: string | null; email?: string | null; profile?: { is_active: boolean; must_change_password: boolean } | null; roles: { code: string; name: string }[]; studentRoleActive?: boolean; membershipStatus?: string | null; label?: string }) {
  const status = accountStatus(props.userId, props.profile);
  const title = props.recordType === "guardian" ? "System access" : "Portal access";
  return <Card><CardHeader><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2><Badge>{status}</Badge></div></CardHeader><CardContent>{!props.userId ? <EnableSystemAccess {...props} label={props.recordType === "employee" ? "Enable teacher portal access" : undefined} /> : props.recordType === "student" && props.email ? <StudentPortalManagement studentId={props.recordId} personId={props.personId} userId={props.userId} email={props.email} studentRoleActive={Boolean(props.studentRoleActive)} membershipStatus={props.membershipStatus} /> : <dl className="grid grid-cols-2 gap-2 text-sm"><dt className="text-slate-500">Login email</dt><dd>{props.email ?? "Not available"}</dd><dt className="text-slate-500">Teacher role</dt><dd>Active</dd><dt className="text-slate-500">Membership</dt><dd>{props.profile?.is_active === false ? "Disabled" : "Active"}</dd></dl>}</CardContent></Card>;
}
