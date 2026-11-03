-- Run once in Supabase → SQL Editor
create table if not exists products (id bigint primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists reviews  (id bigint generated always as identity primary key, data jsonb not null);
create table if not exists settings (key text primary key, value jsonb not null);
create table if not exists clicks   (id bigint generated always as identity primary key, product_id bigint, kind text, created_at timestamptz default now());
create index if not exists clicks_product_idx on clicks(product_id);

-- Lock the tables: no public/anon access. Only the Vercel backend (service-role key) can read/write.
alter table products enable row level security;
alter table reviews  enable row level security;
alter table settings enable row level security;
alter table clicks   enable row level security;

-- Public bucket for product photos (anyone can view; only the backend can upload)
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
