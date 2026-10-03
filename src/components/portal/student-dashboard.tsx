import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatting";
import type { StudentPortalData } from "@/lib/portal/portal-types";

export function StudentDashboard({ student }: { student: StudentPortalData }) {
  const attendance = student.attendance;
  const invoices = student.invoices ?? [];
  const results = student.results ?? [];
  const timetable = student.timetable ?? [];
  const latestResult = results[0];
  const nextLesson = timetable[0];
  const outstanding = invoices.reduce((total, invoice) => total + invoice.balanceDue, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your selected school and your own student records.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DashboardCard title="My Class" href="/app/portal">
          <p className="font-semibold">{student.classGroup ?? "No class assigned"}</p>
          <p className="text-sm text-slate-600">{student.classSection ?? ""}</p>
          <p className="text-xs text-slate-500">
            {[student.academicYear, student.term, student.campus].filter(Boolean).join(" · ")}
          </p>
        </DashboardCard>
        <DashboardCard title="My Attendance" href="/app/portal/attendance">
          {attendance?.total ? (
            <>
              <p className="text-2xl font-bold">{attendance.percentage}%</p>
              <p className="text-xs text-slate-500">
                {attendance.present} present · {attendance.absent} absent · {attendance.late} late
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">No attendance recorded.</p>
          )}
        </DashboardCard>
        <DashboardCard title="My Results" href="/app/portal/results">
          {latestResult ? (
            <>
              <p className="font-semibold">{latestResult.subject}</p>
              <p className="text-sm text-slate-600">
                {latestResult.percentage ?? "—"}% · {latestResult.grade ?? "Not graded"}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">No published results.</p>
          )}
        </DashboardCard>
        <DashboardCard title="My Fees" href="/app/portal/finance">
          <p className="text-2xl font-bold">{formatMoney(outstanding)}</p>
          <p className="text-xs text-slate-500">Outstanding balance</p>
        </DashboardCard>
        <DashboardCard title="Today's Classes" href="/app/portal/timetable">
          {nextLesson ? (
            <>
              <p className="font-semibold">{nextLesson.subject}</p>
              <p className="text-sm text-slate-600">
                {nextLesson.startsAt} – {nextLesson.endsAt}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">No lessons today.</p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  href,
  children
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <Link href={href} className="font-semibold hover:underline">
          {title}
        </Link>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
