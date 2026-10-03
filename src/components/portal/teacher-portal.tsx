import Link from "next/link";
import {
  GraduationCap,
  CalendarCheck,
  Users,
  BookOpen,
  FileText,
  Megaphone,
  MessageSquare,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalSection } from "./portal-section";
import { PortalEmptyState } from "./portal-empty-state";
import { formatDate, formatMoney } from "@/lib/formatting";
import type { EmployeePortalData } from "@/lib/portal/portal-types";

type TeacherPortalProps = {
  data: EmployeePortalData;
};

export function TeacherPortal({ data }: TeacherPortalProps) {
  return (
    <PortalSection
      title="Teacher Portal"
      icon={<GraduationCap className="h-5 w-5 text-slate-600" />}
    >
      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["My Timetable", "/app/portal/timetable"],
            ["My Classes", "/app/portal/classes"],
            ["My Subjects", "/app/portal/subjects"],
            ["My Students", "/app/portal/students"],
            ["Attendance", "/app/portal/attendance"],
            ["Assessments", "/app/portal/assessments"],
            ["Marks / Results", "/app/portal/results"],
            ["Messages", "/app/portal/messages"],
            ["Announcements", "/app/portal/announcements"],
            ["Profile", "/app/profile"],
            ["Notifications", "/app/portal/notifications"]
          ] as const
        ).map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <TeacherSummaryCard data={data} />
        <TeacherScheduleCard data={data} />
        {data.assignedClasses && data.assignedClasses.length > 0 && (
          <TeacherClassesCard classes={data.assignedClasses} />
        )}
        {data.assignedSubjects && data.assignedSubjects.length > 0 && (
          <TeacherSubjectsCard subjects={data.assignedSubjects} />
        )}
        {data.studentCount !== undefined && data.studentCount > 0 && (
          <TeacherStudentsCard studentCount={data.studentCount} />
        )}
        <TeacherLeaveCard data={data} />
        <TeacherPayslipsCard data={data} />
      </div>
    </PortalSection>
  );
}

function TeacherSummaryCard({ data }: { data: EmployeePortalData }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Teacher Summary</h3>
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

function TeacherScheduleCard({ data }: { data: EmployeePortalData }) {
  if (!data.todayLessons || data.todayLessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Today&apos;s Classes</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<CalendarCheck className="h-8 w-8" />}
            title="No classes scheduled today"
            description="You have no teaching assignments scheduled for today."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Today&apos;s Classes</h3>
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
            {lesson.room && <p className="mt-2 text-xs text-slate-500">Room: {lesson.room}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TeacherLeaveCard({ data }: { data: EmployeePortalData }) {
  if (!data.leaveRequests || data.leaveRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Leave Requests</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<CalendarCheck className="h-8 w-8" />}
            title="No leave requests"
            description="You have not submitted any leave requests yet."
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
          <div
            key={request.id}
            className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3"
          >
            <div>
              <p className="font-medium text-sm">{request.leaveType}</p>
              <p className="text-xs text-slate-600">
                {formatDate(request.startsOn)} – {formatDate(request.endsOn)}
                {request.requestedDays > 0 &&
                  ` · ${request.requestedDays} day${request.requestedDays > 1 ? "s" : ""}`}
              </p>
            </div>
            <Badge>{request.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TeacherPayslipsCard({ data }: { data: EmployeePortalData }) {
  if (!data.payslips || data.payslips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Payslips</h3>
        </CardHeader>
        <CardContent>
          <PortalEmptyState
            icon={<FileText className="h-8 w-8" />}
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
          <div
            key={payslip.id}
            className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3"
          >
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

function TeacherClassesCard({ classes }: { classes: Array<{ id: string; classSection: string; classGroup?: string; subject?: string; isPrimary: boolean }> }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">My Classes</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {classes.map((cls) => (
          <div key={cls.id} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <div>
              <p className="font-medium text-sm">{cls.classSection}</p>
              <p className="text-xs text-slate-600">
                {cls.classGroup && `${cls.classGroup} · `}
                {cls.subject || "Multiple subjects"}
              </p>
            </div>
            {cls.isPrimary && <Badge className="text-xs">Primary</Badge>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TeacherSubjectsCard({ subjects }: { subjects: Array<{ id: string; subject: string; classCount: number }> }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">My Subjects</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {subjects.map((subj) => (
          <div key={subj.id} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <p className="font-medium text-sm">{subj.subject}</p>
            <p className="text-xs text-slate-600">{subj.classCount} class{subj.classCount > 1 ? "es" : ""}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TeacherStudentsCard({ studentCount }: { studentCount: number }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">My Students</h3>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-3xl font-black text-slate-900">{studentCount}</p>
          <p className="text-sm text-slate-600">Students in assigned classes</p>
        </div>
      </CardContent>
    </Card>
  );
}
