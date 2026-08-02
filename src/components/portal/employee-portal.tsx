import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, CalendarClock, ReceiptText, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalSection } from "./portal-section";
import { PortalEmptyState } from "./portal-empty-state";
import { formatDate, formatMoney } from "@/lib/formatting";
import type { EmployeePortalData } from "@/lib/portal/portal-types";

type EmployeePortalProps = {
  data: EmployeePortalData;
};

export function EmployeePortal({ data }: EmployeePortalProps) {
  return (
    <PortalSection title="My employment" icon={<BriefcaseBusiness className="h-5 w-5 text-slate-600" />}>
      <div className="grid gap-5 lg:grid-cols-2">
        <EmployeeSummaryCard data={data} />
        {data.isTeacher && <EmployeeScheduleCard data={data} />}
        <EmployeeLeaveCard data={data} />
        <EmployeePayslipsCard data={data} />
      </div>
    </PortalSection>
  );
}

function EmployeeSummaryCard({ data }: { data: EmployeePortalData }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Employee Summary</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Employee Number</span>
          <span className="text-sm font-medium">{data.employeeNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Status</span>
          <Badge>{data.status}</Badge>
        </div>
        {data.primaryJobTitle && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Job Title</span>
            <span className="text-sm font-medium">{data.primaryJobTitle}</span>
          </div>
        )}
        {data.department && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Department</span>
            <span className="text-sm font-medium">{data.department}</span>
          </div>
        )}
        {data.campus && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Campus</span>
            <span className="text-sm font-medium">{data.campus}</span>
          </div>
        )}
        {data.reportingManager && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Reporting Manager</span>
            <span className="text-sm font-medium">{data.reportingManager}</span>
          </div>
        )}
        {data.hireDate && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Hire Date</span>
            <span className="text-sm font-medium">{formatDate(data.hireDate)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmployeeScheduleCard({ data }: { data: EmployeePortalData }) {
  if (!data.todayLessons || data.todayLessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Today's Schedule</h3>
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
        <h3 className="font-semibold">Today's Schedule</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.todayLessons.map((lesson) => (
          <div key={lesson.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{lesson.subject}</p>
                <p className="text-xs text-slate-600">
                  {lesson.classSection}
                  {lesson.classGroup && ` · ${lesson.classGroup}`}
                </p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p>{lesson.startsAt}</p>
                <p>{lesson.endsAt}</p>
              </div>
            </div>
            {lesson.room && (
              <p className="mt-2 text-xs text-slate-500">Room: {lesson.room}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmployeeLeaveCard({ data }: { data: EmployeePortalData }) {
  if (!data.leaveRequests || data.leaveRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Leave Requests</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<CalendarClock className="h-8 w-8" />}
            title="No leave requests"
            description="You have not submitted any leave requests."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Leave Requests</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.leaveRequests.map((request) => (
          <div key={request.id} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <div>
              <p className="font-medium text-sm">{request.leaveType}</p>
              <p className="text-xs text-slate-600">
                {formatDate(request.startsOn)} – {formatDate(request.endsOn)}
                {request.requestedDays > 0 && ` · ${request.requestedDays} day${request.requestedDays > 1 ? 's' : ''}`}
              </p>
            </div>
            <Badge>{request.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmployeePayslipsCard({ data }: { data: EmployeePortalData }) {
  if (!data.payslips || data.payslips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Payslips</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<ReceiptText className="h-8 w-8" />}
            title="No payslips available"
            description="No payroll records have been processed yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Payslips</h3>
          <Link href="/app/portal/payslips" className="text-sm text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.payslips.map((payslip) => (
          <div key={payslip.id} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <div>
              <p className="font-medium text-sm">{payslip.payrollPeriod}</p>
              <p className="text-xs text-slate-600">{payslip.paymentStatus}</p>
            </div>
            <span className="font-semibold text-sm">{formatMoney(payslip.netPay)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
