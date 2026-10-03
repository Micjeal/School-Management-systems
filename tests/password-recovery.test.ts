// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";

const mocks = vi.hoisted(() => {
  const auth = { resetPasswordForEmail: vi.fn(), verifyOtp: vi.fn(), getUser: vi.fn(), exchangeCodeForSession: vi.fn(), updateUser: vi.fn(), refreshSession: vi.fn(), signOut: vi.fn() };
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
  return { auth, query, from: vi.fn(), cookies: new Map<string, string>() };
});
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: mocks.auth, from: mocks.from }) }));
vi.mock("@/lib/env", () => ({ publicEnv: { NEXT_PUBLIC_SITE_URL: "https://school.example" } }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));
vi.mock("@supabase/ssr", () => ({ createServerClient: () => ({ auth: mocks.auth, from: mocks.from }) }));
import { forgotPasswordAction, resendRecoveryOtpAction, verifyRecoveryOtpAction } from "@/app/(auth)/actions";
import { changeFirstLoginPassword, finishPasswordRecovery } from "@/app/auth/change-password/actions";
import { GET } from "@/app/auth/callback/route";
import { updateSession } from "@/lib/supabase/proxy";
import { recoveryRedirect, RECOVERY_SUCCESS, RECOVERY_EXPIRED, PASSWORD_UPDATED } from "@/lib/auth/password-recovery";
import { safeNextPath } from "@/lib/auth/safe-next-path";

const form = (values: Record<string, string>) => { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; };
const passwordForm = (recovery = "1") => form({ password: "Test-Only-Secret123!", confirm: "Test-Only-Secret123!", recovery, next: "/app/students" });
const request = (path: string, method = "GET") => new NextRequest(`https://school.example${path}`, { method });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  for (const name of ["resetPasswordForEmail", "verifyOtp", "exchangeCodeForSession", "updateUser", "refreshSession", "signOut"] as const) mocks.auth[name].mockResolvedValue({ error: null });
  mocks.from.mockReturnValue(mocks.query);
  mocks.query.select.mockReturnThis(); mocks.query.eq.mockReturnThis();
  mocks.query.maybeSingle.mockResolvedValue({ data: { must_change_password: false, is_active: true }, error: null });
});

describe("recovery request", () => {
  it.each(["known@example.com", "unknown@example.com"])("returns identical success for %s", async email => {
    await expect(forgotPasswordAction(form({ email }))).rejects.toThrow(`REDIRECT:/forgot-password/verify?message=${encodeURIComponent(RECOVERY_SUCCESS)}`);
    expect(mocks.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, { redirectTo: "https://school.example/auth/callback?next=/auth/change-password&recovery=1" });
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("conceals account-specific errors", async () => {
    mocks.auth.resetPasswordForEmail.mockResolvedValue({ error: { code: "user_not_found", message: "User not found" } });
    await expect(forgotPasswordAction(form({ email: "unknown@example.com" }))).rejects.toThrow(encodeURIComponent(RECOVERY_SUCCESS));
  });
  it("handles rate limits safely", async () => {
    mocks.auth.resetPasswordForEmail.mockResolvedValue({ error: { status: 429, message: "private details" } });
    await expect(forgotPasswordAction(form({ email: "known@example.com" }))).rejects.toThrow(encodeURIComponent("Please wait before requesting another verification code."));
  });
  it("rejects malformed email without calling Auth", async () => {
    await expect(forgotPasswordAction(form({ email: "bad" }))).rejects.toThrow("Enter%20a%20valid");
    expect(mocks.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
  it("uses only configured HTTP local or HTTPS origins", () => {
    expect(recoveryRedirect("http://localhost:3000/path")).toBe("http://localhost:3000/auth/callback?next=/auth/change-password&recovery=1");
    expect(() => recoveryRedirect("javascript:alert(1)")).toThrow();
    expect(() => recoveryRedirect("http://external.example")).toThrow();
  });
});

describe("recovery OTP", () => {
  it("verifies the Supabase recovery OTP and requires the resulting user", async () => {
    await expect(verifyRecoveryOtpAction(form({ email: "known@example.com", token: "123456" }))).rejects.toThrow("REDIRECT:/auth/change-password?recovery=1");
    expect(mocks.auth.verifyOtp).toHaveBeenCalledWith({ email: "known@example.com", token: "123456", type: "recovery" });
    expect(mocks.auth.getUser).toHaveBeenCalled();
  });
  it("rejects invalid OTPs without creating a recovery session", async () => {
    mocks.auth.verifyOtp.mockResolvedValue({ error: { message: "expired" } });
    await expect(verifyRecoveryOtpAction(form({ email: "known@example.com", token: "000000" }))).rejects.toThrow(encodeURIComponent(RECOVERY_EXPIRED));
    expect(mocks.auth.getUser).not.toHaveBeenCalled();
  });
  it("resends through the Auth recovery API and preserves generic messaging", async () => {
    await expect(resendRecoveryOtpAction(form({ email: "known@example.com" }))).rejects.toThrow(encodeURIComponent(RECOVERY_SUCCESS));
    expect(mocks.auth.resetPasswordForEmail).toHaveBeenCalled();
  });
  it("handles resend rate limits without exposing Auth details", async () => {
    mocks.auth.resetPasswordForEmail.mockResolvedValue({ error: { status: 429, message: "private details" } });
    await expect(resendRecoveryOtpAction(form({ email: "known@example.com" }))).rejects.toThrow(encodeURIComponent("Please wait before requesting another verification code."));
  });
});

describe("PKCE callback", () => {
  it("exchanges once using the SSR client and redirects without caching", async () => {
    const response = await GET(request("/auth/callback?code=once&next=/auth/change-password&recovery=1"));
    expect(mocks.auth.exchangeCodeForSession).toHaveBeenCalledTimes(1); expect(mocks.auth.exchangeCodeForSession).toHaveBeenCalledWith("once");
    expect(response.headers.get("location")).toBe("https://school.example/auth/change-password?recovery=1");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it.each(["invalid", "expired", "consumed"])("handles %s code with a new-link form", async code => {
    mocks.auth.exchangeCodeForSession.mockResolvedValue({ error: { message: code } });
    const response = await GET(request(`/auth/callback?code=${code}&recovery=1`));
    expect(response.headers.get("location")).toBe(`https://school.example/forgot-password?error=${encodeURIComponent(RECOVERY_EXPIRED)}`);
  });
  it("handles a missing recovery code", async () => {
    const response = await GET(request("/auth/callback?recovery=1&error=access_denied"));
    expect(response.headers.get("location")).toContain("/forgot-password?error=");
    expect(mocks.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });
  it.each(["https://evil.example", "//evil.example", "javascript:alert(1)", "/\\evil.example", "/%5cevil.example", "/%2fevil.example", "/\n/evil.example"])("rejects unsafe next %s", async next => {
    expect(safeNextPath(next)).toBe("/app");
    const response = await GET(request(`/auth/callback?code=ok&next=${encodeURIComponent(next)}`));
    expect(response.headers.get("location")).toBe("https://school.example/app");
  });
  it.each(["/app", "/app/invitations?accepted=1", "/auth/change-password?next=%2Fapp"])("preserves other callback destinations %s", async next => {
    const response = await GET(request(`/auth/callback?code=ok&next=${encodeURIComponent(next)}`));
    expect(response.headers.get("location")).toBe(`https://school.example${next}`);
  });
});

describe("password update", () => {
  it("requires a server-verified user", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(changeFirstLoginPassword(passwordForm())).rejects.toThrow("/login?error=Password%20reset%20session");
    expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  });
  it.each([['short', 'short', 'Use%20at%20least%2012'], ['Test-Only-Secret123!', 'Different123!', 'Passwords%20do%20not%20match'], ['abcdefghijklmnop', 'abcdefghijklmnop', 'uppercase']])("validates policy and confirmation", async (password, confirm, message) => {
    await expect(changeFirstLoginPassword(form({ password, confirm, recovery: "1" }))).rejects.toThrow(message);
    expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  });
  it("updates through Auth, verifies the trigger flag and signs out recovery", async () => {
    await expect(changeFirstLoginPassword(passwordForm())).rejects.toThrow(`/login?message=${encodeURIComponent(PASSWORD_UPDATED)}`);
    expect(mocks.auth.updateUser).toHaveBeenCalledWith({ password: "Test-Only-Secret123!" });
    expect(mocks.query.select).toHaveBeenCalledWith("must_change_password");
    expect(mocks.query.eq).toHaveBeenCalledWith("id", "user-1");
    expect(mocks.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(mocks.auth.updateUser.mock.invocationCallOrder[0]).toBeLessThan(mocks.query.select.mock.invocationCallOrder[0]!);
  });
  it("preserves authenticated first-login continuation", async () => {
    await expect(changeFirstLoginPassword(passwordForm("0"))).rejects.toThrow("REDIRECT:/app/students");
    expect(mocks.auth.signOut).not.toHaveBeenCalled();
  });
  it("does not fail an accepted password for a delayed profile", async () => {
    mocks.query.maybeSingle.mockResolvedValue({ data: { must_change_password: true }, error: null });
    await expect(changeFirstLoginPassword(passwordForm())).rejects.toThrow(encodeURIComponent(PASSWORD_UPDATED));
  });
  it("does not fail an accepted password for a failed refresh", async () => {
    mocks.auth.refreshSession.mockRejectedValue(new Error("offline"));
    await expect(changeFirstLoginPassword(passwordForm())).rejects.toThrow(encodeURIComponent(PASSWORD_UPDATED));
  });
  it("does not claim sign-out success on failure and permits retry", async () => {
    mocks.auth.signOut.mockResolvedValueOnce({ error: { message: "offline" } });
    await expect(changeFirstLoginPassword(passwordForm())).rejects.toThrow("completed=1");
    await expect(finishPasswordRecovery()).rejects.toThrow(encodeURIComponent(PASSWORD_UPDATED));
    expect(mocks.auth.updateUser).toHaveBeenCalledTimes(1);
  });
  it("does not disclose raw update errors", async () => {
    mocks.auth.updateUser.mockResolvedValue({ error: { message: "raw internals" } });
    await expect(changeFirstLoginPassword(passwordForm())).rejects.toThrow("Unable%20to%20update");
    expect(mocks.auth.signOut).not.toHaveBeenCalled();
  });
  it("never writes the profile flag, role, membership or person linkage", () => {
    const source = readFileSync("src/app/auth/change-password/actions.ts", "utf8");
    expect(source).not.toMatch(/\.update\(|\.rpc\(|\.insert\(|\.upsert\(|encrypted_password|must_change_password\s*:\s*false/);
  });
});

describe("route guards", () => {
  it.each(["/forgot-password", "/auth/callback?code=ok", "/login"])("allows anonymous %s", async path => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null } });
    expect((await updateSession(request(path))).headers.get("location")).toBeNull();
  });
  it("denies anonymous password change with a safe expired-link error", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null } });
    expect((await updateSession(request("/auth/change-password?recovery=1"))).headers.get("location")).toContain("/login?error=Password%20reset%20session");
  });
  it.each([true, false])("allows authenticated password change with flag %s", async flag => {
    mocks.query.maybeSingle.mockResolvedValue({ data: { must_change_password: flag } });
    expect((await updateSession(request("/auth/change-password?recovery=1"))).headers.get("location")).toBeNull();
  });
  it.each(["/login", "/forgot-password", "/app/students", "/auth/change-password?recovery=1"])("preserves authenticated Server Action POST %s", async path => {
    mocks.query.maybeSingle.mockResolvedValue({ data: { must_change_password: true } });
    expect((await updateSession(request(path, "POST"))).headers.get("location")).toBeNull();
  });
});

