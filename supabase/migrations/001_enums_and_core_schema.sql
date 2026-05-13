-- ===== ENUMS =====
create type pay_type as enum ('fixed', 'daily', 'piece_rate', 'mixed');
create type emp_status as enum ('active', 'inactive', 'suspended', 'terminated');
create type attendance_status as enum ('present', 'absent', 'sick', 'holiday', 'half_day');
create type advance_type as enum ('disbursement', 'recovery', 'adjustment');
create type payroll_status as enum ('draft', 'pending_approval', 'approved', 'paid');
create type month_status as enum ('open', 'closing', 'closed');
create type approval_status as enum ('pending', 'approved', 'rejected', 'expired');
create type approval_action_type as enum (
  'salary_change',
  'employee_termination',
  'rate_card_change',
  'payroll_run_approval',
  'large_advance',
  'advance_writeoff',
  'reopen_closed_month',
  'void_record',
  'policy_change'
);

-- ===== TENANCY & STRUCTURE =====
create table workshops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  letterhead_url text,
  default_currency text default 'AFN',
  created_at timestamptz default now()
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id) not null,
  code text not null,
  name_en text not null,
  name_dari text not null,
  is_active boolean default true,
  unique(workshop_id, code)
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_en text not null,
  name_dari text not null,
  is_active boolean default true
);

-- ===== EMPLOYEES =====
create table employees (
  id uuid primary key default gen_random_uuid(),
  emp_code text unique not null,
  name_dari text not null,
  name_english text,
  father_name text not null,
  national_id text,
  phone text,
  workshop_id uuid references workshops(id) not null,
  section_id uuid references sections(id),
  job_id uuid references jobs(id) not null,
  status emp_status not null default 'active',
  pay_type pay_type not null,
  base_salary numeric(12,2) default 0,
  daily_rate numeric(12,2) default 0,
  transport_rate numeric(12,2) default 0,
  food_deduction_daily numeric(12,2) default 0,
  hire_date date,
  legacy_id text,
  photo_url text,
  bank_account text,
  hawala_provider text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_employees_workshop_section on employees(workshop_id, section_id);

-- ===== RATE CARD (VERSIONED) =====
create table rate_card (
  id uuid primary key default gen_random_uuid(),
  work_code text not null,
  description_dari text not null,
  description_en text,
  category text,
  unit_price numeric(12,2) not null,
  effective_from date not null,
  effective_to date,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create index idx_rate_card_lookup on rate_card(work_code, effective_from, effective_to);

-- ===== OPERATIONAL TABLES =====
create table attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  date date not null,
  status attendance_status not null,
  hours numeric(4,2) default 8,
  overtime_hours numeric(4,2) default 0,
  notes text,
  entered_by uuid references auth.users(id),
  entered_at timestamptz default now(),
  unique(employee_id, date)
);
create index idx_attendance_emp_date on attendance(employee_id, date);

create table production (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  date date not null,
  rate_card_id uuid references rate_card(id) not null,
  quantity numeric(10,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  total numeric(14,2) generated always as (quantity * unit_price) stored,
  notes text,
  entered_by uuid references auth.users(id),
  entered_at timestamptz default now()
);
create index idx_production_emp_date on production(employee_id, date);

create table advances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  date date not null,
  type advance_type not null,
  amount numeric(12,2) not null,
  reason text,
  paid_by uuid references auth.users(id),
  payroll_run_id uuid,
  is_legacy boolean default false,
  created_at timestamptz default now()
);
create index idx_advances_emp on advances(employee_id, date);

-- ===== MONTHLY ACCOUNTING PERIODS =====
create table accounting_periods (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id) not null,
  hijri_year int not null,
  hijri_month int not null check (hijri_month between 1 and 12),
  start_date date not null,
  end_date date not null,
  status month_status not null default 'open',
  closed_by uuid references auth.users(id),
  closed_at timestamptz,
  reopened_by uuid references auth.users(id),
  reopened_at timestamptz,
  reopen_reason text,
  notes text,
  created_at timestamptz default now(),
  unique(workshop_id, hijri_year, hijri_month)
);
create index idx_periods_status on accounting_periods(workshop_id, status);

-- ===== PAYROLL =====
create table payroll_runs (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id) not null,
  period_id uuid references accounting_periods(id) not null,
  status payroll_status not null default 'draft',
  prepared_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  paid_at timestamptz,
  total_gross numeric(14,2),
  total_deductions numeric(14,2),
  total_net numeric(14,2),
  notes text,
  created_at timestamptz default now(),
  unique(period_id)
);

alter table advances add constraint advances_payroll_run_fk
  foreign key (payroll_run_id) references payroll_runs(id);

create table payslips (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid references payroll_runs(id) not null,
  employee_id uuid references employees(id) not null,
  days_present int default 0,
  days_absent int default 0,
  days_holiday int default 0,
  days_sick int default 0,
  fixed_earnings numeric(12,2) default 0,
  piece_rate_earnings numeric(12,2) default 0,
  piece_rate_lines jsonb default '[]'::jsonb,
  overtime numeric(12,2) default 0,
  transport numeric(12,2) default 0,
  food_deduction numeric(12,2) default 0,
  tax numeric(12,2) default 0,
  advance_recovery numeric(12,2) default 0,
  advance_opening_balance numeric(12,2) default 0,
  advance_closing_balance numeric(12,2) default 0,
  net_pay numeric(12,2) generated always as (
    fixed_earnings + piece_rate_earnings + overtime + transport
    - food_deduction - tax - advance_recovery
  ) stored,
  pdf_url text,
  delivered_at timestamptz,
  unique(payroll_run_id, employee_id)
);

-- ===== ADJUSTMENTS =====
create table adjustments (
  id uuid primary key default gen_random_uuid(),
  current_period_id uuid references accounting_periods(id) not null,
  original_period_id uuid references accounting_periods(id) not null,
  employee_id uuid references employees(id) not null,
  category text not null,
  amount numeric(12,2) not null,
  description text not null,
  approved_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

-- ===== EDIT HISTORY =====
create table attendance_history (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid references attendance(id) on delete cascade,
  employee_id uuid references employees(id) not null,
  date date not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  previous_status attendance_status,
  new_status attendance_status,
  previous_hours numeric(4,2),
  new_hours numeric(4,2),
  previous_overtime numeric(4,2),
  new_overtime numeric(4,2),
  changed_by uuid references auth.users(id) not null,
  changed_at timestamptz default now() not null,
  reason text,
  ip_address inet,
  device_info text
);
create index idx_att_history_emp_date on attendance_history(employee_id, date);
create index idx_att_history_changed_at on attendance_history(changed_at desc);

create table production_history (
  id uuid primary key default gen_random_uuid(),
  production_id uuid references production(id) on delete cascade,
  employee_id uuid references employees(id) not null,
  date date not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  previous_rate_card_id uuid,
  new_rate_card_id uuid,
  previous_quantity numeric(10,2),
  new_quantity numeric(10,2),
  previous_unit_price numeric(12,2),
  new_unit_price numeric(12,2),
  previous_total numeric(14,2),
  new_total numeric(14,2),
  changed_by uuid references auth.users(id) not null,
  changed_at timestamptz default now() not null,
  reason text,
  ip_address inet,
  device_info text
);
create index idx_prod_history_emp_date on production_history(employee_id, date);

-- ===== GENERAL AUDIT LOG =====
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz default now(),
  before jsonb,
  after jsonb,
  reason text
);
create index idx_audit_record on audit_log(table_name, record_id);

-- ===== AI LOG =====
create table ai_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  feature text not null,
  model text not null,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,6),
  latency_ms int,
  request_summary text,
  response_summary text,
  created_at timestamptz default now()
);
