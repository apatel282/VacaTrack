create table if not exists settings (
  id serial primary key,
  period_start_month integer,
  period_start_year integer,
  period_end_month integer,
  period_end_year integer,
  annual_allotment integer not null default 0,
  theme text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pto_entries (
  id text primary key,
  type text not null check (type in ('used', 'planned')),
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
