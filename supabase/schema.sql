create extension if not exists pgcrypto;

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  amount_rupees numeric(12, 2) not null check (amount_rupees > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  donor_name text not null,
  donor_email text not null,
  donor_phone text,
  public_opt_in boolean not null default false,
  public_display_name text,
  donation_type text not null check (donation_type in ('money', 'materials')),
  item_summary text,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  donor_email_sent boolean not null default false,
  admin_email_sent boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  check (
    (public_opt_in and public_display_name is not null)
    or (not public_opt_in and public_display_name is null)
  )
);

create index if not exists donations_paid_at_idx
  on public.donations (paid_at desc)
  where status = 'paid';

alter table public.donations enable row level security;
revoke all on public.donations from anon, authenticated;
grant select, insert, update on public.donations to service_role;

create or replace view public.donation_totals
with (security_invoker = true)
as
select
  coalesce(sum(amount_rupees), 0)::numeric(14, 2) as total_amount_rupees,
  count(*)::bigint as donor_count
from public.donations
where status = 'paid';

revoke all on public.donation_totals from anon, authenticated;
grant select on public.donation_totals to service_role;
