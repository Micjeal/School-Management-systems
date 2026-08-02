"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth/context";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

type FunctionPayload = {
  error?: unknown;
  stage?: unknown;
  details?: unknown;
  existingAccount?: unknown;
  temporaryPasswordApplied?: unknown;
  userId?: unknown;
  email?: unknown;
};

function formatFunctionError(
  payload: FunctionPayload | null,
  fallback: string,
): string {
  const message =
    typeof payload?.error === "string" &&
    payload.error.trim()
      ? payload.error.trim()
      : fallback;

  const stage =
    typeof payload?.stage === "string" &&
    payload.stage.trim()
      ? ` (${payload.stage.trim()})`
      : "";

  const details =
    typeof payload?.details === "string" &&
    payload.details.trim()
      ? `: ${payload.details.trim()}`
      : "";

  return `${message}${stage}${details}`;
}

async function invokeAdminUsers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  body: Record<string, unknown>,
): Promise<FunctionPayload> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error(
      "Your session has expired. Sign in again and retry.",
    );
  }

  const response = await fetch(
    `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-users`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey:
          publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

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

  if (!response.ok) {
    throw new Error(
      formatFunctionError(
        payload,
        `User account request failed with HTTP ${response.status}.`,
      ),
    );
  }

  if (payload?.error) {
    throw new Error(
      formatFunctionError(
        payload,
        "Unable to create the user account.",
      ),
    );
  }

  return payload ?? {};
}

export async function inviteUser(formData: FormData) {
  const context =
    await requireUserContext("users.manage");

  const schoolId =
    value(formData, "school_id") ||
    context.active_school_id;

  const email = value(formData, "email").toLowerCase();

  // Do not trim passwords because spaces may be intentional.
  const temporaryPassword = String(
    formData.get("temporary_password") ?? "",
  );

  const confirmPassword = String(
    formData.get("confirm_password") ?? "",
  );

  const roleCode =
    value(formData, "role_code") || null;

  const platformRole =
    value(formData, "platform_role") || null;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    redirect(
      `/app/platform/users?error=${encodeURIComponent(
        "Enter a valid email address.",
      )}`,
    );
  }

  if (temporaryPassword.length < 10) {
    redirect(
      `/app/platform/users?error=${encodeURIComponent(
        "The temporary password must contain at least 10 characters.",
      )}`,
    );
  }

  if (temporaryPassword !== confirmPassword) {
    redirect(
      `/app/platform/users?error=${encodeURIComponent(
        "The temporary passwords do not match.",
      )}`,
    );
  }

  if (schoolId && !roleCode) {
    redirect(
      `/app/platform/users?error=${encodeURIComponent(
        "Select a school role.",
      )}`,
    );
  }

  const supabase = await createClient();

  let data: FunctionPayload;

  try {
    data = await invokeAdminUsers(supabase, {
      action: "invite",
      email,
      temporaryPassword,
      schoolId: schoolId || null,
      roleCode,
      platformRole,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create the user account.";

    redirect(
      `/app/platform/users?error=${encodeURIComponent(
        message,
      )}`,
    );
  }

  revalidatePath("/app/platform/users");

  const existingAccount = Boolean(
    data.existingAccount,
  );

  const temporaryPasswordApplied = Boolean(
    data.temporaryPasswordApplied,
  );

  console.log("Admin user result", {
    email: data.email,
    existingAccount,
    temporaryPasswordApplied,
  });

  let message: string;

  if (!existingAccount) {
    message =
      "User account created. Share the temporary password securely; it must be changed at first login.";
  } else if (temporaryPasswordApplied) {
    message =
      "The partial account was repaired and its temporary password was set. The user must change it at first login.";
  } else {
    message =
      "Existing account added to the school. Its current password was not changed.";
  }

  redirect(
    `/app/platform/users?message=${encodeURIComponent(
      message,
    )}`,
  );
}