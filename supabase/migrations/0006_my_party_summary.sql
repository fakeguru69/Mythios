-- A friend who has asked to join (or was turned away) cannot read the party yet; this gives them only
-- its name and the host's name, for "You've knocked. TV will let you in." (review-accounts-and-invites.md §1).
create function public.my_party_summary(p_party uuid) returns table (party_name text, host_name text)
language sql stable security definer set search_path = '' as $$
  select p.name, (select h.character_name from public.party_members h where h.party_id = p.id and h.user_id = p.host_id)
  from public.parties p
  where p.id = p_party
    and exists (select 1 from public.party_members m where m.party_id = p.id and m.user_id = auth.uid());
$$;
revoke execute on function public.my_party_summary from public, anon;
grant execute on function public.my_party_summary to authenticated;
