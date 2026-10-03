import { redirect } from "next/navigation";
export default async function LegacyChangePassword({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const { next } = await searchParams; redirect(`/auth/change-password${next ? `?next=${encodeURIComponent(next)}` : ""}`); }
