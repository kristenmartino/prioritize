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
