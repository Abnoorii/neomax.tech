-- ===== updated_at trigger =====
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_employees_updated_at
  before update on employees
  for each row execute function update_updated_at();

-- ===== ATTENDANCE HISTORY TRIGGER =====
create or replace function log_attendance_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into attendance_history (
      attendance_id, employee_id, date, action,
      new_status, new_hours, new_overtime,
      changed_by, changed_at
    ) values (
      NEW.id, NEW.employee_id, NEW.date, 'insert',
      NEW.status, NEW.hours, NEW.overtime_hours,
      coalesce(NEW.entered_by, auth.uid()), now()
    );
    return NEW;
  elsif (TG_OP = 'UPDATE') then
    if (OLD.status is distinct from NEW.status
        or OLD.hours is distinct from NEW.hours
        or OLD.overtime_hours is distinct from NEW.overtime_hours) then
      insert into attendance_history (
        attendance_id, employee_id, date, action,
        previous_status, new_status,
        previous_hours, new_hours,
        previous_overtime, new_overtime,
        changed_by, changed_at, reason
      ) values (
        NEW.id, NEW.employee_id, NEW.date, 'update',
        OLD.status, NEW.status,
        OLD.hours, NEW.hours,
        OLD.overtime_hours, NEW.overtime_hours,
        auth.uid(), now(),
        current_setting('app.change_reason', true)
      );
    end if;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    insert into attendance_history (
      attendance_id, employee_id, date, action,
      previous_status, previous_hours, previous_overtime,
      changed_by, changed_at, reason
    ) values (
      OLD.id, OLD.employee_id, OLD.date, 'delete',
      OLD.status, OLD.hours, OLD.overtime_hours,
      auth.uid(), now(),
      current_setting('app.change_reason', true)
    );
    return OLD;
  end if;
end;
$$ language plpgsql security definer;

create trigger trg_attendance_history
  after insert or update or delete on attendance
  for each row execute function log_attendance_change();

-- ===== PRODUCTION HISTORY TRIGGER =====
create or replace function log_production_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into production_history (
      production_id, employee_id, date, action,
      new_rate_card_id, new_quantity, new_unit_price, new_total,
      changed_by, changed_at
    ) values (
      NEW.id, NEW.employee_id, NEW.date, 'insert',
      NEW.rate_card_id, NEW.quantity, NEW.unit_price, NEW.total,
      coalesce(NEW.entered_by, auth.uid()), now()
    );
    return NEW;
  elsif (TG_OP = 'UPDATE') then
    if (OLD.quantity is distinct from NEW.quantity
        or OLD.rate_card_id is distinct from NEW.rate_card_id
        or OLD.unit_price is distinct from NEW.unit_price) then
      insert into production_history (
        production_id, employee_id, date, action,
        previous_rate_card_id, new_rate_card_id,
        previous_quantity, new_quantity,
        previous_unit_price, new_unit_price,
        previous_total, new_total,
        changed_by, changed_at, reason
      ) values (
        NEW.id, NEW.employee_id, NEW.date, 'update',
        OLD.rate_card_id, NEW.rate_card_id,
        OLD.quantity, NEW.quantity,
        OLD.unit_price, NEW.unit_price,
        OLD.total, NEW.total,
        auth.uid(), now(),
        current_setting('app.change_reason', true)
      );
    end if;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    insert into production_history (
      production_id, employee_id, date, action,
      previous_rate_card_id, previous_quantity, previous_unit_price, previous_total,
      changed_by, changed_at, reason
    ) values (
      OLD.id, OLD.employee_id, OLD.date, 'delete',
      OLD.rate_card_id, OLD.quantity, OLD.unit_price, OLD.total,
      auth.uid(), now(),
      current_setting('app.change_reason', true)
    );
    return OLD;
  end if;
end;
$$ language plpgsql security definer;

create trigger trg_production_history
  after insert or update or delete on production
  for each row execute function log_production_change();

-- ===== GENERAL AUDIT TRIGGER =====
create or replace function log_audit_change()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into audit_log (table_name, record_id, action, changed_by, before, after)
    values (TG_TABLE_NAME, NEW.id, 'insert', auth.uid(), null, row_to_json(NEW)::jsonb);
    return NEW;
  elsif (TG_OP = 'UPDATE') then
    insert into audit_log (table_name, record_id, action, changed_by, before, after, reason)
    values (TG_TABLE_NAME, NEW.id, 'update', auth.uid(),
      row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb,
      current_setting('app.change_reason', true));
    return NEW;
  elsif (TG_OP = 'DELETE') then
    insert into audit_log (table_name, record_id, action, changed_by, before, after)
    values (TG_TABLE_NAME, OLD.id, 'delete', auth.uid(), row_to_json(OLD)::jsonb, null);
    return OLD;
  end if;
end;
$$ language plpgsql security definer;

-- Apply audit trigger to sensitive tables
create trigger trg_audit_employees
  after insert or update or delete on employees
  for each row execute function log_audit_change();

create trigger trg_audit_rate_card
  after insert or update or delete on rate_card
  for each row execute function log_audit_change();

create trigger trg_audit_advances
  after insert or update or delete on advances
  for each row execute function log_audit_change();

create trigger trg_audit_payroll_runs
  after insert or update or delete on payroll_runs
  for each row execute function log_audit_change();

create trigger trg_audit_payslips
  after insert or update or delete on payslips
  for each row execute function log_audit_change();

create trigger trg_audit_accounting_periods
  after insert or update or delete on accounting_periods
  for each row execute function log_audit_change();

create trigger trg_audit_roles
  after insert or update or delete on roles
  for each row execute function log_audit_change();

create trigger trg_audit_role_permissions
  after insert or update or delete on role_permissions
  for each row execute function log_audit_change();

create trigger trg_audit_user_roles
  after insert or update or delete on user_roles
  for each row execute function log_audit_change();

-- ===== RATE CARD: get_rate function =====
create or replace function get_rate(_work_code text, _on_date date)
returns numeric(12,2) as $$
  select unit_price
  from rate_card
  where work_code = _work_code
    and effective_from <= _on_date
    and (effective_to is null or effective_to >= _on_date)
  order by effective_from desc
  limit 1;
$$ language sql security definer stable;

-- ===== AUTO-CREATE profile on user signup =====
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, language)
  values (NEW.id, NEW.raw_user_meta_data->>'full_name', 'dari');
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
