"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export type FunctionPayload = {
  code?: unknown;
  error?: unknown;
  stage?: unknown;
  details?: unknown;
  existingAccount?: unknown;
  temporaryPasswordApplied?: unknown;
  userId?: unknown;
  email?: unknown;
  temporaryPassword?: unknown;
  personLinked?: unknown;
  canLink?: unknown;
};

export type InviteState = { status: "idle" | "error" | "success"; message?: string; temporaryPassword?: string };

function formatFunctionError(payload: FunctionPayload | null, fallback: string): string {
  const message =
    typeof payload?.error === "string" && payload.error.trim() ? payload.error.trim() : fallback;

  const stage =
    typeof payload?.stage === "string" && payload.stage.trim() ? ` (${payload.stage.trim()})` : "";

  const details =
    typeof payload?.details === "string" && payload.details.trim()
      ? `: ${payload.details.trim()}`
      : "";

  return `${message}${stage}${details}`;
}

export async function invokeAdminUsers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  body: Record<string, unknown>
): Promise<FunctionPayload> {
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Your session has expired. Sign in again and retry.");
  }

  const response = await fetch(`${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const rawBody = await response.text();

  let payload: FunctionPayload | null = null;

  if (rawBody.trim()) {
    try {
      payload = JSON.parse(rawBody) as FunctionPayload;
    } catch {
      if (!response.ok) {
        throw new Error(rawBody.trim());
      }
    }
  }

  // Existing Auth users are candidates only. Preserve the deliberately
  // minimal response so the UI can require a separate explicit link action.
  if (payload?.code === "existing_account") return payload;

  if (!response.ok) {
    throw new Error(
      formatFunctionError(payload, `User account request failed with HTTP ${response.status}.`)
    );
  }

  if (payload?.error) {
    throw new Error(formatFunctionError(payload, "Unable to create the user account."));
  }

  return payload ?? {};
}

export async function inviteUserInteractive(_previous: InviteState, formData: FormData): Promise<InviteState> {
  const context = await requireUserContext("users.manage");
  const schoolId = value(formData, "school_id") || context.active_school_id;
  const email = value(formData, "email").toLowerCase();
  const roleCode = value(formData, "role_code") || null;
  const platformRole = value(formData, "platform_role") || null;
  if (!/^\S+@\S+\.\S+$/.test(email)) return { status: "error", message: "Enter a valid email address." };
  if (schoolId && !roleCode) return { status: "error", message: "Select a school role." };
  const supabase = await createClient();
  try {
    const data = await invokeAdminUsers(supabase, { action: "invite", email, schoolId: schoolId || null, roleCode, platformRole });
    revalidatePath("/app/platform/users");
    const temporaryPassword = typeof data.temporaryPassword === "string" ? data.temporaryPassword : undefined;
    return { status: "success", message: temporaryPassword ? "Account created. Copy the temporary password now; it will not be shown again." : "Existing account updated without changing its password.", temporaryPassword };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Unable to create the user account." };
  }
}
