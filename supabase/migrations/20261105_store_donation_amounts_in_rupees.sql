begin;

drop view if exists public.donation_totals;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'donations'
      and column_name = 'amount_paise'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'donations'
      and column_name = 'amount_rupees'
  ) then
    alter table public.donations
      add column amount_rupees numeric(12, 2);

    update public.donations
    set amount_rupees = amount_paise::numeric / 100;

    alter table public.donations
      alter column amount_rupees set not null;

    alter table public.donations
      add constraint donations_amount_rupees_positive_check
      check (amount_rupees > 0);

    alter table public.donations
      drop column amount_paise;
  elsif not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'donations'
      and column_name = 'amount_rupees'
  ) then
    raise exception 'Expected public.donations.amount_paise to migrate.';
  end if;
end;
$$;

create view public.donation_totals
with (security_invoker = true)
as
select
  coalesce(sum(amount_rupees), 0)::numeric(14, 2) as total_amount_rupees,
  count(*)::bigint as donor_count
from public.donations
where status = 'paid';

revoke all on public.donation_totals from anon, authenticated;
grant select on public.donation_totals to service_role;

commit;
