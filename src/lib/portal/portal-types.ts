import type { UserContext } from "@/types/context";

export type PortalUser = {
  id: string;
  displayName: string;
  initials: string;
  firstName?: string | null;
  lastName?: string | null;
  mustChangePassword?: boolean;
  isActive?: boolean;
};

export type PortalSchool = {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
} | null;

export type PortalMembership = {
  membershipId: string;
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  schoolStatus: string;
  subscriptionStatus: string;
  campusId: string | null;
  status: string;
  roles: Array<{
    id: string;
    code: string;
    name: string;
  }>;
} | null;

export type EmployeePortalData = {
  employeeId: string;
  employeeNumber: string;
  personId: string;
  employmentType?: string | null;
  hireDate?: string | null;
  status?: string | null;
  primaryJobTitle?: string | null;
  department?: string | null;
  campus?: string | null;
  reportingManager?: string | null;
  isTeacher: boolean;
  todayLessons?: Array<{
    id: string;
    subject: string;
    classSection: string;
    classGroup?: string;
    room?: string;
    startsAt: string;
    endsAt: string;
  }>;
  leaveRequests?: Array<{
    id: string;
    leaveType: string;
    startsOn: string;
    endsOn: string;
    status: string;
    requestedDays: number;
  }>;
  payslips?: Array<{
    id: string;
    payrollPeriod: string;
    runNumber?: string;
    netPay: number;
    paymentStatus: string;
  }>;
  qualifications?: Array<{
    id: string;
    name: string;
    institution?: string | null;
    year?: number | null;
  }>;
};

export type StudentPortalData = {
  studentId: string;
  personId: string;
  admissionNumber: string;
  studentNumber?: string | null;
  status: string;
  campus?: string | null;
  classSection?: string | null;
  classGroup?: string | null;
  academicYear?: string | null;
  term?: string | null;
  boardingStatus?: string | null;
  attendance?: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    total: number;
    percentage: number;
    period: string;
  };
  results?: Array<{
    id: string;
    subject: string;
    term: string;
    percentage: number;
    grade: string;
    teacherRemark?: string | null;
  }>;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    balanceDue: number;
    status: string;
    dueDate: string;
  }>;
  libraryLoans?: Array<{
    id: string;
    title: string;
    dueAt: string;
    status: string;
    isOverdue: boolean;
  }>;
  timetable?: Array<{
    id: string;
    subject: string;
    teacher?: string | null;
    room?: string | null;
    startsAt: string;
    endsAt: string;
    weekday: number;
  }>;
};

export type GuardianLearner = {
  studentId: string;
  personId: string;
  admissionNumber: string;
  displayName: string;
  relationshipType: string;
  status: string;
  classSection?: string | null;
  classGroup?: string | null;
  receivesAcademicReports: boolean;
  receivesFinancialNotices: boolean;
  canPickUp: boolean;
  isFinanciallyResponsible: boolean;
  attendance?: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    total: number;
    percentage: number;
    period: string;
  };
  results?: Array<{
    id: string;
    subject: string;
    term: string;
    percentage: number;
    grade: string;
  }>;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    balanceDue: number;
    status: string;
    dueDate: string;
  }>;
};

export type GuardianPortalData = {
  guardianId: string;
  personId: string;
  learners: GuardianLearner[];
};

export type PlatformPortalData = {
  platformRoles: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  schoolCount: number;
  recentNotifications?: Array<{
    id: string;
    title: string;
    type: string;
    priority: string;
    createdAt: string;
    isRead: boolean;
  }>;
};

export type AnnouncementSummary = {
  id: string;
  title: string;
  priority: string;
  publishedAt: string;
  requiresAcknowledgement: boolean;
  isAcknowledged: boolean;
};

export type NotificationSummary = {
  id: string;
  title: string;
  type: string;
  priority: string;
  createdAt: string;
  isRead: boolean;
  actionLink?: string | null;
};

export type ConversationSummary = {
  id: string;
  title?: string | null;
  participantNames: string[];
  lastMessageAt: string;
  unreadCount: number;
};

export type PrivateFileSummary = {
  id: string;
  name: string;
  category: string;
  uploadedAt: string;
};

export type PortalQuickAction = {
  label: string;
  href: string;
  permission?: string;
  icon: string;
  requiresPersona?: "employee" | "student" | "guardian" | "platform";
};

export type PortalPersonas = {
  employee: EmployeePortalData | null;
  student: StudentPortalData | null;
  guardian: GuardianPortalData | null;
  platformAdmin: PlatformPortalData | null;
};

export type PortalData = {
  user: PortalUser;
  school: PortalSchool;
  membership: PortalMembership;
  personas: PortalPersonas;
  announcements: AnnouncementSummary[];
  notifications: NotificationSummary[];
  messages: ConversationSummary[];
  privateFiles: PrivateFileSummary[];
  quickActions: PortalQuickAction[];
  hasLinkedPerson: boolean;
  selectedLearnerId?: string | null;
};
