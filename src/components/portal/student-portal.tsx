import Link from "next/link";
import { GraduationCap, CalendarCheck, ChartNoAxesColumnIncreasing, WalletCards, BookOpen, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalSection } from "./portal-section";
import { PortalEmptyState } from "./portal-empty-state";
import { formatDate, formatMoney } from "@/lib/formatting";
import type { StudentPortalData } from "@/lib/portal/portal-types";

type StudentPortalProps = {
  data: StudentPortalData;
};

export function StudentPortal({ data }: StudentPortalProps) {
  return (
    <PortalSection title="My academics" icon={<GraduationCap className="h-5 w-5 text-slate-600" />}>
      <div className="grid gap-5 lg:grid-cols-2">
        <StudentSummaryCard data={data} />
        <StudentAttendanceCard data={data} />
        <StudentResultsCard data={data} />
        <StudentFinanceCard data={data} />
        <StudentLibraryCard data={data} />
        <StudentTimetableCard data={data} />
      </div>
    </PortalSection>
  );
}

function StudentSummaryCard({ data }: { data: StudentPortalData }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Student Summary</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Admission Number</span>
          <span className="text-sm font-medium">{data.admissionNumber}</span>
        </div>
        {data.studentNumber && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Student Number</span>
            <span className="text-sm font-medium">{data.studentNumber}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Status</span>
          <Badge>{data.status}</Badge>
        </div>
        {data.campus && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Campus</span>
            <span className="text-sm font-medium">{data.campus}</span>
          </div>
        )}
        {data.classSection && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Class</span>
            <span className="text-sm font-medium">
              {data.classSection}
              {data.classGroup && ` · ${data.classGroup}`}
            </span>
          </div>
        )}
        {data.academicYear && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Academic Year</span>
            <span className="text-sm font-medium">{data.academicYear}</span>
          </div>
        )}
        {data.term && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Term</span>
            <span className="text-sm font-medium">{data.term}</span>
          </div>
        )}
        {data.boardingStatus && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Boarding</span>
            <span className="text-sm font-medium">{data.boardingStatus}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StudentAttendanceCard({ data }: { data: StudentPortalData }) {
  if (!data.attendance || data.attendance.total === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Attendance</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<CalendarCheck className="h-8 w-8" />}
            title="No attendance recorded"
            description="No attendance has been recorded yet."
          />
        </CardContent>
      </Card>
    );
  }

  const { attendance } = data;

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Attendance ({attendance.period})</h3>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-center">
          <p className="text-3xl font-black text-slate-900">{attendance.percentage}%</p>
          <p className="text-sm text-slate-600">Attendance rate</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-lg font-semibold text-emerald-700">{attendance.present}</p>
            <p className="text-xs text-slate-600">Present</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-lg font-semibold text-amber-700">{attendance.late}</p>
            <p className="text-xs text-slate-600">Late</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-lg font-semibold text-red-700">{attendance.absent}</p>
            <p className="text-xs text-slate-600">Absent</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3">
            <p className="text-lg font-semibold text-slate-700">{attendance.excused}</p>
            <p className="text-xs text-slate-600">Excused</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentResultsCard({ data }: { data: StudentPortalData }) {
  if (!data.results || data.results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Results</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<ChartNoAxesColumnIncreasing className="h-8 w-8" />}
            title="No published results"
            description="No published results are available yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Results</h3>
          <Link href="/app/portal/results" className="text-sm text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.results.map((result) => (
          <div key={result.id} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <div>
              <p className="font-medium text-sm">{result.subject}</p>
              <p className="text-xs text-slate-600">{result.term}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{result.percentage}%</p>
              <Badge className="text-xs">{result.grade}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StudentFinanceCard({ data }: { data: StudentPortalData }) {
  if (!data.invoices || data.invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Finance</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<WalletCards className="h-8 w-8" />}
            title="No outstanding invoices"
            description="You have no outstanding invoices."
          />
        </CardContent>
      </Card>
    );
  }

  const totalOutstanding = data.invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Finance</h3>
          <Link href="/app/portal/finance" className="text-sm text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-slate-600">Total Outstanding</p>
          <p className="text-2xl font-bold text-slate-900">{formatMoney(totalOutstanding)}</p>
        </div>
        <div className="space-y-3">
          {data.invoices.map((invoice) => (
            <div key={invoice.id} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-600">Due: {formatDate(invoice.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{formatMoney(invoice.balanceDue)}</p>
                <Badge className="text-xs">{invoice.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentLibraryCard({ data }: { data: StudentPortalData }) {
  if (!data.libraryLoans || data.libraryLoans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Library</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="No active loans"
            description="You have no active library loans."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Library Loans</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.libraryLoans.map((loan) => (
          <div key={loan.id} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <div>
              <p className="font-medium text-sm">{loan.title}</p>
              <p className="text-xs text-slate-600">Due: {formatDate(loan.dueAt)}</p>
            </div>
            <Badge className={loan.isOverdue ? "bg-red-50 text-red-700" : ""}>
              {loan.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StudentTimetableCard({ data }: { data: StudentPortalData }) {
  if (!data.timetable || data.timetable.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Today's Timetable</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<CalendarDays className="h-8 w-8" />}
            title="No lessons today"
            description="You have no scheduled lessons for today."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Today's Timetable</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.timetable.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{entry.subject}</p>
                {entry.teacher && (
                  <p className="text-xs text-slate-600">Teacher: {entry.teacher}</p>
                )}
              </div>
              <div className="text-right text-xs text-slate-600">
                <p>{entry.startsAt}</p>
                <p>{entry.endsAt}</p>
              </div>
            </div>
            {entry.room && (
              <p className="mt-2 text-xs text-slate-500">Room: {entry.room}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
