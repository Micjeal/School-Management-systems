import Link from "next/link";
import { GraduationCap, CalendarCheck, ChartNoAxesColumnIncreasing, WalletCards, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalSection } from "./portal-section";
import { PortalEmptyState } from "./portal-empty-state";
import { formatDate, formatMoney } from "@/lib/formatting";
import type { GuardianPortalData } from "@/lib/portal/portal-types";

type GuardianPortalProps = {
  data: GuardianPortalData;
};

export function GuardianPortal({ data }: GuardianPortalProps) {
  if (data.learners.length === 0) {
    return (
      <PortalSection title="My learners" icon={<GraduationCap className="h-5 w-5 text-slate-600" />}>
        <Card>
          <CardContent className="p-6">
            <PortalEmptyState
              icon={<Users className="h-8 w-8" />}
              title="No linked learners"
              description="You do not have any linked learners at this school."
            />
          </CardContent>
        </Card>
      </PortalSection>
    );
  }

  return (
    <PortalSection title="My learners" icon={<GraduationCap className="h-5 w-5 text-slate-600" />}>
      <div className="space-y-6">
        {data.learners.map((learner) => (
          <GuardianLearnerCard key={learner.studentId} learner={learner} />
        ))}
      </div>
    </PortalSection>
  );
}

function GuardianLearnerCard({ learner }: { learner: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{learner.displayName}</h3>
            <p className="text-sm text-slate-600">
              {learner.admissionNumber}
              {learner.classSection && ` · ${learner.classSection}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{learner.relationshipType}</Badge>
            <Badge>{learner.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-2">
          {learner.receivesAcademicReports && (
            <>
              {learner.attendance && learner.attendance.total > 0 && (
                <GuardianAttendanceCard attendance={learner.attendance} />
              )}
              {learner.results && learner.results.length > 0 && (
                <GuardianResultsCard results={learner.results} />
              )}
            </>
          )}
          {(learner.receivesFinancialNotices || learner.isFinanciallyResponsible) && (
            <>
              {learner.invoices && learner.invoices.length > 0 && (
                <GuardianFinanceCard invoices={learner.invoices} />
              )}
            </>
          )}
        </div>
        <div className="mt-4">
          <Link
            href={`/app/portal/learners/${learner.studentId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View full learner profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function GuardianAttendanceCard({ attendance }: { attendance: any }) {
  return (
    <Card>
      <CardHeader>
        <h4 className="font-semibold text-sm">Attendance ({attendance.period})</h4>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-center">
          <p className="text-2xl font-bold text-slate-900">{attendance.percentage}%</p>
          <p className="text-xs text-slate-600">Attendance rate</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-emerald-50 p-2">
            <p className="text-sm font-semibold text-emerald-700">{attendance.present}</p>
            <p className="text-xs text-slate-600">Present</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-2">
            <p className="text-sm font-semibold text-amber-700">{attendance.late}</p>
            <p className="text-xs text-slate-600">Late</p>
          </div>
          <div className="rounded-lg bg-red-50 p-2">
            <p className="text-sm font-semibold text-red-700">{attendance.absent}</p>
            <p className="text-xs text-slate-600">Absent</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2">
            <p className="text-sm font-semibold text-slate-700">{attendance.excused}</p>
            <p className="text-xs text-slate-600">Excused</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GuardianResultsCard({ results }: { results: any[] }) {
  return (
    <Card>
      <CardHeader>
        <h4 className="font-semibold text-sm">Recent Results</h4>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.slice(0, 5).map((result) => (
          <div key={result.id} className="flex justify-between gap-2 rounded-lg border border-slate-200 p-2">
            <div>
              <p className="text-sm font-medium">{result.subject}</p>
              <p className="text-xs text-slate-600">{result.term}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{result.percentage}%</p>
              <Badge className="text-xs">{result.grade}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function GuardianFinanceCard({ invoices }: { invoices: any[] }) {
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  return (
    <Card>
      <CardHeader>
        <h4 className="font-semibold text-sm">Finance</h4>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="text-xs text-slate-600">Total Outstanding</p>
          <p className="text-xl font-bold text-slate-900">{formatMoney(totalOutstanding)}</p>
        </div>
        <div className="space-y-2">
          {invoices.slice(0, 3).map((invoice) => (
            <div key={invoice.id} className="flex justify-between gap-2 rounded-lg border border-slate-200 p-2">
              <div>
                <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-600">Due: {formatDate(invoice.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatMoney(invoice.balanceDue)}</p>
                <Badge className="text-xs">{invoice.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
