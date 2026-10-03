import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ getUser: vi.fn(), profile: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: auth.profile }) }) }) }) }));
vi.mock("@/app/(auth)/actions", () => ({ forgotPasswordAction: vi.fn(), loginAction: vi.fn() }));
vi.mock("@/app/auth/change-password/actions", () => ({ changeFirstLoginPassword: vi.fn(), finishPasswordRecovery: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));
import ChangePassword from "@/app/auth/change-password/page";
import ForgotPage from "@/app/(auth)/forgot-password/page";
import LoginPage from "@/app/(auth)/login/page";
import { RECOVERY_EXPIRED, PASSWORD_UPDATED } from "@/lib/auth/password-recovery";

beforeEach(() => {
  auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  auth.profile.mockResolvedValue({ data: { must_change_password: false, is_active: true } });
});
afterEach(cleanup);
describe("password recovery pages", () => {
  it("renders the anonymous email form without consulting a role or session", async () => {
    render(await ForgotPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(screen.getByRole("button", { name: "Send verification code" })).toBeVisible();
    expect(auth.getUser).not.toHaveBeenCalled();
  });
  it("renders an expired-link explanation and another reset request", async () => {
    render(await ForgotPage({ searchParams: Promise.resolve({ error: RECOVERY_EXPIRED }) }));
    expect(screen.getByRole("alert")).toHaveTextContent(RECOVERY_EXPIRED);
    expect(screen.getByRole("button", { name: "Send verification code" })).toBeVisible();
  });
  it("renders a recovery form even when the mandatory flag is false", async () => {
    render(await ChangePassword({ searchParams: Promise.resolve({ recovery: "1" }) }));
    expect(screen.getByLabelText("New password")).toHaveAttribute("minlength", "12");
    expect(screen.getByLabelText("Confirm new password")).toBeVisible();
    expect(document.querySelector('input[name="recovery"]')).toHaveValue("1");
    expect(screen.getByRole("link", { name: "Request a new verification code" })).toHaveAttribute("href", "/forgot-password");
  });
  it("retains the first-login form", async () => {
    auth.profile.mockResolvedValue({ data: { must_change_password: true, is_active: true } });
    render(await ChangePassword({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { name: "Secure your account" })).toBeVisible();
  });
  it("requires an authenticated user before rendering", async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(ChangePassword({ searchParams: Promise.resolve({ recovery: "1" }) })).rejects.toThrow("/login?error=Password%20reset%20session");
  });
  it("shows completion and forgot-password on login", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ message: PASSWORD_UPDATED }) }));
    expect(screen.getByRole("status")).toHaveTextContent(PASSWORD_UPDATED);
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
  });
});
