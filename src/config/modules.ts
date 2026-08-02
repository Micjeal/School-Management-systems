import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowDown,
  ArrowUp,
  Banknote,
  BarChart,
  Bed,
  Bell,
  BookOpen,
  Building2,
  Cable,
  Calendar,
  CalendarClock,
  CheckCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  DoorOpen,
  Download,
  Eye,
  FileCheck,
  FileText,
  Flag,
  GraduationCap,
  Hash,
  Heart,
  HeartPulse,
  Home,
  KeyRound,
  Layers,
  Link,
  Lock,
  Mail,
  Map,
  MapPin,
  MessageSquare,
  Moon,
  Phone,
  PieChart,
  Plus,
  RadioTower,
  Receipt,
  ReceiptText,
  RefreshCw,
  RotateCw,
  Ruler,
  Scale,
  School,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
  Timer,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  UserRoundCheck,
  Users,
  UsersRound,
  WalletCards,
  Webhook,
  Wrench,
} from "lucide-react";

export type FieldType = "text" | "email" | "url" | "number" | "date" | "time" | "datetime-local" | "textarea" | "select" | "checkbox" | "json" | "array" | "relation";

export type RelationConfig = { table: string; value: string; label: string; schoolScoped?: boolean; includeGlobal?: boolean };
export type FieldConfig = { name: string; label: string; type: FieldType; options?: readonly string[]; relation?: RelationConfig; optional?: boolean; wide?: boolean; step?: string };
export type ModuleGroup = { id: string; label: string; icon: LucideIcon };
export type WorkflowConfig = { label: string; rpc: string; arg: string; status?: readonly string[] };
export type ModuleConfig = { id: string; group: string; label: string; icon: LucideIcon; table: string; description: string; columns: readonly string[]; fields?: readonly FieldConfig[]; workflows?: readonly WorkflowConfig[]; writePermission?: string; schoolScoped: boolean; platformOnly: boolean; readOnly: boolean; permission?: string; workflowHref?: string; primaryKey?: readonly string[]; orderBy?: string };

export const MODULE_GROUPS = [
  {
    "id": "platform",
    "label": "Platform",
    "icon": Building2
  },
  {
    "id": "academics",
    "label": "Academics",
    "icon": GraduationCap
  },
  {
    "id": "students",
    "label": "Students",
    "icon": Users
  },
  {
    "id": "attendance",
    "label": "Attendance",
    "icon": CheckCircle
  },
  {
    "id": "assessment",
    "label": "Assessment",
    "icon": FileText
  },
  {
    "id": "finance",
    "label": "Finance",
    "icon": WalletCards
  },
  {
    "id": "hr",
    "label": "HR & Payroll",
    "icon": UserCog
  },
  {
    "id": "communication",
    "label": "Communication",
    "icon": Bell
  },
  {
    "id": "operations",
    "label": "Operations",
    "icon": Settings
  },
  {
    "id": "system",
    "label": "System",
    "icon": ShieldCheck
  }
] as const satisfies readonly ModuleGroup[];

export const MODULES: readonly ModuleConfig[] = [
  {
    "id": "schools",
    "group": "platform",
    "label": "Schools",
    "icon": School,
    "table": "schools",
    "description": "Create and manage tenant schools.",
    "columns": [
      "name",
      "slug",
      "code",
      "status",
      "subscription_status",
      "country_code",
      "currency_code"
    ],
    "schoolScoped": false,
    "platformOnly": true,
    "fields": [
      {
        "name": "name",
        "label": "School name",
        "type": "text"
      },
      {
        "name": "slug",
        "label": "Slug",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "legal_name",
        "label": "Legal name",
        "type": "text"
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email"
      },
      {
        "name": "phone",
        "label": "Phone",
        "type": "text"
      },
      {
        "name": "country_code",
        "label": "Country code",
        "type": "text"
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text"
      },
      {
        "name": "timezone",
        "label": "Timezone",
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "suspended",
          "archived"
        ]
      },
      {
        "name": "subscription_status",
        "label": "Subscription",
        "type": "select",
        "options": [
          "trial",
          "active",
          "past_due",
          "cancelled"
        ]
      }
    ],
    "readOnly": false,
    "permission": "settings.manage",
    "workflowHref": "/app/platform/schools"
  },
  {
    "id": "campuses",
    "group": "platform",
    "label": "Campuses",
    "icon": MapPin,
    "table": "campuses",
    "description": "School locations and campuses.",
    "columns": [
      "name",
      "code",
      "city",
      "district",
      "is_main",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Campus name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "city",
        "label": "City",
        "type": "text"
      },
      {
        "name": "district",
        "label": "District",
        "type": "text"
      },
      {
        "name": "country_code",
        "label": "Country code",
        "type": "text"
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email"
      },
      {
        "name": "phone",
        "label": "Phone",
        "type": "text"
      },
      {
        "name": "is_main",
        "label": "Main campus",
        "type": "checkbox"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "settings.manage"
  },
  {
    "id": "memberships",
    "group": "platform",
    "label": "Memberships",
    "icon": Shield,
    "table": "school_memberships",
    "description": "Users attached to schools.",
    "columns": [
      "user_id",
      "campus_id",
      "status",
      "joined_at",
      "ended_at"
    ],
    "fields": [
      {
        "name": "user_id",
        "label": "User ID",
        "type": "text"
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "invited",
          "suspended",
          "ended"
        ]
      },
      {
        "name": "joined_at",
        "label": "Joined at",
        "type": "datetime-local"
      },
      {
        "name": "ended_at",
        "label": "Ended at",
        "type": "datetime-local",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "users.read",
    "workflowHref": "/app/platform/users",
    "writePermission": "users.manage"
  },
  {
    "id": "roles",
    "group": "platform",
    "label": "Roles",
    "icon": ShieldCheck,
    "table": "roles",
    "description": "System and custom school roles.",
    "columns": [
      "name",
      "code",
      "school_id",
      "is_system",
      "is_active"
    ],
    "schoolScoped": false,
    "fields": [
      {
        "name": "name",
        "label": "Role name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "school_id",
        "label": "School ID",
        "type": "text",
        "optional": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "is_system",
        "label": "System role",
        "type": "checkbox"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "readOnly": false,
    "platformOnly": false,
    "permission": "roles.manage",
    "writePermission": "roles.manage"
  },
  {
    "id": "permissions",
    "group": "platform",
    "label": "Permissions",
    "icon": KeyRound,
    "table": "permissions",
    "description": "Granular capability catalogue.",
    "columns": [
      "module",
      "name",
      "code",
      "risk_level"
    ],
    "schoolScoped": false,
    "platformOnly": true,
    "fields": [
      {
        "name": "module",
        "label": "Module",
        "type": "text"
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "risk_level",
        "label": "Risk",
        "type": "select",
        "options": [
          "low",
          "medium",
          "high",
          "critical"
        ]
      }
    ],
    "readOnly": false,
    "permission": "roles.manage",
    "writePermission": "roles.manage"
  },
  {
    "id": "feature-flags",
    "group": "platform",
    "label": "Feature Flags",
    "icon": Flag,
    "table": "school_feature_flags",
    "primaryKey": [
      "school_id",
      "feature_code"
    ],
    "orderBy": "updated_at",
    "description": "Enable modules per school.",
    "columns": [
      "feature_code",
      "is_enabled",
      "updated_at"
    ],
    "fields": [
      {
        "name": "feature_code",
        "label": "Feature code",
        "type": "text"
      },
      {
        "name": "is_enabled",
        "label": "Enabled",
        "type": "checkbox"
      },
      {
        "name": "config",
        "label": "Configuration",
        "type": "json",
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "settings.manage"
  },
  {
    "id": "academic-years",
    "group": "academics",
    "label": "Academic Years",
    "icon": Calendar,
    "table": "academic_years",
    "description": "Academic calendar years.",
    "columns": [
      "name",
      "starts_on",
      "ends_on",
      "is_current",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "starts_on",
        "label": "Starts",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends",
        "type": "date"
      },
      {
        "name": "is_current",
        "label": "Current year",
        "type": "checkbox"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "active",
          "closed",
          "archived"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "terms",
    "group": "academics",
    "label": "Terms",
    "icon": CalendarClock,
    "table": "terms",
    "description": "Terms and semesters.",
    "columns": [
      "name",
      "academic_year_id",
      "sequence_no",
      "starts_on",
      "ends_on",
      "is_current",
      "status"
    ],
    "fields": [
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "sequence_no",
        "label": "Sequence",
        "type": "number"
      },
      {
        "name": "starts_on",
        "label": "Starts",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends",
        "type": "date"
      },
      {
        "name": "is_current",
        "label": "Current term",
        "type": "checkbox"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "active",
          "closed"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "grade-levels",
    "group": "academics",
    "label": "Grade Levels",
    "icon": Layers,
    "table": "grade_levels",
    "description": "Class level catalogue.",
    "columns": [
      "name",
      "code",
      "sequence_no",
      "education_stage",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "sequence_no",
        "label": "Sequence",
        "type": "number"
      },
      {
        "name": "education_stage",
        "label": "Stage",
        "type": "text"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "departments",
    "group": "academics",
    "label": "Departments",
    "icon": Compass,
    "table": "departments",
    "description": "Academic and administrative departments.",
    "columns": [
      "name",
      "code",
      "department_type",
      "campus_id",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "department_type",
        "label": "Type",
        "type": "select",
        "options": [
          "academic",
          "administrative",
          "operations"
        ]
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "parent_department_id",
        "label": "Parent department",
        "type": "relation",
        "relation": {
          "table": "departments",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "subjects",
    "group": "academics",
    "label": "Subjects",
    "icon": BookOpen,
    "table": "subjects",
    "description": "Subjects and course catalogue.",
    "columns": [
      "name",
      "code",
      "short_name",
      "subject_type",
      "department_id",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "short_name",
        "label": "Short name",
        "type": "text"
      },
      {
        "name": "subject_type",
        "label": "Type",
        "type": "select",
        "options": [
          "core",
          "elective",
          "co_curricular"
        ]
      },
      {
        "name": "department_id",
        "label": "Department",
        "type": "relation",
        "relation": {
          "table": "departments",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "classes",
    "group": "academics",
    "label": "Classes",
    "icon": Layers,
    "table": "class_groups",
    "description": "Class groups for an academic year.",
    "columns": [
      "name",
      "code",
      "academic_year_id",
      "grade_level_id",
      "campus_id",
      "capacity",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "grade_level_id",
        "label": "Grade level",
        "type": "relation",
        "relation": {
          "table": "grade_levels",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "capacity",
        "label": "Capacity",
        "type": "number"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive",
          "archived"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "sections",
    "group": "academics",
    "label": "Class Sections",
    "icon": Building2,
    "table": "class_sections",
    "description": "Streams and sections.",
    "columns": [
      "name",
      "code",
      "class_group_id",
      "room_id",
      "capacity",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "class_group_id",
        "label": "Class group",
        "type": "relation",
        "relation": {
          "table": "class_groups",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "room_id",
        "label": "Room",
        "type": "relation",
        "relation": {
          "table": "rooms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "capacity",
        "label": "Capacity",
        "type": "number"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "rooms",
    "group": "academics",
    "label": "Rooms",
    "icon": DoorOpen,
    "table": "rooms",
    "description": "Classrooms and learning spaces.",
    "columns": [
      "name",
      "code",
      "room_type",
      "capacity",
      "campus_id",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "room_type",
        "label": "Type",
        "type": "select",
        "options": [
          "classroom",
          "laboratory",
          "library",
          "hall",
          "office"
        ]
      },
      {
        "name": "capacity",
        "label": "Capacity",
        "type": "number"
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "teacher-assignments",
    "group": "academics",
    "label": "Teacher Assignments",
    "icon": UserRoundCheck,
    "table": "teacher_assignments",
    "description": "Assign teachers to classes and subjects.",
    "columns": [
      "employee_id",
      "subject_id",
      "class_section_id",
      "academic_year_id",
      "term_id",
      "is_primary"
    ],
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        }
      },
      {
        "name": "subject_id",
        "label": "Subject",
        "type": "relation",
        "relation": {
          "table": "subjects",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "is_primary",
        "label": "Primary teacher",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "timetables",
    "group": "academics",
    "label": "Timetables",
    "icon": Clock,
    "table": "timetable_versions",
    "description": "Versioned school timetables.",
    "columns": [
      "name",
      "academic_year_id",
      "term_id",
      "effective_from",
      "effective_to",
      "status",
      "published_at"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "effective_from",
        "label": "Effective from",
        "type": "date"
      },
      {
        "name": "effective_to",
        "label": "Effective to",
        "type": "date"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "published",
          "archived"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "timetable-entries",
    "group": "academics",
    "label": "Timetable Entries",
    "icon": Layers,
    "table": "timetable_entries",
    "description": "Lessons and scheduled activities.",
    "columns": [
      "weekday",
      "starts_at",
      "ends_at",
      "class_section_id",
      "subject_id",
      "teacher_employee_id",
      "room_id"
    ],
    "fields": [
      {
        "name": "timetable_version_id",
        "label": "Timetable",
        "type": "relation",
        "relation": {
          "table": "timetable_versions",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "weekday",
        "label": "Weekday",
        "type": "number"
      },
      {
        "name": "starts_at",
        "label": "Starts",
        "type": "time"
      },
      {
        "name": "ends_at",
        "label": "Ends",
        "type": "time"
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "subject_id",
        "label": "Subject",
        "type": "relation",
        "relation": {
          "table": "subjects",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "teacher_employee_id",
        "label": "Teacher",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        },
        "optional": true
      },
      {
        "name": "room_id",
        "label": "Room",
        "type": "relation",
        "relation": {
          "table": "rooms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "entry_type",
        "label": "Type",
        "type": "select",
        "options": [
          "lesson",
          "break",
          "assembly",
          "activity"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "academics.manage"
  },
  {
    "id": "applications",
    "group": "students",
    "label": "Admissions",
    "icon": UserPlus,
    "table": "applications",
    "description": "Applicant intake and decisions.",
    "columns": [
      "application_number",
      "applicant_person_id",
      "desired_grade_level_id",
      "academic_year_id",
      "status",
      "decision"
    ],
    "fields": [
      {
        "name": "application_number",
        "label": "Application number",
        "type": "text"
      },
      {
        "name": "applicant_person_id",
        "label": "Applicant person",
        "type": "relation",
        "relation": {
          "table": "people",
          "value": "id",
          "label": "first_name"
        }
      },
      {
        "name": "desired_grade_level_id",
        "label": "Desired grade",
        "type": "relation",
        "relation": {
          "table": "grade_levels",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "submitted",
          "under_review",
          "decided"
        ]
      },
      {
        "name": "decision",
        "label": "Decision",
        "type": "select",
        "options": [
          "admitted",
          "waitlisted",
          "rejected"
        ],
        "optional": true
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "wide": true,
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "admissions.read",
    "workflowHref": "/app/admissions",
    "writePermission": "admissions.manage"
  },
  {
    "id": "people",
    "group": "students",
    "label": "People Directory",
    "icon": UsersRound,
    "table": "people",
    "description": "Canonical person records.",
    "columns": [
      "first_name",
      "middle_name",
      "last_name",
      "primary_email",
      "primary_phone",
      "date_of_birth",
      "status"
    ],
    "fields": [
      {
        "name": "first_name",
        "label": "First name",
        "type": "text"
      },
      {
        "name": "middle_name",
        "label": "Middle name",
        "type": "text",
        "optional": true
      },
      {
        "name": "last_name",
        "label": "Last name",
        "type": "text"
      },
      {
        "name": "preferred_name",
        "label": "Preferred name",
        "type": "text",
        "optional": true
      },
      {
        "name": "date_of_birth",
        "label": "Date of birth",
        "type": "date",
        "optional": true
      },
      {
        "name": "gender",
        "label": "Gender",
        "type": "select",
        "options": [
          "male",
          "female",
          "other",
          "prefer_not_to_say"
        ],
        "optional": true
      },
      {
        "name": "primary_email",
        "label": "Email",
        "type": "email",
        "optional": true
      },
      {
        "name": "primary_phone",
        "label": "Phone",
        "type": "text",
        "optional": true
      },
      {
        "name": "nationality_code",
        "label": "Nationality",
        "type": "text",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive",
          "deceased"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "students.read",
    "writePermission": "students.update"
  },
  {
    "id": "students",
    "group": "students",
    "label": "Students",
    "icon": Users,
    "table": "students",
    "description": "Student master records.",
    "columns": [
      "admission_number",
      "student_number",
      "person_id",
      "current_campus_id",
      "boarding_status",
      "status",
      "admission_date"
    ],
    "fields": [
      {
        "name": "person_id",
        "label": "Person",
        "type": "relation",
        "relation": {
          "table": "people",
          "value": "id",
          "label": "first_name"
        }
      },
      {
        "name": "admission_number",
        "label": "Admission number",
        "type": "text"
      },
      {
        "name": "student_number",
        "label": "Student number",
        "type": "text",
        "optional": true
      },
      {
        "name": "current_campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "admission_date",
        "label": "Admission date",
        "type": "date",
        "optional": true
      },
      {
        "name": "boarding_status",
        "label": "Boarding status",
        "type": "select",
        "options": [
          "day",
          "boarding",
          "weekly_boarding"
        ]
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive",
          "graduated",
          "withdrawn",
          "transferred"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "students.read",
    "workflowHref": "/app/students",
    "writePermission": "students.update"
  },
  {
    "id": "guardians",
    "group": "students",
    "label": "Guardians",
    "icon": Users,
    "table": "guardians",
    "description": "Parents, guardians and sponsors.",
    "columns": [
      "person_id",
      "occupation",
      "employer",
      "preferred_contact_method",
      "portal_enabled",
      "status"
    ],
    "fields": [
      {
        "name": "person_id",
        "label": "Person",
        "type": "relation",
        "relation": {
          "table": "people",
          "value": "id",
          "label": "first_name"
        }
      },
      {
        "name": "occupation",
        "label": "Occupation",
        "type": "text",
        "optional": true
      },
      {
        "name": "employer",
        "label": "Employer",
        "type": "text",
        "optional": true
      },
      {
        "name": "preferred_contact_method",
        "label": "Contact method",
        "type": "select",
        "options": [
          "sms",
          "email",
          "phone",
          "whatsapp"
        ]
      },
      {
        "name": "portal_enabled",
        "label": "Portal enabled",
        "type": "checkbox"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "guardians.read",
    "writePermission": "guardians.manage"
  },
  {
    "id": "student-guardians",
    "group": "students",
    "label": "Student Guardians",
    "icon": Link,
    "table": "student_guardians",
    "description": "Link students to guardians.",
    "columns": [
      "student_id",
      "guardian_id",
      "relationship_type",
      "is_primary",
      "is_financially_responsible",
      "can_pick_up"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "guardian_id",
        "label": "Guardian",
        "type": "relation",
        "relation": {
          "table": "guardians",
          "value": "id",
          "label": "id"
        }
      },
      {
        "name": "relationship_type",
        "label": "Relationship",
        "type": "text"
      },
      {
        "name": "is_primary",
        "label": "Primary guardian",
        "type": "checkbox"
      },
      {
        "name": "is_financially_responsible",
        "label": "Financially responsible",
        "type": "checkbox"
      },
      {
        "name": "receives_academic_reports",
        "label": "Receives academic reports",
        "type": "checkbox"
      },
      {
        "name": "receives_financial_notices",
        "label": "Receives finance notices",
        "type": "checkbox"
      },
      {
        "name": "can_pick_up",
        "label": "Can pick up",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "guardians.read",
    "writePermission": "guardians.manage"
  },
  {
    "id": "enrolments",
    "group": "students",
    "label": "Enrolments",
    "icon": ClipboardList,
    "table": "student_enrolments",
    "description": "Academic enrolment and class placement.",
    "columns": [
      "student_id",
      "academic_year_id",
      "term_id",
      "class_section_id",
      "roll_number",
      "enrolment_status",
      "enrolled_on"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "roll_number",
        "label": "Roll number",
        "type": "text",
        "optional": true
      },
      {
        "name": "enrolled_on",
        "label": "Enrolled on",
        "type": "date"
      },
      {
        "name": "enrolment_status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "promoted",
          "transferred",
          "withdrawn",
          "completed"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "students.read",
    "writePermission": "students.update"
  },
  {
    "id": "attendance-sessions",
    "group": "attendance",
    "label": "Attendance Sessions",
    "icon": Timer,
    "table": "attendance_sessions",
    "description": "Daily and lesson attendance sessions.",
    "columns": [
      "session_date",
      "session_type",
      "class_section_id",
      "subject_id",
      "status",
      "starts_at",
      "ends_at"
    ],
    "fields": [
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "subject_id",
        "label": "Subject",
        "type": "relation",
        "relation": {
          "table": "subjects",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "session_date",
        "label": "Date",
        "type": "date"
      },
      {
        "name": "session_type",
        "label": "Type",
        "type": "select",
        "options": [
          "daily",
          "lesson",
          "boarding",
          "activity"
        ]
      },
      {
        "name": "starts_at",
        "label": "Starts",
        "type": "time",
        "optional": true
      },
      {
        "name": "ends_at",
        "label": "Ends",
        "type": "time",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "open",
          "closed",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "attendance.read",
    "workflowHref": "/app/attendance"
  },
  {
    "id": "student-attendance",
    "group": "attendance",
    "label": "Student Attendance",
    "icon": UserCheck,
    "table": "student_attendance_records",
    "description": "Student presence records.",
    "columns": [
      "attendance_session_id",
      "student_id",
      "attendance_status",
      "minutes_late",
      "recorded_at",
      "source"
    ],
    "fields": [
      {
        "name": "attendance_session_id",
        "label": "Session",
        "type": "relation",
        "relation": {
          "table": "attendance_sessions",
          "value": "id",
          "label": "session_date"
        }
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "attendance_status",
        "label": "Status",
        "type": "select",
        "options": [
          "present",
          "absent",
          "late",
          "excused",
          "sick"
        ]
      },
      {
        "name": "minutes_late",
        "label": "Minutes late",
        "type": "number"
      },
      {
        "name": "reason",
        "label": "Reason",
        "type": "text",
        "optional": true
      },
      {
        "name": "remarks",
        "label": "Remarks",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "source",
        "label": "Source",
        "type": "select",
        "options": [
          "manual",
          "biometric",
          "import",
          "mobile"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "attendance.read",
    "workflowHref": "/app/attendance"
  },
  {
    "id": "attendance-corrections",
    "group": "attendance",
    "label": "Attendance Corrections",
    "icon": FileText,
    "table": "attendance_corrections",
    "description": "Controlled attendance amendments.",
    "columns": [
      "attendance_record_id",
      "old_status",
      "new_status",
      "reason",
      "status",
      "requested_at",
      "decided_at"
    ],
    "fields": [
      {
        "name": "attendance_record_id",
        "label": "Attendance record",
        "type": "text"
      },
      {
        "name": "old_status",
        "label": "Old status",
        "type": "text"
      },
      {
        "name": "new_status",
        "label": "New status",
        "type": "text"
      },
      {
        "name": "reason",
        "label": "Reason",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "pending",
          "approved",
          "rejected"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "attendance.read",
    "writePermission": "attendance.correct"
  },
  {
    "id": "assessment-types",
    "group": "assessment",
    "label": "Assessment Types",
    "icon": ClipboardList,
    "table": "assessment_types",
    "description": "Exam, test and coursework categories.",
    "columns": [
      "name",
      "code",
      "default_weight",
      "is_exam",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "default_weight",
        "label": "Default weight",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "is_exam",
        "label": "Is exam",
        "type": "checkbox"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "assessments.read",
    "writePermission": "assessments.manage"
  },
  {
    "id": "grading-scales",
    "group": "assessment",
    "label": "Grading Scales",
    "icon": Ruler,
    "table": "grading_scales",
    "description": "School grading systems.",
    "columns": [
      "name",
      "code",
      "is_default",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "is_default",
        "label": "Default",
        "type": "checkbox"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "assessments.read",
    "writePermission": "assessments.manage"
  },
  {
    "id": "grading-items",
    "group": "assessment",
    "label": "Grade Bands",
    "icon": Hash,
    "table": "grading_scale_items",
    "description": "Score ranges and grade points.",
    "columns": [
      "grading_scale_id",
      "grade",
      "min_score",
      "max_score",
      "grade_point",
      "descriptor"
    ],
    "fields": [
      {
        "name": "grading_scale_id",
        "label": "Grading scale",
        "type": "relation",
        "relation": {
          "table": "grading_scales",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "grade",
        "label": "Grade",
        "type": "text"
      },
      {
        "name": "min_score",
        "label": "Minimum score",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "max_score",
        "label": "Maximum score",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "grade_point",
        "label": "Grade point",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "descriptor",
        "label": "Descriptor",
        "type": "text",
        "optional": true
      },
      {
        "name": "remarks",
        "label": "Remarks",
        "type": "text",
        "optional": true
      },
      {
        "name": "sequence_no",
        "label": "Sequence",
        "type": "number"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "assessments.read",
    "writePermission": "assessments.manage"
  },
  {
    "id": "assessments",
    "group": "assessment",
    "label": "Assessments",
    "icon": FileText,
    "table": "assessments",
    "description": "Tests, exams and assignments.",
    "columns": [
      "title",
      "assessment_date",
      "class_section_id",
      "subject_id",
      "maximum_score",
      "weight",
      "status",
      "published_at"
    ],
    "fields": [
      {
        "name": "title",
        "label": "Title",
        "type": "text"
      },
      {
        "name": "assessment_type_id",
        "label": "Assessment type",
        "type": "relation",
        "relation": {
          "table": "assessment_types",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "subject_id",
        "label": "Subject",
        "type": "relation",
        "relation": {
          "table": "subjects",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "assessment_date",
        "label": "Assessment date",
        "type": "date",
        "optional": true
      },
      {
        "name": "maximum_score",
        "label": "Maximum score",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "weight",
        "label": "Weight",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "open",
          "submitted",
          "moderated",
          "published",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "assessments.read",
    "workflowHref": "/app/assessments",
    "writePermission": "assessments.manage"
  },
  {
    "id": "mark-entries",
    "group": "assessment",
    "label": "Mark Entry",
    "icon": FileText,
    "table": "mark_entries",
    "description": "Scores and moderation state.",
    "columns": [
      "assessment_id",
      "student_id",
      "score",
      "is_absent",
      "is_exempt",
      "status",
      "entered_at",
      "moderated_at"
    ],
    "fields": [
      {
        "name": "assessment_id",
        "label": "Assessment",
        "type": "relation",
        "relation": {
          "table": "assessments",
          "value": "id",
          "label": "title"
        }
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "score",
        "label": "Score",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "is_absent",
        "label": "Absent",
        "type": "checkbox"
      },
      {
        "name": "is_exempt",
        "label": "Exempt",
        "type": "checkbox"
      },
      {
        "name": "remarks",
        "label": "Remarks",
        "type": "text",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "submitted",
          "moderated",
          "published"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "assessments.read",
    "workflowHref": "/app/assessments"
  },
  {
    "id": "subject-results",
    "group": "assessment",
    "label": "Subject Results",
    "icon": BarChart,
    "table": "subject_results",
    "description": "Calculated subject outcomes.",
    "columns": [
      "student_id",
      "subject_id",
      "term_id",
      "percentage_score",
      "grade",
      "position_in_class",
      "status"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "subject_id",
        "label": "Subject",
        "type": "relation",
        "relation": {
          "table": "subjects",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "total_score",
        "label": "Total score",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "percentage_score",
        "label": "Percentage",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "grade",
        "label": "Grade",
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "approved",
          "published"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "assessments.read"
  },
  {
    "id": "report-cards",
    "group": "assessment",
    "label": "Report Cards",
    "icon": FileText,
    "table": "report_cards",
    "description": "Term report cards and comments.",
    "columns": [
      "student_id",
      "term_id",
      "class_section_id",
      "overall_percentage",
      "overall_grade",
      "class_position",
      "status",
      "published_at"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "overall_percentage",
        "label": "Overall percentage",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "overall_grade",
        "label": "Overall grade",
        "type": "text"
      },
      {
        "name": "class_position",
        "label": "Position",
        "type": "number"
      },
      {
        "name": "class_teacher_comment",
        "label": "Class teacher comment",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "head_teacher_comment",
        "label": "Head teacher comment",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "generated",
          "approved",
          "published"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "assessments.read"
  },
  {
    "id": "financial-accounts",
    "group": "finance",
    "label": "Chart of Accounts",
    "icon": PieChart,
    "table": "financial_accounts",
    "description": "Double-entry account structure.",
    "columns": [
      "code",
      "name",
      "account_type",
      "normal_balance",
      "is_control_account",
      "is_active"
    ],
    "fields": [
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "account_type",
        "label": "Account type",
        "type": "select",
        "options": [
          "asset",
          "liability",
          "equity",
          "income",
          "expense"
        ]
      },
      {
        "name": "normal_balance",
        "label": "Normal balance",
        "type": "select",
        "options": [
          "debit",
          "credit"
        ]
      },
      {
        "name": "parent_account_id",
        "label": "Parent account",
        "type": "relation",
        "relation": {
          "table": "financial_accounts",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "is_control_account",
        "label": "Control account",
        "type": "checkbox"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.adjust"
  },
  {
    "id": "fee-categories",
    "group": "finance",
    "label": "Fee Categories",
    "icon": Layers,
    "table": "fee_categories",
    "description": "Group school charges.",
    "columns": [
      "name",
      "code",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.adjust"
  },
  {
    "id": "fee-items",
    "group": "finance",
    "label": "Fee Items",
    "icon": ReceiptText,
    "table": "fee_items",
    "description": "Chargeable fee items.",
    "columns": [
      "name",
      "code",
      "fee_category_id",
      "tax_rate",
      "is_mandatory",
      "is_refundable",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "fee_category_id",
        "label": "Category",
        "type": "relation",
        "relation": {
          "table": "fee_categories",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "revenue_account_id",
        "label": "Revenue account",
        "type": "relation",
        "relation": {
          "table": "financial_accounts",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "tax_rate",
        "label": "Tax rate",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "is_mandatory",
        "label": "Mandatory",
        "type": "checkbox"
      },
      {
        "name": "is_refundable",
        "label": "Refundable",
        "type": "checkbox"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.adjust"
  },
  {
    "id": "fee-structures",
    "group": "finance",
    "label": "Fee Structures",
    "icon": Layers,
    "table": "fee_structures",
    "description": "Grade and term fee schedules.",
    "columns": [
      "name",
      "academic_year_id",
      "term_id",
      "grade_level_id",
      "currency_code",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "grade_level_id",
        "label": "Grade level",
        "type": "relation",
        "relation": {
          "table": "grade_levels",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "active",
          "archived"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.adjust"
  },
  {
    "id": "invoices",
    "group": "finance",
    "label": "Invoices",
    "icon": ReceiptText,
    "table": "invoices",
    "description": "Student billing and balances.",
    "columns": [
      "invoice_number",
      "student_id",
      "invoice_date",
      "due_date",
      "total_amount",
      "paid_amount",
      "balance_due",
      "status"
    ],
    "fields": [
      {
        "name": "invoice_number",
        "label": "Invoice number",
        "type": "text"
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "invoice_date",
        "label": "Invoice date",
        "type": "date"
      },
      {
        "name": "due_date",
        "label": "Due date",
        "type": "date",
        "optional": true
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text"
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "discount_amount",
        "label": "Discount",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "tax_amount",
        "label": "Tax",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "total_amount",
        "label": "Total",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "posted",
          "partially_paid",
          "paid",
          "void"
        ]
      }
    ],
    "workflows": [
      {
        "label": "Post invoice",
        "rpc": "post_invoice",
        "arg": "target_invoice_id",
        "status": [
          "draft"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "workflowHref": "/app/finance/invoices"
  },
  {
    "id": "invoice-lines",
    "group": "finance",
    "label": "Invoice Lines",
    "icon": Plus,
    "table": "invoice_lines",
    "description": "Invoice charge details.",
    "columns": [
      "invoice_id",
      "description",
      "quantity",
      "unit_amount",
      "discount_amount",
      "tax_amount",
      "line_total"
    ],
    "fields": [
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "relation",
        "relation": {
          "table": "invoices",
          "value": "id",
          "label": "invoice_number"
        }
      },
      {
        "name": "fee_item_id",
        "label": "Fee item",
        "type": "relation",
        "relation": {
          "table": "fee_items",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "description",
        "label": "Description",
        "type": "text"
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "unit_amount",
        "label": "Unit amount",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "discount_amount",
        "label": "Discount",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "tax_amount",
        "label": "Tax",
        "type": "number",
        "step": "0.01"
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "finance.read"
  },
  {
    "id": "payments",
    "group": "finance",
    "label": "Payments",
    "icon": Banknote,
    "table": "payments",
    "description": "Cash, bank and digital receipts.",
    "columns": [
      "payment_reference",
      "student_id",
      "payment_date",
      "amount",
      "allocated_amount",
      "unallocated_amount",
      "status"
    ],
    "fields": [
      {
        "name": "payment_reference",
        "label": "Reference",
        "type": "text"
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        },
        "optional": true
      },
      {
        "name": "payment_method_id",
        "label": "Payment method",
        "type": "relation",
        "relation": {
          "table": "payment_methods",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "payment_date",
        "label": "Payment date",
        "type": "date"
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text"
      },
      {
        "name": "external_reference",
        "label": "External reference",
        "type": "text",
        "optional": true
      },
      {
        "name": "payer_name",
        "label": "Payer name",
        "type": "text",
        "optional": true
      },
      {
        "name": "payer_phone",
        "label": "Payer phone",
        "type": "text",
        "optional": true
      },
      {
        "name": "payer_email",
        "label": "Payer email",
        "type": "email",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "posted",
          "reversed",
          "refunded"
        ]
      }
    ],
    "workflows": [
      {
        "label": "Post payment",
        "rpc": "post_payment",
        "arg": "target_payment_id",
        "status": [
          "draft"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "workflowHref": "/app/finance/payments"
  },
  {
    "id": "payment-methods",
    "group": "finance",
    "label": "Payment Methods",
    "icon": WalletCards,
    "table": "payment_methods",
    "description": "Cash, bank, card and mobile money channels.",
    "columns": [
      "name",
      "code",
      "method_type",
      "provider",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "method_type",
        "label": "Type",
        "type": "select",
        "options": [
          "cash",
          "bank",
          "card",
          "mobile_money",
          "cheque",
          "online"
        ]
      },
      {
        "name": "provider",
        "label": "Provider",
        "type": "text",
        "optional": true
      },
      {
        "name": "settlement_account_id",
        "label": "Settlement account",
        "type": "relation",
        "relation": {
          "table": "financial_accounts",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      },
      {
        "name": "config",
        "label": "Configuration",
        "type": "json",
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.adjust"
  },
  {
    "id": "refunds",
    "group": "finance",
    "label": "Refunds",
    "icon": RotateCw,
    "table": "refunds",
    "description": "Controlled payment refunds.",
    "columns": [
      "refund_reference",
      "payment_id",
      "student_id",
      "amount",
      "status",
      "requested_at",
      "approved_at",
      "processed_at"
    ],
    "fields": [
      {
        "name": "refund_reference",
        "label": "Reference",
        "type": "text"
      },
      {
        "name": "payment_id",
        "label": "Payment",
        "type": "relation",
        "relation": {
          "table": "payments",
          "value": "id",
          "label": "payment_reference"
        }
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        },
        "optional": true
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "reason",
        "label": "Reason",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "requested",
          "approved",
          "rejected",
          "processed",
          "failed"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.refund"
  },
  {
    "id": "journals",
    "group": "finance",
    "label": "Journal Entries",
    "icon": BookOpen,
    "table": "journal_entries",
    "description": "Double-entry accounting journals.",
    "columns": [
      "entry_number",
      "entry_date",
      "source_type",
      "description",
      "status",
      "posted_at"
    ],
    "fields": [
      {
        "name": "entry_number",
        "label": "Entry number",
        "type": "text"
      },
      {
        "name": "entry_date",
        "label": "Entry date",
        "type": "date"
      },
      {
        "name": "source_type",
        "label": "Source type",
        "type": "text"
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "posted",
          "reversed"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "finance.read"
  },
  {
    "id": "employees",
    "group": "hr",
    "label": "Employees",
    "icon": User,
    "table": "employees",
    "description": "Staff master records.",
    "columns": [
      "employee_number",
      "person_id",
      "employment_type",
      "hire_date",
      "termination_date",
      "status"
    ],
    "fields": [
      {
        "name": "person_id",
        "label": "Person",
        "type": "relation",
        "relation": {
          "table": "people",
          "value": "id",
          "label": "first_name"
        }
      },
      {
        "name": "employee_number",
        "label": "Employee number",
        "type": "text"
      },
      {
        "name": "employment_type",
        "label": "Employment type",
        "type": "select",
        "options": [
          "permanent",
          "contract",
          "part_time",
          "casual",
          "volunteer"
        ]
      },
      {
        "name": "hire_date",
        "label": "Hire date",
        "type": "date"
      },
      {
        "name": "termination_date",
        "label": "Termination date",
        "type": "date",
        "optional": true
      },
      {
        "name": "tax_identifier",
        "label": "Tax identifier",
        "type": "text",
        "optional": true
      },
      {
        "name": "social_security_number",
        "label": "Social security number",
        "type": "text",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "on_leave",
          "suspended",
          "terminated",
          "retired"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "staff.read",
    "workflowHref": "/app/staff",
    "writePermission": "staff.manage"
  },
  {
    "id": "employee-assignments",
    "group": "hr",
    "label": "Staff Assignments",
    "icon": UserCog,
    "table": "employee_assignments",
    "description": "Positions, departments and reporting lines.",
    "columns": [
      "employee_id",
      "job_title",
      "department_id",
      "campus_id",
      "starts_on",
      "ends_on",
      "is_primary"
    ],
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        }
      },
      {
        "name": "job_title",
        "label": "Job title",
        "type": "text"
      },
      {
        "name": "department_id",
        "label": "Department",
        "type": "relation",
        "relation": {
          "table": "departments",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "reports_to_employee_id",
        "label": "Reports to",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        },
        "optional": true
      },
      {
        "name": "starts_on",
        "label": "Starts on",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends on",
        "type": "date",
        "optional": true
      },
      {
        "name": "is_primary",
        "label": "Primary assignment",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "staff.read",
    "writePermission": "staff.manage"
  },
  {
    "id": "contracts",
    "group": "hr",
    "label": "Contracts",
    "icon": FileCheck,
    "table": "employment_contracts",
    "description": "Employment terms and compensation.",
    "columns": [
      "contract_number",
      "employee_id",
      "contract_type",
      "starts_on",
      "ends_on",
      "base_salary",
      "pay_frequency",
      "status"
    ],
    "fields": [
      {
        "name": "contract_number",
        "label": "Contract number",
        "type": "text"
      },
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        }
      },
      {
        "name": "contract_type",
        "label": "Contract type",
        "type": "text"
      },
      {
        "name": "starts_on",
        "label": "Starts on",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends on",
        "type": "date",
        "optional": true
      },
      {
        "name": "base_salary",
        "label": "Base salary",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text"
      },
      {
        "name": "pay_frequency",
        "label": "Pay frequency",
        "type": "select",
        "options": [
          "monthly",
          "biweekly",
          "weekly"
        ]
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "active",
          "expired",
          "terminated"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "staff.read",
    "writePermission": "staff.manage"
  },
  {
    "id": "leave-types",
    "group": "hr",
    "label": "Leave Types",
    "icon": Sun,
    "table": "leave_types",
    "description": "Leave policy definitions.",
    "columns": [
      "name",
      "code",
      "annual_entitlement_days",
      "is_paid",
      "requires_document",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "annual_entitlement_days",
        "label": "Annual entitlement",
        "type": "number",
        "step": "0.5"
      },
      {
        "name": "is_paid",
        "label": "Paid",
        "type": "checkbox"
      },
      {
        "name": "requires_document",
        "label": "Requires document",
        "type": "checkbox"
      },
      {
        "name": "allows_carry_forward",
        "label": "Allows carry forward",
        "type": "checkbox"
      },
      {
        "name": "max_carry_forward_days",
        "label": "Maximum carry forward",
        "type": "number",
        "step": "0.5",
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "staff.read",
    "writePermission": "staff.manage"
  },
  {
    "id": "leave-requests",
    "group": "hr",
    "label": "Leave Requests",
    "icon": CalendarClock,
    "table": "leave_requests",
    "description": "Employee leave workflow.",
    "columns": [
      "employee_id",
      "leave_type_id",
      "starts_on",
      "ends_on",
      "requested_days",
      "status",
      "requested_at",
      "reviewed_at"
    ],
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        }
      },
      {
        "name": "leave_type_id",
        "label": "Leave type",
        "type": "relation",
        "relation": {
          "table": "leave_types",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "starts_on",
        "label": "Starts",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends",
        "type": "date"
      },
      {
        "name": "requested_days",
        "label": "Days",
        "type": "number",
        "step": "0.5"
      },
      {
        "name": "reason",
        "label": "Reason",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "submitted",
          "approved",
          "rejected",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "staff.read",
    "writePermission": "staff.manage"
  },
  {
    "id": "payroll-periods",
    "group": "hr",
    "label": "Payroll Periods",
    "icon": Calendar,
    "table": "payroll_periods",
    "description": "Payroll calendars.",
    "columns": [
      "name",
      "starts_on",
      "ends_on",
      "payment_date",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "starts_on",
        "label": "Starts",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends",
        "type": "date"
      },
      {
        "name": "payment_date",
        "label": "Payment date",
        "type": "date",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "open",
          "processing",
          "closed",
          "paid"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "payroll.read",
    "writePermission": "payroll.process"
  },
  {
    "id": "payroll-runs",
    "group": "hr",
    "label": "Payroll Runs",
    "icon": Banknote,
    "table": "payroll_runs",
    "description": "Payroll calculation and approval.",
    "columns": [
      "run_number",
      "payroll_period_id",
      "gross_total",
      "deductions_total",
      "net_total",
      "status",
      "processed_at",
      "approved_at"
    ],
    "fields": [
      {
        "name": "run_number",
        "label": "Run number",
        "type": "text"
      },
      {
        "name": "payroll_period_id",
        "label": "Payroll period",
        "type": "relation",
        "relation": {
          "table": "payroll_periods",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "processing",
          "calculated",
          "approved",
          "posted",
          "paid",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "payroll.read",
    "workflowHref": "/app/payroll",
    "writePermission": "payroll.process"
  },
  {
    "id": "announcements",
    "group": "communication",
    "label": "Announcements",
    "icon": Bell,
    "table": "announcements",
    "description": "Targeted school notices.",
    "columns": [
      "title",
      "category",
      "priority",
      "status",
      "starts_at",
      "expires_at",
      "published_at"
    ],
    "fields": [
      {
        "name": "title",
        "label": "Title",
        "type": "text"
      },
      {
        "name": "body",
        "label": "Body",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "category",
        "label": "Category",
        "type": "text"
      },
      {
        "name": "priority",
        "label": "Priority",
        "type": "select",
        "options": [
          "low",
          "normal",
          "high",
          "urgent"
        ]
      },
      {
        "name": "starts_at",
        "label": "Starts at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "expires_at",
        "label": "Expires at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "requires_acknowledgement",
        "label": "Requires acknowledgement",
        "type": "checkbox"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "published",
          "archived"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "communications.read",
    "writePermission": "communications.send"
  },
  {
    "id": "notifications",
    "group": "communication",
    "label": "Notifications",
    "icon": Bell,
    "table": "notifications",
    "description": "In-app user notifications.",
    "columns": [
      "user_id",
      "title",
      "notification_type",
      "priority",
      "read_at",
      "created_at"
    ],
    "fields": [
      {
        "name": "user_id",
        "label": "User ID",
        "type": "text"
      },
      {
        "name": "title",
        "label": "Title",
        "type": "text"
      },
      {
        "name": "body",
        "label": "Body",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "notification_type",
        "label": "Type",
        "type": "text"
      },
      {
        "name": "priority",
        "label": "Priority",
        "type": "select",
        "options": [
          "low",
          "normal",
          "high",
          "urgent"
        ]
      },
      {
        "name": "action_url",
        "label": "Action URL",
        "type": "text",
        "optional": true
      },
      {
        "name": "data",
        "label": "Data",
        "type": "json",
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "communications.read"
  },
  {
    "id": "conversations",
    "group": "communication",
    "label": "Conversations",
    "icon": MessageSquare,
    "table": "conversations",
    "description": "Secure school messaging.",
    "columns": [
      "title",
      "conversation_type",
      "created_by",
      "is_closed",
      "created_at",
      "updated_at"
    ],
    "fields": [
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "optional": true
      },
      {
        "name": "conversation_type",
        "label": "Type",
        "type": "select",
        "options": [
          "direct",
          "group",
          "class",
          "support"
        ]
      },
      {
        "name": "is_closed",
        "label": "Closed",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "communications.read",
    "writePermission": "communications.send"
  },
  {
    "id": "library-items",
    "group": "operations",
    "label": "Library Catalogue",
    "icon": BookOpen,
    "table": "library_items",
    "description": "Books and learning resources.",
    "columns": [
      "title",
      "item_type",
      "isbn",
      "publisher",
      "publication_year",
      "language",
      "is_active"
    ],
    "fields": [
      {
        "name": "title",
        "label": "Title",
        "type": "text"
      },
      {
        "name": "subtitle",
        "label": "Subtitle",
        "type": "text",
        "optional": true
      },
      {
        "name": "item_type",
        "label": "Type",
        "type": "select",
        "options": [
          "book",
          "journal",
          "magazine",
          "digital",
          "equipment"
        ]
      },
      {
        "name": "isbn",
        "label": "ISBN",
        "type": "text",
        "optional": true
      },
      {
        "name": "publisher",
        "label": "Publisher",
        "type": "text",
        "optional": true
      },
      {
        "name": "publication_year",
        "label": "Publication year",
        "type": "number",
        "optional": true
      },
      {
        "name": "language",
        "label": "Language",
        "type": "text"
      },
      {
        "name": "loan_period_days",
        "label": "Loan period days",
        "type": "number"
      },
      {
        "name": "max_renewals",
        "label": "Maximum renewals",
        "type": "number"
      },
      {
        "name": "renewable",
        "label": "Renewable",
        "type": "checkbox"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "library.manage",
    "writePermission": "library.manage"
  },
  {
    "id": "library-copies",
    "group": "operations",
    "label": "Library Copies",
    "icon": BookOpen,
    "table": "library_copies",
    "description": "Physical library inventory.",
    "columns": [
      "accession_number",
      "barcode",
      "library_item_id",
      "campus_id",
      "condition_status",
      "circulation_status"
    ],
    "fields": [
      {
        "name": "library_item_id",
        "label": "Library item",
        "type": "relation",
        "relation": {
          "table": "library_items",
          "value": "id",
          "label": "title"
        }
      },
      {
        "name": "accession_number",
        "label": "Accession number",
        "type": "text"
      },
      {
        "name": "barcode",
        "label": "Barcode",
        "type": "text",
        "optional": true
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "shelf_location",
        "label": "Shelf location",
        "type": "text",
        "optional": true
      },
      {
        "name": "condition_status",
        "label": "Condition",
        "type": "select",
        "options": [
          "new",
          "good",
          "fair",
          "poor",
          "damaged",
          "lost"
        ]
      },
      {
        "name": "circulation_status",
        "label": "Circulation status",
        "type": "select",
        "options": [
          "available",
          "on_loan",
          "reserved",
          "repair",
          "lost",
          "retired"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "library.manage",
    "writePermission": "library.manage"
  },
  {
    "id": "library-loans",
    "group": "operations",
    "label": "Library Loans",
    "icon": RefreshCw,
    "table": "library_loans",
    "description": "Borrowing, returns and renewals.",
    "columns": [
      "library_copy_id",
      "student_id",
      "employee_id",
      "borrowed_at",
      "due_at",
      "returned_at",
      "status"
    ],
    "fields": [
      {
        "name": "library_copy_id",
        "label": "Copy",
        "type": "relation",
        "relation": {
          "table": "library_copies",
          "value": "id",
          "label": "accession_number"
        }
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        },
        "optional": true
      },
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        },
        "optional": true
      },
      {
        "name": "borrowed_at",
        "label": "Borrowed at",
        "type": "datetime-local"
      },
      {
        "name": "due_at",
        "label": "Due at",
        "type": "datetime-local"
      },
      {
        "name": "returned_at",
        "label": "Returned at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "overdue",
          "returned",
          "lost"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "library.manage",
    "workflowHref": "/app/library/circulation",
    "writePermission": "library.manage"
  },
  {
    "id": "vehicles",
    "group": "operations",
    "label": "Vehicles",
    "icon": Map,
    "table": "vehicles",
    "description": "School fleet records.",
    "columns": [
      "registration_number",
      "fleet_number",
      "vehicle_type",
      "seating_capacity",
      "insurance_expires_on",
      "status"
    ],
    "fields": [
      {
        "name": "registration_number",
        "label": "Registration number",
        "type": "text"
      },
      {
        "name": "fleet_number",
        "label": "Fleet number",
        "type": "text",
        "optional": true
      },
      {
        "name": "vehicle_type",
        "label": "Vehicle type",
        "type": "select",
        "options": [
          "bus",
          "van",
          "car",
          "motorcycle"
        ]
      },
      {
        "name": "make",
        "label": "Make",
        "type": "text",
        "optional": true
      },
      {
        "name": "model",
        "label": "Model",
        "type": "text",
        "optional": true
      },
      {
        "name": "manufacture_year",
        "label": "Year",
        "type": "number",
        "optional": true
      },
      {
        "name": "seating_capacity",
        "label": "Seating capacity",
        "type": "number"
      },
      {
        "name": "ownership_type",
        "label": "Ownership",
        "type": "select",
        "options": [
          "owned",
          "leased",
          "contracted"
        ]
      },
      {
        "name": "insurance_expires_on",
        "label": "Insurance expiry",
        "type": "date",
        "optional": true
      },
      {
        "name": "inspection_expires_on",
        "label": "Inspection expiry",
        "type": "date",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "maintenance",
          "inactive",
          "retired"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "transport.manage",
    "writePermission": "transport.manage"
  },
  {
    "id": "transport-routes",
    "group": "operations",
    "label": "Transport Routes",
    "icon": Map,
    "table": "transport_routes",
    "description": "Routes, stops and assigned vehicles.",
    "columns": [
      "name",
      "code",
      "campus_id",
      "default_vehicle_id",
      "fee_amount",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "default_vehicle_id",
        "label": "Default vehicle",
        "type": "relation",
        "relation": {
          "table": "vehicles",
          "value": "id",
          "label": "registration_number"
        },
        "optional": true
      },
      {
        "name": "route_type",
        "label": "Route type",
        "type": "text"
      },
      {
        "name": "morning_start_time",
        "label": "Morning start",
        "type": "time",
        "optional": true
      },
      {
        "name": "afternoon_start_time",
        "label": "Afternoon start",
        "type": "time",
        "optional": true
      },
      {
        "name": "fee_amount",
        "label": "Fee amount",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "transport.manage",
    "writePermission": "transport.manage"
  },
  {
    "id": "hostels",
    "group": "operations",
    "label": "Hostels",
    "icon": Home,
    "table": "hostels",
    "description": "Boarding facilities.",
    "columns": [
      "name",
      "code",
      "campus_id",
      "gender_policy",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "gender_policy",
        "label": "Gender policy",
        "type": "select",
        "options": [
          "male",
          "female",
          "mixed",
          "other"
        ]
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive",
          "maintenance"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "boarding.manage",
    "writePermission": "boarding.manage"
  },
  {
    "id": "boarding-assignments",
    "group": "operations",
    "label": "Boarding Assignments",
    "icon": Bed,
    "table": "boarding_assignments",
    "description": "Student bed allocation.",
    "columns": [
      "student_id",
      "bed_id",
      "academic_year_id",
      "term_id",
      "starts_on",
      "ends_on",
      "status"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "bed_id",
        "label": "Bed",
        "type": "relation",
        "relation": {
          "table": "boarding_beds",
          "value": "id",
          "label": "bed_number"
        }
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "starts_on",
        "label": "Starts",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends",
        "type": "date",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "ended",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "boarding.manage",
    "writePermission": "boarding.manage"
  },
  {
    "id": "clinic-visits",
    "group": "operations",
    "label": "Clinic Visits",
    "icon": Activity,
    "table": "clinic_visits",
    "description": "Student health encounters.",
    "columns": [
      "student_id",
      "visited_at",
      "complaint",
      "diagnosis",
      "disposition",
      "followup_at",
      "confidential"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "visited_at",
        "label": "Visited at",
        "type": "datetime-local"
      },
      {
        "name": "complaint",
        "label": "Complaint",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "diagnosis",
        "label": "Diagnosis",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "treatment",
        "label": "Treatment",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "disposition",
        "label": "Disposition",
        "type": "select",
        "options": [
          "returned_to_class",
          "sent_home",
          "referred",
          "admitted",
          "other"
        ]
      },
      {
        "name": "followup_at",
        "label": "Follow-up at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "confidential",
        "label": "Confidential",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "health.manage",
    "writePermission": "health.manage"
  },
  {
    "id": "discipline",
    "group": "operations",
    "label": "Discipline",
    "icon": Scale,
    "table": "discipline_incidents",
    "description": "Incidents, investigations and actions.",
    "columns": [
      "incident_number",
      "title",
      "category",
      "severity",
      "occurred_at",
      "status",
      "parent_visible"
    ],
    "fields": [
      {
        "name": "incident_number",
        "label": "Incident number",
        "type": "text"
      },
      {
        "name": "title",
        "label": "Title",
        "type": "text"
      },
      {
        "name": "category",
        "label": "Category",
        "type": "text"
      },
      {
        "name": "severity",
        "label": "Severity",
        "type": "select",
        "options": [
          "low",
          "medium",
          "high",
          "critical"
        ]
      },
      {
        "name": "occurred_at",
        "label": "Occurred at",
        "type": "datetime-local"
      },
      {
        "name": "location",
        "label": "Location",
        "type": "text",
        "optional": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "open",
          "investigating",
          "resolved",
          "closed"
        ]
      },
      {
        "name": "parent_visible",
        "label": "Parent visible",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "discipline.manage",
    "writePermission": "discipline.manage"
  },
  {
    "id": "counselling",
    "group": "operations",
    "label": "Counselling",
    "icon": Heart,
    "table": "counseling_cases",
    "description": "Confidential student support cases.",
    "columns": [
      "case_number",
      "student_id",
      "category",
      "priority",
      "status",
      "opened_at",
      "closed_at",
      "parent_visible"
    ],
    "fields": [
      {
        "name": "case_number",
        "label": "Case number",
        "type": "text"
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "category",
        "label": "Category",
        "type": "text"
      },
      {
        "name": "priority",
        "label": "Priority",
        "type": "select",
        "options": [
          "low",
          "normal",
          "high",
          "urgent"
        ]
      },
      {
        "name": "summary",
        "label": "Summary",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "open",
          "active",
          "on_hold",
          "closed"
        ]
      },
      {
        "name": "parent_visible",
        "label": "Parent visible",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "discipline.manage",
    "writePermission": "discipline.manage"
  },
  {
    "id": "inventory-items",
    "group": "operations",
    "label": "Inventory Items",
    "icon": Archive,
    "table": "inventory_items",
    "description": "Consumables and stocked items.",
    "columns": [
      "name",
      "code",
      "category",
      "unit_of_measure",
      "reorder_level",
      "standard_cost",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "category",
        "label": "Category",
        "type": "text",
        "optional": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "unit_of_measure",
        "label": "Unit of measure",
        "type": "text"
      },
      {
        "name": "reorder_level",
        "label": "Reorder level",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "standard_cost",
        "label": "Standard cost",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "track_stock",
        "label": "Track stock",
        "type": "checkbox"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive",
          "discontinued"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "stock-movements",
    "group": "operations",
    "label": "Stock Movements",
    "icon": TrendingUp,
    "table": "stock_movements",
    "description": "Receipts, issues and transfers.",
    "columns": [
      "inventory_item_id",
      "inventory_location_id",
      "movement_type",
      "quantity",
      "unit_cost",
      "occurred_at",
      "reference_type"
    ],
    "fields": [
      {
        "name": "inventory_item_id",
        "label": "Inventory item",
        "type": "relation",
        "relation": {
          "table": "inventory_items",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "inventory_location_id",
        "label": "Location",
        "type": "relation",
        "relation": {
          "table": "inventory_locations",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "movement_type",
        "label": "Movement type",
        "type": "select",
        "options": [
          "receipt",
          "issue",
          "transfer_in",
          "transfer_out",
          "adjustment",
          "return"
        ]
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "unit_cost",
        "label": "Unit cost",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "occurred_at",
        "label": "Occurred at",
        "type": "datetime-local"
      },
      {
        "name": "reference_type",
        "label": "Reference type",
        "type": "text",
        "optional": true
      },
      {
        "name": "reference_id",
        "label": "Reference ID",
        "type": "text",
        "optional": true
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "wide": true,
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage",
    "workflowHref": "/app/inventory/movements"
  },
  {
    "id": "suppliers",
    "group": "operations",
    "label": "Suppliers",
    "icon": Building2,
    "table": "suppliers",
    "description": "Approved vendors.",
    "columns": [
      "name",
      "code",
      "contact_person",
      "phone",
      "email",
      "payment_terms_days",
      "status"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "contact_person",
        "label": "Contact person",
        "type": "text",
        "optional": true
      },
      {
        "name": "phone",
        "label": "Phone",
        "type": "text",
        "optional": true
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email",
        "optional": true
      },
      {
        "name": "tax_identifier",
        "label": "Tax identifier",
        "type": "text",
        "optional": true
      },
      {
        "name": "payment_terms_days",
        "label": "Payment terms days",
        "type": "number"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive",
          "blocked"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "purchase-requests",
    "group": "operations",
    "label": "Purchase Requests",
    "icon": ClipboardList,
    "table": "purchase_requests",
    "description": "Internal procurement requests.",
    "columns": [
      "request_number",
      "department_id",
      "priority",
      "needed_by",
      "status",
      "submitted_at",
      "approved_at"
    ],
    "fields": [
      {
        "name": "request_number",
        "label": "Request number",
        "type": "text"
      },
      {
        "name": "department_id",
        "label": "Department",
        "type": "relation",
        "relation": {
          "table": "departments",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "priority",
        "label": "Priority",
        "type": "select",
        "options": [
          "low",
          "normal",
          "high",
          "urgent"
        ]
      },
      {
        "name": "needed_by",
        "label": "Needed by",
        "type": "date",
        "optional": true
      },
      {
        "name": "justification",
        "label": "Justification",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "submitted",
          "approved",
          "rejected",
          "ordered",
          "closed"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "purchase-orders",
    "group": "operations",
    "label": "Purchase Orders",
    "icon": FileText,
    "table": "purchase_orders",
    "description": "Supplier orders and approvals.",
    "columns": [
      "purchase_order_number",
      "supplier_id",
      "order_date",
      "expected_delivery_date",
      "total_amount",
      "status"
    ],
    "fields": [
      {
        "name": "purchase_order_number",
        "label": "PO number",
        "type": "text"
      },
      {
        "name": "supplier_id",
        "label": "Supplier",
        "type": "relation",
        "relation": {
          "table": "suppliers",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "purchase_request_id",
        "label": "Purchase request",
        "type": "relation",
        "relation": {
          "table": "purchase_requests",
          "value": "id",
          "label": "request_number"
        },
        "optional": true
      },
      {
        "name": "order_date",
        "label": "Order date",
        "type": "date"
      },
      {
        "name": "expected_delivery_date",
        "label": "Expected delivery",
        "type": "date",
        "optional": true
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text"
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "tax_amount",
        "label": "Tax",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "total_amount",
        "label": "Total",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "approved",
          "sent",
          "partially_received",
          "received",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "assets",
    "group": "operations",
    "label": "Assets",
    "icon": Wrench,
    "table": "assets",
    "description": "Fixed assets and lifecycle.",
    "columns": [
      "asset_tag",
      "name",
      "serial_number",
      "purchase_date",
      "purchase_cost",
      "condition_status",
      "asset_status"
    ],
    "fields": [
      {
        "name": "asset_tag",
        "label": "Asset tag",
        "type": "text"
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "asset_category_id",
        "label": "Category",
        "type": "relation",
        "relation": {
          "table": "asset_categories",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "serial_number",
        "label": "Serial number",
        "type": "text",
        "optional": true
      },
      {
        "name": "purchase_date",
        "label": "Purchase date",
        "type": "date",
        "optional": true
      },
      {
        "name": "purchase_cost",
        "label": "Purchase cost",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "condition_status",
        "label": "Condition",
        "type": "select",
        "options": [
          "new",
          "good",
          "fair",
          "poor",
          "damaged"
        ]
      },
      {
        "name": "asset_status",
        "label": "Status",
        "type": "select",
        "options": [
          "available",
          "assigned",
          "maintenance",
          "disposed",
          "lost"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "approvals",
    "group": "system",
    "label": "Approvals",
    "icon": CheckCircle,
    "table": "approval_requests",
    "description": "Cross-module approval workflows.",
    "columns": [
      "request_type",
      "entity_type",
      "amount",
      "status",
      "current_step",
      "submitted_at",
      "completed_at"
    ],
    "fields": [
      {
        "name": "request_type",
        "label": "Request type",
        "type": "text"
      },
      {
        "name": "entity_type",
        "label": "Entity type",
        "type": "text"
      },
      {
        "name": "entity_id",
        "label": "Entity ID",
        "type": "text"
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text",
        "optional": true
      },
      {
        "name": "reason",
        "label": "Reason",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "pending",
          "approved",
          "rejected",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "audit.read"
  },
  {
    "id": "imports",
    "group": "system",
    "label": "Imports",
    "icon": ArrowUp,
    "table": "import_batches",
    "description": "Controlled bulk data imports.",
    "columns": [
      "import_type",
      "file_path",
      "total_rows",
      "success_rows",
      "failed_rows",
      "status",
      "created_at"
    ],
    "fields": [
      {
        "name": "import_type",
        "label": "Import type",
        "type": "text"
      },
      {
        "name": "file_path",
        "label": "File path",
        "type": "text"
      },
      {
        "name": "total_rows",
        "label": "Total rows",
        "type": "number"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "queued",
          "processing",
          "completed",
          "failed",
          "cancelled"
        ]
      },
      {
        "name": "options",
        "label": "Options",
        "type": "json",
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "reports.read",
    "writePermission": "reports.export"
  },
  {
    "id": "exports",
    "group": "system",
    "label": "Exports",
    "icon": ArrowDown,
    "table": "export_jobs",
    "description": "Asynchronous data exports.",
    "columns": [
      "export_type",
      "format",
      "row_count",
      "status",
      "file_path",
      "created_at",
      "completed_at"
    ],
    "fields": [
      {
        "name": "export_type",
        "label": "Export type",
        "type": "text"
      },
      {
        "name": "format",
        "label": "Format",
        "type": "select",
        "options": [
          "csv",
          "xlsx",
          "pdf",
          "json"
        ]
      },
      {
        "name": "filters",
        "label": "Filters",
        "type": "json",
        "wide": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "queued",
          "processing",
          "completed",
          "failed"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "reports.read",
    "writePermission": "reports.export"
  },
  {
    "id": "audit",
    "group": "system",
    "label": "Audit Log",
    "icon": Eye,
    "table": "audit_logs",
    "orderBy": "occurred_at",
    "description": "Immutable activity history.",
    "columns": [
      "occurred_at",
      "actor_user_id",
      "school_id",
      "action",
      "table_name",
      "record_id"
    ],
    "readOnly": true,
    "schoolScoped": false,
    "platformOnly": false,
    "permission": "audit.read"
  },
  {
    "id": "integrations",
    "group": "system",
    "label": "Integrations",
    "icon": Cable,
    "table": "integration_connections",
    "description": "Connect SchoolDB to approved external services.",
    "columns": [
      "name",
      "integration_type",
      "provider",
      "status",
      "last_connected_at",
      "last_error"
    ],
    "schoolScoped": false,
    "platformOnly": false,
    "readOnly": false,
    "permission": "settings.manage",
    "writePermission": "settings.manage",
    "workflowHref": "/app/modules/integrations"
  },
  {
    "id": "webhooks",
    "group": "system",
    "label": "Webhooks",
    "icon": Webhook,
    "table": "webhook_endpoints",
    "description": "Manage outbound event subscriptions and delivery health.",
    "columns": [
      "name",
      "url",
      "event_types",
      "status",
      "failure_count",
      "last_success_at",
      "last_failure_at"
    ],
    "schoolScoped": false,
    "readOnly": false,
    "platformOnly": false,
    "permission": "settings.manage",
    "writePermission": "settings.manage",
    "workflowHref": "/app/modules/webhooks"
  },
  {
    "id": "scheduled-jobs",
    "group": "system",
    "label": "Scheduled Jobs",
    "icon": Clock,
    "table": "scheduled_jobs",
    "description": "Recurring automation and health.",
    "columns": [
      "name",
      "code",
      "job_type",
      "schedule_expression",
      "is_enabled",
      "last_status",
      "last_run_at",
      "next_run_at"
    ],
    "schoolScoped": false,
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "job_type",
        "label": "Job type",
        "type": "text"
      },
      {
        "name": "schedule_expression",
        "label": "Schedule expression",
        "type": "text"
      },
      {
        "name": "is_enabled",
        "label": "Enabled",
        "type": "checkbox"
      },
      {
        "name": "configuration",
        "label": "Configuration",
        "type": "json",
        "wide": true
      }
    ],
    "readOnly": false,
    "platformOnly": false,
    "permission": "audit.read",
    "writePermission": "settings.manage"
  },
  {
    "id": "application-documents",
    "group": "students",
    "label": "Admission Documents",
    "icon": FileText,
    "table": "application_documents",
    "description": "Applicant document review.",
    "columns": [
      "application_id",
      "document_type",
      "file_path",
      "review_status",
      "reviewed_at"
    ],
    "fields": [
      {
        "name": "application_id",
        "label": "Application",
        "type": "relation",
        "relation": {
          "table": "applications",
          "value": "id",
          "label": "application_number"
        }
      },
      {
        "name": "document_type",
        "label": "Document type",
        "type": "text"
      },
      {
        "name": "file_path",
        "label": "File path",
        "type": "text"
      },
      {
        "name": "review_status",
        "label": "Review status",
        "type": "select",
        "options": [
          "pending",
          "approved",
          "rejected"
        ]
      },
      {
        "name": "review_notes",
        "label": "Review notes",
        "type": "textarea",
        "wide": true,
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "admissions.read",
    "writePermission": "admissions.manage"
  },
  {
    "id": "person-contacts",
    "group": "students",
    "label": "Person Contacts",
    "icon": Phone,
    "table": "person_contacts",
    "description": "Additional phone and email records.",
    "columns": [
      "person_id",
      "contact_type",
      "value",
      "label",
      "is_primary",
      "is_verified"
    ],
    "fields": [
      {
        "name": "person_id",
        "label": "Person",
        "type": "relation",
        "relation": {
          "table": "people",
          "value": "id",
          "label": "first_name"
        }
      },
      {
        "name": "contact_type",
        "label": "Type",
        "type": "select",
        "options": [
          "phone",
          "email",
          "whatsapp",
          "other"
        ]
      },
      {
        "name": "value",
        "label": "Value",
        "type": "text"
      },
      {
        "name": "label",
        "label": "Label",
        "type": "text",
        "optional": true
      },
      {
        "name": "is_primary",
        "label": "Primary",
        "type": "checkbox"
      },
      {
        "name": "is_verified",
        "label": "Verified",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "students.read",
    "writePermission": "students.update"
  },
  {
    "id": "person-addresses",
    "group": "students",
    "label": "Person Addresses",
    "icon": Home,
    "table": "person_addresses",
    "description": "Residential and postal addresses.",
    "columns": [
      "person_id",
      "address_type",
      "line1",
      "city",
      "district",
      "country_code",
      "is_primary"
    ],
    "fields": [
      {
        "name": "person_id",
        "label": "Person",
        "type": "relation",
        "relation": {
          "table": "people",
          "value": "id",
          "label": "first_name"
        }
      },
      {
        "name": "address_type",
        "label": "Type",
        "type": "select",
        "options": [
          "home",
          "postal",
          "work",
          "other"
        ]
      },
      {
        "name": "line1",
        "label": "Address line",
        "type": "text"
      },
      {
        "name": "city",
        "label": "City",
        "type": "text",
        "optional": true
      },
      {
        "name": "district",
        "label": "District",
        "type": "text",
        "optional": true
      },
      {
        "name": "subcounty",
        "label": "Subcounty",
        "type": "text",
        "optional": true
      },
      {
        "name": "village",
        "label": "Village",
        "type": "text",
        "optional": true
      },
      {
        "name": "country_code",
        "label": "Country code",
        "type": "text"
      },
      {
        "name": "is_primary",
        "label": "Primary",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "students.read",
    "writePermission": "students.update"
  },
  {
    "id": "person-documents",
    "group": "students",
    "label": "Person Documents",
    "icon": UsersRound,
    "table": "person_documents",
    "description": "Identity and supporting documents.",
    "columns": [
      "person_id",
      "document_type",
      "document_number",
      "issued_on",
      "expires_on",
      "verified_at"
    ],
    "fields": [
      {
        "name": "person_id",
        "label": "Person",
        "type": "relation",
        "relation": {
          "table": "people",
          "value": "id",
          "label": "first_name"
        }
      },
      {
        "name": "document_type",
        "label": "Document type",
        "type": "text"
      },
      {
        "name": "document_number",
        "label": "Document number",
        "type": "text",
        "optional": true
      },
      {
        "name": "file_path",
        "label": "File path",
        "type": "text"
      },
      {
        "name": "issued_on",
        "label": "Issued on",
        "type": "date",
        "optional": true
      },
      {
        "name": "expires_on",
        "label": "Expires on",
        "type": "date",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "students.read",
    "writePermission": "students.update"
  },
  {
    "id": "result-publications",
    "group": "assessment",
    "label": "Result Publications",
    "icon": Bell,
    "table": "result_publications",
    "description": "Approve and publish class results.",
    "columns": [
      "class_section_id",
      "term_id",
      "publication_type",
      "status",
      "published_at",
      "withdrawn_at"
    ],
    "fields": [
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "publication_type",
        "label": "Publication type",
        "type": "select",
        "options": [
          "term",
          "midterm",
          "final",
          "supplementary"
        ]
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "approved",
          "published",
          "withdrawn"
        ]
      }
    ],
    "workflows": [
      {
        "label": "Publish results",
        "rpc": "publish_class_results",
        "arg": "publication_id",
        "status": [
          "approved",
          "draft"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "assessments.read"
  },
  {
    "id": "journal-lines",
    "group": "finance",
    "label": "Journal Lines",
    "icon": Layers,
    "table": "journal_lines",
    "description": "Debit and credit journal details.",
    "columns": [
      "journal_entry_id",
      "account_id",
      "student_id",
      "debit_amount",
      "credit_amount",
      "description"
    ],
    "fields": [
      {
        "name": "journal_entry_id",
        "label": "Journal entry",
        "type": "relation",
        "relation": {
          "table": "journal_entries",
          "value": "id",
          "label": "entry_number"
        }
      },
      {
        "name": "account_id",
        "label": "Account",
        "type": "relation",
        "relation": {
          "table": "financial_accounts",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        },
        "optional": true
      },
      {
        "name": "debit_amount",
        "label": "Debit",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "credit_amount",
        "label": "Credit",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "description",
        "label": "Description",
        "type": "text",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "finance.read"
  },
  {
    "id": "payment-allocations",
    "group": "finance",
    "label": "Payment Allocations",
    "icon": Share2,
    "table": "payment_allocations",
    "description": "Apply payments to invoices.",
    "columns": [
      "payment_id",
      "invoice_id",
      "amount",
      "allocated_at",
      "allocated_by"
    ],
    "fields": [
      {
        "name": "payment_id",
        "label": "Payment",
        "type": "relation",
        "relation": {
          "table": "payments",
          "value": "id",
          "label": "payment_reference"
        }
      },
      {
        "name": "invoice_id",
        "label": "Invoice",
        "type": "relation",
        "relation": {
          "table": "invoices",
          "value": "id",
          "label": "invoice_number"
        }
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "step": "0.01"
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "finance.read"
  },
  {
    "id": "payment-receipts",
    "group": "finance",
    "label": "Payment Receipts",
    "icon": Receipt,
    "table": "payment_receipts",
    "description": "Issued and voided receipts.",
    "columns": [
      "receipt_number",
      "payment_id",
      "issued_at",
      "issued_by",
      "voided_at",
      "void_reason"
    ],
    "fields": [
      {
        "name": "receipt_number",
        "label": "Receipt number",
        "type": "text"
      },
      {
        "name": "payment_id",
        "label": "Payment",
        "type": "relation",
        "relation": {
          "table": "payments",
          "value": "id",
          "label": "payment_reference"
        }
      },
      {
        "name": "file_path",
        "label": "File path",
        "type": "text",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "finance.read"
  },
  {
    "id": "bank-accounts",
    "group": "finance",
    "label": "Bank Accounts",
    "icon": Building2,
    "table": "bank_accounts",
    "description": "School settlement bank accounts.",
    "columns": [
      "bank_name",
      "account_name",
      "account_number_masked",
      "currency_code",
      "is_active"
    ],
    "fields": [
      {
        "name": "bank_name",
        "label": "Bank name",
        "type": "text"
      },
      {
        "name": "account_name",
        "label": "Account name",
        "type": "text"
      },
      {
        "name": "account_number_masked",
        "label": "Masked account number",
        "type": "text"
      },
      {
        "name": "branch_name",
        "label": "Branch",
        "type": "text",
        "optional": true
      },
      {
        "name": "currency_code",
        "label": "Currency",
        "type": "text"
      },
      {
        "name": "financial_account_id",
        "label": "Ledger account",
        "type": "relation",
        "relation": {
          "table": "financial_accounts",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.adjust"
  },
  {
    "id": "bank-transactions",
    "group": "finance",
    "label": "Bank Transactions",
    "icon": Activity,
    "table": "bank_transactions",
    "description": "Imported statements and reconciliation.",
    "columns": [
      "transaction_date",
      "description",
      "debit_amount",
      "credit_amount",
      "balance",
      "reconciliation_status"
    ],
    "fields": [
      {
        "name": "bank_account_id",
        "label": "Bank account",
        "type": "relation",
        "relation": {
          "table": "bank_accounts",
          "value": "id",
          "label": "account_name"
        }
      },
      {
        "name": "transaction_date",
        "label": "Transaction date",
        "type": "date"
      },
      {
        "name": "value_date",
        "label": "Value date",
        "type": "date",
        "optional": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "text",
        "optional": true
      },
      {
        "name": "external_reference",
        "label": "External reference",
        "type": "text",
        "optional": true
      },
      {
        "name": "debit_amount",
        "label": "Debit",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "credit_amount",
        "label": "Credit",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "balance",
        "label": "Balance",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "reconciliation_status",
        "label": "Reconciliation",
        "type": "select",
        "options": [
          "unmatched",
          "matched",
          "excluded"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.adjust"
  },
  {
    "id": "payroll-components",
    "group": "hr",
    "label": "Payroll Components",
    "icon": WalletCards,
    "table": "payroll_components",
    "description": "Earnings, deductions and contributions.",
    "columns": [
      "name",
      "code",
      "component_type",
      "calculation_method",
      "taxable",
      "pensionable",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "component_type",
        "label": "Type",
        "type": "select",
        "options": [
          "earning",
          "deduction",
          "employer_contribution"
        ]
      },
      {
        "name": "calculation_method",
        "label": "Calculation",
        "type": "select",
        "options": [
          "fixed",
          "percentage",
          "formula"
        ]
      },
      {
        "name": "default_amount",
        "label": "Default amount",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "percentage_rate",
        "label": "Percentage rate",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "taxable",
        "label": "Taxable",
        "type": "checkbox"
      },
      {
        "name": "pensionable",
        "label": "Pensionable",
        "type": "checkbox"
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "payroll.read",
    "writePermission": "payroll.process"
  },
  {
    "id": "employee-pay-components",
    "group": "hr",
    "label": "Employee Pay Setup",
    "icon": Settings,
    "table": "employee_pay_components",
    "description": "Employee-specific payroll settings.",
    "columns": [
      "employee_id",
      "payroll_component_id",
      "amount",
      "percentage_rate",
      "starts_on",
      "ends_on",
      "is_active"
    ],
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        }
      },
      {
        "name": "payroll_component_id",
        "label": "Component",
        "type": "relation",
        "relation": {
          "table": "payroll_components",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "percentage_rate",
        "label": "Rate",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "starts_on",
        "label": "Starts",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends",
        "type": "date",
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "payroll.read",
    "writePermission": "payroll.process"
  },
  {
    "id": "payroll-entries",
    "group": "hr",
    "label": "Payroll Entries",
    "icon": Banknote,
    "table": "payroll_entries",
    "description": "Employee payroll calculation results.",
    "columns": [
      "payroll_run_id",
      "employee_id",
      "base_salary",
      "gross_pay",
      "total_deductions",
      "net_pay",
      "payment_status"
    ],
    "fields": [
      {
        "name": "payroll_run_id",
        "label": "Payroll run",
        "type": "relation",
        "relation": {
          "table": "payroll_runs",
          "value": "id",
          "label": "run_number"
        }
      },
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        }
      },
      {
        "name": "base_salary",
        "label": "Base salary",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "gross_pay",
        "label": "Gross pay",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "total_deductions",
        "label": "Deductions",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "employer_contributions",
        "label": "Employer contributions",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "net_pay",
        "label": "Net pay",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "payment_status",
        "label": "Payment status",
        "type": "select",
        "options": [
          "pending",
          "processing",
          "paid",
          "failed"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "payroll.read",
    "writePermission": "payroll.process"
  },
  {
    "id": "qualifications",
    "group": "hr",
    "label": "Staff Qualifications",
    "icon": GraduationCap,
    "table": "employee_qualifications",
    "description": "Employee credentials and verification.",
    "columns": [
      "employee_id",
      "qualification_name",
      "qualification_type",
      "institution",
      "awarded_on",
      "expires_on",
      "verified_at"
    ],
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        }
      },
      {
        "name": "qualification_name",
        "label": "Qualification",
        "type": "text"
      },
      {
        "name": "qualification_type",
        "label": "Type",
        "type": "text"
      },
      {
        "name": "institution",
        "label": "Institution",
        "type": "text"
      },
      {
        "name": "field_of_study",
        "label": "Field of study",
        "type": "text",
        "optional": true
      },
      {
        "name": "awarded_on",
        "label": "Awarded on",
        "type": "date",
        "optional": true
      },
      {
        "name": "expires_on",
        "label": "Expires on",
        "type": "date",
        "optional": true
      },
      {
        "name": "certificate_path",
        "label": "Certificate path",
        "type": "text",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "staff.read",
    "writePermission": "staff.manage"
  },
  {
    "id": "staff-appraisals",
    "group": "hr",
    "label": "Staff Appraisals",
    "icon": Star,
    "table": "staff_appraisals",
    "description": "Performance review cycles.",
    "columns": [
      "employee_id",
      "appraiser_employee_id",
      "appraisal_period_start",
      "appraisal_period_end",
      "overall_score",
      "status",
      "completed_at"
    ],
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        }
      },
      {
        "name": "appraiser_employee_id",
        "label": "Appraiser",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        },
        "optional": true
      },
      {
        "name": "appraisal_period_start",
        "label": "Period start",
        "type": "date"
      },
      {
        "name": "appraisal_period_end",
        "label": "Period end",
        "type": "date"
      },
      {
        "name": "overall_score",
        "label": "Overall score",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "strengths",
        "label": "Strengths",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "improvement_areas",
        "label": "Improvement areas",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "self_review",
          "manager_review",
          "completed"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "staff.read",
    "writePermission": "staff.manage"
  },
  {
    "id": "notification-templates",
    "group": "communication",
    "label": "Notification Templates",
    "icon": Mail,
    "table": "notification_templates",
    "description": "Email, SMS and push templates.",
    "columns": [
      "name",
      "code",
      "channel",
      "school_id",
      "is_active",
      "updated_at"
    ],
    "schoolScoped": false,
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "channel",
        "label": "Channel",
        "type": "select",
        "options": [
          "email",
          "sms",
          "push",
          "whatsapp",
          "in_app"
        ]
      },
      {
        "name": "school_id",
        "label": "School ID",
        "type": "text",
        "optional": true
      },
      {
        "name": "subject_template",
        "label": "Subject template",
        "type": "text",
        "optional": true
      },
      {
        "name": "body_template",
        "label": "Body template",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "variables",
        "label": "Variables",
        "type": "json",
        "wide": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "readOnly": false,
    "platformOnly": false,
    "permission": "communications.read",
    "writePermission": "communications.send"
  },
  {
    "id": "notification-deliveries",
    "group": "communication",
    "label": "Delivery Queue",
    "icon": Mail,
    "table": "notification_deliveries",
    "description": "Provider delivery status and retries.",
    "columns": [
      "channel",
      "recipient",
      "provider",
      "status",
      "attempt_count",
      "delivered_at",
      "failed_at",
      "error_message"
    ],
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": false,
    "permission": "communications.read"
  },
  {
    "id": "transport-stops",
    "group": "operations",
    "label": "Transport Stops",
    "icon": MapPin,
    "table": "transport_stops",
    "description": "Ordered route pickup and drop-off points.",
    "columns": [
      "route_id",
      "sequence_no",
      "name",
      "pickup_time",
      "dropoff_time",
      "is_active"
    ],
    "fields": [
      {
        "name": "route_id",
        "label": "Route",
        "type": "relation",
        "relation": {
          "table": "transport_routes",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "sequence_no",
        "label": "Sequence",
        "type": "number"
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "landmark",
        "label": "Landmark",
        "type": "text",
        "optional": true
      },
      {
        "name": "latitude",
        "label": "Latitude",
        "type": "number",
        "step": "0.000001",
        "optional": true
      },
      {
        "name": "longitude",
        "label": "Longitude",
        "type": "number",
        "step": "0.000001",
        "optional": true
      },
      {
        "name": "pickup_time",
        "label": "Pickup time",
        "type": "time",
        "optional": true
      },
      {
        "name": "dropoff_time",
        "label": "Drop-off time",
        "type": "time",
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "transport.manage",
    "writePermission": "transport.manage"
  },
  {
    "id": "student-transport",
    "group": "operations",
    "label": "Student Transport",
    "icon": Map,
    "table": "student_transport_assignments",
    "description": "Assign students to routes and stops.",
    "columns": [
      "student_id",
      "route_id",
      "pickup_stop_id",
      "dropoff_stop_id",
      "starts_on",
      "ends_on",
      "status"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "route_id",
        "label": "Route",
        "type": "relation",
        "relation": {
          "table": "transport_routes",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "pickup_stop_id",
        "label": "Pickup stop",
        "type": "relation",
        "relation": {
          "table": "transport_stops",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "dropoff_stop_id",
        "label": "Drop-off stop",
        "type": "relation",
        "relation": {
          "table": "transport_stops",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "academic_year_id",
        "label": "Academic year",
        "type": "relation",
        "relation": {
          "table": "academic_years",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "term_id",
        "label": "Term",
        "type": "relation",
        "relation": {
          "table": "terms",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "starts_on",
        "label": "Starts",
        "type": "date"
      },
      {
        "name": "ends_on",
        "label": "Ends",
        "type": "date",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "ended",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "transport.manage",
    "writePermission": "transport.manage"
  },
  {
    "id": "vehicle-trips",
    "group": "operations",
    "label": "Vehicle Trips",
    "icon": Compass,
    "table": "vehicle_trips",
    "description": "Daily route execution.",
    "columns": [
      "trip_date",
      "trip_type",
      "route_id",
      "vehicle_id",
      "driver_employee_id",
      "status",
      "actual_departure_at",
      "completed_at"
    ],
    "fields": [
      {
        "name": "trip_date",
        "label": "Trip date",
        "type": "date"
      },
      {
        "name": "trip_type",
        "label": "Trip type",
        "type": "select",
        "options": [
          "morning",
          "afternoon",
          "special"
        ]
      },
      {
        "name": "route_id",
        "label": "Route",
        "type": "relation",
        "relation": {
          "table": "transport_routes",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "vehicle_id",
        "label": "Vehicle",
        "type": "relation",
        "relation": {
          "table": "vehicles",
          "value": "id",
          "label": "registration_number"
        }
      },
      {
        "name": "driver_employee_id",
        "label": "Driver",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        },
        "optional": true
      },
      {
        "name": "scheduled_departure_at",
        "label": "Scheduled departure",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "scheduled",
          "departed",
          "completed",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "transport.manage",
    "writePermission": "transport.manage"
  },
  {
    "id": "trip-attendance",
    "group": "operations",
    "label": "Trip Attendance",
    "icon": Users,
    "table": "trip_student_attendance",
    "description": "Student boarding and alighting records.",
    "columns": [
      "vehicle_trip_id",
      "student_id",
      "attendance_status",
      "boarded_at",
      "alighted_at"
    ],
    "fields": [
      {
        "name": "vehicle_trip_id",
        "label": "Trip",
        "type": "relation",
        "relation": {
          "table": "vehicle_trips",
          "value": "id",
          "label": "trip_date"
        }
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "attendance_status",
        "label": "Status",
        "type": "select",
        "options": [
          "expected",
          "boarded",
          "absent",
          "alighted"
        ]
      },
      {
        "name": "boarded_at",
        "label": "Boarded at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "alighted_at",
        "label": "Alighted at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "text",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "transport.manage",
    "writePermission": "transport.manage"
  },
  {
    "id": "dormitories",
    "group": "operations",
    "label": "Dormitories",
    "icon": Building2,
    "table": "dormitories",
    "description": "Hostel dormitory rooms.",
    "columns": [
      "hostel_id",
      "name",
      "code",
      "floor",
      "capacity",
      "status"
    ],
    "fields": [
      {
        "name": "hostel_id",
        "label": "Hostel",
        "type": "relation",
        "relation": {
          "table": "hostels",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "floor",
        "label": "Floor",
        "type": "text",
        "optional": true
      },
      {
        "name": "capacity",
        "label": "Capacity",
        "type": "number"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "inactive",
          "maintenance"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "boarding.manage",
    "writePermission": "boarding.manage"
  },
  {
    "id": "boarding-beds",
    "group": "operations",
    "label": "Boarding Beds",
    "icon": Bed,
    "table": "boarding_beds",
    "description": "Individual bed inventory.",
    "columns": [
      "dormitory_id",
      "bed_number",
      "status",
      "notes"
    ],
    "fields": [
      {
        "name": "dormitory_id",
        "label": "Dormitory",
        "type": "relation",
        "relation": {
          "table": "dormitories",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "bed_number",
        "label": "Bed number",
        "type": "text"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "available",
          "occupied",
          "maintenance",
          "inactive"
        ]
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "text",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "boarding.manage",
    "writePermission": "boarding.manage"
  },
  {
    "id": "medical-profiles",
    "group": "operations",
    "label": "Medical Profiles",
    "icon": Activity,
    "table": "student_medical_profiles",
    "primaryKey": [
      "student_id"
    ],
    "orderBy": "updated_at",
    "description": "Student emergency and consent data.",
    "columns": [
      "student_id",
      "blood_group",
      "genotype",
      "consent_to_treat",
      "primary_physician",
      "updated_at"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "blood_group",
        "label": "Blood group",
        "type": "text",
        "optional": true
      },
      {
        "name": "genotype",
        "label": "Genotype",
        "type": "text",
        "optional": true
      },
      {
        "name": "primary_physician",
        "label": "Primary physician",
        "type": "text",
        "optional": true
      },
      {
        "name": "physician_phone",
        "label": "Physician phone",
        "type": "text",
        "optional": true
      },
      {
        "name": "insurance_provider",
        "label": "Insurance provider",
        "type": "text",
        "optional": true
      },
      {
        "name": "insurance_number",
        "label": "Insurance number",
        "type": "text",
        "optional": true
      },
      {
        "name": "emergency_instructions",
        "label": "Emergency instructions",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "consent_to_treat",
        "label": "Consent to treat",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "health.manage",
    "writePermission": "health.manage"
  },
  {
    "id": "medical-conditions",
    "group": "operations",
    "label": "Medical Conditions",
    "icon": HeartPulse,
    "table": "medical_conditions",
    "description": "Manage the global and school medical-condition catalogue.",
    "columns": [
      "code",
      "name",
      "condition_type",
      "school_id",
      "created_at"
    ],
    "orderBy": "name",
    "schoolScoped": false,
    "readOnly": false,
    "platformOnly": false,
    "permission": "health.manage",
    "writePermission": "health.manage",
    "workflowHref": "/app/modules/medical-conditions"
  },
  {
    "id": "student-medical-conditions",
    "group": "operations",
    "label": "Student Conditions",
    "icon": ShieldAlert,
    "table": "student_medical_conditions",
    "description": "Student diagnoses and emergency actions.",
    "columns": [
      "student_id",
      "medical_condition_id",
      "severity",
      "current_status",
      "diagnosed_on"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "medical_condition_id",
        "label": "Condition",
        "type": "relation",
        "relation": {
          "table": "medical_conditions",
          "value": "id",
          "label": "name",
          "includeGlobal": true
        }
      },
      {
        "name": "severity",
        "label": "Severity",
        "type": "select",
        "options": [
          "mild",
          "moderate",
          "severe",
          "critical"
        ]
      },
      {
        "name": "current_status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "resolved",
          "managed"
        ]
      },
      {
        "name": "diagnosed_on",
        "label": "Diagnosed on",
        "type": "date",
        "optional": true
      },
      {
        "name": "emergency_action",
        "label": "Emergency action",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "treatment_notes",
        "label": "Treatment notes",
        "type": "textarea",
        "wide": true,
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "health.manage",
    "writePermission": "health.manage"
  },
  {
    "id": "medications",
    "group": "operations",
    "label": "Medication Administration",
    "icon": Plus,
    "table": "medication_administrations",
    "description": "Authorized medication records.",
    "columns": [
      "student_id",
      "medication_name",
      "dosage",
      "route",
      "administered_at",
      "administered_by_employee_id"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "clinic_visit_id",
        "label": "Clinic visit",
        "type": "relation",
        "relation": {
          "table": "clinic_visits",
          "value": "id",
          "label": "visited_at"
        },
        "optional": true
      },
      {
        "name": "medication_name",
        "label": "Medication",
        "type": "text"
      },
      {
        "name": "dosage",
        "label": "Dosage",
        "type": "text"
      },
      {
        "name": "route",
        "label": "Route",
        "type": "text",
        "optional": true
      },
      {
        "name": "administered_at",
        "label": "Administered at",
        "type": "datetime-local"
      },
      {
        "name": "administered_by_employee_id",
        "label": "Administered by",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        },
        "optional": true
      },
      {
        "name": "guardian_authorization_reference",
        "label": "Guardian authorization",
        "type": "text",
        "optional": true
      },
      {
        "name": "reaction_notes",
        "label": "Reaction notes",
        "type": "textarea",
        "wide": true,
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "health.manage",
    "writePermission": "health.manage"
  },
  {
    "id": "inventory-locations",
    "group": "operations",
    "label": "Inventory Locations",
    "icon": MapPin,
    "table": "inventory_locations",
    "description": "Stores and stock locations.",
    "columns": [
      "name",
      "code",
      "location_type",
      "campus_id",
      "parent_location_id",
      "is_active"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "location_type",
        "label": "Type",
        "type": "select",
        "options": [
          "store",
          "warehouse",
          "department",
          "room"
        ]
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "parent_location_id",
        "label": "Parent location",
        "type": "relation",
        "relation": {
          "table": "inventory_locations",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "is_active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "stock-balances",
    "group": "operations",
    "label": "Stock Balances",
    "icon": BarChart,
    "table": "inventory_stock_balances",
    "primaryKey": [
      "inventory_item_id",
      "inventory_location_id"
    ],
    "orderBy": "updated_at",
    "description": "Current on-hand and reserved stock.",
    "columns": [
      "inventory_item_id",
      "inventory_location_id",
      "quantity_on_hand",
      "quantity_reserved",
      "average_cost",
      "updated_at"
    ],
    "fields": [
      {
        "name": "inventory_item_id",
        "label": "Inventory item",
        "type": "relation",
        "relation": {
          "table": "inventory_items",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "inventory_location_id",
        "label": "Location",
        "type": "relation",
        "relation": {
          "table": "inventory_locations",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "quantity_on_hand",
        "label": "On hand",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "quantity_reserved",
        "label": "Reserved",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "average_cost",
        "label": "Average cost",
        "type": "number",
        "step": "0.01"
      }
    ],
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "goods-receipts",
    "group": "operations",
    "label": "Goods Receipts",
    "icon": UserPlus,
    "table": "goods_receipts",
    "description": "Receive purchase orders into stock.",
    "columns": [
      "goods_receipt_number",
      "purchase_order_id",
      "inventory_location_id",
      "received_at",
      "status"
    ],
    "fields": [
      {
        "name": "goods_receipt_number",
        "label": "Receipt number",
        "type": "text"
      },
      {
        "name": "purchase_order_id",
        "label": "Purchase order",
        "type": "relation",
        "relation": {
          "table": "purchase_orders",
          "value": "id",
          "label": "purchase_order_number"
        }
      },
      {
        "name": "inventory_location_id",
        "label": "Location",
        "type": "relation",
        "relation": {
          "table": "inventory_locations",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "delivery_note_number",
        "label": "Delivery note",
        "type": "text",
        "optional": true
      },
      {
        "name": "received_at",
        "label": "Received at",
        "type": "datetime-local"
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "wide": true,
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "draft",
          "received",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "asset-categories",
    "group": "operations",
    "label": "Asset Categories",
    "icon": Layers,
    "table": "asset_categories",
    "description": "Asset classes and depreciation settings.",
    "columns": [
      "name",
      "code",
      "depreciation_method",
      "useful_life_months"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text"
      },
      {
        "name": "depreciation_method",
        "label": "Depreciation method",
        "type": "select",
        "options": [
          "straight_line",
          "declining_balance",
          "none"
        ]
      },
      {
        "name": "useful_life_months",
        "label": "Useful life months",
        "type": "number",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "asset-assignments",
    "group": "operations",
    "label": "Asset Assignments",
    "icon": UserCheck,
    "table": "asset_assignments",
    "description": "Custody and return tracking.",
    "columns": [
      "asset_id",
      "employee_id",
      "student_id",
      "department_id",
      "assigned_at",
      "returned_at",
      "status"
    ],
    "fields": [
      {
        "name": "asset_id",
        "label": "Asset",
        "type": "relation",
        "relation": {
          "table": "assets",
          "value": "id",
          "label": "asset_tag"
        }
      },
      {
        "name": "employee_id",
        "label": "Employee",
        "type": "relation",
        "relation": {
          "table": "employees",
          "value": "id",
          "label": "employee_number"
        },
        "optional": true
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        },
        "optional": true
      },
      {
        "name": "department_id",
        "label": "Department",
        "type": "relation",
        "relation": {
          "table": "departments",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "assigned_at",
        "label": "Assigned at",
        "type": "datetime-local"
      },
      {
        "name": "expected_return_at",
        "label": "Expected return",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "returned_at",
        "label": "Returned at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "active",
          "returned",
          "lost",
          "damaged"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "asset-maintenance",
    "group": "operations",
    "label": "Asset Maintenance",
    "icon": Wrench,
    "table": "asset_maintenance",
    "description": "Maintenance scheduling and cost.",
    "columns": [
      "asset_id",
      "maintenance_type",
      "scheduled_at",
      "started_at",
      "completed_at",
      "cost",
      "status"
    ],
    "fields": [
      {
        "name": "asset_id",
        "label": "Asset",
        "type": "relation",
        "relation": {
          "table": "assets",
          "value": "id",
          "label": "asset_tag"
        }
      },
      {
        "name": "maintenance_type",
        "label": "Maintenance type",
        "type": "text"
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "scheduled_at",
        "label": "Scheduled at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "started_at",
        "label": "Started at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "completed_at",
        "label": "Completed at",
        "type": "datetime-local",
        "optional": true
      },
      {
        "name": "cost",
        "label": "Cost",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "vendor",
        "label": "Vendor",
        "type": "text",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "scheduled",
          "in_progress",
          "completed",
          "cancelled"
        ]
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage"
  },
  {
    "id": "import-rows",
    "group": "system",
    "label": "Import Row Errors",
    "icon": Search,
    "table": "import_rows",
    "orderBy": "row_number",
    "description": "Row-level import validation results.",
    "columns": [
      "import_batch_id",
      "row_number",
      "status",
      "entity_id",
      "processed_at",
      "errors"
    ],
    "readOnly": true,
    "schoolScoped": true,
    "platformOnly": false,
    "permission": "audit.read"
  },
  {
    "id": "integration-events",
    "group": "system",
    "label": "Integration Events",
    "icon": RadioTower,
    "table": "integration_events",
    "orderBy": "received_at",
    "description": "Monitor inbound and outbound integration processing.",
    "columns": [
      "received_at",
      "event_type",
      "direction",
      "status",
      "retry_count",
      "processed_at",
      "error_message"
    ],
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": false,
    "permission": "settings.manage",
    "workflowHref": "/app/modules/integration-events"
  },
  {
    "id": "outbox-events",
    "group": "system",
    "label": "Outbox Events",
    "icon": Upload,
    "table": "outbox_events",
    "description": "Transactional events awaiting delivery.",
    "columns": [
      "created_at",
      "event_type",
      "aggregate_type",
      "aggregate_id",
      "status",
      "attempt_count",
      "processed_at"
    ],
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": false,
    "permission": "audit.read"
  },
  {
    "id": "webhook-deliveries",
    "group": "system",
    "label": "Webhook Deliveries",
    "icon": Share2,
    "table": "webhook_deliveries",
    "description": "Webhook attempts and responses.",
    "columns": [
      "created_at",
      "webhook_endpoint_id",
      "outbox_event_id",
      "status",
      "attempt_count",
      "response_status",
      "delivered_at",
      "error_message"
    ],
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": false,
    "permission": "audit.read"
  },
  {
    "id": "membership-roles",
    "group": "platform",
    "label": "Membership Roles",
    "icon": Layers,
    "table": "membership_roles",
    "description": "Role assignments attached to school memberships.",
    "columns": [
      "membership_id",
      "role_id",
      "assigned_by",
      "assigned_at",
      "expires_at"
    ],
    "primaryKey": [
      "membership_id",
      "role_id"
    ],
    "orderBy": "assigned_at",
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": false,
    "permission": "users.read",
    "workflowHref": "/app/platform/users"
  },
  {
    "id": "platform-user-roles",
    "group": "platform",
    "label": "Platform User Roles",
    "icon": Shield,
    "table": "platform_user_roles",
    "description": "Platform-wide administrator role assignments.",
    "columns": [
      "user_id",
      "role_id",
      "assigned_by",
      "assigned_at"
    ],
    "primaryKey": [
      "user_id",
      "role_id"
    ],
    "orderBy": "assigned_at",
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": true,
    "permission": "users.read",
    "workflowHref": "/app/platform/users"
  },
  {
    "id": "role-permissions",
    "group": "platform",
    "label": "Role Permissions",
    "icon": Lock,
    "table": "role_permissions",
    "description": "Permission grants assigned to roles.",
    "columns": [
      "role_id",
      "permission_id",
      "created_at"
    ],
    "fields": [
      {
        "name": "role_id",
        "label": "Role",
        "type": "relation",
        "relation": {
          "table": "roles",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "permission_id",
        "label": "Permission",
        "type": "relation",
        "relation": {
          "table": "permissions",
          "value": "id",
          "label": "name",
          "schoolScoped": false
        }
      }
    ],
    "primaryKey": [
      "role_id",
      "permission_id"
    ],
    "orderBy": "created_at",
    "schoolScoped": false,
    "readOnly": false,
    "platformOnly": false,
    "permission": "roles.manage",
    "writePermission": "roles.manage",
    "workflowHref": "/app/platform/roles"
  },
  {
    "id": "profiles",
    "group": "platform",
    "label": "User Profiles",
    "icon": User,
    "table": "profiles",
    "description": "Authentication-linked user profiles.",
    "columns": [
      "display_name",
      "first_name",
      "last_name",
      "phone",
      "is_active",
      "must_change_password",
      "last_active_at"
    ],
    "primaryKey": [
      "id"
    ],
    "orderBy": "created_at",
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": true,
    "permission": "users.read"
  },
  {
    "id": "user-invitations",
    "group": "platform",
    "label": "User Invitations",
    "icon": Mail,
    "table": "user_invitations",
    "description": "Pending, accepted, revoked and expired invitations.",
    "columns": [
      "email",
      "school_id",
      "expires_at",
      "accepted_at",
      "revoked_at",
      "created_at"
    ],
    "orderBy": "created_at",
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": false,
    "permission": "users.read",
    "workflowHref": "/app/platform/users"
  },
  {
    "id": "school-settings",
    "group": "platform",
    "label": "School Settings",
    "icon": Settings,
    "table": "school_settings",
    "description": "Academic, numbering and lock-policy settings.",
    "columns": [
      "academic_week_start",
      "default_language",
      "date_format",
      "attendance_lock_hours",
      "result_entry_lock_enabled",
      "updated_at"
    ],
    "fields": [
      {
        "name": "academic_week_start",
        "label": "Academic week start",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "default_language",
        "label": "Default language",
        "type": "text"
      },
      {
        "name": "date_format",
        "label": "Date format",
        "type": "text"
      },
      {
        "name": "student_number_prefix",
        "label": "Student number prefix",
        "type": "text",
        "optional": true
      },
      {
        "name": "employee_number_prefix",
        "label": "Employee number prefix",
        "type": "text",
        "optional": true
      },
      {
        "name": "receipt_number_prefix",
        "label": "Receipt prefix",
        "type": "text",
        "optional": true
      },
      {
        "name": "invoice_number_prefix",
        "label": "Invoice prefix",
        "type": "text",
        "optional": true
      },
      {
        "name": "attendance_lock_hours",
        "label": "Attendance lock hours",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "result_entry_lock_enabled",
        "label": "Lock result entry",
        "type": "checkbox"
      },
      {
        "name": "settings",
        "label": "Extended settings",
        "type": "json",
        "wide": true,
        "optional": true
      }
    ],
    "primaryKey": [
      "school_id"
    ],
    "orderBy": "updated_at",
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "settings.manage",
    "writePermission": "settings.manage"
  },
  {
    "id": "school-finance-settings",
    "group": "finance",
    "label": "School Finance Settings",
    "icon": WalletCards,
    "table": "school_finance_settings",
    "description": "Control accounts and automated posting configuration.",
    "columns": [
      "receivables_account_id",
      "cash_account_id",
      "bank_account_id",
      "default_income_account_id",
      "auto_post_invoices",
      "auto_post_payments",
      "updated_at"
    ],
    "primaryKey": [
      "school_id"
    ],
    "orderBy": "updated_at",
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "finance.read"
  },
  {
    "id": "announcement-audiences",
    "group": "communication",
    "label": "Announcement Audiences",
    "icon": UsersRound,
    "table": "announcement_audiences",
    "description": "Target roles, campuses, classes and users for announcements.",
    "columns": [
      "announcement_id",
      "audience_type",
      "role_id",
      "campus_id",
      "class_section_id",
      "user_id",
      "created_at"
    ],
    "fields": [
      {
        "name": "announcement_id",
        "label": "Announcement",
        "type": "relation",
        "relation": {
          "table": "announcements",
          "value": "id",
          "label": "title"
        }
      },
      {
        "name": "audience_type",
        "label": "Audience type",
        "type": "select",
        "options": [
          "all",
          "role",
          "campus",
          "class",
          "user"
        ]
      },
      {
        "name": "role_id",
        "label": "Role",
        "type": "relation",
        "relation": {
          "table": "roles",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "campus_id",
        "label": "Campus",
        "type": "relation",
        "relation": {
          "table": "campuses",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "class_section_id",
        "label": "Class section",
        "type": "relation",
        "relation": {
          "table": "class_sections",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "user_id",
        "label": "User ID",
        "type": "text",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "communications.read",
    "writePermission": "communications.send"
  },
  {
    "id": "announcement-acknowledgements",
    "group": "communication",
    "label": "Announcement Acknowledgements",
    "icon": CheckCircle2,
    "table": "announcement_acknowledgements",
    "description": "Users who acknowledged required announcements.",
    "columns": [
      "announcement_id",
      "user_id",
      "acknowledged_at"
    ],
    "primaryKey": [
      "announcement_id",
      "user_id"
    ],
    "orderBy": "acknowledged_at",
    "schoolScoped": false,
    "readOnly": true,
    "platformOnly": false,
    "permission": "communications.read"
  },
  {
    "id": "conversation-members",
    "group": "communication",
    "label": "Conversation Members",
    "icon": UsersRound,
    "table": "conversation_members",
    "description": "Participants and read state for conversations.",
    "columns": [
      "conversation_id",
      "user_id",
      "role",
      "joined_at",
      "left_at",
      "last_read_at",
      "is_muted"
    ],
    "fields": [
      {
        "name": "conversation_id",
        "label": "Conversation",
        "type": "relation",
        "relation": {
          "table": "conversations",
          "value": "id",
          "label": "title"
        }
      },
      {
        "name": "user_id",
        "label": "User ID",
        "type": "text"
      },
      {
        "name": "role",
        "label": "Role",
        "type": "select",
        "options": [
          "member",
          "admin",
          "owner"
        ]
      },
      {
        "name": "is_muted",
        "label": "Muted",
        "type": "checkbox"
      }
    ],
    "primaryKey": [
      "conversation_id",
      "user_id"
    ],
    "orderBy": "joined_at",
    "schoolScoped": false,
    "readOnly": false,
    "platformOnly": false,
    "permission": "communications.read",
    "writePermission": "communications.send"
  },
  {
    "id": "messages",
    "group": "communication",
    "label": "Messages",
    "icon": MessageSquare,
    "table": "messages",
    "description": "Conversation message history.",
    "columns": [
      "conversation_id",
      "sender_user_id",
      "message_type",
      "body",
      "reply_to_message_id",
      "edited_at",
      "deleted_at",
      "created_at"
    ],
    "fields": [
      {
        "name": "conversation_id",
        "label": "Conversation",
        "type": "relation",
        "relation": {
          "table": "conversations",
          "value": "id",
          "label": "title"
        }
      },
      {
        "name": "body",
        "label": "Message",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "message_type",
        "label": "Message type",
        "type": "select",
        "options": [
          "text",
          "system",
          "file"
        ]
      },
      {
        "name": "reply_to_message_id",
        "label": "Reply to",
        "type": "relation",
        "relation": {
          "table": "messages",
          "value": "id",
          "label": "id"
        },
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "communications.read",
    "writePermission": "communications.send"
  },
  {
    "id": "message-attachments",
    "group": "communication",
    "label": "Message Attachments",
    "icon": FileText,
    "table": "message_attachments",
    "description": "Private files attached to conversation messages.",
    "columns": [
      "message_id",
      "file_name",
      "mime_type",
      "size_bytes",
      "created_at"
    ],
    "orderBy": "created_at",
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "communications.read"
  },
  {
    "id": "approval-steps",
    "group": "system",
    "label": "Approval Steps",
    "icon": Layers,
    "table": "approval_steps",
    "description": "Ordered approvers and decisions for approval requests.",
    "columns": [
      "approval_request_id",
      "step_no",
      "approver_user_id",
      "approver_role_id",
      "decision",
      "decided_at",
      "decision_notes",
      "created_at"
    ],
    "orderBy": "created_at",
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "audit.read"
  },
  {
    "id": "boarding-attendance",
    "group": "operations",
    "label": "Boarding Attendance",
    "icon": Moon,
    "table": "boarding_attendance",
    "description": "Night and boarding check attendance.",
    "columns": [
      "student_id",
      "attendance_date",
      "check_type",
      "status",
      "recorded_at",
      "notes"
    ],
    "fields": [
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "attendance_date",
        "label": "Attendance date",
        "type": "date"
      },
      {
        "name": "check_type",
        "label": "Check type",
        "type": "select",
        "options": [
          "night",
          "morning",
          "roll_call"
        ]
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "present",
          "absent",
          "excused",
          "medical"
        ]
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "optional": true,
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "boarding.manage",
    "writePermission": "boarding.manage"
  },
  {
    "id": "counseling-notes",
    "group": "operations",
    "label": "Counselling Notes",
    "icon": FileText,
    "table": "counseling_case_notes",
    "description": "Confidential progress and case notes.",
    "columns": [
      "counseling_case_id",
      "note_type",
      "confidential",
      "created_by",
      "created_at"
    ],
    "fields": [
      {
        "name": "counseling_case_id",
        "label": "Counselling case",
        "type": "relation",
        "relation": {
          "table": "counseling_cases",
          "value": "id",
          "label": "case_number"
        }
      },
      {
        "name": "note_type",
        "label": "Note type",
        "type": "select",
        "options": [
          "progress",
          "assessment",
          "plan",
          "closure"
        ]
      },
      {
        "name": "note",
        "label": "Note",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "confidential",
        "label": "Confidential",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "discipline.manage",
    "writePermission": "discipline.manage"
  },
  {
    "id": "discipline-actions",
    "group": "operations",
    "label": "Discipline Actions",
    "icon": Scale,
    "table": "discipline_actions",
    "description": "Assigned sanctions, interventions and appeals.",
    "columns": [
      "incident_id",
      "student_id",
      "action_type",
      "starts_on",
      "ends_on",
      "status",
      "parent_notified_at",
      "appeal_status"
    ],
    "fields": [
      {
        "name": "incident_id",
        "label": "Incident",
        "type": "relation",
        "relation": {
          "table": "discipline_incidents",
          "value": "id",
          "label": "incident_number"
        }
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "action_type",
        "label": "Action type",
        "type": "text"
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "starts_on",
        "label": "Starts on",
        "type": "date",
        "optional": true
      },
      {
        "name": "ends_on",
        "label": "Ends on",
        "type": "date",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "assigned",
          "in_progress",
          "completed",
          "cancelled"
        ]
      },
      {
        "name": "appeal_status",
        "label": "Appeal status",
        "type": "text",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "discipline.manage",
    "writePermission": "discipline.manage"
  },
  {
    "id": "discipline-students",
    "group": "operations",
    "label": "Incident Students",
    "icon": Scale,
    "table": "discipline_incident_students",
    "description": "Students and witnesses linked to discipline incidents.",
    "columns": [
      "incident_id",
      "student_id",
      "involvement_type",
      "statement",
      "created_at"
    ],
    "fields": [
      {
        "name": "incident_id",
        "label": "Incident",
        "type": "relation",
        "relation": {
          "table": "discipline_incidents",
          "value": "id",
          "label": "incident_number"
        }
      },
      {
        "name": "student_id",
        "label": "Student",
        "type": "relation",
        "relation": {
          "table": "students",
          "value": "id",
          "label": "admission_number"
        }
      },
      {
        "name": "involvement_type",
        "label": "Involvement",
        "type": "select",
        "options": [
          "subject",
          "victim",
          "witness"
        ]
      },
      {
        "name": "statement",
        "label": "Statement",
        "type": "textarea",
        "optional": true,
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "discipline.manage",
    "writePermission": "discipline.manage"
  },
  {
    "id": "fee-structure-items",
    "group": "finance",
    "label": "Fee Structure Items",
    "icon": ReceiptText,
    "table": "fee_structure_items",
    "description": "Charges and installments inside fee structures.",
    "columns": [
      "fee_structure_id",
      "fee_item_id",
      "amount",
      "due_date",
      "installment_no",
      "is_optional"
    ],
    "fields": [
      {
        "name": "fee_structure_id",
        "label": "Fee structure",
        "type": "relation",
        "relation": {
          "table": "fee_structures",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "fee_item_id",
        "label": "Fee item",
        "type": "relation",
        "relation": {
          "table": "fee_items",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "due_date",
        "label": "Due date",
        "type": "date",
        "optional": true
      },
      {
        "name": "installment_no",
        "label": "Installment number",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "is_optional",
        "label": "Optional",
        "type": "checkbox"
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "finance.read",
    "writePermission": "finance.adjust"
  },
  {
    "id": "goods-receipt-items",
    "group": "operations",
    "label": "Goods Receipt Items",
    "icon": Download,
    "table": "goods_receipt_items",
    "description": "Line items accepted or rejected during goods receipt.",
    "columns": [
      "goods_receipt_id",
      "inventory_item_id",
      "quantity_received",
      "unit_cost",
      "condition_status",
      "rejection_reason"
    ],
    "fields": [
      {
        "name": "goods_receipt_id",
        "label": "Goods receipt",
        "type": "relation",
        "relation": {
          "table": "goods_receipts",
          "value": "id",
          "label": "goods_receipt_number"
        }
      },
      {
        "name": "purchase_order_item_id",
        "label": "Purchase order item",
        "type": "relation",
        "relation": {
          "table": "purchase_order_items",
          "value": "id",
          "label": "description"
        }
      },
      {
        "name": "inventory_item_id",
        "label": "Inventory item",
        "type": "relation",
        "relation": {
          "table": "inventory_items",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "quantity_received",
        "label": "Quantity received",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "unit_cost",
        "label": "Unit cost",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "condition_status",
        "label": "Condition",
        "type": "select",
        "options": [
          "accepted",
          "rejected",
          "damaged"
        ]
      },
      {
        "name": "rejection_reason",
        "label": "Rejection reason",
        "type": "textarea",
        "optional": true,
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage",
    "writePermission": "inventory.manage"
  },
  {
    "id": "library-authors",
    "group": "operations",
    "label": "Library Authors",
    "icon": FileText,
    "table": "library_authors",
    "description": "Author catalogue for library resources.",
    "columns": [
      "name",
      "created_at",
      "updated_at"
    ],
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text"
      },
      {
        "name": "biography",
        "label": "Biography",
        "type": "textarea",
        "optional": true,
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "library.manage",
    "writePermission": "library.manage"
  },
  {
    "id": "library-fines",
    "group": "operations",
    "label": "Library Fines",
    "icon": Banknote,
    "table": "library_fines",
    "description": "Outstanding, paid and waived circulation fines.",
    "columns": [
      "library_loan_id",
      "student_id",
      "employee_id",
      "fine_type",
      "amount",
      "status",
      "assessed_at",
      "paid_at",
      "waived_at"
    ],
    "orderBy": "assessed_at",
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "library.manage"
  },
  {
    "id": "library-item-authors",
    "group": "operations",
    "label": "Item Authors",
    "icon": UsersRound,
    "table": "library_item_authors",
    "description": "Many-to-many author assignments for library items.",
    "columns": [
      "library_item_id",
      "author_id",
      "sequence_no"
    ],
    "fields": [
      {
        "name": "library_item_id",
        "label": "Library item",
        "type": "relation",
        "relation": {
          "table": "library_items",
          "value": "id",
          "label": "title"
        }
      },
      {
        "name": "author_id",
        "label": "Author",
        "type": "relation",
        "relation": {
          "table": "library_authors",
          "value": "id",
          "label": "name"
        }
      },
      {
        "name": "sequence_no",
        "label": "Sequence number",
        "type": "number",
        "step": "0.01"
      }
    ],
    "primaryKey": [
      "library_item_id",
      "author_id"
    ],
    "orderBy": "sequence_no",
    "schoolScoped": false,
    "readOnly": false,
    "platformOnly": false,
    "permission": "library.manage",
    "writePermission": "library.manage"
  },
  {
    "id": "payroll-entry-lines",
    "group": "hr",
    "label": "Payroll Entry Lines",
    "icon": ReceiptText,
    "table": "payroll_entry_lines",
    "description": "Calculated component lines for employee payroll entries.",
    "columns": [
      "payroll_entry_id",
      "payroll_component_id",
      "quantity",
      "rate",
      "amount",
      "created_at"
    ],
    "orderBy": "created_at",
    "schoolScoped": true,
    "readOnly": true,
    "platformOnly": false,
    "permission": "payroll.read"
  },
  {
    "id": "purchase-request-items",
    "group": "operations",
    "label": "Purchase Request Items",
    "icon": ClipboardList,
    "table": "purchase_request_items",
    "description": "Requested quantities and estimated costs.",
    "columns": [
      "purchase_request_id",
      "inventory_item_id",
      "description",
      "quantity",
      "estimated_unit_cost",
      "preferred_supplier_id"
    ],
    "fields": [
      {
        "name": "purchase_request_id",
        "label": "Purchase request",
        "type": "relation",
        "relation": {
          "table": "purchase_requests",
          "value": "id",
          "label": "request_number"
        }
      },
      {
        "name": "inventory_item_id",
        "label": "Inventory item",
        "type": "relation",
        "relation": {
          "table": "inventory_items",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "text"
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "estimated_unit_cost",
        "label": "Estimated unit cost",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "preferred_supplier_id",
        "label": "Preferred supplier",
        "type": "relation",
        "relation": {
          "table": "suppliers",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "optional": true,
        "wide": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage",
    "writePermission": "inventory.manage"
  },
  {
    "id": "purchase-order-items",
    "group": "operations",
    "label": "Purchase Order Items",
    "icon": Archive,
    "table": "purchase_order_items",
    "description": "Ordered quantities, prices and receipt progress.",
    "columns": [
      "purchase_order_id",
      "inventory_item_id",
      "description",
      "quantity",
      "received_quantity",
      "unit_price",
      "tax_amount",
      "line_total"
    ],
    "fields": [
      {
        "name": "purchase_order_id",
        "label": "Purchase order",
        "type": "relation",
        "relation": {
          "table": "purchase_orders",
          "value": "id",
          "label": "purchase_order_number"
        }
      },
      {
        "name": "inventory_item_id",
        "label": "Inventory item",
        "type": "relation",
        "relation": {
          "table": "inventory_items",
          "value": "id",
          "label": "name"
        },
        "optional": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "text"
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "unit_price",
        "label": "Unit price",
        "type": "number",
        "step": "0.01"
      },
      {
        "name": "tax_amount",
        "label": "Tax amount",
        "type": "number",
        "step": "0.01",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "inventory.manage",
    "writePermission": "inventory.manage"
  },
  {
    "id": "vehicle-maintenance",
    "group": "operations",
    "label": "Vehicle Maintenance",
    "icon": Wrench,
    "table": "vehicle_maintenance",
    "description": "Scheduled and completed fleet maintenance.",
    "columns": [
      "vehicle_id",
      "maintenance_type",
      "scheduled_on",
      "completed_on",
      "odometer",
      "vendor",
      "cost",
      "status",
      "next_due_on"
    ],
    "fields": [
      {
        "name": "vehicle_id",
        "label": "Vehicle",
        "type": "relation",
        "relation": {
          "table": "vehicles",
          "value": "id",
          "label": "registration_number"
        }
      },
      {
        "name": "maintenance_type",
        "label": "Maintenance type",
        "type": "text"
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "wide": true
      },
      {
        "name": "scheduled_on",
        "label": "Scheduled on",
        "type": "date",
        "optional": true
      },
      {
        "name": "started_on",
        "label": "Started on",
        "type": "date",
        "optional": true
      },
      {
        "name": "completed_on",
        "label": "Completed on",
        "type": "date",
        "optional": true
      },
      {
        "name": "odometer",
        "label": "Odometer",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "vendor",
        "label": "Vendor",
        "type": "text",
        "optional": true
      },
      {
        "name": "cost",
        "label": "Cost",
        "type": "number",
        "step": "0.01",
        "optional": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "options": [
          "scheduled",
          "in_progress",
          "completed",
          "cancelled"
        ]
      },
      {
        "name": "next_due_on",
        "label": "Next due on",
        "type": "date",
        "optional": true
      }
    ],
    "schoolScoped": true,
    "readOnly": false,
    "platformOnly": false,
    "permission": "transport.manage",
    "writePermission": "transport.manage"
  }
];

export type ModuleId = (typeof MODULES)[number]["id"];
export const moduleById = (id: string): ModuleConfig | undefined => MODULES.find((module) => module.id === id);
export const groupById = (id: string): ModuleGroup | undefined => MODULE_GROUPS.find((group) => group.id === id);

const WRITE_PERMISSION_BY_VIEW_PERMISSION: Record<string, string> = {
  "users.read": "users.manage",
  "admissions.read": "admissions.manage",
  "students.read": "students.update",
  "guardians.read": "guardians.manage",
  "attendance.read": "attendance.record",
  "assessments.read": "assessments.manage",
  "finance.read": "finance.adjust",
  "staff.read": "staff.manage",
  "communications.read": "communications.send",
  "reports.read": "reports.export",
  "audit.read": "settings.manage",
};

export function moduleWritePermission(module: ModuleConfig): string | undefined {
  if (module.readOnly) return undefined;
  if (module.writePermission) return module.writePermission;
  if (!module.permission) return undefined;
  return WRITE_PERMISSION_BY_VIEW_PERMISSION[module.permission] ?? module.permission;
}
