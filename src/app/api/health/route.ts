import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ service: "schooldb", status: "ok", timestamp: new Date().toISOString(), version: process.env.npm_package_version ?? "2.0.0" }, { headers: { "Cache-Control": "no-store" } }); }
