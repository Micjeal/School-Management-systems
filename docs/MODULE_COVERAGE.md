# Module coverage

SchoolDB registers **139 unique module screens**, one governed registry entry for every public table. Configuration/master-data modules use the shared RLS-backed module engine; entries with a workflow link have a dedicated operational interface.

## 🏢 Platform (6)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Schools | `schools` | `schools` | `settings.manage` | Yes — `/app/platform/schools` |
| Campuses | `campuses` | `campuses` | `settings.manage` | Shared module interface |
| Memberships | `memberships` | `school_memberships` | `settings.manage` | Yes — `/app/platform/users` |
| Roles | `roles` | `roles` | `settings.manage` | Shared module interface |
| Permissions | `permissions` | `permissions` | `settings.manage` | Shared module interface |
| Feature Flags | `feature-flags` | `school_feature_flags` | `settings.manage` | Shared module interface |

## 🎓 Academics (11)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Academic Years | `academic-years` | `academic_years` | `academics.manage` | Shared module interface |
| Terms | `terms` | `terms` | `academics.manage` | Shared module interface |
| Grade Levels | `grade-levels` | `grade_levels` | `academics.manage` | Shared module interface |
| Departments | `departments` | `departments` | `academics.manage` | Shared module interface |
| Subjects | `subjects` | `subjects` | `academics.manage` | Shared module interface |
| Classes | `classes` | `class_groups` | `academics.manage` | Shared module interface |
| Class Sections | `sections` | `class_sections` | `academics.manage` | Shared module interface |
| Rooms | `rooms` | `rooms` | `academics.manage` | Shared module interface |
| Teacher Assignments | `teacher-assignments` | `teacher_assignments` | `academics.manage` | Shared module interface |
| Timetables | `timetables` | `timetable_versions` | `academics.manage` | Shared module interface |
| Timetable Entries | `timetable-entries` | `timetable_entries` | `academics.manage` | Shared module interface |

## 🧑‍🎓 Students (10)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Admissions | `applications` | `applications` | `students.read` | Yes — `/app/admissions` |
| People Directory | `people` | `people` | `students.read` | Shared module interface |
| Students | `students` | `students` | `students.read` | Yes — `/app/students` |
| Guardians | `guardians` | `guardians` | `students.read` | Shared module interface |
| Student Guardians | `student-guardians` | `student_guardians` | `students.read` | Shared module interface |
| Enrolments | `enrolments` | `student_enrolments` | `students.read` | Shared module interface |
| Admission Documents | `application-documents` | `application_documents` | `students.read` | Shared module interface |
| Person Contacts | `person-contacts` | `person_contacts` | `students.read` | Shared module interface |
| Person Addresses | `person-addresses` | `person_addresses` | `students.read` | Shared module interface |
| Person Documents | `person-documents` | `person_documents` | `students.read` | Shared module interface |

## ✅ Attendance (3)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Attendance Sessions | `attendance-sessions` | `attendance_sessions` | `attendance.read` | Yes — `/app/attendance` |
| Student Attendance | `student-attendance` | `student_attendance_records` | `attendance.read` | Shared module interface |
| Attendance Corrections | `attendance-corrections` | `attendance_corrections` | `attendance.read` | Shared module interface |

## 📝 Assessment (8)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Assessment Types | `assessment-types` | `assessment_types` | `assessments.read` | Shared module interface |
| Grading Scales | `grading-scales` | `grading_scales` | `assessments.read` | Shared module interface |
| Grade Bands | `grading-items` | `grading_scale_items` | `assessments.read` | Shared module interface |
| Assessments | `assessments` | `assessments` | `assessments.read` | Yes — `/app/assessments` |
| Mark Entry | `mark-entries` | `mark_entries` | `assessments.read` | Shared module interface |
| Subject Results | `subject-results` | `subject_results` | `assessments.read` | Shared module interface |
| Report Cards | `report-cards` | `report_cards` | `assessments.read` | Shared module interface |
| Result Publications | `result-publications` | `result_publications` | `assessments.read` | Shared module interface |

## 💳 Finance (15)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Chart of Accounts | `financial-accounts` | `financial_accounts` | `finance.read` | Shared module interface |
| Fee Categories | `fee-categories` | `fee_categories` | `finance.read` | Shared module interface |
| Fee Items | `fee-items` | `fee_items` | `finance.read` | Shared module interface |
| Fee Structures | `fee-structures` | `fee_structures` | `finance.read` | Shared module interface |
| Invoices | `invoices` | `invoices` | `finance.read` | Yes — `/app/finance/invoices` |
| Invoice Lines | `invoice-lines` | `invoice_lines` | `finance.read` | Shared module interface |
| Payments | `payments` | `payments` | `finance.read` | Yes — `/app/finance/payments` |
| Payment Methods | `payment-methods` | `payment_methods` | `finance.read` | Shared module interface |
| Refunds | `refunds` | `refunds` | `finance.read` | Shared module interface |
| Journal Entries | `journals` | `journal_entries` | `finance.read` | Shared module interface |
| Journal Lines | `journal-lines` | `journal_lines` | `finance.read` | Shared module interface |
| Payment Allocations | `payment-allocations` | `payment_allocations` | `finance.read` | Shared module interface |
| Payment Receipts | `payment-receipts` | `payment_receipts` | `finance.read` | Shared module interface |
| Bank Accounts | `bank-accounts` | `bank_accounts` | `finance.read` | Shared module interface |
| Bank Transactions | `bank-transactions` | `bank_transactions` | `finance.read` | Shared module interface |

## 👥 HR & Payroll (12)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Employees | `employees` | `employees` | `staff.read` | Yes — `/app/staff` |
| Staff Assignments | `employee-assignments` | `employee_assignments` | `staff.read` | Shared module interface |
| Contracts | `contracts` | `employment_contracts` | `staff.read` | Shared module interface |
| Leave Types | `leave-types` | `leave_types` | `staff.read` | Shared module interface |
| Leave Requests | `leave-requests` | `leave_requests` | `staff.read` | Shared module interface |
| Payroll Periods | `payroll-periods` | `payroll_periods` | `staff.read` | Shared module interface |
| Payroll Runs | `payroll-runs` | `payroll_runs` | `staff.read` | Yes — `/app/payroll` |
| Payroll Components | `payroll-components` | `payroll_components` | `staff.read` | Shared module interface |
| Employee Pay Setup | `employee-pay-components` | `employee_pay_components` | `staff.read` | Shared module interface |
| Payroll Entries | `payroll-entries` | `payroll_entries` | `staff.read` | Shared module interface |
| Staff Qualifications | `qualifications` | `employee_qualifications` | `staff.read` | Shared module interface |
| Staff Appraisals | `staff-appraisals` | `staff_appraisals` | `staff.read` | Shared module interface |

## 💬 Communication (5)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Announcements | `announcements` | `announcements` | `communications.read` | Shared module interface |
| Notifications | `notifications` | `notifications` | `communications.read` | Shared module interface |
| Conversations | `conversations` | `conversations` | `communications.read` | Shared module interface |
| Notification Templates | `notification-templates` | `notification_templates` | `communications.read` | Shared module interface |
| Delivery Queue | `notification-deliveries` | `notification_deliveries` | `communications.read` | Shared module interface |

## ⚙️ Operations (32)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Library Catalogue | `library-items` | `library_items` | `inventory.manage` | Shared module interface |
| Library Copies | `library-copies` | `library_copies` | `inventory.manage` | Shared module interface |
| Library Loans | `library-loans` | `library_loans` | `inventory.manage` | Yes — `/app/library/circulation` |
| Vehicles | `vehicles` | `vehicles` | `inventory.manage` | Shared module interface |
| Transport Routes | `transport-routes` | `transport_routes` | `inventory.manage` | Shared module interface |
| Hostels | `hostels` | `hostels` | `inventory.manage` | Shared module interface |
| Boarding Assignments | `boarding-assignments` | `boarding_assignments` | `inventory.manage` | Shared module interface |
| Clinic Visits | `clinic-visits` | `clinic_visits` | `inventory.manage` | Shared module interface |
| Discipline | `discipline` | `discipline_incidents` | `inventory.manage` | Shared module interface |
| Counselling | `counselling` | `counseling_cases` | `inventory.manage` | Shared module interface |
| Inventory Items | `inventory-items` | `inventory_items` | `inventory.manage` | Shared module interface |
| Stock Movements | `stock-movements` | `stock_movements` | `inventory.manage` | Yes — `/app/inventory/movements` |
| Suppliers | `suppliers` | `suppliers` | `inventory.manage` | Shared module interface |
| Purchase Requests | `purchase-requests` | `purchase_requests` | `inventory.manage` | Shared module interface |
| Purchase Orders | `purchase-orders` | `purchase_orders` | `inventory.manage` | Shared module interface |
| Assets | `assets` | `assets` | `inventory.manage` | Shared module interface |
| Transport Stops | `transport-stops` | `transport_stops` | `inventory.manage` | Shared module interface |
| Student Transport | `student-transport` | `student_transport_assignments` | `inventory.manage` | Shared module interface |
| Vehicle Trips | `vehicle-trips` | `vehicle_trips` | `inventory.manage` | Shared module interface |
| Trip Attendance | `trip-attendance` | `trip_student_attendance` | `inventory.manage` | Shared module interface |
| Dormitories | `dormitories` | `dormitories` | `inventory.manage` | Shared module interface |
| Boarding Beds | `boarding-beds` | `boarding_beds` | `inventory.manage` | Shared module interface |
| Medical Profiles | `medical-profiles` | `student_medical_profiles` | `inventory.manage` | Shared module interface |
| Medical Conditions | `medical-conditions` | `medical_conditions` | `inventory.manage` | Shared module interface |
| Student Conditions | `student-medical-conditions` | `student_medical_conditions` | `inventory.manage` | Shared module interface |
| Medication Administration | `medications` | `medication_administrations` | `inventory.manage` | Shared module interface |
| Inventory Locations | `inventory-locations` | `inventory_locations` | `inventory.manage` | Shared module interface |
| Stock Balances | `stock-balances` | `inventory_stock_balances` | `inventory.manage` | Shared module interface |
| Goods Receipts | `goods-receipts` | `goods_receipts` | `inventory.manage` | Shared module interface |
| Asset Categories | `asset-categories` | `asset_categories` | `inventory.manage` | Shared module interface |
| Asset Assignments | `asset-assignments` | `asset_assignments` | `inventory.manage` | Shared module interface |
| Asset Maintenance | `asset-maintenance` | `asset_maintenance` | `inventory.manage` | Shared module interface |

## 🛡️ System (11)

| Screen | Module ID | Table | Permission | Dedicated workflow |
|---|---|---|---|---|
| Approvals | `approvals` | `approval_requests` | `audit.read` | Shared module interface |
| Imports | `imports` | `import_batches` | `audit.read` | Shared module interface |
| Exports | `exports` | `export_jobs` | `audit.read` | Shared module interface |
| Audit Log | `audit` | `audit_logs` | `audit.read` | Shared module interface |
| Integrations | `integrations` | `integration_connections` | `audit.read` | Shared module interface |
| Webhooks | `webhooks` | `webhook_endpoints` | `audit.read` | Shared module interface |
| Scheduled Jobs | `scheduled-jobs` | `scheduled_jobs` | `audit.read` | Shared module interface |
| Import Row Errors | `import-rows` | `import_rows` | `audit.read` | Shared module interface |
| Integration Events | `integration-events` | `integration_events` | `audit.read` | Shared module interface |
| Outbox Events | `outbox-events` | `outbox_events` | `audit.read` | Shared module interface |
| Webhook Deliveries | `webhook-deliveries` | `webhook_deliveries` | `audit.read` | Shared module interface |

