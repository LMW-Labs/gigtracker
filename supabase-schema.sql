-- GigTracker Supabase Schema
-- Run this in your Supabase SQL editor

create table if not exists trips (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  platform text check (platform in ('lyft', 'uber', 'both')) default 'lyft',
  miles numeric(8,2) not null default 0,
  gross_earnings numeric(10,2) not null default 0,
  tips numeric(10,2) not null default 0,
  hours numeric(6,2) not null default 0,
  notes text,
  created_at timestamptz default now()
);

-- Index for date-range queries
create index if not exists trips_date_idx on trips(date);

-- Enable Row Level Security (optional - for single user, you can disable)
alter table trips enable row level security;

-- Allow all operations for now (single-user app)
-- If you want auth later, replace with user-specific policies
create policy "Allow all" on trips for all using (true) with check (true);
