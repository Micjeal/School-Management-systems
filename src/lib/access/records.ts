import "server-only";
import { isUuid, AccessScopeError } from "@/lib/auth/access-errors";

export async function requireSchoolRecord(
  supabase: any,
  table: string,
  id: string,
  schoolId: string | null,
  columns = "id"
): Promise<any> {
  if (!schoolId) throw new AccessScopeError("ACTIVE_SCHOOL_REQUIRED");
  if (!isUuid(id)) throw new Error("INVALID_RECORD_ID");
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq("id", id)
    .eq("school_id", schoolId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("RECORD_NOT_FOUND");
  return data;
}

export async function requireConversationMember(
  supabase: any,
  conversationId: string,
  schoolId: string | null,
  userId: string,
  ownerOnly = false
): Promise<any> {
  if (!schoolId) throw new AccessScopeError("ACTIVE_SCHOOL_REQUIRED");
  if (!isUuid(conversationId)) throw new Error("INVALID_RECORD_ID");
  let query = supabase
    .from("conversations")
    .select("id,status,conversation_members!inner(user_id,role,left_at)")
    .eq("id", conversationId)
    .eq("school_id", schoolId)
    .eq("conversation_members.user_id", userId)
    .is("conversation_members.left_at", null);
  if (ownerOnly) query = query.eq("conversation_members.role", "owner");
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("RECORD_NOT_FOUND");
  return data;
}
