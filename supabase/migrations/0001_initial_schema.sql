-- ClientPortal PostgreSQL Schema & Row-Level Security Migration
-- Target: Supabase PostgreSQL 15+

create extension if not exists "pgcrypto";

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  custom_domain text unique,
  studio_name text not null,
  tagline text not null default '',
  logo_url text,
  accent_hex text not null default '#2F5D50' check (accent_hex ~ '^#[0-9A-Fa-f]{6}$'),
  welcome_message text not null default 'Welcome to your dedicated project hub.',
  contact_email text not null,
  billing_address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  client_name text not null,
  client_company text not null,
  client_email text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  passcode_hash text not null,
  passcode_salt text not null,
  passcode_version integer not null default 1 check (passcode_version >= 1),
  passcode_hint text,
  target_launch_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, slug)
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text not null default '',
  weight_pct integer not null check (weight_pct between 0 and 100),
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'in_review', 'approved')),
  sort_order integer not null default 0,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  milestone_id uuid references public.milestones (id) on delete set null,
  title text not null,
  summary text not null default '',
  kind text not null check (kind in ('image', 'pdf', 'video', 'archive', 'figma', 'staging_url', 'loom', 'document', 'link')),
  status text not null default 'in_review' check (status in ('draft', 'in_review', 'changes_requested', 'approved')),
  current_version integer not null default 1 check (current_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliverable_versions (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables (id) on delete cascade,
  version_number integer not null check (version_number >= 1),
  asset_url text,
  asset_public_id text,
  external_url text,
  preview_type text not null,
  release_notes text not null default '',
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  created_at timestamptz not null default now(),
  unique (deliverable_id, version_number)
);

create table if not exists public.approval_records (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables (id) on delete cascade,
  deliverable_version_id uuid not null references public.deliverable_versions (id) on delete cascade,
  version_number integer not null,
  decision text not null check (decision in ('approved', 'changes_requested')),
  reviewer_name text not null,
  reviewer_email text,
  feedback_note text not null default '',
  decided_at timestamptz not null default now()
);

create table if not exists public.deliverable_comments (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables (id) on delete cascade,
  author_role text not null check (author_role in ('freelancer', 'client')),
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  invoice_number text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'void')),
  currency text not null default 'USD',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  tax_bps integer not null default 0 check (tax_bps between 0 and 10000),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  notes text not null default '',
  stripe_invoice_id text unique,
  stripe_hosted_url text,
  stripe_pdf_url text,
  issue_date date not null default current_date,
  due_date date not null,
  paid_at timestamptz,
  payment_method_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity integer not null check (quantity >= 1),
  unit_amount_cents integer not null check (unit_amount_cents >= 0),
  amount_cents integer not null check (amount_cents >= 0),
  sort_order integer not null default 0
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  type text not null,
  actor_name text not null,
  actor_role text not null check (actor_role in ('freelancer', 'client', 'system')),
  message text not null,
  created_at timestamptz not null default now()
);

-- Indexes for fast multi-tenant lookup
create index if not exists idx_studios_custom_domain on public.studios (custom_domain);
create index if not exists idx_projects_studio_slug on public.projects (studio_id, slug);
create index if not exists idx_milestones_project on public.milestones (project_id, sort_order);
create index if not exists idx_deliverables_project on public.deliverables (project_id);
create index if not exists idx_invoices_project on public.invoices (project_id);
create index if not exists idx_activity_events_project on public.activity_events (project_id, created_at desc);

-- Row-Level Security (Strict Freelancer Tenant Isolation)
alter table public.studios enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.deliverables enable row level security;
alter table public.deliverable_versions enable row level security;
alter table public.approval_records enable row level security;
alter table public.deliverable_comments enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.activity_events enable row level security;

create policy "studio_owner_all" on public.studios
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

create policy "project_owner_all" on public.projects
  for all using (
    exists (
      select 1 from public.studios s
      where s.id = projects.studio_id and s.owner_user_id = auth.uid()
    )
  );

create policy "milestone_owner_all" on public.milestones
  for all using (
    exists (
      select 1 from public.projects p
      join public.studios s on s.id = p.studio_id
      where p.id = milestones.project_id and s.owner_user_id = auth.uid()
    )
  );

create policy "deliverable_owner_all" on public.deliverables
  for all using (
    exists (
      select 1 from public.projects p
      join public.studios s on s.id = p.studio_id
      where p.id = deliverables.project_id and s.owner_user_id = auth.uid()
    )
  );

create policy "deliverable_version_owner_all" on public.deliverable_versions
  for all using (
    exists (
      select 1 from public.deliverables d
      join public.projects p on p.id = d.project_id
      join public.studios s on s.id = p.studio_id
      where d.id = deliverable_versions.deliverable_id and s.owner_user_id = auth.uid()
    )
  );

create policy "approval_record_owner_all" on public.approval_records
  for all using (
    exists (
      select 1 from public.deliverables d
      join public.projects p on p.id = d.project_id
      join public.studios s on s.id = p.studio_id
      where d.id = approval_records.deliverable_id and s.owner_user_id = auth.uid()
    )
  );

create policy "comment_owner_all" on public.deliverable_comments
  for all using (
    exists (
      select 1 from public.deliverables d
      join public.projects p on p.id = d.project_id
      join public.studios s on s.id = p.studio_id
      where d.id = deliverable_comments.deliverable_id and s.owner_user_id = auth.uid()
    )
  );

create policy "invoice_owner_all" on public.invoices
  for all using (
    exists (
      select 1 from public.projects p
      join public.studios s on s.id = p.studio_id
      where p.id = invoices.project_id and s.owner_user_id = auth.uid()
    )
  );

create policy "invoice_line_item_owner_all" on public.invoice_line_items
  for all using (
    exists (
      select 1 from public.invoices i
      join public.projects p on p.id = i.project_id
      join public.studios s on s.id = p.studio_id
      where i.id = invoice_line_items.invoice_id and s.owner_user_id = auth.uid()
    )
  );

create policy "activity_owner_all" on public.activity_events
  for all using (
    exists (
      select 1 from public.projects p
      join public.studios s on s.id = p.studio_id
      where p.id = activity_events.project_id and s.owner_user_id = auth.uid()
    )
  );
