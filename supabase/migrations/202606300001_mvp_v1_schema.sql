create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create type public.application_status as enum ('saved','preparing','applied','waiting_response','hr_screening','interview','technical_test','offering','accepted','rejected','ghosted','follow_up_needed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_attention_status as enum ('follow_up_needed','deadline_soon','interview_soon','test_due','waiting_too_long');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_priority as enum ('low','medium','high','dream');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_result as enum ('accepted','rejected','ghosted','withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.follow_up_status as enum ('scheduled','due','overdue','completed','cancelled','rescheduled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.follow_up_outcome as enum ('no_response_yet','recruiter_replied','interview_scheduled','test_scheduled','rejected','rescheduled','marked_ghosted','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.interview_stage as enum ('hr_interview','user_interview','technical_interview','case_study','group_discussion','final_interview','offering_discussion','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.interview_status as enum ('scheduled','needs_preparation','completed','waiting_result','cancelled','rescheduled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.location_type as enum ('online','onsite','phone','unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.job_type as enum ('internship','full_time','mt_odp','contract','freelance','part_time','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.work_system as enum ('onsite','hybrid','remote','unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_type as enum ('cv_ats','cv_creative','portfolio','cover_letter','transcript','certificate','linkedin_url','github_url','behance_url','personal_website','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_status as enum ('ready','needs_review','draft','old_version');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_event_type as enum ('application_created','application_updated','status_changed','follow_up_scheduled','follow_up_completed','follow_up_rescheduled','interview_created','interview_updated','interview_completed','document_attached','document_removed','company_linked','company_research_updated','note_added','result_marked','application_archived','application_restored');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  email text not null,
  avatar_url text,
  current_status text,
  target_roles text[] default '{}',
  location text,
  linkedin_url text,
  portfolio_url text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  default_view text not null default 'today',
  follow_up_after_days integer not null default 7 check (follow_up_after_days >= 1 and follow_up_after_days <= 60),
  ghosted_after_days integer not null default 21 check (ghosted_after_days >= 7 and ghosted_after_days <= 180),
  week_starts_on integer not null default 1 check (week_starts_on >= 0 and week_starts_on <= 6),
  timezone text not null default 'Asia/Jakarta',
  preferred_sources text[] default '{}',
  target_roles text[] default '{}',
  notification_email_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text,
  website_url text,
  source text,
  why_i_apply text,
  company_notes text,
  culture_notes text,
  products_services text,
  red_flags text,
  questions_for_interviewer text,
  recruitment_process_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  company_name text not null check (length(trim(company_name)) > 0),
  role_title text not null check (length(trim(role_title)) > 0),
  source text,
  source_url text,
  job_url text,
  job_type public.job_type,
  work_system public.work_system default 'unknown',
  location text,
  status public.application_status not null default 'saved',
  attention_status public.application_attention_status,
  priority public.application_priority,
  deadline_at timestamptz,
  applied_at timestamptz,
  follow_up_at timestamptz,
  last_followed_up_at timestamptz,
  next_action text,
  notes text,
  result public.application_result,
  result_at timestamptz,
  reflection_notes text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint applications_final_status_result_consistency check (
    (status in ('accepted','rejected','ghosted') and result is not null)
    or status not in ('accepted','rejected','ghosted')
  )
);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type public.application_event_type not null,
  title text not null check (length(trim(title)) > 0),
  description text,
  from_status public.application_status,
  to_status public.application_status,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  due_at timestamptz not null,
  completed_at timestamptz,
  status public.follow_up_status not null default 'scheduled',
  channel text,
  message text,
  response_received boolean not null default false,
  outcome public.follow_up_outcome,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint follow_ups_completed_status_consistency check ((status = 'completed' and completed_at is not null) or status <> 'completed')
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  stage public.interview_stage not null,
  scheduled_at timestamptz,
  ended_at timestamptz,
  location_type public.location_type default 'unknown',
  location_value text,
  interviewer_name text,
  interviewer_role text,
  preparation_notes text,
  questions_to_prepare text[] default '{}',
  questions_asked text[] default '{}',
  my_answers text,
  feedback text,
  next_step text,
  status public.interview_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  type public.document_type not null,
  status public.document_status not null default 'draft',
  url text,
  file_path text,
  version_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  usage_note text,
  attached_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint application_documents_unique_pair unique (application_id, document_id)
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  week_end date not null check (week_end >= week_start),
  applications_sent integer not null default 0,
  responses_received integer not null default 0,
  interviews_scheduled integer not null default 0,
  follow_ups_completed integer not null default 0,
  follow_ups_needed integer not null default 0,
  accepted_count integer not null default 0,
  rejected_count integer not null default 0,
  ghosted_count integer not null default 0,
  offering_count integer not null default 0,
  saved_count integer not null default 0,
  insight text,
  next_week_focus text,
  reflection_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_reviews_user_week_unique unique (user_id, week_start, week_end)
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at before update on public.user_preferences for each row execute function public.set_updated_at();
drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at before update on public.applications for each row execute function public.set_updated_at();
drop trigger if exists set_follow_ups_updated_at on public.follow_ups;
create trigger set_follow_ups_updated_at before update on public.follow_ups for each row execute function public.set_updated_at();
drop trigger if exists set_interviews_updated_at on public.interviews;
create trigger set_interviews_updated_at before update on public.interviews for each row execute function public.set_updated_at();
drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at before update on public.documents for each row execute function public.set_updated_at();
drop trigger if exists set_weekly_reviews_updated_at on public.weekly_reviews;
create trigger set_weekly_reviews_updated_at before update on public.weekly_reviews for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id, timezone, follow_up_after_days, ghosted_after_days, default_view)
  values (new.id, 'Asia/Jakarta', 7, 21, 'today')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists companies_user_id_idx on public.companies(user_id);
create index if not exists companies_user_name_idx on public.companies(user_id, name);
create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_user_status_idx on public.applications(user_id, status);
create index if not exists applications_user_updated_idx on public.applications(user_id, updated_at desc);
create index if not exists applications_user_follow_up_idx on public.applications(user_id, follow_up_at);
create index if not exists application_events_user_id_idx on public.application_events(user_id);
create index if not exists application_events_application_created_idx on public.application_events(application_id, created_at desc);
create index if not exists follow_ups_user_due_idx on public.follow_ups(user_id, due_at);
create index if not exists interviews_user_scheduled_idx on public.interviews(user_id, scheduled_at);
create index if not exists documents_user_id_idx on public.documents(user_id);

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.companies enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
alter table public.follow_ups enable row level security;
alter table public.interviews enable row level security;
alter table public.documents enable row level security;
alter table public.application_documents enable row level security;
alter table public.weekly_reviews enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (user_id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "preferences_select_own" on public.user_preferences for select to authenticated using (user_id = auth.uid());
create policy "preferences_insert_own" on public.user_preferences for insert to authenticated with check (user_id = auth.uid());
create policy "preferences_update_own" on public.user_preferences for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "companies_select_own" on public.companies for select to authenticated using (user_id = auth.uid());
create policy "companies_insert_own" on public.companies for insert to authenticated with check (user_id = auth.uid());
create policy "companies_update_own" on public.companies for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "companies_delete_own" on public.companies for delete to authenticated using (user_id = auth.uid());

create policy "applications_select_own" on public.applications for select to authenticated using (user_id = auth.uid());
create policy "applications_insert_own" on public.applications for insert to authenticated with check (user_id = auth.uid());
create policy "applications_update_own" on public.applications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "applications_delete_own" on public.applications for delete to authenticated using (user_id = auth.uid());

create policy "events_select_own" on public.application_events for select to authenticated using (user_id = auth.uid());
create policy "events_insert_own" on public.application_events for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "events_update_own" on public.application_events for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "events_delete_own" on public.application_events for delete to authenticated using (user_id = auth.uid());

create policy "followups_select_own" on public.follow_ups for select to authenticated using (user_id = auth.uid());
create policy "followups_insert_own" on public.follow_ups for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "followups_update_own" on public.follow_ups for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "followups_delete_own" on public.follow_ups for delete to authenticated using (user_id = auth.uid());

create policy "interviews_select_own" on public.interviews for select to authenticated using (user_id = auth.uid());
create policy "interviews_insert_own" on public.interviews for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "interviews_update_own" on public.interviews for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "interviews_delete_own" on public.interviews for delete to authenticated using (user_id = auth.uid());

create policy "documents_select_own" on public.documents for select to authenticated using (user_id = auth.uid());
create policy "documents_insert_own" on public.documents for insert to authenticated with check (user_id = auth.uid());
create policy "documents_update_own" on public.documents for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "documents_delete_own" on public.documents for delete to authenticated using (user_id = auth.uid());

create policy "application_documents_select_own" on public.application_documents for select to authenticated using (user_id = auth.uid());
create policy "application_documents_insert_own" on public.application_documents for insert to authenticated with check (
  user_id = auth.uid()
  and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  and exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
);
create policy "application_documents_delete_own" on public.application_documents for delete to authenticated using (user_id = auth.uid());

create policy "weekly_reviews_select_own" on public.weekly_reviews for select to authenticated using (user_id = auth.uid());
create policy "weekly_reviews_insert_own" on public.weekly_reviews for insert to authenticated with check (user_id = auth.uid());
create policy "weekly_reviews_update_own" on public.weekly_reviews for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "weekly_reviews_delete_own" on public.weekly_reviews for delete to authenticated using (user_id = auth.uid());
