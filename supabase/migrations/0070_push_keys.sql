-- The game's push key pair is made by the "notify" server function the first time it runs (Web Push VAPID keys), and
-- kept only in app_secrets: the private half never leaves the server, and nobody types or copies it. Phones ask for the
-- public half to turn notifications on. Additive only.

-- Stores the pair once; a second call keeps the first pair. Called only by the "notify" function.
create function public.push_vapid_init(p_public text, p_private text) returns void
language sql security definer set search_path = '' as $$
  insert into public.app_secrets (name, value)
  values ('vapid_public', p_public), ('vapid_private', p_private), ('vapid_subject', 'https://mythios.vercel.app')
  on conflict (name) do nothing;
$$;

-- The public half, for a phone turning notifications on (null until the "notify" function has first run).
create function public.push_public_key() returns text
language sql stable security definer set search_path = '' as $$
  select value from public.app_secrets where name = 'vapid_public';
$$;

revoke execute on function public.push_vapid_init, public.push_public_key from public, anon, authenticated;
grant execute on function public.push_vapid_init to service_role;
grant execute on function public.push_public_key to authenticated;
