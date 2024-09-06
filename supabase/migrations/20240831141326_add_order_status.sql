-- Order status configuration
create table public.order_status (
    id int4 primary key,
    name text not null
);
alter table public.order_status enable row level security;
create policy "anyone can read order_status"
on public.order_status
for select
using (true);

-- Order history configuration
create table public.order_history (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references public.order(id),
    order_status_id int4 not null references public.order_status(id),
    created_at timestamptz not null default now(),
    notes text
);
alter table public.order_history enable row level security;
create policy "user can read order_history"
on public.order_history
for select
using (auth.uid() = (
    select user_id
    from public.order
    where id = order_id
));

create policy "user can create order_history"
on public.order_history
for insert
with check (auth.uid() = (
    select user_id
    from public.order
    where id = order_id
));
