export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          is_current: boolean
          name: string
          school_id: string
          starts_on: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          is_current?: boolean
          name: string
          school_id: string
          starts_on: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          is_current?: boolean
          name?: string
          school_id?: string
          starts_on?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_acknowledgements: {
        Row: {
          acknowledged_at: string
          announcement_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          announcement_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          announcement_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_acknowledgements_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_acknowledgements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_audiences: {
        Row: {
          announcement_id: string
          audience_type: string
          campus_id: string | null
          class_section_id: string | null
          created_at: string
          id: string
          role_id: string | null
          school_id: string
          user_id: string | null
        }
        Insert: {
          announcement_id: string
          audience_type: string
          campus_id?: string | null
          class_section_id?: string | null
          created_at?: string
          id?: string
          role_id?: string | null
          school_id: string
          user_id?: string | null
        }
        Update: {
          announcement_id?: string
          audience_type?: string
          campus_id?: string | null
          class_section_id?: string | null
          created_at?: string
          id?: string
          role_id?: string | null
          school_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_audiences_announcement_fk"
            columns: ["school_id", "announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "announcement_audiences_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_audiences_class_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "announcement_audiences_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_audiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string
          category: string
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json
          priority: string
          published_at: string | null
          published_by: string | null
          requires_acknowledgement: boolean
          school_id: string
          starts_at: string | null
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          priority?: string
          published_at?: string | null
          published_by?: string | null
          requires_acknowledgement?: boolean
          school_id: string
          starts_at?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          priority?: string
          published_at?: string | null
          published_by?: string | null
          requires_acknowledgement?: boolean
          school_id?: string
          starts_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "announcements_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_type: string
          file_path: string
          id: string
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_type: string
          file_path: string
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_type?: string
          file_path?: string
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_fk"
            columns: ["school_id", "application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "application_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          academic_year_id: string
          applicant_person_id: string
          application_number: string
          campus_id: string | null
          created_at: string
          decision: string | null
          decision_at: string | null
          decision_by: string | null
          desired_grade_level_id: string
          id: string
          metadata: Json
          notes: string | null
          school_id: string
          status: string
          submitted_at: string | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          applicant_person_id: string
          application_number: string
          campus_id?: string | null
          created_at?: string
          decision?: string | null
          decision_at?: string | null
          decision_by?: string | null
          desired_grade_level_id: string
          id?: string
          metadata?: Json
          notes?: string | null
          school_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          applicant_person_id?: string
          application_number?: string
          campus_id?: string | null
          created_at?: string
          decision?: string | null
          decision_at?: string | null
          decision_by?: string | null
          desired_grade_level_id?: string
          id?: string
          metadata?: Json
          notes?: string | null
          school_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "applications_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_decision_by_fkey"
            columns: ["decision_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_grade_fk"
            columns: ["school_id", "desired_grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "applications_person_fk"
            columns: ["school_id", "applicant_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "applications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          amount: number | null
          completed_at: string | null
          created_at: string
          currency_code: string | null
          current_step: number
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          reason: string | null
          request_type: string
          requested_by: string | null
          school_id: string
          status: string
          submitted_at: string
          updated_at: string
          version: number
        }
        Insert: {
          amount?: number | null
          completed_at?: string | null
          created_at?: string
          currency_code?: string | null
          current_step?: number
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          reason?: string | null
          request_type: string
          requested_by?: string | null
          school_id: string
          status?: string
          submitted_at?: string
          updated_at?: string
          version?: number
        }
        Update: {
          amount?: number | null
          completed_at?: string | null
          created_at?: string
          currency_code?: string | null
          current_step?: number
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          reason?: string | null
          request_type?: string
          requested_by?: string | null
          school_id?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_steps: {
        Row: {
          approval_request_id: string
          approver_role_id: string | null
          approver_user_id: string | null
          created_at: string
          decided_at: string | null
          decision: string | null
          decision_notes: string | null
          id: string
          school_id: string
          step_no: number
        }
        Insert: {
          approval_request_id: string
          approver_role_id?: string | null
          approver_user_id?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          decision_notes?: string | null
          id?: string
          school_id: string
          step_no: number
        }
        Update: {
          approval_request_id?: string
          approver_role_id?: string | null
          approver_user_id?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          decision_notes?: string | null
          id?: string
          school_id?: string
          step_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_steps_approver_role_id_fkey"
            columns: ["approver_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_steps_approver_user_id_fkey"
            columns: ["approver_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_steps_request_fk"
            columns: ["school_id", "approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      assessment_types: {
        Row: {
          code: string
          created_at: string
          default_weight: number | null
          id: string
          is_active: boolean
          is_exam: boolean
          name: string
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          default_weight?: number | null
          id?: string
          is_active?: boolean
          is_exam?: boolean
          name: string
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          default_weight?: number | null
          id?: string
          is_active?: boolean
          is_exam?: boolean
          name?: string
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_types_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          academic_year_id: string
          assessment_date: string | null
          assessment_type_id: string
          class_section_id: string
          created_at: string
          created_by: string | null
          description: string | null
          grading_scale_id: string | null
          id: string
          marks_due_at: string | null
          maximum_score: number
          published_at: string | null
          published_by: string | null
          school_id: string
          status: string
          subject_id: string
          term_id: string
          title: string
          updated_at: string
          version: number
          weight: number
        }
        Insert: {
          academic_year_id: string
          assessment_date?: string | null
          assessment_type_id: string
          class_section_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          grading_scale_id?: string | null
          id?: string
          marks_due_at?: string | null
          maximum_score: number
          published_at?: string | null
          published_by?: string | null
          school_id: string
          status?: string
          subject_id: string
          term_id: string
          title: string
          updated_at?: string
          version?: number
          weight?: number
        }
        Update: {
          academic_year_id?: string
          assessment_date?: string | null
          assessment_type_id?: string
          class_section_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          grading_scale_id?: string | null
          id?: string
          marks_due_at?: string | null
          maximum_score?: number
          published_at?: string | null
          published_by?: string | null
          school_id?: string
          status?: string
          subject_id?: string
          term_id?: string
          title?: string
          updated_at?: string
          version?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_scale_fk"
            columns: ["school_id", "grading_scale_id"]
            isOneToOne: false
            referencedRelation: "grading_scales"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "assessments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_section_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "assessments_subject_fk"
            columns: ["school_id", "subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "assessments_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "assessments_type_fk"
            columns: ["school_id", "assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "assessments_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      asset_assignments: {
        Row: {
          asset_id: string
          assigned_at: string
          assigned_by: string | null
          created_at: string
          department_id: string | null
          employee_id: string | null
          expected_return_at: string | null
          id: string
          notes: string | null
          return_condition: string | null
          returned_at: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          asset_id: string
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          department_id?: string | null
          employee_id?: string | null
          expected_return_at?: string | null
          id?: string
          notes?: string | null
          return_condition?: string | null
          returned_at?: string | null
          school_id: string
          status?: string
          student_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          asset_id?: string
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          department_id?: string | null
          employee_id?: string | null
          expected_return_at?: string | null
          id?: string
          notes?: string | null
          return_condition?: string | null
          returned_at?: string | null
          school_id?: string
          status?: string
          student_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_asset_fk"
            columns: ["school_id", "asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "asset_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_department_fk"
            columns: ["school_id", "department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "asset_assignments_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "asset_assignments_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      asset_categories: {
        Row: {
          accumulated_depreciation_account_id: string | null
          asset_account_id: string | null
          code: string
          created_at: string
          depreciation_expense_account_id: string | null
          depreciation_method: string
          id: string
          name: string
          school_id: string
          updated_at: string
          useful_life_months: number | null
          version: number
        }
        Insert: {
          accumulated_depreciation_account_id?: string | null
          asset_account_id?: string | null
          code: string
          created_at?: string
          depreciation_expense_account_id?: string | null
          depreciation_method?: string
          id?: string
          name: string
          school_id: string
          updated_at?: string
          useful_life_months?: number | null
          version?: number
        }
        Update: {
          accumulated_depreciation_account_id?: string | null
          asset_account_id?: string | null
          code?: string
          created_at?: string
          depreciation_expense_account_id?: string | null
          depreciation_method?: string
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
          useful_life_months?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_categories_accumulated_account_fk"
            columns: ["school_id", "accumulated_depreciation_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "asset_categories_asset_account_fk"
            columns: ["school_id", "asset_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "asset_categories_expense_account_fk"
            columns: ["school_id", "depreciation_expense_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "asset_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_maintenance: {
        Row: {
          asset_id: string
          completed_at: string | null
          cost: number | null
          created_at: string
          description: string
          document_path: string | null
          id: string
          maintenance_type: string
          next_due_at: string | null
          scheduled_at: string | null
          school_id: string
          started_at: string | null
          status: string
          updated_at: string
          vendor: string | null
          version: number
        }
        Insert: {
          asset_id: string
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description: string
          document_path?: string | null
          id?: string
          maintenance_type: string
          next_due_at?: string | null
          scheduled_at?: string | null
          school_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          vendor?: string | null
          version?: number
        }
        Update: {
          asset_id?: string
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          document_path?: string | null
          id?: string
          maintenance_type?: string
          next_due_at?: string | null
          scheduled_at?: string | null
          school_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          vendor?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_maintenance_asset_fk"
            columns: ["school_id", "asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_category_id: string
          asset_status: string
          asset_tag: string
          condition_status: string
          created_at: string
          description: string | null
          disposal_date: string | null
          disposal_value: number | null
          id: string
          inventory_location_id: string | null
          metadata: Json
          name: string
          purchase_cost: number | null
          purchase_date: string | null
          school_id: string
          serial_number: string | null
          supplier_id: string | null
          updated_at: string
          version: number
          warranty_expires_on: string | null
        }
        Insert: {
          asset_category_id: string
          asset_status?: string
          asset_tag: string
          condition_status?: string
          created_at?: string
          description?: string | null
          disposal_date?: string | null
          disposal_value?: number | null
          id?: string
          inventory_location_id?: string | null
          metadata?: Json
          name: string
          purchase_cost?: number | null
          purchase_date?: string | null
          school_id: string
          serial_number?: string | null
          supplier_id?: string | null
          updated_at?: string
          version?: number
          warranty_expires_on?: string | null
        }
        Update: {
          asset_category_id?: string
          asset_status?: string
          asset_tag?: string
          condition_status?: string
          created_at?: string
          description?: string | null
          disposal_date?: string | null
          disposal_value?: number | null
          id?: string
          inventory_location_id?: string | null
          metadata?: Json
          name?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          school_id?: string
          serial_number?: string | null
          supplier_id?: string | null
          updated_at?: string
          version?: number
          warranty_expires_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_category_fk"
            columns: ["school_id", "asset_category_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "assets_location_fk"
            columns: ["school_id", "inventory_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "assets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_supplier_fk"
            columns: ["school_id", "supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      attendance_corrections: {
        Row: {
          approved_by: string | null
          attendance_record_id: string
          created_at: string
          decided_at: string | null
          id: string
          new_status: string
          old_status: string
          reason: string
          requested_at: string
          requested_by: string | null
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_by?: string | null
          attendance_record_id: string
          created_at?: string
          decided_at?: string | null
          id?: string
          new_status: string
          old_status: string
          reason: string
          requested_at?: string
          requested_by?: string | null
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_by?: string | null
          attendance_record_id?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          new_status?: string
          old_status?: string
          reason?: string
          requested_at?: string
          requested_by?: string | null
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_corrections_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_record_fk"
            columns: ["school_id", "attendance_record_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_records"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "attendance_corrections_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          academic_year_id: string
          class_section_id: string
          closed_at: string | null
          closed_by: string | null
          created_at: string
          ends_at: string | null
          id: string
          notes: string | null
          opened_by: string | null
          school_id: string
          session_date: string
          session_type: string
          starts_at: string | null
          status: string
          subject_id: string | null
          term_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          class_section_id: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          opened_by?: string | null
          school_id: string
          session_date: string
          session_type?: string
          starts_at?: string | null
          status?: string
          subject_id?: string | null
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          class_section_id?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          opened_by?: string | null
          school_id?: string
          session_date?: string
          session_type?: string
          starts_at?: string | null
          status?: string
          subject_id?: string | null
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_section_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "attendance_sessions_subject_fk"
            columns: ["school_id", "subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "attendance_sessions_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "attendance_sessions_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_membership_id: string | null
          actor_user_id: string | null
          id: number
          ip_address: unknown
          new_data: Json | null
          occurred_at: string
          old_data: Json | null
          record_id: string | null
          request_id: string | null
          schema_name: string
          school_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_membership_id?: string | null
          actor_user_id?: string | null
          id?: never
          ip_address?: unknown
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string | null
          request_id?: string | null
          schema_name: string
          school_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_membership_id?: string | null
          actor_user_id?: string | null
          id?: never
          ip_address?: unknown
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string | null
          request_id?: string | null
          schema_name?: string
          school_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number_masked: string
          bank_name: string
          branch_name: string | null
          created_at: string
          currency_code: string
          financial_account_id: string
          id: string
          is_active: boolean
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          account_name: string
          account_number_masked: string
          bank_name: string
          branch_name?: string | null
          created_at?: string
          currency_code?: string
          financial_account_id: string
          id?: string
          is_active?: boolean
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          account_name?: string
          account_number_masked?: string
          bank_name?: string
          branch_name?: string | null
          created_at?: string
          currency_code?: string
          financial_account_id?: string
          id?: string
          is_active?: boolean
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_financial_fk"
            columns: ["school_id", "financial_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "bank_accounts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          balance: number | null
          bank_account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          external_reference: string | null
          id: string
          imported_at: string
          matched_payment_id: string | null
          reconciliation_status: string
          school_id: string
          transaction_date: string
          updated_at: string
          value_date: string | null
          version: number
        }
        Insert: {
          balance?: number | null
          bank_account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          external_reference?: string | null
          id?: string
          imported_at?: string
          matched_payment_id?: string | null
          reconciliation_status?: string
          school_id: string
          transaction_date: string
          updated_at?: string
          value_date?: string | null
          version?: number
        }
        Update: {
          balance?: number | null
          bank_account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          external_reference?: string | null
          id?: string
          imported_at?: string
          matched_payment_id?: string | null
          reconciliation_status?: string
          school_id?: string
          transaction_date?: string
          updated_at?: string
          value_date?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_account_fk"
            columns: ["school_id", "bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "bank_transactions_payment_fk"
            columns: ["school_id", "matched_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      boarding_assignments: {
        Row: {
          academic_year_id: string
          assigned_by: string | null
          bed_id: string
          created_at: string
          ends_on: string | null
          id: string
          notes: string | null
          school_id: string
          starts_on: string
          status: string
          student_id: string
          term_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          assigned_by?: string | null
          bed_id: string
          created_at?: string
          ends_on?: string | null
          id?: string
          notes?: string | null
          school_id: string
          starts_on: string
          status?: string
          student_id: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          assigned_by?: string | null
          bed_id?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          notes?: string | null
          school_id?: string
          starts_on?: string
          status?: string
          student_id?: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "boarding_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_assignments_bed_fk"
            columns: ["school_id", "bed_id"]
            isOneToOne: false
            referencedRelation: "boarding_beds"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "boarding_assignments_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "boarding_assignments_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "boarding_assignments_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      boarding_attendance: {
        Row: {
          attendance_date: string
          check_type: string
          created_at: string
          id: string
          notes: string | null
          recorded_at: string
          recorded_by: string | null
          school_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          attendance_date: string
          check_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          school_id: string
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          check_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          school_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boarding_attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boarding_attendance_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      boarding_beds: {
        Row: {
          bed_number: string
          created_at: string
          dormitory_id: string
          id: string
          notes: string | null
          school_id: string
          status: string
          updated_at: string
        }
        Insert: {
          bed_number: string
          created_at?: string
          dormitory_id: string
          id?: string
          notes?: string | null
          school_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          bed_number?: string
          created_at?: string
          dormitory_id?: string
          id?: string
          notes?: string | null
          school_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boarding_beds_dormitory_fk"
            columns: ["school_id", "dormitory_id"]
            isOneToOne: false
            referencedRelation: "dormitories"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      campuses: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          code: string
          country_code: string
          created_at: string
          district: string | null
          email: string | null
          id: string
          is_active: boolean
          is_main: boolean
          metadata: Json
          name: string
          phone: string | null
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code: string
          country_code?: string
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_main?: boolean
          metadata?: Json
          name: string
          phone?: string | null
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          code?: string
          country_code?: string
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_main?: boolean
          metadata?: Json
          name?: string
          phone?: string | null
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "campuses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      class_groups: {
        Row: {
          academic_year_id: string
          campus_id: string | null
          capacity: number | null
          code: string
          created_at: string
          grade_level_id: string
          id: string
          name: string
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          campus_id?: string | null
          capacity?: number | null
          code: string
          created_at?: string
          grade_level_id: string
          id?: string
          name: string
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          campus_id?: string | null
          capacity?: number | null
          code?: string
          created_at?: string
          grade_level_id?: string
          id?: string
          name?: string
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_groups_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_groups_grade_fk"
            columns: ["school_id", "grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "class_groups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_groups_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      class_sections: {
        Row: {
          capacity: number | null
          class_group_id: string
          code: string
          created_at: string
          id: string
          name: string
          room_id: string | null
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          capacity?: number | null
          class_group_id: string
          code: string
          created_at?: string
          id?: string
          name: string
          room_id?: string | null
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          capacity?: number | null
          class_group_id?: string
          code?: string
          created_at?: string
          id?: string
          name?: string
          room_id?: string | null
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_sections_group_fk"
            columns: ["school_id", "class_group_id"]
            isOneToOne: false
            referencedRelation: "class_groups"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "class_sections_room_fk"
            columns: ["school_id", "room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "class_sections_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_visits: {
        Row: {
          attended_by_employee_id: string | null
          complaint: string
          confidential: boolean
          created_at: string
          diagnosis: string | null
          disposition: string
          followup_at: string | null
          guardian_notified_at: string | null
          id: string
          observations: string | null
          referred_to: string | null
          school_id: string
          student_id: string
          temperature_c: number | null
          treatment: string | null
          updated_at: string
          version: number
          visited_at: string
        }
        Insert: {
          attended_by_employee_id?: string | null
          complaint: string
          confidential?: boolean
          created_at?: string
          diagnosis?: string | null
          disposition?: string
          followup_at?: string | null
          guardian_notified_at?: string | null
          id?: string
          observations?: string | null
          referred_to?: string | null
          school_id: string
          student_id: string
          temperature_c?: number | null
          treatment?: string | null
          updated_at?: string
          version?: number
          visited_at?: string
        }
        Update: {
          attended_by_employee_id?: string | null
          complaint?: string
          confidential?: boolean
          created_at?: string
          diagnosis?: string | null
          disposition?: string
          followup_at?: string | null
          guardian_notified_at?: string | null
          id?: string
          observations?: string | null
          referred_to?: string | null
          school_id?: string
          student_id?: string
          temperature_c?: number | null
          treatment?: string | null
          updated_at?: string
          version?: number
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_visits_employee_fk"
            columns: ["school_id", "attended_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "clinic_visits_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          is_muted: boolean
          joined_at: string
          last_read_at: string | null
          left_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          is_muted?: boolean
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          is_muted?: boolean
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string
          created_at: string
          created_by: string | null
          id: string
          is_closed: boolean
          school_id: string
          title: string | null
          updated_at: string
          version: number
        }
        Insert: {
          conversation_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_closed?: boolean
          school_id: string
          title?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          conversation_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_closed?: boolean
          school_id?: string
          title?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      counseling_case_notes: {
        Row: {
          confidential: boolean
          counseling_case_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string
          note_type: string
          school_id: string
        }
        Insert: {
          confidential?: boolean
          counseling_case_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          note_type?: string
          school_id: string
        }
        Update: {
          confidential?: boolean
          counseling_case_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          note_type?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "counseling_case_notes_case_fk"
            columns: ["school_id", "counseling_case_id"]
            isOneToOne: false
            referencedRelation: "counseling_cases"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "counseling_case_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      counseling_cases: {
        Row: {
          assigned_to_employee_id: string | null
          case_number: string
          category: string
          closed_at: string | null
          created_at: string
          id: string
          opened_at: string
          opened_by: string | null
          parent_visible: boolean
          priority: string
          referral_source: string | null
          school_id: string
          status: string
          student_id: string
          summary: string | null
          updated_at: string
          version: number
        }
        Insert: {
          assigned_to_employee_id?: string | null
          case_number: string
          category: string
          closed_at?: string | null
          created_at?: string
          id?: string
          opened_at?: string
          opened_by?: string | null
          parent_visible?: boolean
          priority?: string
          referral_source?: string | null
          school_id: string
          status?: string
          student_id: string
          summary?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          assigned_to_employee_id?: string | null
          case_number?: string
          category?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          opened_at?: string
          opened_by?: string | null
          parent_visible?: boolean
          priority?: string
          referral_source?: string | null
          school_id?: string
          status?: string
          student_id?: string
          summary?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "counseling_cases_employee_fk"
            columns: ["school_id", "assigned_to_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "counseling_cases_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counseling_cases_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      departments: {
        Row: {
          campus_id: string | null
          code: string
          created_at: string
          department_type: string
          id: string
          is_active: boolean
          name: string
          parent_department_id: string | null
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          campus_id?: string | null
          code: string
          created_at?: string
          department_type?: string
          id?: string
          is_active?: boolean
          name: string
          parent_department_id?: string | null
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          campus_id?: string | null
          code?: string
          created_at?: string
          department_type?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_department_id?: string | null
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "departments_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      discipline_actions: {
        Row: {
          action_type: string
          appeal_status: string | null
          assigned_by: string | null
          completed_at: string | null
          created_at: string
          description: string
          ends_on: string | null
          id: string
          incident_id: string
          parent_notified_at: string | null
          school_id: string
          starts_on: string | null
          status: string
          student_id: string
          updated_at: string
          version: number
        }
        Insert: {
          action_type: string
          appeal_status?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          ends_on?: string | null
          id?: string
          incident_id: string
          parent_notified_at?: string | null
          school_id: string
          starts_on?: string | null
          status?: string
          student_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          action_type?: string
          appeal_status?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          ends_on?: string | null
          id?: string
          incident_id?: string
          parent_notified_at?: string | null
          school_id?: string
          starts_on?: string | null
          status?: string
          student_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "discipline_actions_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_actions_incident_fk"
            columns: ["school_id", "incident_id"]
            isOneToOne: false
            referencedRelation: "discipline_incidents"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "discipline_actions_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      discipline_incident_students: {
        Row: {
          created_at: string
          id: string
          incident_id: string
          involvement_type: string
          school_id: string
          statement: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          incident_id: string
          involvement_type?: string
          school_id: string
          statement?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          incident_id?: string
          involvement_type?: string
          school_id?: string
          statement?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discipline_incident_students_incident_fk"
            columns: ["school_id", "incident_id"]
            isOneToOne: false
            referencedRelation: "discipline_incidents"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "discipline_incident_students_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      discipline_incidents: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          incident_number: string
          location: string | null
          occurred_at: string
          parent_visible: boolean
          reported_by: string | null
          resolution_summary: string | null
          resolved_at: string | null
          school_id: string
          severity: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          incident_number: string
          location?: string | null
          occurred_at: string
          parent_visible?: boolean
          reported_by?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          school_id: string
          severity?: string
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          incident_number?: string
          location?: string | null
          occurred_at?: string
          parent_visible?: boolean
          reported_by?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          school_id?: string
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "discipline_incidents_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_incidents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      dormitories: {
        Row: {
          capacity: number
          code: string
          created_at: string
          floor: string | null
          hostel_id: string
          id: string
          name: string
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          capacity: number
          code: string
          created_at?: string
          floor?: string | null
          hostel_id: string
          id?: string
          name: string
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          capacity?: number
          code?: string
          created_at?: string
          floor?: string | null
          hostel_id?: string
          id?: string
          name?: string
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "dormitories_hostel_fk"
            columns: ["school_id", "hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      employee_assignments: {
        Row: {
          campus_id: string | null
          created_at: string
          department_id: string | null
          employee_id: string
          ends_on: string | null
          id: string
          is_primary: boolean
          job_title: string
          reports_to_employee_id: string | null
          school_id: string
          starts_on: string
          updated_at: string
        }
        Insert: {
          campus_id?: string | null
          created_at?: string
          department_id?: string | null
          employee_id: string
          ends_on?: string | null
          id?: string
          is_primary?: boolean
          job_title: string
          reports_to_employee_id?: string | null
          school_id: string
          starts_on: string
          updated_at?: string
        }
        Update: {
          campus_id?: string | null
          created_at?: string
          department_id?: string | null
          employee_id?: string
          ends_on?: string | null
          id?: string
          is_primary?: boolean
          job_title?: string
          reports_to_employee_id?: string | null
          school_id?: string
          starts_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_assignments_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assignments_department_fk"
            columns: ["school_id", "department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "employee_assignments_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "employee_assignments_manager_fk"
            columns: ["school_id", "reports_to_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      employee_pay_components: {
        Row: {
          amount: number | null
          created_at: string
          employee_id: string
          ends_on: string | null
          id: string
          is_active: boolean
          metadata: Json
          payroll_component_id: string
          percentage_rate: number | null
          school_id: string
          starts_on: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          employee_id: string
          ends_on?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          payroll_component_id: string
          percentage_rate?: number | null
          school_id: string
          starts_on: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          employee_id?: string
          ends_on?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          payroll_component_id?: string
          percentage_rate?: number | null
          school_id?: string
          starts_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_pay_components_component_fk"
            columns: ["school_id", "payroll_component_id"]
            isOneToOne: false
            referencedRelation: "payroll_components"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "employee_pay_components_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      employee_qualifications: {
        Row: {
          awarded_on: string | null
          certificate_path: string | null
          created_at: string
          employee_id: string
          expires_on: string | null
          field_of_study: string | null
          id: string
          institution: string
          qualification_name: string
          qualification_type: string
          school_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          awarded_on?: string | null
          certificate_path?: string | null
          created_at?: string
          employee_id: string
          expires_on?: string | null
          field_of_study?: string | null
          id?: string
          institution: string
          qualification_name: string
          qualification_type: string
          school_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          awarded_on?: string | null
          certificate_path?: string | null
          created_at?: string
          employee_id?: string
          expires_on?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string
          qualification_name?: string
          qualification_type?: string
          school_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_qualifications_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "employee_qualifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          employee_number: string
          employment_type: string
          hire_date: string
          id: string
          metadata: Json
          person_id: string
          school_id: string
          social_security_number: string | null
          status: string
          tax_identifier: string | null
          termination_date: string | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          employee_number: string
          employment_type?: string
          hire_date: string
          id?: string
          metadata?: Json
          person_id: string
          school_id: string
          social_security_number?: string | null
          status?: string
          tax_identifier?: string | null
          termination_date?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          employee_number?: string
          employment_type?: string
          hire_date?: string
          id?: string
          metadata?: Json
          person_id?: string
          school_id?: string
          social_security_number?: string | null
          status?: string
          tax_identifier?: string | null
          termination_date?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "employees_person_fk"
            columns: ["school_id", "person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "employees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_contracts: {
        Row: {
          base_salary: number
          contract_number: string
          contract_type: string
          created_at: string
          currency_code: string
          employee_id: string
          ends_on: string | null
          id: string
          notice_period_days: number
          pay_frequency: string
          probation_ends_on: string | null
          school_id: string
          starts_on: string
          status: string
          terms_path: string | null
          updated_at: string
          version: number
        }
        Insert: {
          base_salary?: number
          contract_number: string
          contract_type: string
          created_at?: string
          currency_code?: string
          employee_id: string
          ends_on?: string | null
          id?: string
          notice_period_days?: number
          pay_frequency?: string
          probation_ends_on?: string | null
          school_id: string
          starts_on: string
          status?: string
          terms_path?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          base_salary?: number
          contract_number?: string
          contract_type?: string
          created_at?: string
          currency_code?: string
          employee_id?: string
          ends_on?: string | null
          id?: string
          notice_period_days?: number
          pay_frequency?: string
          probation_ends_on?: string | null
          school_id?: string
          starts_on?: string
          status?: string
          terms_path?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "employment_contracts_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          expires_at: string | null
          export_type: string
          file_path: string | null
          filters: Json
          format: string
          id: string
          requested_by: string | null
          row_count: number | null
          school_id: string
          started_at: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          export_type: string
          file_path?: string | null
          filters?: Json
          format: string
          id?: string
          requested_by?: string | null
          row_count?: number | null
          school_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          file_path?: string | null
          filters?: Json
          format?: string
          id?: string
          requested_by?: string | null
          row_count?: number | null
          school_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "export_jobs_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_jobs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_items: {
        Row: {
          code: string
          created_at: string
          description: string | null
          fee_category_id: string
          id: string
          is_active: boolean
          is_mandatory: boolean
          is_refundable: boolean
          name: string
          revenue_account_id: string | null
          school_id: string
          tax_rate: number
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          fee_category_id: string
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          is_refundable?: boolean
          name: string
          revenue_account_id?: string | null
          school_id: string
          tax_rate?: number
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          fee_category_id?: string
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          is_refundable?: boolean
          name?: string
          revenue_account_id?: string | null
          school_id?: string
          tax_rate?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_items_category_fk"
            columns: ["school_id", "fee_category_id"]
            isOneToOne: false
            referencedRelation: "fee_categories"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "fee_items_revenue_fk"
            columns: ["school_id", "revenue_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "fee_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure_items: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          fee_item_id: string
          fee_structure_id: string
          id: string
          installment_no: number | null
          is_optional: boolean
          school_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          fee_item_id: string
          fee_structure_id: string
          id?: string
          installment_no?: number | null
          is_optional?: boolean
          school_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          fee_item_id?: string
          fee_structure_id?: string
          id?: string
          installment_no?: number | null
          is_optional?: boolean
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structure_items_item_fk"
            columns: ["school_id", "fee_item_id"]
            isOneToOne: false
            referencedRelation: "fee_items"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "fee_structure_items_structure_fk"
            columns: ["school_id", "fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year_id: string
          campus_id: string | null
          created_at: string
          currency_code: string
          effective_from: string | null
          effective_to: string | null
          grade_level_id: string | null
          id: string
          name: string
          school_id: string
          status: string
          term_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          campus_id?: string | null
          created_at?: string
          currency_code?: string
          effective_from?: string | null
          effective_to?: string | null
          grade_level_id?: string | null
          id?: string
          name: string
          school_id: string
          status?: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          campus_id?: string | null
          created_at?: string
          currency_code?: string
          effective_from?: string | null
          effective_to?: string | null
          grade_level_id?: string | null
          id?: string
          name?: string
          school_id?: string
          status?: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_grade_fk"
            columns: ["school_id", "grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "fee_structures_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      file_access_logs: {
        Row: {
          action: string
          actor_membership_id: string | null
          actor_user_id: string | null
          file_source: string
          id: string
          ip_address: unknown
          metadata: Json
          occurred_at: string
          reason: string | null
          record_id: string
          request_id: string | null
          result: string
          school_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_membership_id?: string | null
          actor_user_id?: string | null
          file_source: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          occurred_at?: string
          reason?: string | null
          record_id: string
          request_id?: string | null
          result?: string
          school_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_membership_id?: string | null
          actor_user_id?: string | null
          file_source?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          occurred_at?: string
          reason?: string | null
          record_id?: string
          request_id?: string | null
          result?: string
          school_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          account_type: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_control_account: boolean
          name: string
          normal_balance: string
          parent_account_id: string | null
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          account_type: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_control_account?: boolean
          name: string
          normal_balance: string
          parent_account_id?: string | null
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          account_type?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_control_account?: boolean
          name?: string
          normal_balance?: string
          parent_account_id?: string | null
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_parent_fk"
            columns: ["school_id", "parent_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "financial_accounts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipt_items: {
        Row: {
          condition_status: string
          created_at: string
          goods_receipt_id: string
          id: string
          inventory_item_id: string
          purchase_order_item_id: string
          quantity_received: number
          rejection_reason: string | null
          school_id: string
          unit_cost: number
        }
        Insert: {
          condition_status?: string
          created_at?: string
          goods_receipt_id: string
          id?: string
          inventory_item_id: string
          purchase_order_item_id: string
          quantity_received: number
          rejection_reason?: string | null
          school_id: string
          unit_cost: number
        }
        Update: {
          condition_status?: string
          created_at?: string
          goods_receipt_id?: string
          id?: string
          inventory_item_id?: string
          purchase_order_item_id?: string
          quantity_received?: number
          rejection_reason?: string | null
          school_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_item_fk"
            columns: ["school_id", "inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "goods_receipt_items_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_receipt_fk"
            columns: ["school_id", "goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          created_at: string
          delivery_note_number: string | null
          goods_receipt_number: string
          id: string
          inventory_location_id: string
          notes: string | null
          purchase_order_id: string
          received_at: string
          received_by: string | null
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          delivery_note_number?: string | null
          goods_receipt_number: string
          id?: string
          inventory_location_id: string
          notes?: string | null
          purchase_order_id: string
          received_at?: string
          received_by?: string | null
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          delivery_note_number?: string | null
          goods_receipt_number?: string
          id?: string
          inventory_location_id?: string
          notes?: string | null
          purchase_order_id?: string
          received_at?: string
          received_by?: string | null
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_location_fk"
            columns: ["school_id", "inventory_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "goods_receipts_order_fk"
            columns: ["school_id", "purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "goods_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_levels: {
        Row: {
          code: string
          created_at: string
          education_stage: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          sequence_no: number
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          education_stage?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          sequence_no: number
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          education_stage?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          sequence_no?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "grade_levels_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_scale_items: {
        Row: {
          created_at: string
          descriptor: string | null
          grade: string
          grade_point: number | null
          grading_scale_id: string
          id: string
          max_score: number
          min_score: number
          remarks: string | null
          school_id: string
          sequence_no: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          descriptor?: string | null
          grade: string
          grade_point?: number | null
          grading_scale_id: string
          id?: string
          max_score: number
          min_score: number
          remarks?: string | null
          school_id: string
          sequence_no: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          descriptor?: string | null
          grade?: string
          grade_point?: number | null
          grading_scale_id?: string
          id?: string
          max_score?: number
          min_score?: number
          remarks?: string | null
          school_id?: string
          sequence_no?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grading_scale_items_scale_fk"
            columns: ["school_id", "grading_scale_id"]
            isOneToOne: false
            referencedRelation: "grading_scales"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      grading_scales: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "grading_scales_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          created_at: string
          employer: string | null
          id: string
          occupation: string | null
          person_id: string
          portal_enabled: boolean
          preferred_contact_method: string
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          employer?: string | null
          id?: string
          occupation?: string | null
          person_id: string
          portal_enabled?: boolean
          preferred_contact_method?: string
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          employer?: string | null
          id?: string
          occupation?: string | null
          person_id?: string
          portal_enabled?: boolean
          preferred_contact_method?: string
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "guardians_person_fk"
            columns: ["school_id", "person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "guardians_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          campus_id: string | null
          code: string
          created_at: string
          gender_policy: string
          id: string
          name: string
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          campus_id?: string | null
          code: string
          created_at?: string
          gender_policy?: string
          id?: string
          name: string
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          campus_id?: string | null
          code?: string
          created_at?: string
          gender_policy?: string
          id?: string
          name?: string
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "hostels_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostels_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          error_summary: string | null
          failed_rows: number
          file_path: string
          id: string
          import_type: string
          options: Json
          processed_rows: number
          requested_by: string | null
          school_id: string
          started_at: string | null
          status: string
          success_rows: number
          total_rows: number
          updated_at: string
          version: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_summary?: string | null
          failed_rows?: number
          file_path: string
          id?: string
          import_type: string
          options?: Json
          processed_rows?: number
          requested_by?: string | null
          school_id: string
          started_at?: string | null
          status?: string
          success_rows?: number
          total_rows?: number
          updated_at?: string
          version?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_summary?: string | null
          failed_rows?: number
          file_path?: string
          id?: string
          import_type?: string
          options?: Json
          processed_rows?: number
          requested_by?: string | null
          school_id?: string
          started_at?: string | null
          status?: string
          success_rows?: number
          total_rows?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      import_rows: {
        Row: {
          entity_id: string | null
          errors: Json
          id: number
          import_batch_id: string
          normalized_data: Json | null
          processed_at: string | null
          raw_data: Json
          row_number: number
          school_id: string
          status: string
        }
        Insert: {
          entity_id?: string | null
          errors?: Json
          id?: never
          import_batch_id: string
          normalized_data?: Json | null
          processed_at?: string | null
          raw_data: Json
          row_number: number
          school_id: string
          status?: string
        }
        Update: {
          entity_id?: string | null
          errors?: Json
          id?: never
          import_batch_id?: string
          normalized_data?: Json | null
          processed_at?: string | null
          raw_data?: Json
          row_number?: number
          school_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_rows_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_school_batch_fk"
            columns: ["school_id", "import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "import_rows_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          integration_type: string
          last_connected_at: string | null
          last_error: string | null
          name: string
          provider: string
          school_id: string | null
          secret_reference: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          integration_type: string
          last_connected_at?: string | null
          last_error?: string | null
          name: string
          provider: string
          school_id?: string | null
          secret_reference?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          integration_type?: string
          last_connected_at?: string | null
          last_error?: string | null
          name?: string
          provider?: string
          school_id?: string | null
          secret_reference?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_events: {
        Row: {
          direction: string
          error_message: string | null
          event_type: string
          id: number
          idempotency_key: string | null
          integration_connection_id: string | null
          next_retry_at: string | null
          payload: Json
          payload_hash: string | null
          processed_at: string | null
          provider_event_id: string | null
          received_at: string
          retry_count: number
          school_id: string | null
          status: string
        }
        Insert: {
          direction: string
          error_message?: string | null
          event_type: string
          id?: never
          idempotency_key?: string | null
          integration_connection_id?: string | null
          next_retry_at?: string | null
          payload?: Json
          payload_hash?: string | null
          processed_at?: string | null
          provider_event_id?: string | null
          received_at?: string
          retry_count?: number
          school_id?: string | null
          status?: string
        }
        Update: {
          direction?: string
          error_message?: string | null
          event_type?: string
          id?: never
          idempotency_key?: string | null
          integration_connection_id?: string | null
          next_retry_at?: string | null
          payload?: Json
          payload_hash?: string | null
          processed_at?: string | null
          provider_event_id?: string | null
          received_at?: string
          retry_count?: number
          school_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_integration_connection_id_fkey"
            columns: ["integration_connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          preferred_supplier_id: string | null
          reorder_level: number
          school_id: string
          standard_cost: number | null
          status: string
          track_stock: boolean
          unit_of_measure: string
          updated_at: string
          version: number
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          preferred_supplier_id?: string | null
          reorder_level?: number
          school_id: string
          standard_cost?: number | null
          status?: string
          track_stock?: boolean
          unit_of_measure?: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          preferred_supplier_id?: string | null
          reorder_level?: number
          school_id?: string
          standard_cost?: number | null
          status?: string
          track_stock?: boolean
          unit_of_measure?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_supplier_fk"
            columns: ["school_id", "preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          campus_id: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          location_type: string
          name: string
          parent_location_id: string | null
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          campus_id?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_type?: string
          name: string
          parent_location_id?: string | null
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          campus_id?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location_type?: string
          name?: string
          parent_location_id?: string | null
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_locations_parent_fk"
            columns: ["school_id", "parent_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "inventory_locations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock_balances: {
        Row: {
          average_cost: number
          inventory_item_id: string
          inventory_location_id: string
          quantity_on_hand: number
          quantity_reserved: number
          school_id: string
          updated_at: string
        }
        Insert: {
          average_cost?: number
          inventory_item_id: string
          inventory_location_id: string
          quantity_on_hand?: number
          quantity_reserved?: number
          school_id: string
          updated_at?: string
        }
        Update: {
          average_cost?: number
          inventory_item_id?: string
          inventory_location_id?: string
          quantity_on_hand?: number
          quantity_reserved?: number
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_balances_item_fk"
            columns: ["school_id", "inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "inventory_stock_balances_location_fk"
            columns: ["school_id", "inventory_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          created_at: string
          description: string
          discount_amount: number
          fee_item_id: string
          id: string
          invoice_id: string
          line_total: number | null
          metadata: Json
          quantity: number
          revenue_account_id: string | null
          school_id: string
          tax_amount: number
          unit_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount_amount?: number
          fee_item_id: string
          id?: string
          invoice_id: string
          line_total?: number | null
          metadata?: Json
          quantity?: number
          revenue_account_id?: string | null
          school_id: string
          tax_amount?: number
          unit_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_amount?: number
          fee_item_id?: string
          id?: string
          invoice_id?: string
          line_total?: number | null
          metadata?: Json
          quantity?: number
          revenue_account_id?: string | null
          school_id?: string
          tax_amount?: number
          unit_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_fee_item_fk"
            columns: ["school_id", "fee_item_id"]
            isOneToOne: false
            referencedRelation: "fee_items"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_fk"
            columns: ["school_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "invoice_lines_revenue_fk"
            columns: ["school_id", "revenue_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      invoices: {
        Row: {
          academic_year_id: string
          balance_due: number | null
          created_at: string
          credited_amount: number
          currency_code: string
          discount_amount: number
          due_date: string | null
          id: string
          idempotency_key: string | null
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          posted_at: string | null
          posted_by: string | null
          school_id: string
          status: string
          student_id: string
          subtotal: number
          tax_amount: number
          term_id: string | null
          total_amount: number
          updated_at: string
          version: number
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          academic_year_id: string
          balance_due?: number | null
          created_at?: string
          credited_amount?: number
          currency_code?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          idempotency_key?: string | null
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number
          posted_at?: string | null
          posted_by?: string | null
          school_id: string
          status?: string
          student_id: string
          subtotal?: number
          tax_amount?: number
          term_id?: string | null
          total_amount?: number
          updated_at?: string
          version?: number
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          academic_year_id?: string
          balance_due?: number | null
          created_at?: string
          credited_amount?: number
          currency_code?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          idempotency_key?: string | null
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number
          posted_at?: string | null
          posted_by?: string | null
          school_id?: string
          status?: string
          student_id?: string
          subtotal?: number
          tax_amount?: number
          term_id?: string | null
          total_amount?: number
          updated_at?: string
          version?: number
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "invoices_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "invoices_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          currency_code: string
          description: string
          entry_date: string
          entry_number: string
          id: string
          posted_at: string | null
          posted_by: string | null
          reversal_reason: string | null
          reversed_entry_id: string | null
          school_id: string
          source_id: string | null
          source_type: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          currency_code?: string
          description: string
          entry_date?: string
          entry_number: string
          id?: string
          posted_at?: string | null
          posted_by?: string | null
          reversal_reason?: string | null
          reversed_entry_id?: string | null
          school_id: string
          source_id?: string | null
          source_type: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          currency_code?: string
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          posted_at?: string | null
          posted_by?: string | null
          reversal_reason?: string | null
          reversed_entry_id?: string | null
          school_id?: string
          source_id?: string | null
          source_type?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_reversal_fk"
            columns: ["school_id", "reversed_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "journal_entries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          journal_entry_id: string
          school_id: string
          student_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id: string
          school_id: string
          student_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
          school_id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_fk"
            columns: ["school_id", "account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "journal_lines_entry_fk"
            columns: ["school_id", "journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "journal_lines_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          document_path: string | null
          employee_id: string
          ends_on: string
          id: string
          leave_type_id: string
          reason: string | null
          requested_at: string
          requested_days: number
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          starts_on: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          document_path?: string | null
          employee_id: string
          ends_on: string
          id?: string
          leave_type_id: string
          reason?: string | null
          requested_at?: string
          requested_days: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          starts_on: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          document_path?: string | null
          employee_id?: string
          ends_on?: string
          id?: string
          leave_type_id?: string
          reason?: string | null
          requested_at?: string
          requested_days?: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          starts_on?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_type_fk"
            columns: ["school_id", "leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      leave_types: {
        Row: {
          allows_carry_forward: boolean
          annual_entitlement_days: number | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_paid: boolean
          max_carry_forward_days: number | null
          name: string
          requires_document: boolean
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          allows_carry_forward?: boolean
          annual_entitlement_days?: number | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          max_carry_forward_days?: number | null
          name: string
          requires_document?: boolean
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          allows_carry_forward?: boolean
          annual_entitlement_days?: number | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          max_carry_forward_days?: number | null
          name?: string
          requires_document?: boolean
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      library_authors: {
        Row: {
          biography: string | null
          created_at: string
          id: string
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          biography?: string | null
          created_at?: string
          id?: string
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          biography?: string | null
          created_at?: string
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_authors_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      library_copies: {
        Row: {
          accession_number: string
          acquired_on: string | null
          acquisition_cost: number | null
          barcode: string | null
          campus_id: string | null
          circulation_status: string
          condition_status: string
          created_at: string
          id: string
          library_item_id: string
          notes: string | null
          school_id: string
          shelf_location: string | null
          updated_at: string
          version: number
        }
        Insert: {
          accession_number: string
          acquired_on?: string | null
          acquisition_cost?: number | null
          barcode?: string | null
          campus_id?: string | null
          circulation_status?: string
          condition_status?: string
          created_at?: string
          id?: string
          library_item_id: string
          notes?: string | null
          school_id: string
          shelf_location?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          accession_number?: string
          acquired_on?: string | null
          acquisition_cost?: number | null
          barcode?: string | null
          campus_id?: string | null
          circulation_status?: string
          condition_status?: string
          created_at?: string
          id?: string
          library_item_id?: string
          notes?: string | null
          school_id?: string
          shelf_location?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "library_copies_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_copies_item_fk"
            columns: ["school_id", "library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      library_fines: {
        Row: {
          amount: number
          assessed_at: string
          created_at: string
          employee_id: string | null
          fine_type: string
          id: string
          library_loan_id: string
          paid_at: string | null
          reason: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
          waived_at: string | null
          waived_by: string | null
        }
        Insert: {
          amount: number
          assessed_at?: string
          created_at?: string
          employee_id?: string | null
          fine_type: string
          id?: string
          library_loan_id: string
          paid_at?: string | null
          reason?: string | null
          school_id: string
          status?: string
          student_id?: string | null
          updated_at?: string
          version?: number
          waived_at?: string | null
          waived_by?: string | null
        }
        Update: {
          amount?: number
          assessed_at?: string
          created_at?: string
          employee_id?: string | null
          fine_type?: string
          id?: string
          library_loan_id?: string
          paid_at?: string | null
          reason?: string | null
          school_id?: string
          status?: string
          student_id?: string | null
          updated_at?: string
          version?: number
          waived_at?: string | null
          waived_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_fines_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "library_fines_loan_fk"
            columns: ["school_id", "library_loan_id"]
            isOneToOne: false
            referencedRelation: "library_loans"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "library_fines_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "library_fines_waived_by_fkey"
            columns: ["waived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      library_item_authors: {
        Row: {
          author_id: string
          library_item_id: string
          sequence_no: number
        }
        Insert: {
          author_id: string
          library_item_id: string
          sequence_no?: number
        }
        Update: {
          author_id?: string
          library_item_id?: string
          sequence_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "library_item_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "library_authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_item_authors_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          cover_path: string | null
          created_at: string
          description: string | null
          edition: string | null
          id: string
          is_active: boolean
          isbn: string | null
          item_type: string
          language: string
          loan_period_days: number
          max_renewals: number
          metadata: Json
          publication_year: number | null
          publisher: string | null
          renewable: boolean
          school_id: string
          subject_category: string | null
          subtitle: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          cover_path?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          id?: string
          is_active?: boolean
          isbn?: string | null
          item_type?: string
          language?: string
          loan_period_days?: number
          max_renewals?: number
          metadata?: Json
          publication_year?: number | null
          publisher?: string | null
          renewable?: boolean
          school_id: string
          subject_category?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          cover_path?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          id?: string
          is_active?: boolean
          isbn?: string | null
          item_type?: string
          language?: string
          loan_period_days?: number
          max_renewals?: number
          metadata?: Json
          publication_year?: number | null
          publisher?: string | null
          renewable?: boolean
          school_id?: string
          subject_category?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "library_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      library_loans: {
        Row: {
          borrowed_at: string
          created_at: string
          due_at: string
          employee_id: string | null
          id: string
          issued_by: string | null
          library_copy_id: string
          notes: string | null
          received_by: string | null
          renewal_count: number
          return_condition: string | null
          returned_at: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          borrowed_at?: string
          created_at?: string
          due_at: string
          employee_id?: string | null
          id?: string
          issued_by?: string | null
          library_copy_id: string
          notes?: string | null
          received_by?: string | null
          renewal_count?: number
          return_condition?: string | null
          returned_at?: string | null
          school_id: string
          status?: string
          student_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          borrowed_at?: string
          created_at?: string
          due_at?: string
          employee_id?: string | null
          id?: string
          issued_by?: string | null
          library_copy_id?: string
          notes?: string | null
          received_by?: string | null
          renewal_count?: number
          return_condition?: string | null
          returned_at?: string | null
          school_id?: string
          status?: string
          student_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "library_loans_copy_fk"
            columns: ["school_id", "library_copy_id"]
            isOneToOne: false
            referencedRelation: "library_copies"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "library_loans_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "library_loans_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      mark_entries: {
        Row: {
          assessment_id: string
          created_at: string
          entered_at: string | null
          entered_by: string | null
          id: string
          is_absent: boolean
          is_exempt: boolean
          moderated_at: string | null
          moderated_by: string | null
          remarks: string | null
          school_id: string
          score: number | null
          status: string
          student_id: string
          updated_at: string
          version: number
        }
        Insert: {
          assessment_id: string
          created_at?: string
          entered_at?: string | null
          entered_by?: string | null
          id?: string
          is_absent?: boolean
          is_exempt?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          remarks?: string | null
          school_id: string
          score?: number | null
          status?: string
          student_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          assessment_id?: string
          created_at?: string
          entered_at?: string | null
          entered_by?: string | null
          id?: string
          is_absent?: boolean
          is_exempt?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          remarks?: string | null
          school_id?: string
          score?: number | null
          status?: string
          student_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "mark_entries_assessment_fk"
            columns: ["school_id", "assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "mark_entries_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mark_entries_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mark_entries_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      medical_conditions: {
        Row: {
          code: string
          condition_type: string
          created_at: string
          description: string | null
          id: string
          name: string
          school_id: string | null
        }
        Insert: {
          code: string
          condition_type?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          school_id?: string | null
        }
        Update: {
          code?: string
          condition_type?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_conditions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_administrations: {
        Row: {
          administered_at: string
          administered_by_employee_id: string | null
          clinic_visit_id: string | null
          created_at: string
          dosage: string
          guardian_authorization_reference: string | null
          id: string
          medication_name: string
          reaction_notes: string | null
          route: string | null
          school_id: string
          student_id: string
        }
        Insert: {
          administered_at?: string
          administered_by_employee_id?: string | null
          clinic_visit_id?: string | null
          created_at?: string
          dosage: string
          guardian_authorization_reference?: string | null
          id?: string
          medication_name: string
          reaction_notes?: string | null
          route?: string | null
          school_id: string
          student_id: string
        }
        Update: {
          administered_at?: string
          administered_by_employee_id?: string | null
          clinic_visit_id?: string | null
          created_at?: string
          dosage?: string
          guardian_authorization_reference?: string | null
          id?: string
          medication_name?: string
          reaction_notes?: string | null
          route?: string | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_admin_employee_fk"
            columns: ["school_id", "administered_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "medication_admin_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "medication_admin_visit_fk"
            columns: ["school_id", "clinic_visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visits"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      membership_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          membership_id: string
          role_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          membership_id: string
          role_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          membership_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_roles_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "school_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          message_id: string
          mime_type: string | null
          school_id: string
          size_bytes: number | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          message_id: string
          mime_type?: string | null
          school_id: string
          size_bytes?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          message_id?: string
          mime_type?: string | null
          school_id?: string
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: string
          metadata: Json
          reply_to_message_id: string | null
          school_id: string
          sender_user_id: string | null
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json
          reply_to_message_id?: string | null
          school_id: string
          sender_user_id?: string | null
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json
          reply_to_message_id?: string | null
          school_id?: string
          sender_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_fk"
            columns: ["school_id", "conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          last_attempt_at: string | null
          metadata: Json
          notification_id: string | null
          provider: string | null
          provider_message_id: string | null
          recipient: string
          school_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          channel: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json
          notification_id?: string | null
          provider?: string | null
          provider_message_id?: string | null
          recipient: string
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json
          notification_id?: string | null
          provider?: string | null
          provider_message_id?: string | null
          recipient?: string
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_deliveries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_template: string
          channel: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          school_id: string | null
          subject_template: string | null
          updated_at: string
          variables: Json
          version: number
        }
        Insert: {
          body_template: string
          channel: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          school_id?: string | null
          subject_template?: string | null
          updated_at?: string
          variables?: Json
          version?: number
        }
        Update: {
          body_template?: string
          channel?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string | null
          subject_template?: string | null
          updated_at?: string
          variables?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          archived_at: string | null
          body: string
          created_at: string
          data: Json
          id: string
          notification_type: string
          priority: string
          read_at: string | null
          school_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          archived_at?: string | null
          body: string
          created_at?: string
          data?: Json
          id?: string
          notification_type: string
          priority?: string
          read_at?: string | null
          school_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          archived_at?: string | null
          body?: string
          created_at?: string
          data?: Json
          id?: string
          notification_type?: string
          priority?: string
          read_at?: string | null
          school_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_events: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          attempt_count: number
          available_at: string
          created_at: string
          event_type: string
          id: number
          last_error: string | null
          payload: Json
          processed_at: string | null
          school_id: string | null
          status: string
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          attempt_count?: number
          available_at?: string
          created_at?: string
          event_type: string
          id?: never
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          school_id?: string | null
          status?: string
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          attempt_count?: number
          available_at?: string
          created_at?: string
          event_type?: string
          id?: never
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          school_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbox_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          allocated_at: string
          allocated_by: string | null
          amount: number
          created_at: string
          id: string
          invoice_id: string
          payment_id: string
          school_id: string
        }
        Insert: {
          allocated_at?: string
          allocated_by?: string | null
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          payment_id: string
          school_id: string
        }
        Update: {
          allocated_at?: string
          allocated_by?: string | null
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          payment_id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_invoice_fk"
            columns: ["school_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_fk"
            columns: ["school_id", "payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          code: string
          config: Json
          created_at: string
          id: string
          is_active: boolean
          method_type: string
          name: string
          provider: string | null
          school_id: string
          settlement_account_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          method_type: string
          name: string
          provider?: string | null
          school_id: string
          settlement_account_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          method_type?: string
          name?: string
          provider?: string | null
          school_id?: string
          settlement_account_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_account_fk"
            columns: ["school_id", "settlement_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payment_methods_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_receipts: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          issued_at: string
          issued_by: string | null
          payment_id: string
          receipt_number: string
          school_id: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          payment_id: string
          receipt_number: string
          school_id: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          payment_id?: string
          receipt_number?: string
          school_id?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_payment_fk"
            columns: ["school_id", "payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payment_receipts_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          allocated_amount: number
          amount: number
          created_at: string
          currency_code: string
          external_reference: string | null
          id: string
          idempotency_key: string | null
          notes: string | null
          payer_email: string | null
          payer_name: string | null
          payer_phone: string | null
          payment_date: string
          payment_method_id: string
          payment_reference: string
          posted_at: string | null
          posted_by: string | null
          provider_payload: Json
          received_by: string | null
          school_id: string
          status: string
          student_id: string | null
          unallocated_amount: number | null
          updated_at: string
          version: number
        }
        Insert: {
          allocated_amount?: number
          amount: number
          created_at?: string
          currency_code?: string
          external_reference?: string | null
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          payment_date?: string
          payment_method_id: string
          payment_reference: string
          posted_at?: string | null
          posted_by?: string | null
          provider_payload?: Json
          received_by?: string | null
          school_id: string
          status?: string
          student_id?: string | null
          unallocated_amount?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          allocated_amount?: number
          amount?: number
          created_at?: string
          currency_code?: string
          external_reference?: string | null
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          payment_date?: string
          payment_method_id?: string
          payment_reference?: string
          posted_at?: string | null
          posted_by?: string | null
          provider_payload?: Json
          received_by?: string | null
          school_id?: string
          status?: string
          student_id?: string | null
          unallocated_amount?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_method_fk"
            columns: ["school_id", "payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payments_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      payroll_components: {
        Row: {
          calculation_method: string
          code: string
          component_type: string
          created_at: string
          default_amount: number | null
          financial_account_id: string | null
          id: string
          is_active: boolean
          name: string
          pensionable: boolean
          percentage_rate: number | null
          school_id: string
          taxable: boolean
          updated_at: string
          version: number
        }
        Insert: {
          calculation_method?: string
          code: string
          component_type: string
          created_at?: string
          default_amount?: number | null
          financial_account_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          pensionable?: boolean
          percentage_rate?: number | null
          school_id: string
          taxable?: boolean
          updated_at?: string
          version?: number
        }
        Update: {
          calculation_method?: string
          code?: string
          component_type?: string
          created_at?: string
          default_amount?: number | null
          financial_account_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pensionable?: boolean
          percentage_rate?: number | null
          school_id?: string
          taxable?: boolean
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_components_account_fk"
            columns: ["school_id", "financial_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payroll_components_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_entries: {
        Row: {
          base_salary: number
          calculation_details: Json
          created_at: string
          employee_id: string
          employer_contributions: number
          gross_pay: number
          id: string
          net_pay: number
          payment_reference: string | null
          payment_status: string
          payroll_run_id: string
          payslip_path: string | null
          school_id: string
          total_deductions: number
          updated_at: string
          version: number
        }
        Insert: {
          base_salary?: number
          calculation_details?: Json
          created_at?: string
          employee_id: string
          employer_contributions?: number
          gross_pay?: number
          id?: string
          net_pay?: number
          payment_reference?: string | null
          payment_status?: string
          payroll_run_id: string
          payslip_path?: string | null
          school_id: string
          total_deductions?: number
          updated_at?: string
          version?: number
        }
        Update: {
          base_salary?: number
          calculation_details?: Json
          created_at?: string
          employee_id?: string
          employer_contributions?: number
          gross_pay?: number
          id?: string
          net_pay?: number
          payment_reference?: string | null
          payment_status?: string
          payroll_run_id?: string
          payslip_path?: string | null
          school_id?: string
          total_deductions?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payroll_entries_run_fk"
            columns: ["school_id", "payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      payroll_entry_lines: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payroll_component_id: string
          payroll_entry_id: string
          quantity: number
          rate: number | null
          school_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payroll_component_id: string
          payroll_entry_id: string
          quantity?: number
          rate?: number | null
          school_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payroll_component_id?: string
          payroll_entry_id?: string
          quantity?: number
          rate?: number | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entry_lines_component_fk"
            columns: ["school_id", "payroll_component_id"]
            isOneToOne: false
            referencedRelation: "payroll_components"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payroll_entry_lines_entry_fk"
            columns: ["school_id", "payroll_entry_id"]
            isOneToOne: false
            referencedRelation: "payroll_entries"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          name: string
          payment_date: string | null
          school_id: string
          starts_on: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          name: string
          payment_date?: string | null
          school_id: string
          starts_on: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          name?: string
          payment_date?: string | null
          school_id?: string
          starts_on?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_periods_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          deductions_total: number
          employer_contributions_total: number
          gross_total: number
          id: string
          net_total: number
          payroll_period_id: string
          posted_journal_entry_id: string | null
          processed_at: string | null
          processed_by: string | null
          run_number: string
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          deductions_total?: number
          employer_contributions_total?: number
          gross_total?: number
          id?: string
          net_total?: number
          payroll_period_id: string
          posted_journal_entry_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          run_number: string
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          deductions_total?: number
          employer_contributions_total?: number
          gross_total?: number
          id?: string
          net_total?: number
          payroll_period_id?: string
          posted_journal_entry_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          run_number?: string
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_journal_fk"
            columns: ["school_id", "posted_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payroll_runs_period_fk"
            columns: ["school_id", "payroll_period_id"]
            isOneToOne: true
            referencedRelation: "payroll_periods"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "payroll_runs_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          created_at: string
          date_of_birth: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          metadata: Json
          middle_name: string | null
          national_id: string | null
          nationality_code: string | null
          photo_path: string | null
          preferred_name: string | null
          primary_email: string | null
          primary_phone: string | null
          school_id: string
          status: string
          updated_at: string
          user_id: string | null
          version: number
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          metadata?: Json
          middle_name?: string | null
          national_id?: string | null
          nationality_code?: string | null
          photo_path?: string | null
          preferred_name?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          school_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          metadata?: Json
          middle_name?: string | null
          national_id?: string | null
          nationality_code?: string | null
          photo_path?: string | null
          preferred_name?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          school_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "people_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          module: string
          name: string
          risk_level: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
          name: string
          risk_level?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          name?: string
          risk_level?: string
        }
        Relationships: []
      }
      person_addresses: {
        Row: {
          address_type: string
          city: string | null
          country_code: string
          created_at: string
          district: string | null
          id: string
          is_primary: boolean
          line1: string | null
          line2: string | null
          parish: string | null
          person_id: string
          postal_code: string | null
          school_id: string
          subcounty: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          address_type?: string
          city?: string | null
          country_code?: string
          created_at?: string
          district?: string | null
          id?: string
          is_primary?: boolean
          line1?: string | null
          line2?: string | null
          parish?: string | null
          person_id: string
          postal_code?: string | null
          school_id: string
          subcounty?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          address_type?: string
          city?: string | null
          country_code?: string
          created_at?: string
          district?: string | null
          id?: string
          is_primary?: boolean
          line1?: string | null
          line2?: string | null
          parish?: string | null
          person_id?: string
          postal_code?: string | null
          school_id?: string
          subcounty?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_addresses_person_fk"
            columns: ["school_id", "person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      person_contacts: {
        Row: {
          contact_type: string
          created_at: string
          id: string
          is_primary: boolean
          is_verified: boolean
          label: string | null
          person_id: string
          school_id: string
          updated_at: string
          value: string
        }
        Insert: {
          contact_type: string
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          label?: string | null
          person_id: string
          school_id: string
          updated_at?: string
          value: string
        }
        Update: {
          contact_type?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          label?: string | null
          person_id?: string
          school_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_contacts_person_fk"
            columns: ["school_id", "person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      person_documents: {
        Row: {
          created_at: string
          document_number: string | null
          document_type: string
          expires_on: string | null
          file_path: string
          id: string
          issued_on: string | null
          metadata: Json
          person_id: string
          school_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_number?: string | null
          document_type: string
          expires_on?: string | null
          file_path: string
          id?: string
          issued_on?: string | null
          metadata?: Json
          person_id: string
          school_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_number?: string | null
          document_type?: string
          expires_on?: string | null
          file_path?: string
          id?: string
          issued_on?: string | null
          metadata?: Json
          person_id?: string
          school_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_documents_person_fk"
            columns: ["school_id", "person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "person_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          is_active: boolean
          last_active_at: string | null
          last_name: string | null
          locale: string
          middle_name: string | null
          must_change_password: boolean
          phone: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean
          last_active_at?: string | null
          last_name?: string | null
          locale?: string
          middle_name?: string | null
          must_change_password?: boolean
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_active_at?: string | null
          last_name?: string | null
          locale?: string
          middle_name?: string | null
          must_change_password?: boolean
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          description: string
          id: string
          inventory_item_id: string | null
          line_total: number | null
          purchase_order_id: string
          quantity: number
          received_quantity: number
          school_id: string
          tax_amount: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          inventory_item_id?: string | null
          line_total?: number | null
          purchase_order_id: string
          quantity: number
          received_quantity?: number
          school_id: string
          tax_amount?: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          inventory_item_id?: string | null
          line_total?: number | null
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number
          school_id?: string
          tax_amount?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_fk"
            columns: ["school_id", "inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "purchase_order_items_order_fk"
            columns: ["school_id", "purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency_code: string
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          purchase_order_number: string
          purchase_request_id: string | null
          school_id: string
          sent_at: string | null
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number
          total_amount: number
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency_code?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          purchase_order_number: string
          purchase_request_id?: string | null
          school_id: string
          sent_at?: string | null
          status?: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency_code?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          purchase_order_number?: string
          purchase_request_id?: string | null
          school_id?: string
          sent_at?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_request_fk"
            columns: ["school_id", "purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "purchase_orders_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_fk"
            columns: ["school_id", "supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      purchase_request_items: {
        Row: {
          created_at: string
          description: string
          estimated_unit_cost: number | null
          id: string
          inventory_item_id: string | null
          notes: string | null
          preferred_supplier_id: string | null
          purchase_request_id: string
          quantity: number
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          estimated_unit_cost?: number | null
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          preferred_supplier_id?: string | null
          purchase_request_id: string
          quantity: number
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_unit_cost?: number | null
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          preferred_supplier_id?: string | null
          purchase_request_id?: string
          quantity?: number
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_items_item_fk"
            columns: ["school_id", "inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "purchase_request_items_request_fk"
            columns: ["school_id", "purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "purchase_request_items_supplier_fk"
            columns: ["school_id", "preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          department_id: string | null
          id: string
          justification: string | null
          needed_by: string | null
          priority: string
          rejected_reason: string | null
          request_number: string
          requested_by: string | null
          school_id: string
          status: string
          submitted_at: string | null
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          justification?: string | null
          needed_by?: string | null
          priority?: string
          rejected_reason?: string | null
          request_number: string
          requested_by?: string | null
          school_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          justification?: string | null
          needed_by?: string | null
          priority?: string
          rejected_reason?: string | null
          request_number?: string
          requested_by?: string | null
          school_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_department_fk"
            columns: ["school_id", "department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "purchase_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_allocation_reversals: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          payment_allocation_id: string
          payment_id: string
          refund_id: string
          school_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          payment_allocation_id: string
          payment_id: string
          refund_id: string
          school_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          payment_allocation_id?: string
          payment_id?: string
          refund_id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_allocation_reversals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_allocation_reversals_invoice_fk"
            columns: ["school_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "refund_allocation_reversals_payment_allocation_id_fkey"
            columns: ["payment_allocation_id"]
            isOneToOne: false
            referencedRelation: "payment_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_allocation_reversals_payment_fk"
            columns: ["school_id", "payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "refund_allocation_reversals_refund_fk"
            columns: ["school_id", "refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "refund_allocation_reversals_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          payment_id: string
          processed_at: string | null
          processed_by: string | null
          provider_reference: string | null
          reason: string
          refund_reference: string
          requested_at: string
          requested_by: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          payment_id: string
          processed_at?: string | null
          processed_by?: string | null
          provider_reference?: string | null
          reason: string
          refund_reference: string
          requested_at?: string
          requested_by?: string | null
          school_id: string
          status?: string
          student_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          payment_id?: string
          processed_at?: string | null
          processed_by?: string | null
          provider_reference?: string | null
          reason?: string
          refund_reference?: string
          requested_at?: string
          requested_by?: string | null
          school_id?: string
          status?: string
          student_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "refunds_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_fk"
            columns: ["school_id", "payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "refunds_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      report_cards: {
        Row: {
          academic_summary: Json
          academic_year_id: string
          attendance_summary: Json
          class_position: number | null
          class_section_id: string
          class_teacher_comment: string | null
          created_at: string
          file_path: string | null
          generated_at: string | null
          head_teacher_comment: string | null
          id: string
          overall_grade: string | null
          overall_percentage: number | null
          published_at: string | null
          school_id: string
          status: string
          student_id: string
          term_id: string
          updated_at: string
          version: number
        }
        Insert: {
          academic_summary?: Json
          academic_year_id: string
          attendance_summary?: Json
          class_position?: number | null
          class_section_id: string
          class_teacher_comment?: string | null
          created_at?: string
          file_path?: string | null
          generated_at?: string | null
          head_teacher_comment?: string | null
          id?: string
          overall_grade?: string | null
          overall_percentage?: number | null
          published_at?: string | null
          school_id: string
          status?: string
          student_id: string
          term_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          academic_summary?: Json
          academic_year_id?: string
          attendance_summary?: Json
          class_position?: number | null
          class_section_id?: string
          class_teacher_comment?: string | null
          created_at?: string
          file_path?: string | null
          generated_at?: string | null
          head_teacher_comment?: string | null
          id?: string
          overall_grade?: string | null
          overall_percentage?: number | null
          published_at?: string | null
          school_id?: string
          status?: string
          student_id?: string
          term_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_section_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "report_cards_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "report_cards_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "report_cards_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      result_publications: {
        Row: {
          academic_year_id: string
          class_section_id: string
          created_at: string
          id: string
          notes: string | null
          publication_type: string
          published_at: string | null
          published_by: string | null
          school_id: string
          status: string
          term_id: string
          updated_at: string
          version: number
          withdrawn_at: string | null
          withdrawn_by: string | null
        }
        Insert: {
          academic_year_id: string
          class_section_id: string
          created_at?: string
          id?: string
          notes?: string | null
          publication_type?: string
          published_at?: string | null
          published_by?: string | null
          school_id: string
          status?: string
          term_id: string
          updated_at?: string
          version?: number
          withdrawn_at?: string | null
          withdrawn_by?: string | null
        }
        Update: {
          academic_year_id?: string
          class_section_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          publication_type?: string
          published_at?: string | null
          published_by?: string | null
          school_id?: string
          status?: string
          term_id?: string
          updated_at?: string
          version?: number
          withdrawn_at?: string | null
          withdrawn_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "result_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_publications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_publications_section_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "result_publications_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "result_publications_withdrawn_by_fkey"
            columns: ["withdrawn_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "result_publications_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          school_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          school_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          school_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          campus_id: string | null
          capacity: number | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          room_type: string
          school_id: string
          updated_at: string
          version: number
        }
        Insert: {
          campus_id?: string | null
          capacity?: number | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          room_type?: string
          school_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          campus_id?: string | null
          capacity?: number | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          room_type?: string
          school_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "rooms_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_jobs: {
        Row: {
          code: string
          configuration: Json
          created_at: string
          id: string
          is_enabled: boolean
          job_type: string
          last_error: string | null
          last_run_at: string | null
          last_status: string | null
          name: string
          next_run_at: string | null
          schedule_expression: string
          school_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          configuration?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          job_type: string
          last_error?: string | null
          last_run_at?: string | null
          last_status?: string | null
          name: string
          next_run_at?: string | null
          schedule_expression: string
          school_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          configuration?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          job_type?: string
          last_error?: string | null
          last_run_at?: string | null
          last_status?: string | null
          name?: string
          next_run_at?: string | null
          schedule_expression?: string
          school_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_jobs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_feature_flags: {
        Row: {
          config: Json
          feature_code: string
          is_enabled: boolean
          school_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config?: Json
          feature_code: string
          is_enabled?: boolean
          school_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          feature_code?: string
          is_enabled?: boolean
          school_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_feature_flags_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_feature_flags_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_finance_settings: {
        Row: {
          auto_post_invoices: boolean
          auto_post_payments: boolean
          bank_account_id: string
          cash_account_id: string
          created_at: string
          default_income_account_id: string
          discounts_account_id: string | null
          employer_contribution_expense_account_id: string | null
          employer_contribution_payable_account_id: string | null
          fiscal_year_start_month: number
          payroll_bank_account_id: string | null
          payroll_expense_account_id: string | null
          payroll_payable_account_id: string | null
          receivables_account_id: string
          refunds_account_id: string | null
          school_id: string
          unapplied_payments_account_id: string
          updated_at: string
          version: number
        }
        Insert: {
          auto_post_invoices?: boolean
          auto_post_payments?: boolean
          bank_account_id: string
          cash_account_id: string
          created_at?: string
          default_income_account_id: string
          discounts_account_id?: string | null
          employer_contribution_expense_account_id?: string | null
          employer_contribution_payable_account_id?: string | null
          fiscal_year_start_month?: number
          payroll_bank_account_id?: string | null
          payroll_expense_account_id?: string | null
          payroll_payable_account_id?: string | null
          receivables_account_id: string
          refunds_account_id?: string | null
          school_id: string
          unapplied_payments_account_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          auto_post_invoices?: boolean
          auto_post_payments?: boolean
          bank_account_id?: string
          cash_account_id?: string
          created_at?: string
          default_income_account_id?: string
          discounts_account_id?: string | null
          employer_contribution_expense_account_id?: string | null
          employer_contribution_payable_account_id?: string | null
          fiscal_year_start_month?: number
          payroll_bank_account_id?: string | null
          payroll_expense_account_id?: string | null
          payroll_payable_account_id?: string | null
          receivables_account_id?: string
          refunds_account_id?: string | null
          school_id?: string
          unapplied_payments_account_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_bank_fk"
            columns: ["school_id", "bank_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "finance_cash_fk"
            columns: ["school_id", "cash_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "finance_discounts_fk"
            columns: ["school_id", "discounts_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "finance_income_fk"
            columns: ["school_id", "default_income_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "finance_receivables_fk"
            columns: ["school_id", "receivables_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "finance_refunds_fk"
            columns: ["school_id", "refunds_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "finance_unapplied_fk"
            columns: ["school_id", "unapplied_payments_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "school_finance_employer_expense_fk"
            columns: ["school_id", "employer_contribution_expense_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "school_finance_employer_payable_fk"
            columns: ["school_id", "employer_contribution_payable_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "school_finance_payroll_bank_fk"
            columns: ["school_id", "payroll_bank_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "school_finance_payroll_expense_fk"
            columns: ["school_id", "payroll_expense_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "school_finance_payroll_payable_fk"
            columns: ["school_id", "payroll_payable_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "school_finance_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_memberships: {
        Row: {
          campus_id: string | null
          created_at: string
          ended_at: string | null
          id: string
          invited_by: string | null
          joined_at: string
          metadata: Json
          school_id: string
          status: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          campus_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string
          metadata?: Json
          school_id: string
          status?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          campus_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string
          metadata?: Json
          school_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "school_memberships_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_memberships_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_settings: {
        Row: {
          academic_week_start: number
          attendance_lock_hours: number
          created_at: string
          date_format: string
          default_language: string
          employee_number_prefix: string | null
          invoice_number_prefix: string | null
          receipt_number_prefix: string | null
          result_entry_lock_enabled: boolean
          school_id: string
          settings: Json
          student_number_prefix: string | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_week_start?: number
          attendance_lock_hours?: number
          created_at?: string
          date_format?: string
          default_language?: string
          employee_number_prefix?: string | null
          invoice_number_prefix?: string | null
          receipt_number_prefix?: string | null
          result_entry_lock_enabled?: boolean
          school_id: string
          settings?: Json
          student_number_prefix?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_week_start?: number
          attendance_lock_hours?: number
          created_at?: string
          date_format?: string
          default_language?: string
          employee_number_prefix?: string | null
          invoice_number_prefix?: string | null
          receipt_number_prefix?: string | null
          result_entry_lock_enabled?: boolean
          school_id?: string
          settings?: Json
          student_number_prefix?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "school_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          code: string | null
          country_code: string
          created_at: string
          created_by: string | null
          currency_code: string
          email: string | null
          id: string
          legal_name: string | null
          logo_path: string | null
          metadata: Json
          name: string
          phone: string | null
          slug: string
          status: string
          subscription_status: string
          timezone: string
          updated_at: string
          version: number
          website: string | null
        }
        Insert: {
          code?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_path?: string | null
          metadata?: Json
          name: string
          phone?: string | null
          slug: string
          status?: string
          subscription_status?: string
          timezone?: string
          updated_at?: string
          version?: number
          website?: string | null
        }
        Update: {
          code?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_path?: string | null
          metadata?: Json
          name?: string
          phone?: string | null
          slug?: string
          status?: string
          subscription_status?: string
          timezone?: string
          updated_at?: string
          version?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_appraisals: {
        Row: {
          appraisal_period_end: string
          appraisal_period_start: string
          appraiser_comments: string | null
          appraiser_employee_id: string | null
          completed_at: string | null
          created_at: string
          employee_comments: string | null
          employee_id: string
          goals: Json
          id: string
          improvement_areas: string | null
          overall_score: number | null
          school_id: string
          status: string
          strengths: string | null
          updated_at: string
          version: number
        }
        Insert: {
          appraisal_period_end: string
          appraisal_period_start: string
          appraiser_comments?: string | null
          appraiser_employee_id?: string | null
          completed_at?: string | null
          created_at?: string
          employee_comments?: string | null
          employee_id: string
          goals?: Json
          id?: string
          improvement_areas?: string | null
          overall_score?: number | null
          school_id: string
          status?: string
          strengths?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          appraisal_period_end?: string
          appraisal_period_start?: string
          appraiser_comments?: string | null
          appraiser_employee_id?: string | null
          completed_at?: string | null
          created_at?: string
          employee_comments?: string | null
          employee_id?: string
          goals?: Json
          id?: string
          improvement_areas?: string | null
          overall_score?: number | null
          school_id?: string
          status?: string
          strengths?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_appraisals_appraiser_fk"
            columns: ["school_id", "appraiser_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "staff_appraisals_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          idempotency_key: string | null
          inventory_item_id: string
          inventory_location_id: string
          movement_type: string
          notes: string | null
          occurred_at: string
          performed_by: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          school_id: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          idempotency_key?: string | null
          inventory_item_id: string
          inventory_location_id: string
          movement_type: string
          notes?: string | null
          occurred_at?: string
          performed_by?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          school_id: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          idempotency_key?: string | null
          inventory_item_id?: string
          inventory_location_id?: string
          movement_type?: string
          notes?: string | null
          occurred_at?: string
          performed_by?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          school_id?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_item_fk"
            columns: ["school_id", "inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "stock_movements_location_fk"
            columns: ["school_id", "inventory_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "stock_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance_records: {
        Row: {
          attendance_session_id: string
          attendance_status: string
          created_at: string
          id: string
          minutes_late: number
          reason: string | null
          recorded_at: string
          recorded_by: string | null
          remarks: string | null
          school_id: string
          source: string
          source_reference: string | null
          student_id: string
          updated_at: string
          version: number
        }
        Insert: {
          attendance_session_id: string
          attendance_status: string
          created_at?: string
          id?: string
          minutes_late?: number
          reason?: string | null
          recorded_at?: string
          recorded_by?: string | null
          remarks?: string | null
          school_id: string
          source?: string
          source_reference?: string | null
          student_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          attendance_session_id?: string
          attendance_status?: string
          created_at?: string
          id?: string
          minutes_late?: number
          reason?: string | null
          recorded_at?: string
          recorded_by?: string | null
          remarks?: string | null
          school_id?: string
          source?: string
          source_reference?: string | null
          student_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_session_fk"
            columns: ["school_id", "attendance_session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "student_attendance_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      student_enrolments: {
        Row: {
          academic_year_id: string
          class_section_id: string
          created_at: string
          end_reason: string | null
          ended_on: string | null
          enrolled_on: string
          enrolment_status: string
          id: string
          roll_number: string | null
          school_id: string
          student_id: string
          term_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          class_section_id: string
          created_at?: string
          end_reason?: string | null
          ended_on?: string | null
          enrolled_on?: string
          enrolment_status?: string
          id?: string
          roll_number?: string | null
          school_id: string
          student_id: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          class_section_id?: string
          created_at?: string
          end_reason?: string | null
          ended_on?: string | null
          enrolled_on?: string
          enrolment_status?: string
          id?: string
          roll_number?: string | null
          school_id?: string
          student_id?: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "enrolments_section_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "enrolments_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "enrolments_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "enrolments_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          can_pick_up: boolean
          created_at: string
          guardian_id: string
          id: string
          is_emergency_contact: boolean
          is_financially_responsible: boolean
          is_primary: boolean
          receives_academic_reports: boolean
          receives_financial_notices: boolean
          relationship_type: string
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          can_pick_up?: boolean
          created_at?: string
          guardian_id: string
          id?: string
          is_emergency_contact?: boolean
          is_financially_responsible?: boolean
          is_primary?: boolean
          receives_academic_reports?: boolean
          receives_financial_notices?: boolean
          relationship_type: string
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          can_pick_up?: boolean
          created_at?: string
          guardian_id?: string
          id?: string
          is_emergency_contact?: boolean
          is_financially_responsible?: boolean
          is_primary?: boolean
          receives_academic_reports?: boolean
          receives_financial_notices?: boolean
          relationship_type?: string
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_guardian_fk"
            columns: ["school_id", "guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "student_guardians_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      student_medical_conditions: {
        Row: {
          created_at: string
          current_status: string
          diagnosed_on: string | null
          document_path: string | null
          emergency_action: string | null
          id: string
          medical_condition_id: string
          school_id: string
          severity: string
          student_id: string
          treatment_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_status?: string
          diagnosed_on?: string | null
          document_path?: string | null
          emergency_action?: string | null
          id?: string
          medical_condition_id: string
          school_id: string
          severity?: string
          student_id: string
          treatment_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_status?: string
          diagnosed_on?: string | null
          document_path?: string | null
          emergency_action?: string | null
          id?: string
          medical_condition_id?: string
          school_id?: string
          severity?: string
          student_id?: string
          treatment_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_medical_conditions_medical_condition_id_fkey"
            columns: ["medical_condition_id"]
            isOneToOne: false
            referencedRelation: "medical_conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_medical_conditions_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      student_medical_profiles: {
        Row: {
          blood_group: string | null
          confidential_notes: string | null
          consent_recorded_at: string | null
          consent_recorded_by: string | null
          consent_to_treat: boolean
          created_at: string
          emergency_instructions: string | null
          genotype: string | null
          insurance_number: string | null
          insurance_provider: string | null
          physician_phone: string | null
          primary_physician: string | null
          school_id: string
          student_id: string
          updated_at: string
          version: number
        }
        Insert: {
          blood_group?: string | null
          confidential_notes?: string | null
          consent_recorded_at?: string | null
          consent_recorded_by?: string | null
          consent_to_treat?: boolean
          created_at?: string
          emergency_instructions?: string | null
          genotype?: string | null
          insurance_number?: string | null
          insurance_provider?: string | null
          physician_phone?: string | null
          primary_physician?: string | null
          school_id: string
          student_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          blood_group?: string | null
          confidential_notes?: string | null
          consent_recorded_at?: string | null
          consent_recorded_by?: string | null
          consent_to_treat?: boolean
          created_at?: string
          emergency_instructions?: string | null
          genotype?: string | null
          insurance_number?: string | null
          insurance_provider?: string | null
          physician_phone?: string | null
          primary_physician?: string | null
          school_id?: string
          student_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_medical_profiles_consent_recorded_by_fkey"
            columns: ["consent_recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_medical_profiles_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      student_transport_assignments: {
        Row: {
          academic_year_id: string
          created_at: string
          dropoff_stop_id: string | null
          emergency_notes: string | null
          ends_on: string | null
          id: string
          pickup_stop_id: string | null
          route_id: string
          school_id: string
          starts_on: string
          status: string
          student_id: string
          term_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          dropoff_stop_id?: string | null
          emergency_notes?: string | null
          ends_on?: string | null
          id?: string
          pickup_stop_id?: string | null
          route_id: string
          school_id: string
          starts_on: string
          status?: string
          student_id: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          dropoff_stop_id?: string | null
          emergency_notes?: string | null
          ends_on?: string | null
          id?: string
          pickup_stop_id?: string | null
          route_id?: string
          school_id?: string
          starts_on?: string
          status?: string
          student_id?: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_transport_dropoff_fk"
            columns: ["school_id", "dropoff_stop_id"]
            isOneToOne: false
            referencedRelation: "transport_stops"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "student_transport_pickup_fk"
            columns: ["school_id", "pickup_stop_id"]
            isOneToOne: false
            referencedRelation: "transport_stops"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "student_transport_route_fk"
            columns: ["school_id", "route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "student_transport_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "student_transport_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "student_transport_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      students: {
        Row: {
          admission_date: string | null
          admission_number: string
          boarding_status: string
          created_at: string
          current_campus_id: string | null
          exit_date: string | null
          exit_reason: string | null
          id: string
          metadata: Json
          person_id: string
          school_id: string
          status: string
          student_number: string | null
          updated_at: string
          version: number
        }
        Insert: {
          admission_date?: string | null
          admission_number: string
          boarding_status?: string
          created_at?: string
          current_campus_id?: string | null
          exit_date?: string | null
          exit_reason?: string | null
          id?: string
          metadata?: Json
          person_id: string
          school_id: string
          status?: string
          student_number?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          admission_date?: string | null
          admission_number?: string
          boarding_status?: string
          created_at?: string
          current_campus_id?: string | null
          exit_date?: string | null
          exit_reason?: string | null
          id?: string
          metadata?: Json
          person_id?: string
          school_id?: string
          status?: string
          student_number?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "students_current_campus_id_fkey"
            columns: ["current_campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_person_fk"
            columns: ["school_id", "person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_results: {
        Row: {
          academic_year_id: string
          calculated_at: string
          calculation_details: Json
          class_section_id: string
          created_at: string
          grade: string | null
          grade_point: number | null
          id: string
          percentage_score: number | null
          position_in_class: number | null
          school_id: string
          status: string
          student_id: string
          subject_id: string
          teacher_comment: string | null
          term_id: string
          total_score: number | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          calculated_at?: string
          calculation_details?: Json
          class_section_id: string
          created_at?: string
          grade?: string | null
          grade_point?: number | null
          id?: string
          percentage_score?: number | null
          position_in_class?: number | null
          school_id: string
          status?: string
          student_id: string
          subject_id: string
          teacher_comment?: string | null
          term_id: string
          total_score?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          calculated_at?: string
          calculation_details?: Json
          class_section_id?: string
          created_at?: string
          grade?: string | null
          grade_point?: number | null
          id?: string
          percentage_score?: number | null
          position_in_class?: number | null
          school_id?: string
          status?: string
          student_id?: string
          subject_id?: string
          teacher_comment?: string | null
          term_id?: string
          total_score?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "subject_results_section_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "subject_results_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "subject_results_subject_fk"
            columns: ["school_id", "subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "subject_results_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "subject_results_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          school_id: string
          short_name: string | null
          subject_type: string
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          school_id: string
          short_name?: string | null
          subject_type?: string
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          school_id?: string
          short_name?: string | null
          subject_type?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_department_fk"
            columns: ["school_id", "department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: Json
          code: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          metadata: Json
          name: string
          payment_terms_days: number
          phone: string | null
          school_id: string
          status: string
          tax_identifier: string | null
          updated_at: string
          version: number
        }
        Insert: {
          address?: Json
          code: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json
          name: string
          payment_terms_days?: number
          phone?: string | null
          school_id: string
          status?: string
          tax_identifier?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          address?: Json
          code?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json
          name?: string
          payment_terms_days?: number
          phone?: string | null
          school_id?: string
          status?: string
          tax_identifier?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year_id: string
          class_section_id: string
          created_at: string
          employee_id: string
          ends_on: string | null
          id: string
          is_primary: boolean
          school_id: string
          starts_on: string | null
          subject_id: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_section_id: string
          created_at?: string
          employee_id: string
          ends_on?: string | null
          id?: string
          is_primary?: boolean
          school_id: string
          starts_on?: string | null
          subject_id: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_section_id?: string
          created_at?: string
          employee_id?: string
          ends_on?: string | null
          id?: string
          is_primary?: boolean
          school_id?: string
          starts_on?: string | null
          subject_id?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_employee_fk"
            columns: ["school_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "teacher_assignments_section_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_fk"
            columns: ["school_id", "subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "teacher_assignments_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "teacher_assignments_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      terms: {
        Row: {
          academic_year_id: string
          created_at: string
          ends_on: string
          id: string
          is_current: boolean
          name: string
          school_id: string
          sequence_no: number
          starts_on: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          ends_on: string
          id?: string
          is_current?: boolean
          name: string
          school_id: string
          sequence_no: number
          starts_on: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          ends_on?: string
          id?: string
          is_current?: boolean
          name?: string
          school_id?: string
          sequence_no?: number
          starts_on?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          class_section_id: string
          created_at: string
          ends_at: string
          entry_type: string
          id: string
          recurrence: Json
          room_id: string | null
          school_id: string
          starts_at: string
          subject_id: string | null
          teacher_employee_id: string | null
          timetable_version_id: string
          updated_at: string
          weekday: number
        }
        Insert: {
          class_section_id: string
          created_at?: string
          ends_at: string
          entry_type?: string
          id?: string
          recurrence?: Json
          room_id?: string | null
          school_id: string
          starts_at: string
          subject_id?: string | null
          teacher_employee_id?: string | null
          timetable_version_id: string
          updated_at?: string
          weekday: number
        }
        Update: {
          class_section_id?: string
          created_at?: string
          ends_at?: string
          entry_type?: string
          id?: string
          recurrence?: Json
          room_id?: string | null
          school_id?: string
          starts_at?: string
          subject_id?: string | null
          teacher_employee_id?: string | null
          timetable_version_id?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_room_fk"
            columns: ["school_id", "room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "timetable_entries_section_fk"
            columns: ["school_id", "class_section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_fk"
            columns: ["school_id", "subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "timetable_entries_teacher_fk"
            columns: ["school_id", "teacher_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "timetable_entries_version_fk"
            columns: ["school_id", "timetable_version_id"]
            isOneToOne: false
            referencedRelation: "timetable_versions"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      timetable_versions: {
        Row: {
          academic_year_id: string
          created_at: string
          effective_from: string | null
          effective_to: string | null
          id: string
          name: string
          published_at: string | null
          published_by: string | null
          school_id: string
          status: string
          term_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          name: string
          published_at?: string | null
          published_by?: string | null
          school_id: string
          status?: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          name?: string
          published_at?: string | null
          published_by?: string | null
          school_id?: string
          status?: string
          term_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "timetable_versions_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_versions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_versions_term_fk"
            columns: ["school_id", "term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "timetable_versions_year_fk"
            columns: ["school_id", "academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      transport_routes: {
        Row: {
          afternoon_start_time: string | null
          campus_id: string | null
          code: string
          created_at: string
          default_vehicle_id: string | null
          fee_amount: number | null
          id: string
          morning_start_time: string | null
          name: string
          route_type: string
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          afternoon_start_time?: string | null
          campus_id?: string | null
          code: string
          created_at?: string
          default_vehicle_id?: string | null
          fee_amount?: number | null
          id?: string
          morning_start_time?: string | null
          name: string
          route_type?: string
          school_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          afternoon_start_time?: string | null
          campus_id?: string | null
          code?: string
          created_at?: string
          default_vehicle_id?: string | null
          fee_amount?: number | null
          id?: string
          morning_start_time?: string | null
          name?: string
          route_type?: string
          school_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "transport_routes_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_routes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_routes_vehicle_fk"
            columns: ["school_id", "default_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      transport_stops: {
        Row: {
          created_at: string
          dropoff_time: string | null
          id: string
          is_active: boolean
          landmark: string | null
          latitude: number | null
          longitude: number | null
          name: string
          pickup_time: string | null
          route_id: string
          school_id: string
          sequence_no: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dropoff_time?: string | null
          id?: string
          is_active?: boolean
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          pickup_time?: string | null
          route_id: string
          school_id: string
          sequence_no: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dropoff_time?: string | null
          id?: string
          is_active?: boolean
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          pickup_time?: string | null
          route_id?: string
          school_id?: string
          sequence_no?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_stops_route_fk"
            columns: ["school_id", "route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      trip_student_attendance: {
        Row: {
          alighted_at: string | null
          alighted_stop_id: string | null
          attendance_status: string
          boarded_at: string | null
          boarded_stop_id: string | null
          created_at: string
          id: string
          notes: string | null
          recorded_by: string | null
          school_id: string
          student_id: string
          updated_at: string
          vehicle_trip_id: string
        }
        Insert: {
          alighted_at?: string | null
          alighted_stop_id?: string | null
          attendance_status?: string
          boarded_at?: string | null
          boarded_stop_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          school_id: string
          student_id: string
          updated_at?: string
          vehicle_trip_id: string
        }
        Update: {
          alighted_at?: string | null
          alighted_stop_id?: string | null
          attendance_status?: string
          boarded_at?: string | null
          boarded_stop_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          school_id?: string
          student_id?: string
          updated_at?: string
          vehicle_trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_student_alight_stop_fk"
            columns: ["school_id", "alighted_stop_id"]
            isOneToOne: false
            referencedRelation: "transport_stops"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "trip_student_attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_student_board_stop_fk"
            columns: ["school_id", "boarded_stop_id"]
            isOneToOne: false
            referencedRelation: "transport_stops"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "trip_student_student_fk"
            columns: ["school_id", "student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "trip_student_trip_fk"
            columns: ["school_id", "vehicle_trip_id"]
            isOneToOne: false
            referencedRelation: "vehicle_trips"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          metadata: Json
          revoked_at: string | null
          school_id: string | null
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          metadata?: Json
          revoked_at?: string | null
          school_id?: string | null
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          metadata?: Json
          revoked_at?: string | null
          school_id?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_maintenance: {
        Row: {
          completed_on: string | null
          cost: number | null
          created_at: string
          description: string
          id: string
          invoice_path: string | null
          maintenance_type: string
          next_due_on: string | null
          odometer: number | null
          scheduled_on: string | null
          school_id: string
          started_on: string | null
          status: string
          updated_at: string
          vehicle_id: string
          vendor: string | null
          version: number
        }
        Insert: {
          completed_on?: string | null
          cost?: number | null
          created_at?: string
          description: string
          id?: string
          invoice_path?: string | null
          maintenance_type: string
          next_due_on?: string | null
          odometer?: number | null
          scheduled_on?: string | null
          school_id: string
          started_on?: string | null
          status?: string
          updated_at?: string
          vehicle_id: string
          vendor?: string | null
          version?: number
        }
        Update: {
          completed_on?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          invoice_path?: string | null
          maintenance_type?: string
          next_due_on?: string | null
          odometer?: number | null
          scheduled_on?: string | null
          school_id?: string
          started_on?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string
          vendor?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_vehicle_fk"
            columns: ["school_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      vehicle_trips: {
        Row: {
          actual_departure_at: string | null
          completed_at: string | null
          created_at: string
          driver_employee_id: string | null
          end_odometer: number | null
          id: string
          notes: string | null
          route_id: string
          scheduled_departure_at: string | null
          school_id: string
          start_odometer: number | null
          status: string
          trip_date: string
          trip_type: string
          updated_at: string
          vehicle_id: string
          version: number
        }
        Insert: {
          actual_departure_at?: string | null
          completed_at?: string | null
          created_at?: string
          driver_employee_id?: string | null
          end_odometer?: number | null
          id?: string
          notes?: string | null
          route_id: string
          scheduled_departure_at?: string | null
          school_id: string
          start_odometer?: number | null
          status?: string
          trip_date: string
          trip_type: string
          updated_at?: string
          vehicle_id: string
          version?: number
        }
        Update: {
          actual_departure_at?: string | null
          completed_at?: string | null
          created_at?: string
          driver_employee_id?: string | null
          end_odometer?: number | null
          id?: string
          notes?: string | null
          route_id?: string
          scheduled_departure_at?: string | null
          school_id?: string
          start_odometer?: number | null
          status?: string
          trip_date?: string
          trip_type?: string
          updated_at?: string
          vehicle_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_trips_driver_fk"
            columns: ["school_id", "driver_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "vehicle_trips_route_fk"
            columns: ["school_id", "route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["school_id", "id"]
          },
          {
            foreignKeyName: "vehicle_trips_vehicle_fk"
            columns: ["school_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["school_id", "id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          fleet_number: string | null
          id: string
          inspection_expires_on: string | null
          insurance_expires_on: string | null
          make: string | null
          manufacture_year: number | null
          metadata: Json
          model: string | null
          ownership_type: string
          registration_number: string
          school_id: string
          seating_capacity: number
          status: string
          updated_at: string
          vehicle_type: string
          version: number
        }
        Insert: {
          created_at?: string
          fleet_number?: string | null
          id?: string
          inspection_expires_on?: string | null
          insurance_expires_on?: string | null
          make?: string | null
          manufacture_year?: number | null
          metadata?: Json
          model?: string | null
          ownership_type?: string
          registration_number: string
          school_id: string
          seating_capacity: number
          status?: string
          updated_at?: string
          vehicle_type?: string
          version?: number
        }
        Update: {
          created_at?: string
          fleet_number?: string | null
          id?: string
          inspection_expires_on?: string | null
          insurance_expires_on?: string | null
          make?: string | null
          manufacture_year?: number | null
          metadata?: Json
          model?: string | null
          ownership_type?: string
          registration_number?: string
          school_id?: string
          seating_capacity?: number
          status?: string
          updated_at?: string
          vehicle_type?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: number
          next_attempt_at: string | null
          outbox_event_id: number | null
          response_body: string | null
          response_status: number | null
          school_id: string | null
          status: string
          webhook_endpoint_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: never
          next_attempt_at?: string | null
          outbox_event_id?: number | null
          response_body?: string | null
          response_status?: number | null
          school_id?: string | null
          status?: string
          webhook_endpoint_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: never
          next_attempt_at?: string | null
          outbox_event_id?: number | null
          response_body?: string | null
          response_status?: number | null
          school_id?: string | null
          status?: string
          webhook_endpoint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_outbox_event_id_fkey"
            columns: ["outbox_event_id"]
            isOneToOne: false
            referencedRelation: "outbox_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_endpoint_id_fkey"
            columns: ["webhook_endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          event_types: string[]
          failure_count: number
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          name: string
          school_id: string | null
          secret_reference: string | null
          status: string
          updated_at: string
          url: string
          version: number
        }
        Insert: {
          created_at?: string
          event_types?: string[]
          failure_count?: number
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          name: string
          school_id?: string | null
          secret_reference?: string | null
          status?: string
          updated_at?: string
          url: string
          version?: number
        }
        Update: {
          created_at?: string
          event_types?: string[]
          failure_count?: number
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          name?: string
          school_id?: string | null
          secret_reference?: string | null
          status?: string
          updated_at?: string
          url?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acknowledge_announcement: {
        Args: { target_announcement_id: string }
        Returns: {
          acknowledged_at: string
          announcement_id: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "announcement_acknowledgements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      allocate_payment: {
        Args: {
          allocation_amount: number
          target_invoice_id: string
          target_payment_id: string
        }
        Returns: {
          allocated_at: string
          allocated_by: string | null
          amount: number
          created_at: string
          id: string
          invoice_id: string
          payment_id: string
          school_id: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_allocations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_attendance_correction: {
        Args: {
          approve: boolean
          correction_id: string
          decision_note?: string
        }
        Returns: {
          approved_by: string | null
          attendance_record_id: string
          created_at: string
          decided_at: string | null
          id: string
          new_status: string
          old_status: string
          reason: string
          requested_at: string
          requested_by: string | null
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "attendance_corrections"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_payroll_run: {
        Args: { target_payroll_run_id: string }
        Returns: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          deductions_total: number
          employer_contributions_total: number
          gross_total: number
          id: string
          net_total: number
          payroll_period_id: string
          posted_journal_entry_id: string | null
          processed_at: string | null
          processed_by: string | null
          run_number: string
          school_id: string
          status: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "payroll_runs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_asset: {
        Args: {
          target_asset_id: string
          target_department_id?: string
          target_employee_id?: string
          target_expected_return_at?: string
          target_notes?: string
          target_student_id?: string
        }
        Returns: {
          asset_id: string
          assigned_at: string
          assigned_by: string | null
          created_at: string
          department_id: string | null
          employee_id: string | null
          expected_return_at: string | null
          id: string
          notes: string | null
          return_condition: string | null
          returned_at: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "asset_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_boarding_bed: {
        Args: {
          target_academic_year_id: string
          target_bed_id: string
          target_ends_on?: string
          target_notes?: string
          target_school_id: string
          target_starts_on?: string
          target_student_id: string
          target_term_id?: string
        }
        Returns: {
          academic_year_id: string
          assigned_by: string | null
          bed_id: string
          created_at: string
          ends_on: string | null
          id: string
          notes: string | null
          school_id: string
          starts_on: string
          status: string
          student_id: string
          term_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "boarding_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      calculate_class_results: {
        Args: {
          target_academic_year_id: string
          target_class_section_id: string
          target_school_id: string
          target_term_id: string
        }
        Returns: Json
      }
      calculate_payroll_run: {
        Args: { target_payroll_run_id: string }
        Returns: Json
      }
      can: {
        Args: { permission_code: string; target_school_id: string }
        Returns: boolean
      }
      cancel_announcement: {
        Args: { target_announcement_id: string }
        Returns: {
          body: string
          category: string
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json
          priority: string
          published_at: string | null
          published_by: string | null
          requires_acknowledgement: boolean
          school_id: string
          starts_at: string | null
          status: string
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "announcements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_export_job: {
        Args: { target_export_job_id: string }
        Returns: boolean
      }
      check_timetable_conflicts: {
        Args: { target_timetable_version_id: string }
        Returns: Json
      }
      configure_payroll_accounts: {
        Args: {
          target_bank_account_id: string
          target_employer_expense_account_id?: string
          target_employer_payable_account_id?: string
          target_expense_account_id: string
          target_payable_account_id: string
          target_school_id: string
        }
        Returns: {
          auto_post_invoices: boolean
          auto_post_payments: boolean
          bank_account_id: string
          cash_account_id: string
          created_at: string
          default_income_account_id: string
          discounts_account_id: string | null
          employer_contribution_expense_account_id: string | null
          employer_contribution_payable_account_id: string | null
          fiscal_year_start_month: number
          payroll_bank_account_id: string | null
          payroll_expense_account_id: string | null
          payroll_payable_account_id: string | null
          receivables_account_id: string
          refunds_account_id: string | null
          school_id: string
          unapplied_payments_account_id: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "school_finance_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      convert_application_to_student: {
        Args: {
          admission_number: string
          class_section_id: string
          roll_number?: string
          target_application_id: string
          target_term_id?: string
        }
        Returns: Json
      }
      create_announcement_with_audiences: {
        Args: {
          announcement_data: Json
          audiences: Json
          publish_now?: boolean
          target_school_id: string
        }
        Returns: {
          body: string
          category: string
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json
          priority: string
          published_at: string | null
          published_by: string | null
          requires_acknowledgement: boolean
          school_id: string
          starts_at: string | null
          status: string
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "announcements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_conversation_with_members: {
        Args: {
          target_conversation_type: string
          target_member_user_ids: string[]
          target_school_id: string
          target_title: string
        }
        Returns: Json
      }
      create_discipline_incident_with_student: {
        Args: {
          incident_data: Json
          target_involvement_type?: string
          target_school_id: string
          target_statement?: string
          target_student_id: string
        }
        Returns: Json
      }
      create_employee_with_assignment: {
        Args: {
          assignment_data: Json
          contract_data?: Json
          employee_data: Json
          person_data: Json
          target_school_id: string
        }
        Returns: Json
      }
      create_goods_receipt_with_items: {
        Args: {
          lines: Json
          post_now?: boolean
          receipt_data: Json
          target_school_id: string
        }
        Returns: Json
      }
      create_invoice_with_lines: {
        Args: {
          invoice_data: Json
          lines: Json
          post_now?: boolean
          target_school_id: string
        }
        Returns: {
          academic_year_id: string
          balance_due: number | null
          created_at: string
          credited_amount: number
          currency_code: string
          discount_amount: number
          due_date: string | null
          id: string
          idempotency_key: string | null
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          posted_at: string | null
          posted_by: string | null
          school_id: string
          status: string
          student_id: string
          subtotal: number
          tax_amount: number
          term_id: string | null
          total_amount: number
          updated_at: string
          version: number
          voided_at: string | null
          voided_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_payment_with_allocations: {
        Args: {
          allocations: Json
          payment_data: Json
          post_now?: boolean
          target_school_id: string
        }
        Returns: {
          allocated_amount: number
          amount: number
          created_at: string
          currency_code: string
          external_reference: string | null
          id: string
          idempotency_key: string | null
          notes: string | null
          payer_email: string | null
          payer_name: string | null
          payer_phone: string | null
          payment_date: string
          payment_method_id: string
          payment_reference: string
          posted_at: string | null
          posted_by: string | null
          provider_payload: Json
          received_by: string | null
          school_id: string
          status: string
          student_id: string | null
          unallocated_amount: number | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_purchase_order_with_items: {
        Args: { lines: Json; order_data: Json; target_school_id: string }
        Returns: Json
      }
      create_refund_request: {
        Args: {
          target_amount: number
          target_payment_id: string
          target_reason: string
          target_refund_reference?: string
          target_school_id: string
        }
        Returns: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          payment_id: string
          processed_at: string | null
          processed_by: string | null
          provider_reference: string | null
          reason: string
          refund_reference: string
          requested_at: string
          requested_by: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "refunds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_school: {
        Args: {
          country_code?: string
          currency_code?: string
          main_campus_name?: string
          school_address?: string
          school_code?: string
          school_email?: string
          school_name: string
          school_phone?: string
          school_slug: string
          timezone?: string
        }
        Returns: string
      }
      create_student_with_enrolment: {
        Args: {
          enrolment_data?: Json
          guardians_data?: Json
          person_data: Json
          student_data: Json
          target_school_id: string
        }
        Returns: Json
      }
      create_vehicle_trip_with_roster: {
        Args: {
          target_driver_employee_id: string
          target_notes?: string
          target_route_id: string
          target_scheduled_departure_at?: string
          target_school_id: string
          target_trip_date: string
          target_trip_type: string
          target_vehicle_id: string
        }
        Returns: Json
      }
      decide_approval_step: {
        Args: {
          approve: boolean
          decision_note?: string
          target_step_id: string
        }
        Returns: Json
      }
      decide_leave_request: {
        Args: {
          approve: boolean
          decision_note?: string
          target_leave_request_id: string
        }
        Returns: {
          created_at: string
          document_path: string | null
          employee_id: string
          ends_on: string
          id: string
          leave_type_id: string
          reason: string | null
          requested_at: string
          requested_days: number
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          starts_on: string
          status: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "leave_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      decide_refund_request: {
        Args: {
          approve: boolean
          decision_note?: string
          target_refund_id: string
        }
        Returns: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          payment_id: string
          processed_at: string | null
          processed_by: string | null
          provider_reference: string | null
          reason: string
          refund_reference: string
          requested_at: string
          requested_by: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "refunds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      end_boarding_assignment: {
        Args: {
          target_assignment_id: string
          target_end_date?: string
          target_notes?: string
        }
        Returns: {
          academic_year_id: string
          assigned_by: string | null
          bed_id: string
          created_at: string
          ends_on: string | null
          id: string
          notes: string | null
          school_id: string
          starts_on: string
          status: string
          student_id: string
          term_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "boarding_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_my_context: { Args: { target_school_id?: string }; Returns: Json }
      get_my_employee_portal: {
        Args: { target_school_id: string }
        Returns: Json
      }
      get_my_guardian_portal: {
        Args: { selected_student_id?: string; target_school_id: string }
        Returns: Json
      }
      get_my_pending_approvals: {
        Args: { target_school_id: string }
        Returns: Json
      }
      get_my_portal_identity: {
        Args: { target_school_id: string }
        Returns: Json
      }
      get_my_portal_notifications: {
        Args: { target_school_id?: string }
        Returns: Json
      }
      get_my_student_portal: {
        Args: { target_school_id: string }
        Returns: Json
      }
      initialize_school_finance: {
        Args: { target_school_id: string }
        Returns: undefined
      }
      issue_library_item: {
        Args: {
          notes?: string
          target_copy_id: string
          target_due_at?: string
          target_employee_id?: string
          target_student_id?: string
        }
        Returns: {
          borrowed_at: string
          created_at: string
          due_at: string
          employee_id: string | null
          id: string
          issued_by: string | null
          library_copy_id: string
          notes: string | null
          received_by: string | null
          renewal_count: number
          return_condition: string | null
          returned_at: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "library_loans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      issue_payment_receipt: {
        Args: { target_payment_id: string }
        Returns: {
          created_at: string
          file_path: string | null
          id: string
          issued_at: string
          issued_by: string | null
          payment_id: string
          receipt_number: string
          school_id: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payment_receipts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      link_person_to_user: {
        Args: {
          target_person_id: string
          target_school_id: string
          target_user_id: string
        }
        Returns: Json
      }
      lock_attendance_session: {
        Args: { target_session_id: string }
        Returns: {
          academic_year_id: string
          class_section_id: string
          closed_at: string | null
          closed_by: string | null
          created_at: string
          ends_at: string | null
          id: string
          notes: string | null
          opened_by: string | null
          school_id: string
          session_date: string
          session_type: string
          starts_at: string | null
          status: string
          subject_id: string | null
          term_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "attendance_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_conversation_read: {
        Args: { target_conversation_id: string }
        Returns: undefined
      }
      moderate_assessment_marks: {
        Args: { approve: boolean; note?: string; target_assessment_id: string }
        Returns: Json
      }
      open_attendance_session: {
        Args: {
          default_attendance_status?: string
          target_academic_year_id: string
          target_class_section_id: string
          target_ends_at?: string
          target_school_id: string
          target_session_date: string
          target_session_type?: string
          target_starts_at?: string
          target_subject_id?: string
          target_term_id: string
        }
        Returns: Json
      }
      pay_payroll_run: {
        Args: {
          target_payment_reference: string
          target_payroll_run_id: string
        }
        Returns: Json
      }
      post_goods_receipt: {
        Args: { target_goods_receipt_id: string }
        Returns: Json
      }
      post_invoice: {
        Args: { target_invoice_id: string }
        Returns: {
          academic_year_id: string
          balance_due: number | null
          created_at: string
          credited_amount: number
          currency_code: string
          discount_amount: number
          due_date: string | null
          id: string
          idempotency_key: string | null
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          posted_at: string | null
          posted_by: string | null
          school_id: string
          status: string
          student_id: string
          subtotal: number
          tax_amount: number
          term_id: string | null
          total_amount: number
          updated_at: string
          version: number
          voided_at: string | null
          voided_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      post_manual_journal: {
        Args: { journal_data: Json; lines: Json; target_school_id: string }
        Returns: {
          created_at: string
          currency_code: string
          description: string
          entry_date: string
          entry_number: string
          id: string
          posted_at: string | null
          posted_by: string | null
          reversal_reason: string | null
          reversed_entry_id: string | null
          school_id: string
          source_id: string | null
          source_type: string
          status: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "journal_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      post_payment: {
        Args: { target_payment_id: string }
        Returns: {
          allocated_amount: number
          amount: number
          created_at: string
          currency_code: string
          external_reference: string | null
          id: string
          idempotency_key: string | null
          notes: string | null
          payer_email: string | null
          payer_name: string | null
          payer_phone: string | null
          payment_date: string
          payment_method_id: string
          payment_reference: string
          posted_at: string | null
          posted_by: string | null
          provider_payload: Json
          received_by: string | null
          school_id: string
          status: string
          student_id: string | null
          unallocated_amount: number | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      post_payroll_run: {
        Args: { target_payroll_run_id: string }
        Returns: Json
      }
      process_import_batch: {
        Args: { target_import_batch_id: string }
        Returns: Json
      }
      process_refund: {
        Args: { target_provider_reference?: string; target_refund_id: string }
        Returns: Json
      }
      publish_announcement: {
        Args: { target_announcement_id: string }
        Returns: {
          body: string
          category: string
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json
          priority: string
          published_at: string | null
          published_by: string | null
          requires_acknowledgement: boolean
          school_id: string
          starts_at: string | null
          status: string
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "announcements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      publish_class_results: {
        Args: { publication_id: string }
        Returns: {
          academic_year_id: string
          class_section_id: string
          created_at: string
          id: string
          notes: string | null
          publication_type: string
          published_at: string | null
          published_by: string | null
          school_id: string
          status: string
          term_id: string
          updated_at: string
          version: number
          withdrawn_at: string | null
          withdrawn_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "result_publications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      publish_timetable_version: {
        Args: { target_timetable_version_id: string }
        Returns: {
          academic_year_id: string
          created_at: string
          effective_from: string | null
          effective_to: string | null
          id: string
          name: string
          published_at: string | null
          published_by: string | null
          school_id: string
          status: string
          term_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "timetable_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_clinic_visit: {
        Args: { target_school_id: string; visit_data: Json }
        Returns: {
          attended_by_employee_id: string | null
          complaint: string
          confidential: boolean
          created_at: string
          diagnosis: string | null
          disposition: string
          followup_at: string | null
          guardian_notified_at: string | null
          id: string
          observations: string | null
          referred_to: string | null
          school_id: string
          student_id: string
          temperature_c: number | null
          treatment: string | null
          updated_at: string
          version: number
          visited_at: string
        }
        SetofOptions: {
          from: "*"
          to: "clinic_visits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_stock_movement: {
        Args: {
          destination_location_id?: string
          idempotency_key?: string
          movement_type: string
          notes?: string
          quantity: number
          reference_id?: string
          reference_type?: string
          source_location_id: string
          target_item_id: string
          target_school_id: string
          unit_cost?: number
        }
        Returns: Json
      }
      record_trip_student_status: {
        Args: {
          target_attendance_id: string
          target_notes?: string
          target_status: string
          target_stop_id?: string
        }
        Returns: {
          alighted_at: string | null
          alighted_stop_id: string | null
          attendance_status: string
          boarded_at: string | null
          boarded_stop_id: string | null
          created_at: string
          id: string
          notes: string | null
          recorded_by: string | null
          school_id: string
          student_id: string
          updated_at: string
          vehicle_trip_id: string
        }
        SetofOptions: {
          from: "*"
          to: "trip_student_attendance"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      resolve_discipline_incident: {
        Args: {
          target_incident_id: string
          target_resolution_summary: string
          target_status: string
        }
        Returns: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          incident_number: string
          location: string | null
          occurred_at: string
          parent_visible: boolean
          reported_by: string | null
          resolution_summary: string | null
          resolved_at: string | null
          school_id: string
          severity: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "discipline_incidents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      return_asset: {
        Args: {
          target_assignment_id: string
          target_notes?: string
          target_return_condition?: string
        }
        Returns: {
          asset_id: string
          assigned_at: string
          assigned_by: string | null
          created_at: string
          department_id: string | null
          employee_id: string | null
          expected_return_at: string | null
          id: string
          notes: string | null
          return_condition: string | null
          returned_at: string | null
          school_id: string
          status: string
          student_id: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "asset_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      return_library_item: {
        Args: {
          target_fine_amount?: number
          target_fine_type?: string
          target_loan_id: string
          target_notes?: string
          target_return_condition?: string
        }
        Returns: Json
      }
      save_attendance_records: {
        Args: {
          records: Json
          submit_session?: boolean
          target_session_id: string
        }
        Returns: Json
      }
      save_mark_entries: {
        Args: {
          entries: Json
          submit_entries?: boolean
          target_assessment_id: string
        }
        Returns: Json
      }
      send_conversation_message: {
        Args: {
          target_body: string
          target_conversation_id: string
          target_reply_to_message_id?: string
        }
        Returns: {
          body: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: string
          metadata: Json
          reply_to_message_id: string | null
          school_id: string
          sender_user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_conversation_closed: {
        Args: { target_closed: boolean; target_conversation_id: string }
        Returns: {
          conversation_type: string
          created_at: string
          created_by: string | null
          id: string
          is_closed: boolean
          school_id: string
          title: string | null
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "conversations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_purchase_order_status: {
        Args: { target_purchase_order_id: string; target_status: string }
        Returns: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency_code: string
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          purchase_order_number: string
          purchase_request_id: string | null
          school_id: string
          sent_at: string | null
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number
          total_amount: number
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "purchase_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_role_permissions: {
        Args: { target_permission_ids: string[]; target_role_id: string }
        Returns: Json
      }
      submit_approval_request: {
        Args: {
          target_amount?: number
          target_approvers: Json
          target_currency_code?: string
          target_entity_id: string
          target_entity_type: string
          target_metadata?: Json
          target_reason: string
          target_request_type: string
          target_school_id: string
        }
        Returns: Json
      }
      withdraw_class_results: {
        Args: { reason: string; target_publication_id: string }
        Returns: {
          academic_year_id: string
          class_section_id: string
          created_at: string
          id: string
          notes: string | null
          publication_type: string
          published_at: string | null
          published_by: string | null
          school_id: string
          status: string
          term_id: string
          updated_at: string
          version: number
          withdrawn_at: string | null
          withdrawn_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "result_publications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PublicTableName = keyof Database["public"]["Tables"]

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
