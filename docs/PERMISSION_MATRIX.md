# Permission Matrix

This document defines the permission grants for each school role in SchoolDB. Permissions are granular capability codes that control access to specific modules and actions.

## School Roles

### School Owner
Full school-level access except platform administration.

**Permissions:**
- `settings.manage` - School settings, users, roles, features
- `academics.manage` - Academic years, terms, classes, subjects, timetable
- `students.read` - Student records, guardians, enrolments
- `students.create` - Create new students
- `students.update` - Update student records
- `attendance.read` - View attendance records
- `attendance.record` - Record attendance
- `assessments.read` - View assessments and results
- `assessments.manage` - Create and manage assessments
- `results.publish` - Publish student results
- `finance.read` - View financial records
- `finance.collect` - Collect payments
- `finance.manage` - Full finance management
- `staff.read` - View staff records
- `staff.manage` - Full staff management
- `payroll.process` - Process payroll
- `communications.send` - Send communications
- `reports.read` - View reports
- `inventory.manage` - Manage inventory
- `procurement.manage` - Manage procurement
- `library.manage` - Manage library
- `health.manage` - Manage health records
- `transport.manage` - Manage transport
- `boarding.manage` - Manage boarding

### School Administrator
Full school-level management except platform administration.

**Permissions:**
- `settings.manage`
- `academics.manage`
- `students.read`
- `students.create`
- `students.update`
- `attendance.read`
- `attendance.record`
- `assessments.read`
- `assessments.manage`
- `results.publish`
- `finance.read`
- `finance.collect`
- `finance.manage`
- `staff.read`
- `staff.manage`
- `payroll.process`
- `communications.send`
- `reports.read`
- `inventory.manage`
- `procurement.manage`
- `library.manage`
- `health.manage`
- `transport.manage`
- `boarding.manage`

### Principal / Head Teacher
Academic oversight and school operations.

**Permissions:**
- `academics.manage`
- `students.read`
- `students.update`
- `attendance.read`
- `attendance.record`
- `assessments.read`
- `assessments.manage`
- `results.publish`
- `staff.read`
- `communications.send`
- `reports.read`

### Deputy Principal
Supports principal in academic oversight.

**Permissions:**
- `academics.manage`
- `students.read`
- `attendance.read`
- `attendance.record`
- `assessments.read`
- `assessments.manage`
- `staff.read`
- `communications.send`
- `reports.read`

### Director of Studies
Academic program management.

**Permissions:**
- `academics.manage`
- `students.read`
- `assessments.read`
- `assessments.manage`
- `results.publish`
- `staff.read`
- `reports.read`

### Registrar
Student records and enrolment management.

**Permissions:**
- `students.read`
- `students.create`
- `students.update`
- `attendance.read`
- `communications.send`
- `reports.read`

### Teacher
Class-specific academic management.

**Permissions:**
- `academics.manage` (limited to assigned classes)
- `students.read` (limited to assigned students)
- `attendance.read` (limited to assigned classes)
- `attendance.record` (limited to assigned classes)
- `assessments.read` (limited to assigned subjects)
- `assessments.manage` (limited to assigned subjects)
- `communications.send` (limited to assigned classes)

### Class Teacher
Specific class oversight.

**Permissions:**
- `academics.manage` (limited to assigned class)
- `students.read` (limited to assigned class)
- `attendance.read` (limited to assigned class)
- `attendance.record` (limited to assigned class)
- `assessments.read` (limited to assigned class)
- `communications.send` (limited to assigned class)

### Bursar
Financial management and reporting.

**Permissions:**
- `finance.read`
- `finance.collect`
- `finance.manage`
- `students.read` (for fee purposes)
- `reports.read` (finance reports)

### Accountant
Financial operations and reconciliation.

**Permissions:**
- `finance.read`
- `finance.collect`
- `finance.manage`
- `reports.read` (finance reports)

### Cashier
Payment collection and receipting.

**Permissions:**
- `finance.read`
- `finance.collect`
- `students.read` (for payment purposes)

### HR Manager
Staff management and payroll.

**Permissions:**
- `staff.read`
- `staff.manage`
- `payroll.process`
- `attendance.read` (staff attendance)
- `reports.read` (HR reports)

### Librarian
Library management.

**Permissions:**
- `library.manage`
- `students.read` (for library records)
- `staff.read` (for library records)

### Nurse
Health records management.

**Permissions:**
- `health.manage`
- `students.read` (for health records)
- `staff.read` (for health records)

### Transport Manager
Transport operations.

**Permissions:**
- `transport.manage`
- `students.read` (for transport records)
- `attendance.read` (transport attendance)

### Boarding Warden
Boarding facility management.

**Permissions:**
- `boarding.manage`
- `students.read` (limited to boarding students)
- `attendance.read` (boarding attendance)

### Parent / Guardian
Portal access to child's information.

**Permissions:**
- `students.read` (limited to own children)
- `attendance.read` (limited to own children)
- `assessments.read` (limited to own children, published results)
- `finance.read` (limited to own children's invoices)
- `communications.send` (limited to own children)
- `library.manage` (limited to own children's library records)

### Student
Portal access to own information.

**Permissions:**
- `students.read` (limited to own record)
- `attendance.read` (limited to own attendance)
- `assessments.read` (limited to own results, published only)
- `finance.read` (limited to own invoices)
- `library.manage` (limited to own library records)

## Permission Categories

### Platform Permissions (never assigned to school users)
- `platform.manage` - Platform administration
- `platform.users.manage` - Platform user management

### Academic Permissions
- `academics.manage` - Academic setup and management
- `students.read` - View student records
- `students.create` - Create new students
- `students.update` - Update student records
- `attendance.read` - View attendance records
- `attendance.record` - Record attendance
- `assessments.read` - View assessments and results
- `assessments.manage` - Create and manage assessments
- `results.publish` - Publish student results

### Finance Permissions
- `finance.read` - View financial records
- `finance.collect` - Collect payments
- `finance.manage` - Full finance management

### HR Permissions
- `staff.read` - View staff records
- `staff.manage` - Full staff management
- `payroll.process` - Process payroll

### Operational Permissions
- `communications.send` - Send communications
- `reports.read` - View reports
- `inventory.manage` - Manage inventory
- `procurement.manage` - Manage procurement
- `library.manage` - Manage library
- `health.manage` - Manage health records
- `transport.manage` - Manage transport
- `boarding.manage` - Manage boarding

### Settings Permissions
- `settings.manage` - School settings, users, roles, features

## Implementation Notes

1. **Scope Limitations**: Some permissions should be scoped to specific data (e.g., teacher's `students.read` should only show students in their assigned classes). This is enforced through RLS policies and server-side authorization.

2. **Platform Role Protection**: Platform roles (`super_admin`, `platform_admin`) can only be assigned by platform administrators through the platform user management interface. School administrators cannot assign platform roles.

3. **Permission Inheritance**: Roles with broader permissions (e.g., School Owner) include all permissions of more specific roles (e.g., Teacher) for their scope.

4. **Audit Trail**: All permission assignments and role changes must be logged in the audit log with the user who made the change and the timestamp.

5. **Role Expiry**: Roles can have expiry dates. When a role expires, the associated permissions are immediately revoked.

6. **Campus Restrictions**: Users can be restricted to specific campuses. This limits their data access to records associated with those campuses.
