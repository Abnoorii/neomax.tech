-- ===== SEED PERMISSION CATALOG =====
insert into permissions (code, category, name_en, description_en) values
-- EMPLOYEES
('employees.view',           'employees', 'View Employees',         'View employee list and basic details'),
('employees.create',         'employees', 'Create Employees',       'Add new employees'),
('employees.edit',           'employees', 'Edit Employees',         'Edit non-financial employee details'),
('employees.change_salary',  'employees', 'Change Salary',          'Change base_salary or daily_rate (requires dual approval)'),
('employees.change_status',  'employees', 'Change Status',          'Change status (active/inactive/terminated)'),
('employees.delete',         'employees', 'Delete Employees',       'Soft-delete employees'),
-- RATE CARD
('rate_card.view',           'rate_card', 'View Rate Card',         'View current and historical rates'),
('rate_card.create',         'rate_card', 'Create Rate Card',       'Add new work codes'),
('rate_card.edit',           'rate_card', 'Edit Rate Card',         'Edit rates (versioned, requires dual approval)'),
('rate_card.bulk_update',    'rate_card', 'Bulk Update Rates',      'Bulk percentage adjustments (requires dual approval)'),
-- ATTENDANCE
('attendance.view_own',      'attendance', 'View Own Attendance',   'View own attendance records'),
('attendance.view_all',      'attendance', 'View All Attendance',   'View attendance for in-scope employees'),
('attendance.enter',         'attendance', 'Enter Attendance',      'Create new attendance entries'),
('attendance.edit_own',      'attendance', 'Edit Own Attendance',   'Edit own entries within 7 days'),
('attendance.edit_any',      'attendance', 'Edit Any Attendance',   'Edit any in-scope entry within 30 days'),
('attendance.override_lock', 'attendance', 'Override Attendance Lock', 'Override 7/30-day lock (HR+)'),
-- PRODUCTION
('production.view_own',      'production', 'View Own Production',  'View own production records'),
('production.view_all',      'production', 'View All Production',  'View all in-scope production'),
('production.enter',         'production', 'Enter Production',     'Create new production entries'),
('production.edit_own',      'production', 'Edit Own Production',  'Edit own entries within 7 days'),
('production.edit_any',      'production', 'Edit Any Production',  'Edit any in-scope entry within 30 days'),
('production.override_lock', 'production', 'Override Production Lock', 'Override lock (HR+)'),
-- ADVANCES
('advances.view',            'advances', 'View Advances',          'View advance records'),
('advances.disburse',        'advances', 'Disburse Advances',      'Record new advance disbursements'),
('advances.recover',         'advances', 'Recover Advances',       'Manually record recoveries'),
('advances.adjust',          'advances', 'Adjust Advances',        'Write-offs and corrections (requires dual approval)'),
-- PAYROLL
('payroll.view',             'payroll', 'View Payroll',            'View payroll runs and payslips'),
('payroll.prepare',          'payroll', 'Prepare Payroll',         'Run draft monthly payroll'),
('payroll.approve',          'payroll', 'Approve Payroll',         'Approve a payroll run (dual approval)'),
('payroll.mark_paid',        'payroll', 'Mark Payroll Paid',       'Mark a payroll run as disbursed'),
('payroll.view_tax',         'payroll', 'View Tax Details',        'See tax details on payslips'),
-- REPORTS
('reports.labor_cost',       'reports', 'Labor Cost Reports',      'View labor cost dashboards and reports'),
('reports.view_salaries',    'reports', 'View Salaries',           'See salary details in reports'),
('reports.view_per_employee','reports', 'Per-Employee Reports',    'View per-employee breakdowns'),
('reports.export_pdf',       'reports', 'Export PDF',              'Export reports as PDF'),
('reports.export_excel',     'reports', 'Export Excel',            'Export reports as Excel'),
-- PERIODS
('periods.close_month',      'periods', 'Close Month',             'Close an accounting period'),
('periods.reopen_month',     'periods', 'Reopen Month',            'Reopen a closed period (dual approval, Owner+)'),
('periods.create_adjustment','periods', 'Create Adjustments',      'Create adjustment entries in open month'),
-- AI
('ai.use_voice_entry',       'ai', 'Voice Entry',                  'Use voice input for production/attendance'),
('ai.use_nl_reporting',      'ai', 'NL Reporting',                 'Use natural-language report queries'),
('ai.use_ocr',               'ai', 'OCR Import',                   'Use OCR to import legacy records'),
('ai.view_logs',             'ai', 'View AI Logs',                 'View AI feature usage logs'),
-- ADMIN
('admin.manage_users',       'admin', 'Manage Users',              'Create and manage user accounts'),
('admin.manage_permissions', 'admin', 'Manage Permissions',        'Create and assign roles and permissions'),
('admin.manage_workshops',   'admin', 'Manage Workshops',          'Manage workshop/section configuration'),
('admin.manage_policies',    'admin', 'Manage Policies',           'Edit approval policies, thresholds, tax rate'),
('admin.view_audit_log',     'admin', 'View Audit Log',            'View full system audit trail'),
('admin.manage_approvals',   'admin', 'Manage Approvals',          'Approve sensitive actions'),
-- APPROVAL
('approval.approve_salary_change',  'approval', 'Approve Salary Change',   'Approve salary change requests'),
('approval.approve_termination',    'approval', 'Approve Termination',     'Approve employee termination'),
('approval.approve_rate_change',    'approval', 'Approve Rate Change',     'Approve rate card changes'),
('approval.approve_payroll',        'approval', 'Approve Payroll',         'Approve payroll runs'),
('approval.approve_large_advance',  'approval', 'Approve Large Advance',   'Approve advances over threshold'),
('approval.approve_writeoff',       'approval', 'Approve Write-off',       'Approve advance write-offs'),
('approval.approve_reopen_month',   'approval', 'Approve Reopen Month',    'Approve reopening closed period'),
('approval.approve_void',           'approval', 'Approve Void',            'Approve void/cancel records'),
('approval.approve_policy_change',  'approval', 'Approve Policy Change',   'Approve policy/tax changes');

-- ===== SEED DEFAULT ROLE TEMPLATES =====

-- floor_supervisor
insert into roles (code, name_en, name_dari, description, is_system) values
('floor_supervisor', 'Floor Supervisor', 'سرپرست کارگاه', 'Can enter attendance and production for in-scope workers', true);

insert into role_permissions (role_id, permission_code)
select r.id, p.code from roles r, permissions p
where r.code = 'floor_supervisor'
  and p.code in (
    'attendance.enter', 'attendance.view_all', 'attendance.edit_own',
    'production.enter', 'production.view_all', 'production.edit_own',
    'employees.view', 'ai.use_voice_entry'
  );

-- casting_supervisor
insert into roles (code, name_en, name_dari, description, is_system) values
('casting_supervisor', 'Casting Supervisor', 'سرپرست ریخت', 'Floor supervisor pre-scoped to Casting section', true);

insert into role_permissions (role_id, permission_code)
select r.id, p.code from roles r, permissions p
where r.code = 'casting_supervisor'
  and p.code in (
    'attendance.enter', 'attendance.view_all', 'attendance.edit_own',
    'production.enter', 'production.view_all', 'production.edit_own',
    'employees.view', 'ai.use_voice_entry'
  );

-- bookkeeper
insert into roles (code, name_en, name_dari, description, is_system) values
('bookkeeper', 'Bookkeeper', 'حسابدار', 'Full operational access — no salary changes or payroll approval', true);

insert into role_permissions (role_id, permission_code)
select r.id, p.code from roles r, permissions p
where r.code = 'bookkeeper'
  and p.code in (
    'attendance.enter', 'attendance.view_all', 'attendance.edit_own', 'attendance.edit_any',
    'production.enter', 'production.view_all', 'production.edit_own', 'production.edit_any',
    'employees.view',
    'advances.view', 'advances.disburse', 'advances.recover',
    'payroll.view', 'payroll.prepare',
    'reports.labor_cost', 'reports.view_per_employee', 'reports.export_pdf', 'reports.export_excel',
    'rate_card.view', 'ai.use_voice_entry', 'ai.use_nl_reporting'
  );

-- hr_manager
insert into roles (code, name_en, name_dari, description, is_system) values
('hr_manager', 'HR Manager', 'مدیر منابع بشری', 'Bookkeeper + employee management + attendance overrides', true);

insert into role_permissions (role_id, permission_code)
select r.id, p.code from roles r, permissions p
where r.code = 'hr_manager'
  and p.code in (
    'attendance.enter', 'attendance.view_all', 'attendance.edit_own', 'attendance.edit_any', 'attendance.override_lock',
    'production.enter', 'production.view_all', 'production.edit_own', 'production.edit_any', 'production.override_lock',
    'employees.view', 'employees.create', 'employees.edit', 'employees.change_status',
    'advances.view', 'advances.disburse', 'advances.recover',
    'payroll.view', 'payroll.prepare',
    'reports.labor_cost', 'reports.view_per_employee', 'reports.export_pdf', 'reports.export_excel',
    'rate_card.view', 'ai.use_voice_entry', 'ai.use_nl_reporting',
    'approval.approve_termination'
  );

-- finance
insert into roles (code, name_en, name_dari, description, is_system) values
('finance', 'Finance', 'مالی', 'HR Manager + payroll approval, period close, and financial approvals', true);

insert into role_permissions (role_id, permission_code)
select r.id, p.code from roles r, permissions p
where r.code = 'finance'
  and p.code in (
    'attendance.enter', 'attendance.view_all', 'attendance.edit_own', 'attendance.edit_any', 'attendance.override_lock',
    'production.enter', 'production.view_all', 'production.edit_own', 'production.edit_any', 'production.override_lock',
    'employees.view', 'employees.create', 'employees.edit', 'employees.change_status',
    'advances.view', 'advances.disburse', 'advances.recover', 'advances.adjust',
    'payroll.view', 'payroll.prepare', 'payroll.approve', 'payroll.mark_paid', 'payroll.view_tax',
    'reports.labor_cost', 'reports.view_salaries', 'reports.view_per_employee', 'reports.export_pdf', 'reports.export_excel',
    'rate_card.view', 'rate_card.create',
    'periods.close_month', 'periods.create_adjustment',
    'ai.use_voice_entry', 'ai.use_nl_reporting',
    'approval.approve_termination', 'approval.approve_salary_change', 'approval.approve_payroll',
    'approval.approve_large_advance', 'approval.approve_rate_change', 'approval.approve_writeoff',
    'admin.manage_approvals'
  );

-- owner_admin
insert into roles (code, name_en, name_dari, description, is_system) values
('owner_admin', 'Owner / Admin', 'مالک / مدیر', 'Full access — all permissions including admin and reopen', true);

insert into role_permissions (role_id, permission_code)
select r.id, p.code from roles r, permissions p
where r.code = 'owner_admin';

-- worker (self-service only)
insert into roles (code, name_en, name_dari, description, is_system) values
('worker', 'Worker', 'کارگر', 'View own attendance, production, and payslips only', true);

insert into role_permissions (role_id, permission_code)
select r.id, p.code from roles r, permissions p
where r.code = 'worker'
  and p.code in (
    'attendance.view_own', 'production.view_own'
  );

-- ===== SEED APPROVAL POLICIES =====
insert into approval_policies (action_type, requires_dual_approval, requester_permission, approver_permission, amount_threshold) values
('salary_change',       true, 'employees.change_salary',   'approval.approve_salary_change',  null),
('employee_termination',true, 'employees.change_status',   'approval.approve_termination',    null),
('rate_card_change',    true, 'rate_card.edit',             'approval.approve_rate_change',    null),
('payroll_run_approval',true, 'payroll.prepare',            'approval.approve_payroll',        null),
('large_advance',       true, 'advances.disburse',          'approval.approve_large_advance',  10000),
('advance_writeoff',    true, 'advances.adjust',            'approval.approve_writeoff',       null),
('reopen_closed_month', true, 'periods.reopen_month',       'approval.approve_reopen_month',   null),
('void_record',         true, 'employees.edit',             'approval.approve_void',           null),
('policy_change',       true, 'admin.manage_policies',      'approval.approve_policy_change',  null);

-- ===== SEED DEFAULT WORKSHOP =====
insert into workshops (name, location, default_currency) values
('Misgaran Main Workshop', 'Kabul', 'AFN');

-- ===== SEED SECTIONS =====
insert into sections (workshop_id, code, name_en, name_dari)
select w.id, s.code, s.name_en, s.name_dari
from workshops w, (values
  ('CASTING',  'Casting',   'ریخت'),
  ('FORMING',  'Forming',   'مایچه'),
  ('POLISHING','Polishing', 'پالش'),
  ('FINISHING','Finishing', 'خالیکن'),
  ('OFFICE',   'Office',    'دفتر'),
  ('KITCHEN',  'Kitchen',   'آشپزخانه'),
  ('SECURITY', 'Security',  'امنیت'),
  ('OTHER',    'Other',     'سایر')
) as s(code, name_en, name_dari)
where w.name = 'Misgaran Main Workshop';

-- ===== SEED JOBS =====
insert into jobs (code, name_en, name_dari) values
('WATCHMAN',    'Watchman',                   'نگهبان'),
('SUPERVISOR',  'Supervisor',                 'سرپرست'),
('KHARAD_KAR',  'Kharad Kar (Lathe Operator)','خراد کار'),
('FLIZKAR',     'Flizkar (Metalworker)',       'فلزکار'),
('BARQI',       'Barqi (Electrician)',         'برقی'),
('LABOR',       'Labor',                      'کارگر'),
('BEKKERY',     'Bekkery',                    'بیکری'),
('HR',          'HR',                         'منابع بشری'),
('ACCOUNTANT',  'Accountant',                 'محاسب'),
('CHEF',        'Chef',                       'آشپز'),
('FINANCE',     'Finance',                    'مالی'),
('GUARD',       'Guard',                      'گارد'),
('CHAKI_KHAK',  'Chaki Khak',                 'چکی خاک'),
('CHAKI_PEPSI', 'Chaki Pepsi',                'چکی پپسی'),
('DESIGNER',    'Designer',                   'طراح'),
('CLEANER',     'Cleaner',                    'نظافتچی'),
('DRIVER',      'Driver',                     'راننده'),
('CASTER',      'Caster (Riht)',               'ریخت گر'),
('POLISHER',    'Polisher (Palish)',           'پالش کار'),
('FINISHER',    'Finisher (Khaliken)',         'خالیکن'),
('FORMER',      'Former (Maicha)',             'مایچه کار'),
('SARPECH_MAKER','Sarpech Maker',             'سرپیچ ساز'),
('LID_MAKER',   'Lid Maker',                  'درپوش ساز'),
('STOREKEEPER', 'Storekeeper',                'انبارداری'),
('FOREMAN',     'Foreman',                    'فورمن'),
('APPRENTICE',  'Apprentice',                 'شاگرد'),
('OTHER',       'Other',                      'سایر');

-- ===== SEED SAMPLE RATE CARD =====
insert into rate_card (work_code, description_dari, description_en, category, unit_price, effective_from) values
('DR-M3-Lit',   'ریخت ۳ لیتر مسی (روز)',    'Casting 3L copper pot (day)',    'casting',   2.5,  '2026-03-21'),
('DR-M5-Lit',   'ریخت ۵ لیتر مسی (روز)',    'Casting 5L copper pot (day)',    'casting',   2.8,  '2026-03-21'),
('DR-M8-Lit',   'ریخت ۸ لیتر مسی (روز)',    'Casting 8L copper pot (day)',    'casting',   3.2,  '2026-03-21'),
('DR-M10-Lit',  'ریخت ۱۰ لیتر مسی (روز)',   'Casting 10L copper pot (day)',   'casting',   3.8,  '2026-03-21'),
('DR-M12-Lit',  'ریخت ۱۲ لیتر مسی (روز)',   'Casting 12L copper pot (day)',   'casting',   4.2,  '2026-03-21'),
('DR-M15-Lit',  'ریخت ۱۵ لیتر مسی (روز)',   'Casting 15L copper pot (day)',   'casting',   4.8,  '2026-03-21'),
('DR-M20-Lit',  'ریخت ۲۰ لیتر مسی (روز)',   'Casting 20L copper pot (day)',   'casting',   5.5,  '2026-03-21'),
('DM-CS10-Lit', 'مایچه ۱۰ لیتر ساده (روز)', 'Forming 10L plain pot (day)',    'forming',   3.3,  '2026-03-21'),
('DM-CS15-Lit', 'مایچه ۱۵ لیتر ساده (روز)', 'Forming 15L plain pot (day)',    'forming',   3.9,  '2026-03-21'),
('DM-CS20-Lit', 'مایچه ۲۰ لیتر ساده (روز)', 'Forming 20L plain pot (day)',    'forming',   4.5,  '2026-03-21'),
('DP-M10-Lit',  'پالش ۱۰ لیتر مسی (روز)',   'Polishing 10L copper pot (day)', 'polishing', 2.9,  '2026-03-21'),
('DP-M20-Lit',  'پالش ۲۰ لیتر مسی (روز)',   'Polishing 20L copper pot (day)', 'polishing', 4.1,  '2026-03-21'),
('DKHL-CS10-Lit','خالیکن ۱۰ لیتر ساده (روز)','Finishing 10L plain pot (day)', 'finishing', 2.6, '2026-03-21'),
('DKHL-CS20-Lit','خالیکن ۲۰ لیتر ساده (روز)','Finishing 20L plain pot (day)', 'finishing', 3.7, '2026-03-21');
