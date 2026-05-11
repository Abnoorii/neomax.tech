export type PayType = 'fixed' | 'daily' | 'piece_rate' | 'mixed'
export type EmpStatus = 'active' | 'inactive' | 'suspended' | 'terminated'
export type AttendanceStatus = 'present' | 'absent' | 'sick' | 'holiday' | 'half_day'
export type AdvanceType = 'disbursement' | 'recovery' | 'adjustment'
export type PayrollStatus = 'draft' | 'pending_approval' | 'approved' | 'paid'
export type MonthStatus = 'open' | 'closing' | 'closed'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type ApprovalActionType =
  | 'salary_change'
  | 'employee_termination'
  | 'rate_card_change'
  | 'payroll_run_approval'
  | 'large_advance'
  | 'advance_writeoff'
  | 'reopen_closed_month'
  | 'void_record'
  | 'policy_change'

export interface Workshop {
  id: string
  name: string
  location: string | null
  letterhead_url: string | null
  default_currency: string
  created_at: string
}

export interface Section {
  id: string
  workshop_id: string
  code: string
  name_en: string
  name_dari: string
  is_active: boolean
}

export interface Job {
  id: string
  code: string
  name_en: string
  name_dari: string
  is_active: boolean
}

export interface Employee {
  id: string
  emp_code: string
  name_dari: string
  name_english: string | null
  father_name: string
  national_id: string | null
  phone: string | null
  workshop_id: string
  section_id: string | null
  job_id: string
  status: EmpStatus
  pay_type: PayType
  base_salary: number
  daily_rate: number
  transport_rate: number
  food_deduction_daily: number
  hire_date: string | null
  legacy_id: string | null
  photo_url: string | null
  bank_account: string | null
  hawala_provider: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RateCard {
  id: string
  work_code: string
  description_dari: string
  description_en: string | null
  category: string | null
  unit_price: number
  effective_from: string
  effective_to: string | null
  created_by: string | null
  created_at: string
}

export interface Attendance {
  id: string
  employee_id: string
  date: string
  status: AttendanceStatus
  hours: number
  overtime_hours: number
  notes: string | null
  entered_by: string | null
  entered_at: string
}

export interface Production {
  id: string
  employee_id: string
  date: string
  rate_card_id: string
  quantity: number
  unit_price: number
  total: number
  notes: string | null
  entered_by: string | null
  entered_at: string
}

export interface Advance {
  id: string
  employee_id: string
  date: string
  type: AdvanceType
  amount: number
  reason: string | null
  paid_by: string | null
  payroll_run_id: string | null
  is_legacy: boolean
  created_at: string
}

export interface AccountingPeriod {
  id: string
  workshop_id: string
  hijri_year: number
  hijri_month: number
  start_date: string
  end_date: string
  status: MonthStatus
  closed_by: string | null
  closed_at: string | null
  reopened_by: string | null
  reopened_at: string | null
  reopen_reason: string | null
  notes: string | null
  created_at: string
}

export interface PayrollRun {
  id: string
  workshop_id: string
  period_id: string
  status: PayrollStatus
  prepared_by: string | null
  approved_by: string | null
  approved_at: string | null
  paid_at: string | null
  total_gross: number | null
  total_deductions: number | null
  total_net: number | null
  notes: string | null
  created_at: string
}

export interface Payslip {
  id: string
  payroll_run_id: string
  employee_id: string
  days_present: number
  days_absent: number
  days_holiday: number
  days_sick: number
  fixed_earnings: number
  piece_rate_earnings: number
  piece_rate_lines: PieceRateLine[]
  overtime: number
  transport: number
  food_deduction: number
  tax: number
  advance_recovery: number
  advance_opening_balance: number
  advance_closing_balance: number
  net_pay: number
  pdf_url: string | null
  delivered_at: string | null
}

export interface PieceRateLine {
  work_code: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Profile {
  id: string
  full_name: string | null
  full_name_dari: string | null
  phone: string | null
  language: 'dari' | 'pashto' | 'en'
  is_active: boolean
  is_admin: boolean
  employee_id: string | null
  created_at: string
}

export interface Role {
  id: string
  code: string
  name_en: string
  name_dari: string | null
  description: string | null
  is_system: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface Permission {
  code: string
  category: string
  name_en: string
  description_en: string | null
}

export interface ApprovalRequest {
  id: string
  action_type: ApprovalActionType
  target_table: string
  target_record_id: string | null
  requested_by: string
  requested_at: string
  payload: Record<string, unknown>
  reason: string | null
  status: ApprovalStatus
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  expires_at: string | null
  workshop_id: string | null
}

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: string
  changed_by: string | null
  changed_at: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  reason: string | null
}

export interface Adjustment {
  id: string
  current_period_id: string
  original_period_id: string
  employee_id: string
  category: string
  amount: number
  description: string
  approved_by: string
  created_at: string
}
