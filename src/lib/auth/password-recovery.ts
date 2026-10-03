export const RECOVERY_SUCCESS = "If an account exists for that email address, a verification code has been sent.";
export const RECOVERY_EXPIRED = "That verification code is invalid or has expired.";
export const RECOVERY_SESSION_ERROR = "Password reset session is invalid or expired";
export const PASSWORD_UPDATED = "Password updated successfully. Please sign in.";

export function recoveryRedirect(siteUrl: string): string {
  const origin = new URL(siteUrl);
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password ||
      (origin.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname))) {
    throw new Error("Configure NEXT_PUBLIC_SITE_URL with the application HTTPS origin.");
  }
  return `${origin.origin}/auth/callback?next=/auth/change-password&recovery=1`;
}

export function isAuthRateLimit(error: { status?: number; code?: string } | null): boolean {
  return error?.status === 429 || ["over_email_send_rate_limit", "over_request_rate_limit"].includes(error?.code ?? "");
}
