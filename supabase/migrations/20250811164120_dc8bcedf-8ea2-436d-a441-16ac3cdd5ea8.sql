-- Create a submissions log table for rate limiting
create table if not exists public.job_post_submissions (
  id uuid primary key default gen_random_uuid(),
  ip inet not null,
  created_at timestamptz not null default now(),
  job_id uuid references public.jobs(id) on delete set null
);

-- Enable RLS and only allow inserts (no public reads)
alter table public.job_post_submissions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'job_post_submissions' and policyname = 'Anyone can insert logs'
  ) then
    create policy "Anyone can insert logs"
    on public.job_post_submissions
    for insert
    with check (true);
  end if;
end $$;

-- Indexes for scalability
create index if not exists idx_job_post_submissions_ip_created_at on public.job_post_submissions (ip, created_at desc);
create index if not exists idx_jobs_created_at on public.jobs (created_at desc);
create index if not exists idx_jobs_skills_gin on public.jobs using gin (skills);