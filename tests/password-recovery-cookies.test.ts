// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ set: vi.fn(), getAll: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => state }));
vi.mock("@/lib/env", () => ({ publicEnv: { NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-key" } }));
vi.mock("@supabase/ssr", () => ({ createServerClient: (_url: string, _key: string, options: { cookies: { getAll: () => unknown; setAll: (cookies: { name: string; value: string; options: object }[]) => void } }) => ({
  auth: { exchangeCodeForSession: async () => {
    expect(options.cookies.getAll()).toEqual([{ name: "pkce-verifier", value: "test-verifier" }]);
    options.cookies.setAll([{ name: "sb-session", value: "test-session", options: { path: "/", httpOnly: true } }]);
    return { error: null };
  } }
}) }));
import { GET } from "@/app/auth/callback/route";
import { NextRequest } from "next/server";
beforeEach(() => { vi.clearAllMocks(); state.getAll.mockReturnValue([{ name: "pkce-verifier", value: "test-verifier" }]); });
it("passes PKCE cookies to the existing SSR client and persists exchanged session cookies", async () => {
  const response = await GET(new NextRequest("https://school.example/auth/callback?code=once&recovery=1"));
  expect(state.set).toHaveBeenCalledWith("sb-session", "test-session", { path: "/", httpOnly: true });
  expect(response.headers.get("location")).toBe("https://school.example/auth/change-password?recovery=1");
});
