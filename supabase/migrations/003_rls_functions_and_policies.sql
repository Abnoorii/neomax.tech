-- ===== RLS HELPER FUNCTIONS =====

create or replace function current_user_can(_permission text)
returns boolean as $$
  select exists (
    select 1
    from user_roles ur
    join role_permissions rp on rp.role_id = ur.role_id
    where ur.user_id = auth.uid()
      and rp.permission_code = _permission
  ) or exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  );
$$ language sql security definer stable;

create or replace function current_user_in_scope_employee(_employee_id uuid)
returns boolean as $$
declare
  e record;
begin
  select workshop_id, section_id, pay_type into e from employees where id = _employee_id;
  if exists (select 1 from user_workshop_scope where user_id = auth.uid()) then
    if not exists (select 1 from user_workshop_scope where user_id = auth.uid() and workshop_id = e.workshop_id) then
      return false;
    end if;
  end if;
  if exists (select 1 from user_section_scope where user_id = auth.uid()) then
    if not exists (select 1 from user_section_scope where user_id = auth.uid() and section_id = e.section_id) then
      return false;
    end if;
  end if;
  if exists (select 1 from user_employee_scope where user_id = auth.uid()) then
    if not exists (select 1 from user_employee_scope where user_id = auth.uid() and employee_id = _employee_id) then
      return false;
    end if;
  end if;
  if exists (select 1 from user_pay_type_scope where user_id = auth.uid()) then
    if not exists (select 1 from user_pay_type_scope where user_id = auth.uid() and pay_type = e.pay_type) then
      return false;
    end if;
  end if;
  return true;
end;
$$ language plpgsql security definer stable;

-- ===== ENABLE RLS ON ALL TABLES =====

alter table workshops enable row level security;
alter table sections enable row level security;
alter table jobs enable row level security;
alter table employees enable row level security;
alter table rate_card enable row level security;
alter table attendance enable row level security;
alter table production enable row level security;
alter table advances enable row level security;
alter table accounting_periods enable row level security;
alter table payroll_runs enable row level security;
alter table payslips enable row level security;
alter table adjustments enable row level security;
alter table attendance_history enable row level security;
alter table production_history enable row level security;
alter table audit_log enable row level security;
alter table ai_log enable row level security;
alter table permissions enable row level security;
alter table roles enable row level security;
alter table role_permissions enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table user_workshop_scope enable row level security;
alter table user_section_scope enable row level security;
alter table user_employee_scope enable row level security;
alter table user_pay_type_scope enable row level security;
alter table approval_requests enable row level security;
alter table approval_policies enable row level security;

-- ===== PROFILES =====
create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid() or current_user_can('admin.manage_users'));

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Admin can insert profiles"
  on profiles for insert
  with check (id = auth.uid() or current_user_can('admin.manage_users'));

-- ===== WORKSHOPS =====
create policy "Authenticated users can view workshops"
  on workshops for select
  using (auth.uid() is not null);

create policy "Admin can manage workshops"
  on workshops for all
  using (current_user_can('admin.manage_workshops'));

-- ===== SECTIONS =====
create policy "Authenticated can view sections"
  on sections for select
  using (auth.uid() is not null);

create policy "Admin can manage sections"
  on sections for all
  using (current_user_can('admin.manage_workshops'));

-- ===== JOBS =====
create policy "Authenticated can view jobs"
  on jobs for select
  using (auth.uid() is not null);

create policy "Admin can manage jobs"
  on jobs for all
  using (current_user_can('admin.manage_workshops'));

-- ===== EMPLOYEES =====
create policy "View employees with scope"
  on employees for select
  using (
    current_user_can('employees.view')
    and current_user_in_scope_employee(id)
  );

create policy "Create employees"
  on employees for insert
  with check (current_user_can('employees.create'));

create policy "Edit employees"
  on employees for update
  using (
    current_user_can('employees.edit')
    and current_user_in_scope_employee(id)
  );

create policy "Delete employees"
  on employees for delete
  using (current_user_can('employees.delete'));

-- ===== RATE CARD =====
create policy "View rate card"
  on rate_card for select
  using (current_user_can('rate_card.view'));

create policy "Create rate card"
  on rate_card for insert
  with check (current_user_can('rate_card.create'));

-- ===== ATTENDANCE =====
create policy "View attendance with scope"
  on attendance for select
  using (
    (current_user_can('attendance.view_all') and current_user_in_scope_employee(employee_id))
    or (current_user_can('attendance.view_own') and employee_id in (
      select id from employees where id = (select employee_id from profiles where id = auth.uid())
    ))
  );

create policy "Insert attendance with scope"
  on attendance for insert
  with check (
    current_user_can('attendance.enter')
    and current_user_in_scope_employee(employee_id)
  );

create policy "Update attendance with scope"
  on attendance for update
  using (
    current_user_can('attendance.edit_any')
    and current_user_in_scope_employee(employee_id)
  );

-- ===== PRODUCTION =====
create policy "View production with scope"
  on production for select
  using (
    (current_user_can('production.view_all') and current_user_in_scope_employee(employee_id))
    or (current_user_can('production.view_own') and employee_id in (
      select id from employees where id = (select employee_id from profiles where id = auth.uid())
    ))
  );

create policy "Insert production with scope"
  on production for insert
  with check (
    current_user_can('production.enter')
    and current_user_in_scope_employee(employee_id)
  );

create policy "Update production with scope"
  on production for update
  using (
    current_user_can('production.edit_any')
    and current_user_in_scope_employee(employee_id)
  );

-- ===== ADVANCES =====
create policy "View advances"
  on advances for select
  using (
    current_user_can('advances.view')
    and current_user_in_scope_employee(employee_id)
  );

create policy "Insert advances"
  on advances for insert
  with check (current_user_can('advances.disburse'));

-- ===== ACCOUNTING PERIODS =====
create policy "View accounting periods"
  on accounting_periods for select
  using (auth.uid() is not null);

create policy "Manage accounting periods"
  on accounting_periods for all
  using (current_user_can('periods.close_month') or current_user_can('admin.manage_workshops'));

-- ===== PAYROLL =====
create policy "View payroll runs"
  on payroll_runs for select
  using (current_user_can('payroll.view'));

create policy "Create payroll runs"
  on payroll_runs for insert
  with check (current_user_can('payroll.prepare'));

create policy "Update payroll runs"
  on payroll_runs for update
  using (current_user_can('payroll.prepare') or current_user_can('payroll.approve'));

-- ===== PAYSLIPS =====
create policy "View payslips"
  on payslips for select
  using (
    current_user_can('payroll.view')
    or (current_user_can('attendance.view_own') and employee_id in (
      select id from employees where id = (select employee_id from profiles where id = auth.uid())
    ))
  );

create policy "Insert payslips"
  on payslips for insert
  with check (current_user_can('payroll.prepare'));

-- ===== ROLES =====
create policy "View roles"
  on roles for select
  using (auth.uid() is not null);

create policy "Manage roles"
  on roles for all
  using (current_user_can('admin.manage_permissions'));

-- ===== PERMISSIONS =====
create policy "View permissions"
  on permissions for select
  using (auth.uid() is not null);

-- ===== ROLE PERMISSIONS =====
create policy "View role permissions"
  on role_permissions for select
  using (auth.uid() is not null);

create policy "Manage role permissions"
  on role_permissions for all
  using (current_user_can('admin.manage_permissions'));

-- ===== USER ROLES =====
create policy "View user roles"
  on user_roles for select
  using (user_id = auth.uid() or current_user_can('admin.manage_users'));

create policy "Manage user roles"
  on user_roles for all
  using (current_user_can('admin.manage_permissions'));

-- ===== APPROVAL REQUESTS =====
create policy "View approval requests"
  on approval_requests for select
  using (
    requested_by = auth.uid()
    or current_user_can('admin.manage_approvals')
    or current_user_can('approval.approve_salary_change')
    or current_user_can('approval.approve_payroll')
  );

create policy "Create approval requests"
  on approval_requests for insert
  with check (auth.uid() is not null);

create policy "Update approval requests"
  on approval_requests for update
  using (
    current_user_can('admin.manage_approvals')
    or current_user_can('approval.approve_salary_change')
    or current_user_can('approval.approve_payroll')
  );

-- ===== AUDIT LOG =====
create policy "View audit log"
  on audit_log for select
  using (current_user_can('admin.view_audit_log'));

create policy "Insert audit log"
  on audit_log for insert
  with check (auth.uid() is not null);

-- ===== ATTENDANCE HISTORY =====
create policy "View attendance history"
  on attendance_history for select
  using (
    current_user_can('attendance.view_all')
    or (employee_id in (
      select id from employees where id = (select employee_id from profiles where id = auth.uid())
    ))
  );

-- ===== PRODUCTION HISTORY =====
create policy "View production history"
  on production_history for select
  using (
    current_user_can('production.view_all')
    or (employee_id in (
      select id from employees where id = (select employee_id from profiles where id = auth.uid())
    ))
  );

-- ===== AI LOG =====
create policy "View ai log"
  on ai_log for select
  using (user_id = auth.uid() or current_user_can('ai.view_logs'));

create policy "Insert ai log"
  on ai_log for insert
  with check (auth.uid() is not null);

-- ===== SCOPE TABLES =====
create policy "View own scopes"
  on user_workshop_scope for select
  using (user_id = auth.uid() or current_user_can('admin.manage_users'));

create policy "Manage workshop scopes"
  on user_workshop_scope for all
  using (current_user_can('admin.manage_permissions'));

create policy "View own section scopes"
  on user_section_scope for select
  using (user_id = auth.uid() or current_user_can('admin.manage_users'));

create policy "Manage section scopes"
  on user_section_scope for all
  using (current_user_can('admin.manage_permissions'));

create policy "View own employee scopes"
  on user_employee_scope for select
  using (user_id = auth.uid() or current_user_can('admin.manage_users'));

create policy "Manage employee scopes"
  on user_employee_scope for all
  using (current_user_can('admin.manage_permissions'));

create policy "View own pay type scopes"
  on user_pay_type_scope for select
  using (user_id = auth.uid() or current_user_can('admin.manage_users'));

create policy "Manage pay type scopes"
  on user_pay_type_scope for all
  using (current_user_can('admin.manage_permissions'));

-- ===== APPROVAL POLICIES =====
create policy "View approval policies"
  on approval_policies for select
  using (auth.uid() is not null);

create policy "Manage approval policies"
  on approval_policies for all
  using (current_user_can('admin.manage_policies'));

-- ===== ADJUSTMENTS =====
create policy "View adjustments"
  on adjustments for select
  using (current_user_can('payroll.view') or current_user_can('periods.create_adjustment'));

create policy "Create adjustments"
  on adjustments for insert
  with check (current_user_can('periods.create_adjustment'));
