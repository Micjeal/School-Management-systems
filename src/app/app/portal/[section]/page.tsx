import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { requireUserContext } from "@/lib/auth/context";
import { getPortalData } from "@/lib/portal/get-portal-data";
import { formatDate, formatMoney } from "@/lib/formatting";

const SECTIONS = new Set([
  "timetable",
  "attendance",
  "assessments",
  "results",
  "report-cards",
  "finance",
  "receipts",
  "library",
  "boarding",
  "transport",
  "announcements",
  "messages",
  "files",
  "notifications",
  "account"
]);

export default async function StudentPortalSection({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!SECTIONS.has(section)) notFound();

  const context = await requireUserContext();
  if (!context.active_school_id) notFound();
  const data = await getPortalData(context);
  const student = data.personas.student;
  if (!student) notFound();

  const title = section.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return (
    <div className="space-y-6">
      <PageHeader
        title={`My ${title}`}
        description="Information for your selected school and your student record only."
      />
      {content(section, data, student)}
    </div>
  );
}

function content(section: string, data: any, student: any) {
  if (section === "timetable")
    return list("Weekly timetable", student.timetable, (item: any) => (
      <>
        <b>{item.subject}</b>
        <span>
          {item.startsAt} – {item.endsAt}
          {item.room ? ` · ${item.room}` : ""}
        </span>
      </>
    ));
  if (section === "attendance")
    return (
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Attendance summary</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.entries(student.attendance ?? {})
            .filter(([key]) => ["present", "late", "absent", "excused", "percentage"].includes(key))
            .map(([key, value]) => (
              <div key={key} className="rounded-lg border p-3">
                <p className="text-xs text-slate-500">{key}</p>
                <p className="text-lg font-bold">
                  {String(value)}
                  {key === "percentage" ? "%" : ""}
                </p>
              </div>
            ))}
        </CardContent>
      </Card>
    );
  if (section === "assessments" || section === "results")
    return list("Published results", student.results, (item: any) => (
      <>
        <b>{item.subject}</b>
        <span>
          {item.percentage ?? "—"}% · {item.grade ?? "Not graded"}
          {item.teacherRemark ? ` · ${item.teacherRemark}` : ""}
        </span>
      </>
    ));
  if (section === "finance" || section === "receipts")
    return list(
      section === "finance" ? "Your invoices" : "Receipts",
      section === "finance" ? student.invoices : [],
      (item: any) => (
        <>
          <b>{item.invoiceNumber}</b>
          <span>
            {formatMoney(item.balanceDue)} · {item.status} · due {formatDate(item.dueDate)}
          </span>
        </>
      )
    );
  if (section === "library")
    return list("Your library loans", student.libraryLoans, (item: any) => (
      <>
        <b>{item.title}</b>
        <span>
          {item.status} · due {formatDate(item.dueAt)}
        </span>
      </>
    ));
  if (section === "boarding")
    return empty(
      "Boarding",
      student.boardingStatus
        ? `Your boarding status is ${student.boardingStatus}. Your school has not published an active room assignment to this portal.`
        : "No boarding assignment."
    );
  if (section === "transport") return empty("Transport", "No transport assignment.");
  if (section === "announcements")
    return list("Announcements visible to you", data.announcements, (item: any) => (
      <>
        <b>{item.title}</b>
        <span>
          {item.priority} · {formatDate(item.publishedAt)}
        </span>
      </>
    ));
  if (section === "messages")
    return list("Your conversations", data.messages, (item: any) => (
      <>
        <b>{item.title || "Conversation"}</b>
        <span>
          {item.unreadCount} unread · {formatDate(item.lastMessageAt)}
        </span>
      </>
    ));
  if (section === "files" || section === "report-cards")
    return empty(
      section === "files" ? "My files" : "Report cards",
      "Files and published report cards are available in the private-files area when shared with you."
    );
  if (section === "notifications")
    return list("Your notifications", data.notifications, (item: any) => (
      <>
        <b>{item.title}</b>
        <span>
          {item.isRead ? "Read" : "Unread"} · {formatDate(item.createdAt)}
        </span>
      </>
    ));
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">Account</h2>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          Your password is never displayed. Use the account menu to change it; first-login password
          changes remain enforced by the authentication flow.
        </p>
      </CardContent>
    </Card>
  );
}

function list(title: string, items: any[] | undefined, render: (item: any) => React.ReactNode) {
  if (!items?.length) return empty(title, "Nothing has been published or assigned yet.");
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
            {render(item)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function empty(title: string, description: string) {
  return (
    <Card>
      <CardContent>
        <PortalEmptyState title={title} description={description} />
      </CardContent>
    </Card>
  );
}
