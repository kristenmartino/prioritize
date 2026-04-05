-- Prioritize Database Schema
-- Run this in the Supabase SQL Editor to set up the database.

-- Workspaces table
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null default 'My Backlog',
  position int not null default 0,
  product_summary text default '',
  target_users text default '',
  strategic_priorities text default '',
  created_at timestamptz default now()
);

-- Features table
create table public.features (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text default '',
  reach int not null default 50,
  impact int not null default 50,
  confidence int not null default 50,
  effort int not null default 50,
  position int not null default 0,
  created_at timestamptz default now()
);

-- Indexes
create index idx_workspaces_user on public.workspaces(user_id);
create index idx_features_workspace on public.features(workspace_id);

-- ─── Agent Feedback Loop Tables ─────────────────────────────────────

-- Tracks AI score suggestions and whether users accepted/adjusted/rejected them
create table public.ai_score_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  feature_id text not null,
  feature_name text not null,
  dimension text not null check (dimension in ('reach', 'impact', 'confidence', 'effort')),
  ai_score int not null,
  final_score int,
  outcome text not null default 'pending' check (outcome in ('pending', 'accepted', 'adjusted', 'rejected')),
  created_at timestamptz default now()
);
create index idx_score_events_ws on public.ai_score_events(workspace_id);

-- Tracks AI analysis runs and user engagement signals
create table public.ai_analysis_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  feature_count int not null,
  mode text not null check (mode in ('live', 'demo')),
  response_ms int,
  top_pick text,
  quick_win text,
  risk_flag text,
  error boolean default false,
  thumbs_up boolean,
  created_at timestamptz default now()
);
create index idx_analysis_events_ws on public.ai_analysis_events(workspace_id);

-- ─── Feature Version Control ────────────────────────────────────────

-- Full snapshot per revision with field-level change tracking
create table public.feature_revisions (
  id uuid primary key default gen_random_uuid(),
  feature_id uuid not null references public.features(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  revision_number int not null,
  snapshot_name text not null,
  snapshot_description text not null default '',
  snapshot_reach int not null,
  snapshot_impact int not null,
  snapshot_confidence int not null,
  snapshot_effort int not null,
  change_type text not null default 'updated'
    check (change_type in ('created', 'updated', 'reverted')),
  changed_fields jsonb not null default '[]'::jsonb,
  change_summary text not null default '',
  reverted_to_revision int,
  created_at timestamptz not null default now()
);
create unique index idx_revisions_feature_number on public.feature_revisions(feature_id, revision_number);
create index idx_revisions_feature_created on public.feature_revisions(feature_id, created_at desc);
create index idx_revisions_workspace on public.feature_revisions(workspace_id);
