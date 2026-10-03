import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

type PrivateDatabase = {
  private: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      can_access_my_person_document: { Args: { target_document_id: string }; Returns: boolean };
      can_access_report_card: { Args: { target_report_card_id: string }; Returns: boolean };
      can_access_payment_receipt: { Args: { target_receipt_id: string }; Returns: boolean };
      can_access_message_attachment: { Args: { target_attachment_id: string }; Returns: boolean };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

/** Narrow contract for verified private-schema authorization functions. */
export function privateRpcClient(client: unknown): SupabaseClient<PrivateDatabase, "private"> {
  return client as SupabaseClient<PrivateDatabase, "private">;
}
