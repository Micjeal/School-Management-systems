import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UserContext } from "@/types/context";
import type {
  PortalData,
  PortalUser,
  PortalSchool,
  PortalMembership,
  PortalPersonas,
  EmployeePortalData,
  StudentPortalData,
  GuardianPortalData,
  GuardianLearner,
  PlatformPortalData,
  AnnouncementSummary,
  NotificationSummary,
  ConversationSummary,
  PrivateFileSummary,
  PortalQuickAction,
} from "./portal-types";

export async function getPortalData(
  context: UserContext,
  selectedLearnerId?: string | null,
): Promise<PortalData> {
  const supabase = await createClient();
  const schoolId = context.active_school_id;

  // Build user data
  const user: PortalUser = {
    id: context.user_id,
    displayName: (context.profile.display_name ?? 
      `${context.profile.first_name ?? ""} ${context.profile.last_name ?? ""}`.trim()) || "User",
    initials: getInitials(context.profile.first_name, context.profile.last_name),
    firstName: context.profile.first_name,
    lastName: context.profile.last_name,
    mustChangePassword: context.profile.must_change_password,
    isActive: context.profile.is_active,
  };

  // Build school data
  const membership = context.memberships.find((m) => m.school_id === schoolId);
  const school: PortalSchool = schoolId && membership
    ? {
        id: membership.school_id,
        name: membership.school_name,
        slug: membership.school_slug,
        status: membership.school_status,
        subscriptionStatus: membership.subscription_status,
      }
    : null;

  // Build membership data
  const portalMembership: PortalMembership = membership
    ? {
        membershipId: membership.membership_id,
        schoolId: membership.school_id,
        schoolName: membership.school_name,
        schoolSlug: membership.school_slug,
        schoolStatus: membership.school_status,
        subscriptionStatus: membership.subscription_status,
        campusId: membership.campus_id,
        status: membership.status,
        roles: membership.roles,
      }
    : null;

  // Load personas
  const personas = await loadPersonas(supabase, context, schoolId, selectedLearnerId ?? null);

  // Load universal data (announcements, notifications, messages, files)
  const [announcements, notifications, messages, privateFiles] = await Promise.all([
    loadAnnouncements(supabase, context.user_id, schoolId),
    loadNotifications(supabase, context.user_id, schoolId),
    loadMessages(supabase, context.user_id, schoolId),
    loadPrivateFiles(supabase, context.user_id, schoolId),
  ]);

  // Build quick actions
  const quickActions = buildQuickActions(context, personas);

  // Check if user has any linked person record
  const hasLinkedPerson = !!(personas.employee || personas.student || personas.guardian);

  return {
    user,
    school,
    membership: portalMembership,
    personas,
    announcements,
    notifications,
    messages,
    privateFiles,
    quickActions,
    hasLinkedPerson,
    selectedLearnerId,
  };
}

async function loadPersonas(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: UserContext,
  schoolId: string | null,
  selectedLearnerId: string | null,
): Promise<PortalPersonas> {
  if (!schoolId) {
    // Platform view - only load platform admin persona
    return {
      employee: null,
      student: null,
      guardian: null,
      platformAdmin: context.is_platform_admin ? await loadPlatformPortalData(supabase, context) : null,
    };
  }

  // Get portal identity using secure RPC
  const { data: identity, error: identityError } =
    await (supabase as any).rpc("get_my_portal_identity", {
      target_school_id: schoolId,
    });

  if (identityError || !identity) {
    return {
      employee: null,
      student: null,
      guardian: null,
      platformAdmin: context.is_platform_admin ? await loadPlatformPortalData(supabase, context) : null,
    };
  }

  const personId = identity.person_id;

  // Load all personas using secure RPCs in parallel
  const [employee, student, guardian] = await Promise.all([
    personId && identity.employee_id ? loadEmployeePortalData(supabase, schoolId, personId) : Promise.resolve(null),
    personId && identity.student_id ? loadStudentPortalData(supabase, schoolId, personId) : Promise.resolve(null),
    personId && identity.guardian_id ? loadGuardianPortalData(supabase, schoolId, personId, selectedLearnerId) : Promise.resolve(null),
  ]);

  return {
    employee,
    student,
    guardian,
    platformAdmin: context.is_platform_admin ? await loadPlatformPortalData(supabase, context) : null,
  };
}

async function loadEmployeePortalData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolId: string,
  personId: string,
): Promise<EmployeePortalData | null> {
  // Use secure RPC for employee portal data
  const { data: employee, error: employeeError } =
    await (supabase as any).rpc("get_my_employee_portal", {
      target_school_id: schoolId,
    });

  if (employeeError || !employee) return null;

  const isTeacher = employee.is_teacher;

  // Load today's lessons if teacher
  let todayLessons: EmployeePortalData["todayLessons"] = [];
  if (isTeacher) {
    const today = new Date().getDay();
    const { data: timetable } = await supabase
      .from("timetable_entries")
      .select("id,subjects(name),class_sections(name,class_groups(name)),rooms(name),starts_at,ends_at,weekday")
      .eq("teacher_employee_id", employee.employee_id)
      .eq("weekday", today === 0 ? 7 : today)
      .order("starts_at") as any;

    todayLessons = (timetable ?? []).map((entry: any) => ({
      id: entry.id,
      subject: entry.subjects?.name || "",
      classSection: entry.class_sections?.name || "",
      classGroup: entry.class_sections?.class_groups?.name,
      room: entry.rooms?.name,
      startsAt: entry.starts_at,
      endsAt: entry.ends_at,
    }));
  }

  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select("id,leave_types(name),starts_on,ends_on,status,requested_days")
    .eq("employee_id", employee.employee_id)
    .order("requested_at", { ascending: false })
    .limit(5) as any;

  const { data: payslips } = await supabase
    .from("payroll_entries")
    .select("id,net_pay,payment_status,payroll_runs(run_number,payroll_periods(name))")
    .eq("employee_id", employee.employee_id)
    .order("created_at", { ascending: false })
    .limit(5) as any;

  const { data: qualifications } = await supabase
    .from("employee_qualifications")
    .select("id,name,institution,year")
    .eq("employee_id", employee.employee_id)
    .order("year", { ascending: false })
    .limit(10) as any;

  return {
    employeeId: employee.employee_id,
    employeeNumber: employee.employee_number,
    personId,
    employmentType: employee.employment_type,
    hireDate: employee.hire_date,
    status: employee.status,
    primaryJobTitle: employee.primary_job_title,
    department: employee.department,
    campus: employee.campus,
    reportingManager: null,
    isTeacher,
    todayLessons,
    leaveRequests: (leaveRequests ?? []).map((req: any) => ({
      id: req.id,
      leaveType: req.leave_types?.name || "",
      startsOn: req.starts_on,
      endsOn: req.ends_on,
      status: req.status,
      requestedDays: req.requested_days || 0,
    })),
    payslips: (payslips ?? []).map((pay: any) => ({
      id: pay.id,
      payrollPeriod: pay.payroll_runs?.payroll_periods?.name || pay.payroll_runs?.run_number || "",
      runNumber: pay.payroll_runs?.run_number,
      netPay: pay.net_pay,
      paymentStatus: pay.payment_status,
    })),
    qualifications: (qualifications ?? []).map((qual: any) => ({
      id: qual.id,
      name: qual.name,
      institution: qual.institution,
      year: qual.year,
    })),
  };
}

async function loadStudentPortalData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolId: string,
  personId: string,
): Promise<StudentPortalData | null> {
  // Use secure RPC for student portal data
  const { data: student, error: studentError } =
    await (supabase as any).rpc("get_my_student_portal", {
      target_school_id: schoolId,
    });

  if (studentError || !student) return null;

  // Load additional data that RPC doesn't provide
  const { data: enrolment } = await supabase
    .from("student_enrolments")
    .select(
      "id,class_sections(name,class_groups(name)),academic_years(name),terms(name),boarding_status",
    )
    .eq("student_id", student.student_id)
    .eq("enrolment_status", "active")
    .order("academic_year_id", { ascending: false })
    .limit(1)
    .maybeSingle() as any;

  // Load attendance for current term
  const attendance = await loadStudentAttendance(supabase, student.student_id, enrolment?.terms?.id ?? null);

  // Load published results only
  const { data: results } = await supabase
    .from("subject_results")
    .select("id,percentage_score,grade,status,subjects(name),terms(name),teacher_remark")
    .eq("student_id", student.student_id)
    .eq("status", "published")
    .order("calculated_at", { ascending: false })
    .limit(12) as any;

  // Load invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id,invoice_number,balance_due,status,due_date")
    .eq("student_id", student.student_id)
    .in("status", ["draft", "sent", "partial", "overdue"])
    .order("due_date", { ascending: false })
    .limit(8) as any;

  // Load library loans
  const { data: loans } = await supabase
    .from("library_loans")
    .select("id,due_at,status,library_copies(library_items(title))")
    .eq("student_id", student.student_id)
    .in("status", ["active", "overdue"]) as any;

  // Load timetable
  const today = new Date().getDay();
  const { data: timetable } = await supabase
    .from("timetable_entries")
    .select(
      "id,subjects(name),rooms(name),starts_at,ends_at,weekday,teacher_assignments(employees(people(first_name,last_name)))",
    )
    .eq("class_section_id", (enrolment as any)?.class_sections?.id)
    .eq("weekday", today === 0 ? 7 : today)
    .order("starts_at") as any;

  return {
    studentId: student.student_id,
    personId,
    admissionNumber: student.admission_number,
    studentNumber: student.student_number,
    status: student.status,
    campus: student.campus,
    classSection: student.class_section,
    classGroup: student.class_group,
    academicYear: student.academic_year,
    term: student.term,
    boardingStatus: student.boarding_status,
    attendance,
    results: (results ?? []).map((result: any) => ({
      id: result.id,
      subject: result.subjects?.name || "",
      term: result.terms?.name || "",
      percentage: result.percentage_score,
      grade: result.grade,
      teacherRemark: result.teacher_remark,
    })),
    invoices: (invoices ?? []).map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      balanceDue: inv.balance_due,
      status: inv.status,
      dueDate: inv.due_date,
    })),
    libraryLoans: (loans ?? []).map((loan: any) => ({
      id: loan.id,
      title: loan.library_copies?.library_items?.title || "",
      dueAt: loan.due_at,
      status: loan.status,
      isOverdue: loan.status === "overdue",
    })),
    timetable: (timetable ?? []).map((entry: any) => ({
      id: entry.id,
      subject: entry.subjects?.name || "",
      teacher: entry.teacher_assignments?.employees?.people
        ? `${entry.teacher_assignments.employees.people.first_name} ${entry.teacher_assignments.employees.people.last_name}`
        : null,
      room: entry.rooms?.name,
      startsAt: entry.starts_at,
      endsAt: entry.ends_at,
      weekday: entry.weekday,
    })),
  };
}

async function loadStudentAttendance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  termId: string | undefined,
) {
  const { data: attendance } = await supabase
    .from("student_attendance_records")
    .select("attendance_status")
    .eq("student_id", studentId)
    .limit(1000) as any;

  if (!attendance || attendance.length === 0) {
    return {
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      total: 0,
      percentage: 0,
      period: "No attendance recorded yet",
    };
  }

  const present = attendance.filter((a: any) => a.attendance_status === "present").length;
  const late = attendance.filter((a: any) => a.attendance_status === "late").length;
  const absent = attendance.filter((a: any) => a.attendance_status === "absent").length;
  const excused = attendance.filter((a: any) => a.attendance_status === "excused").length;
  const total = attendance.length;
  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return {
    present,
    late,
    absent,
    excused,
    total,
    percentage,
    period: termId ? "Current term" : "All records",
  };
}

async function loadGuardianPortalData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  schoolId: string,
  personId: string,
  selectedLearnerId: string | null,
): Promise<GuardianPortalData | null> {
  // Use secure RPC for guardian portal data
  const { data: guardian, error: guardianError } =
    await (supabase as any).rpc("get_my_guardian_portal", {
      target_school_id: schoolId,
      selected_student_id: selectedLearnerId ?? null,
    });

  if (guardianError || !guardian) return null;

  // Load linked learners with authorization flags
  const { data: links } = await supabase
    .from("student_guardians")
    .select(
      "id,relationship_type,receives_academic_reports,receives_financial_notices,can_pick_up,is_financially_responsible,students(id,person_id,admission_number,status,people(first_name,last_name),student_enrolments(class_sections(name,class_groups(name))))",
    )
    .eq("guardian_id", guardian.guardian_id)
    .eq("students.status", "active") as any;

  if (guardian.learner_count === 0) {
    return {
      guardianId: guardian.guardian_id,
      personId,
      learners: [],
    };
  }

  // Validate selected learner if provided
  let validatedLearnerId = selectedLearnerId;
  if (selectedLearnerId) {
    const isValid = links.some((link: any) => link.students.id === selectedLearnerId);
    if (!isValid) {
      validatedLearnerId = null;
    }
  }

  // Load detailed data for each learner
  const learners: GuardianLearner[] = await Promise.all(
    (links ?? []).map(async (link: any) => {
      const student = link.students;
      const learner: GuardianLearner = {
        studentId: student.id,
        personId: student.person_id,
        admissionNumber: student.admission_number,
        displayName: `${student.people.first_name} ${student.people.last_name}`,
        relationshipType: link.relationship_type,
        status: student.status,
        classSection: student.student_enrolments?.[0]?.class_sections?.name,
        classGroup: student.student_enrolments?.[0]?.class_sections?.class_groups?.name,
        receivesAcademicReports: link.receives_academic_reports,
        receivesFinancialNotices: link.receives_financial_notices,
        canPickUp: link.can_pick_up,
        isFinanciallyResponsible: link.is_financially_responsible,
      };

      // Load academic data if authorized
      if (link.receives_academic_reports) {
        const [attendance, results] = await Promise.all([
          loadStudentAttendance(supabase, student.id, undefined),
          supabase
            .from("subject_results")
            .select("id,percentage_score,grade,status,subjects(name),terms(name)")
            .eq("student_id", student.id)
            .eq("status", "published")
            .order("calculated_at", { ascending: false })
            .limit(8),
        ]);

        learner.attendance = attendance;
        learner.results = (results.data ?? []).map((r: any) => ({
          id: r.id,
          subject: r.subjects?.name || "",
          term: r.terms?.name || "",
          percentage: r.percentage_score,
          grade: r.grade,
        }));
      }

      // Load financial data if authorized
      if (link.receives_financial_notices || link.is_financially_responsible) {
        const { data: invoices } = await supabase
          .from("invoices")
          .select("id,invoice_number,balance_due,status,due_date")
          .eq("student_id", student.id)
          .in("status", ["draft", "sent", "partial", "overdue"])
          .order("due_date", { ascending: false })
          .limit(5);

        learner.invoices = (invoices ?? []).map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          balanceDue: inv.balance_due,
          status: inv.status,
          dueDate: inv.due_date,
        }));
      }

      return learner;
    }),
  );

  return {
    guardianId: guardian.guardian_id,
    personId,
    learners,
  };
}

async function loadPlatformPortalData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: UserContext,
): Promise<PlatformPortalData> {
  const schoolCount = context.memberships.length;

  // Load recent platform notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id,title,type,priority,created_at,is_read")
    .eq("user_id", context.user_id)
    .is("school_id", null)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    platformRoles: context.platform_roles,
    schoolCount,
    recentNotifications: (notifications ?? []).map((n: any) => ({
      id: n.id,
      title: n.title,
      type: n.type,
      priority: n.priority,
      createdAt: n.created_at,
      isRead: n.is_read,
    })),
  };
}

async function loadAnnouncements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  schoolId: string | null,
): Promise<AnnouncementSummary[]> {
  if (!schoolId) return [];

  const { data: announcements } = await supabase
    .from("announcements")
    .select(
      "id,title,priority,published_at,requires_acknowledgement,announcement_acknowledgements(id)",
    )
    .eq("school_id", schoolId)
    .eq("is_published", true)
    .gte("published_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order("published_at", { ascending: false })
    .limit(5) as any;

  return (announcements ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    priority: a.priority,
    publishedAt: a.published_at,
    requiresAcknowledgement: a.requires_acknowledgement,
    isAcknowledged: a.announcement_acknowledgements?.length > 0,
  }));
}

async function loadNotifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  schoolId: string | null,
): Promise<NotificationSummary[]> {
  // Use secure RPC for notifications
  const { data: notifications, error: notificationsError } =
    await (supabase as any).rpc("get_my_portal_notifications", {
      target_school_id: schoolId ?? null,
    });

  if (notificationsError || !notifications) return [];

  return notifications.map((n: any) => ({
    id: n.id,
    title: n.title,
    type: n.type,
    priority: n.priority,
    createdAt: n.created_at,
    isRead: n.is_read,
    actionLink: n.action_link,
  }));
}

async function loadMessages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  schoolId: string | null,
): Promise<ConversationSummary[]> {
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id,title,last_message_at,conversation_participants(people(first_name,last_name))")
    .contains("participant_ids", [userId])
    .order("last_message_at", { ascending: false })
    .limit(5) as any;

  return (conversations ?? []).map((c: any) => ({
    id: c.id,
    title: c.title,
    participantNames: c.conversation_participants
      .map((p: any) => `${p.people.first_name} ${p.people.last_name}`)
      .filter((n: string) => n),
    lastMessageAt: c.last_message_at,
    unreadCount: 0, // TODO: Implement unread count
  }));
}

async function loadPrivateFiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  schoolId: string | null,
): Promise<PrivateFileSummary[]> {
  const { data: files } = await supabase
    .from("private_files")
    .select("id,name,category,uploaded_at")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false })
    .limit(5) as any;

  return (files ?? []).map((f: any) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    uploadedAt: f.uploaded_at,
  }));
}

function buildQuickActions(
  context: UserContext,
  personas: PortalPersonas,
): PortalQuickAction[] {
  const actions: PortalQuickAction[] = [
    {
      label: "Update profile",
      href: "/app/profile",
      icon: "UserRound",
    },
    {
      label: "Private files",
      href: "/app/files",
      icon: "FolderLock",
    },
    {
      label: "Announcements",
      href: "/app/announcements",
      icon: "Megaphone",
    },
    {
      label: "Messages",
      href: "/app/messages",
      icon: "MessageSquare",
    },
    {
      label: "Notifications",
      href: "/app/notifications",
      icon: "Bell",
    },
  ];

  // Add employee-specific actions
  if (personas.employee) {
    if (context.permissions.includes("attendance.read")) {
      actions.push({
        label: "Take attendance",
        href: "/app/attendance",
        permission: "attendance.read",
        icon: "CalendarCheck",
        requiresPersona: "employee",
      });
    }
    if (context.permissions.includes("assessments.read")) {
      actions.push({
        label: "Enter marks",
        href: "/app/assessments",
        permission: "assessments.read",
        icon: "FileText",
        requiresPersona: "employee",
      });
    }
    actions.push(
      {
        label: "View my schedule",
        href: "/app/portal/schedule",
        icon: "CalendarDays",
        requiresPersona: "employee",
      },
      {
        label: "View payslips",
        href: "/app/portal/payslips",
        icon: "ReceiptText",
        requiresPersona: "employee",
      },
    );
  }

  // Add student-specific actions
  if (personas.student) {
    actions.push(
      {
        label: "View timetable",
        href: "/app/portal/timetable",
        icon: "CalendarDays",
        requiresPersona: "student",
      },
      {
        label: "View results",
        href: "/app/portal/results",
        icon: "ChartNoAxesColumnIncreasing",
        requiresPersona: "student",
      },
      {
        label: "View balances",
        href: "/app/portal/finance",
        icon: "WalletCards",
        requiresPersona: "student",
      },
    );
  }

  // Add guardian-specific actions
  if (personas.guardian) {
    actions.push(
      {
        label: "View learners",
        href: "/app/portal/learners",
        icon: "GraduationCap",
        requiresPersona: "guardian",
      },
    );
  }

  // Add platform admin actions
  if (personas.platformAdmin) {
    actions.push(
      {
        label: "Open platform dashboard",
        href: "/platform",
        icon: "LayoutDashboard",
        requiresPersona: "platform",
      },
      {
        label: "Manage schools",
        href: "/platform/schools",
        icon: "Building2",
        requiresPersona: "platform",
      },
      {
        label: "Manage users",
        href: "/platform/users",
        icon: "Users",
        requiresPersona: "platform",
      },
    );
  }

  // Add permission-based administrative actions
  const adminActions: PortalQuickAction[] = [
    {
      label: "Manage students",
      href: "/app/students",
      permission: "students.read",
      icon: "Users",
    },
    {
      label: "Manage staff",
      href: "/app/staff",
      permission: "staff.read",
      icon: "UserCog",
    },
    {
      label: "Finance",
      href: "/app/finance/invoices",
      permission: "finance.read",
      icon: "WalletCards",
    },
    {
      label: "Attendance",
      href: "/app/attendance",
      permission: "attendance.read",
      icon: "CalendarCheck",
    },
    {
      label: "Assessments",
      href: "/app/assessments",
      permission: "assessments.read",
      icon: "FileText",
    },
    {
      label: "Library",
      href: "/app/library/circulation",
      permission: "library.manage",
      icon: "BookOpen",
    },
  ];

  // Filter admin actions by permissions
  const visibleAdminActions = adminActions.filter(
    (action) =>
      context.is_platform_admin ||
      (action.permission && context.permissions.includes(action.permission)),
  );

  actions.push(...visibleAdminActions);

  return actions;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "U";
}
