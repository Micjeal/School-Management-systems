import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isUuid } from "@/lib/auth/access-errors";

const ID_ROUTE_PATTERNS = [
  /^\/app\/(?:staff|admissions|approvals|assessments|attendance)\/((?!new(?:\/|$))[^/]+)/,
  /^\/app\/students\/((?!new(?:\/|$))[^/]+)/,
  /^\/app\/academics\/timetable\/([^/]+)/,
  /^\/app\/finance\/(?:invoices|payments|refunds)\/([^/]+)/,
  /^\/app\/(?:messages|payroll)\/([^/]+)/,
  /^\/app\/platform\/(?:schools|roles)\/([^/]+)/,
  /^\/app\/platform\/users\/([^/]+)\/roles/,
  /^\/app\/procurement\/orders\/([^/]+)/,
  /^\/app\/system\/imports\/([^/]+)/,
  /^\/app\/modules\/(?:integrations|medical-conditions|webhooks)\/([^/]+)/,
  /^\/print\/(?:invoice|payslip|report-card)\/([^/]+)/
];

export async function proxy(request: NextRequest) {
  for (const pattern of ID_ROUTE_PATTERNS) {
    const id = request.nextUrl.pathname.match(pattern)?.[1];
    if (id && !isUuid(id)) return NextResponse.rewrite(new URL("/not-found", request.url));
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
