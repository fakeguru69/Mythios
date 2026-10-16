-- "What should your friends call you?" (review-accounts-and-invites.md §1 Screen 3) is asked once per account.
-- Email sign-up asks it on the form; Google and Apple sign-ins are asked on first arrival (name_chosen = false).
-- Accounts made before this already chose a name: they start as true, new ones as false.
alter table public.profiles add column if not exists name_chosen boolean not null default true;
alter table public.profiles alter column name_chosen set default false;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_chosen text := nullif(new.raw_user_meta_data ->> 'display_name', '');
begin
  insert into public.profiles (id, display_name, name_chosen)
  values (
    new.id,
    left(coalesce(v_chosen, nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''),
                  split_part(new.email, '@', 1), 'Friend'), 12),
    v_chosen is not null
  );
  return new;
end;
$$;

grant update (display_name, name_chosen) on public.profiles to authenticated;
