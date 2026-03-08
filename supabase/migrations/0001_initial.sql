-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- house
create table house (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- household
create table household (
  id uuid primary key default uuid_generate_v4(),
  house_id uuid not null references house(id),
  name text not null,
  color text not null
);

-- profile (extends auth.users)
create table profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  household_id uuid not null references household(id),
  role text not null check (role in ('head', 'member'))
);

-- year
create table year (
  id uuid primary key default uuid_generate_v4(),
  house_id uuid not null references house(id),
  year int not null,
  rotation_order uuid[] not null default '{}',
  spring_shared_week_number int,
  unique(house_id, year)
);

-- week_allocation
create table week_allocation (
  id uuid primary key default uuid_generate_v4(),
  year_id uuid not null references year(id),
  week_number int not null,
  week_start date not null,
  week_end date not null,
  type text not null check (type in ('household', 'shared_verslunarmannahelgi', 'shared_spring')),
  household_id uuid references household(id)
);

create index idx_wa_year_week on week_allocation(year_id, week_number);
create index idx_wa_year_household on week_allocation(year_id, household_id);
create index idx_wa_year_type on week_allocation(year_id, type);

-- day_release
create table day_release (
  id uuid primary key default uuid_generate_v4(),
  week_allocation_id uuid not null references week_allocation(id) on delete cascade,
  date date not null,
  status text not null check (status in ('released', 'claimed')),
  claimed_by_household_id uuid references household(id)
);

create index idx_dr_allocation_status on day_release(week_allocation_id, status);

-- request
create table request (
  id uuid primary key default uuid_generate_v4(),
  year_id uuid not null references year(id),
  requesting_household_id uuid not null references household(id),
  target_week_allocation_id uuid not null references week_allocation(id),
  requested_days date[] not null default '{}',
  status text not null check (status in ('pending_own_head', 'pending_releasing_head', 'approved', 'declined', 'cancelled')),
  decline_reason text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index idx_req_status_allocation on request(status, target_week_allocation_id);

-- swap_proposal
create table swap_proposal (
  id uuid primary key default uuid_generate_v4(),
  year_id uuid not null references year(id),
  household_a_id uuid not null references household(id),
  allocation_a_id uuid not null references week_allocation(id),
  days_a date[] not null default '{}',
  household_b_id uuid not null references household(id),
  allocation_b_id uuid not null references week_allocation(id),
  days_b date[] not null default '{}',
  status text not null check (status in ('pending_own_head', 'pending_other_head', 'approved', 'declined', 'cancelled')),
  decline_reason text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index idx_swap_status_household_b on swap_proposal(status, household_b_id);

-- allocation_change
create table allocation_change (
  id uuid primary key default uuid_generate_v4(),
  year_id uuid not null references year(id),
  changed_by uuid not null references auth.users(id),
  change_type text not null check (change_type in ('rotation_order', 'spring_week')),
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

-- notification
create table notification (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('release', 'request_received', 'request_resolved', 'swap_received', 'swap_resolved', 'allocation_changed', 'member_action_pending', 'auto_cancelled')),
  reference_id uuid,
  reference_type text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notif_user_read_date on notification(user_id, read, created_at desc);

-- =====================
-- HELPER FUNCTIONS
-- =====================

create or replace function current_profile()
returns profile
language sql
security definer
stable
as $$
  select * from profile where id = auth.uid()
$$;

create or replace function is_head()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profile where id = auth.uid() and role = 'head'
  )
$$;

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table house enable row level security;
alter table household enable row level security;
alter table year enable row level security;
alter table week_allocation enable row level security;
alter table profile enable row level security;
alter table day_release enable row level security;
alter table request enable row level security;
alter table swap_proposal enable row level security;
alter table allocation_change enable row level security;
alter table notification enable row level security;

-- house: all authenticated read; heads write
create policy "house_read" on house for select to authenticated using (true);
create policy "house_write" on house for all to authenticated using (is_head()) with check (is_head());

-- household: all authenticated read; heads write
create policy "household_read" on household for select to authenticated using (true);
create policy "household_write" on household for all to authenticated using (is_head()) with check (is_head());

-- year: all authenticated read; heads write
create policy "year_read" on year for select to authenticated using (true);
create policy "year_write" on year for all to authenticated using (is_head()) with check (is_head());

-- week_allocation: all authenticated read; heads write
create policy "wa_read" on week_allocation for select to authenticated using (true);
create policy "wa_write" on week_allocation for all to authenticated using (is_head()) with check (is_head());

-- profile: users read own + same household; heads read all; users update own
create policy "profile_read_own" on profile for select to authenticated
  using (id = auth.uid() or household_id = (select household_id from profile where id = auth.uid()) or is_head());
create policy "profile_update_own" on profile for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profile_insert" on profile for insert to authenticated
  with check (id = auth.uid());

-- day_release: all authenticated read; heads write
create policy "dr_read" on day_release for select to authenticated using (true);
create policy "dr_write" on day_release for all to authenticated using (is_head()) with check (is_head());

-- request: all authenticated read; own household inserts; heads update
create policy "req_read" on request for select to authenticated using (true);
create policy "req_insert" on request for insert to authenticated
  with check (requesting_household_id = (select household_id from profile where id = auth.uid()));
create policy "req_update" on request for update to authenticated
  using (is_head() or requesting_household_id = (select household_id from profile where id = auth.uid()));

-- swap_proposal: all authenticated read; own household inserts; heads update
create policy "swap_read" on swap_proposal for select to authenticated using (true);
create policy "swap_insert" on swap_proposal for insert to authenticated
  with check (household_a_id = (select household_id from profile where id = auth.uid()));
create policy "swap_update" on swap_proposal for update to authenticated
  using (is_head() or household_a_id = (select household_id from profile where id = auth.uid()) or household_b_id = (select household_id from profile where id = auth.uid()));

-- allocation_change: all authenticated read; heads write
create policy "ac_read" on allocation_change for select to authenticated using (true);
create policy "ac_write" on allocation_change for all to authenticated using (is_head()) with check (is_head());

-- notification: own rows only; service role bypasses
create policy "notif_own" on notification for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
