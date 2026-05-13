-- ===== PERMISSIONS & CUSTOM ROLES SCHEMA =====

create table permissions (
  code text primary key,
  category text not null,
  name_en text not null,
  description_en text
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_en text not null,
  name_dari text,
  description text,
  is_system boolean default false,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_code text references permissions(code) on delete cascade,
  primary key (role_id, permission_code)
);

create table profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  full_name_dari text,
  phone text,
  language text default 'dari',
  is_active boolean default true,
  is_admin boolean default false,
  employee_id uuid references employees(id),
  created_at timestamptz default now()
);

create table user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references roles(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz default now(),
  primary key (user_id, role_id)
);

-- Scope tables
create table user_workshop_scope (
  user_id uuid references auth.users(id) on delete cascade,
  workshop_id uuid references workshops(id) on delete cascade,
  primary key (user_id, workshop_id)
);

create table user_section_scope (
  user_id uuid references auth.users(id) on delete cascade,
  section_id uuid references sections(id) on delete cascade,
  primary key (user_id, section_id)
);

create table user_employee_scope (
  user_id uuid references auth.users(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  primary key (user_id, employee_id)
);

create table user_pay_type_scope (
  user_id uuid references auth.users(id) on delete cascade,
  pay_type pay_type,
  primary key (user_id, pay_type)
);

-- ===== APPROVAL WORKFLOW =====

create table approval_requests (
  id uuid primary key default gen_random_uuid(),
  action_type approval_action_type not null,
  target_table text not null,
  target_record_id uuid,
  requested_by uuid references auth.users(id) not null,
  requested_at timestamptz default now(),
  payload jsonb not null,
  reason text,
  status approval_status not null default 'pending',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  expires_at timestamptz,
  workshop_id uuid references workshops(id)
);
create index idx_approval_status on approval_requests(status, action_type);

create table approval_policies (
  id uuid primary key default gen_random_uuid(),
  action_type approval_action_type not null unique,
  requires_dual_approval boolean default true,
  requester_permission text not null,
  approver_permission text not null,
  amount_threshold numeric(12,2),
  is_active boolean default true
);
