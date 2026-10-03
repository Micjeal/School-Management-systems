export const EMPLOYEE_DIRECTORY_COLUMNS =
  "id,employee_number,employment_type,hire_date,status,people(first_name,middle_name,last_name,primary_email,primary_phone),employee_assignments!employee_assignments_employee_fk(job_title,is_primary,departments(name),campuses(name))";
export const EMPLOYEE_SELF_COLUMNS =
  "id,employee_number,employment_type,hire_date,termination_date,status,people!inner(id,first_name,middle_name,last_name,primary_email,primary_phone)";
export const EMPLOYEE_HR_COLUMNS =
  "id,person_id,employee_number,employment_type,hire_date,termination_date,status,created_at,people(id,first_name,middle_name,last_name,date_of_birth,primary_email,primary_phone)";
export const EMPLOYEE_PICKER_COLUMNS = "id,people(first_name,last_name)";
export const EMPLOYEE_PAYROLL_COLUMNS =
  "id,employee_number,employment_type,status,tax_identifier,social_security_number";
