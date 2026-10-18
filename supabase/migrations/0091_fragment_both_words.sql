-- Fake Guru, 17 Oct: "for convenience, a party can solve both words. The earlier the puzzles are solved the faster
-- campfire can discuss it." The race stays: the first friend to find a word fills it in for the whole party and takes
-- its 25g. The one-word-per-friend limit until the fragment's own day ends is gone (Core Rules §6): any friend may find
-- both words. solve_word is 0086's body without the oneToday check; nothing else changes.

create or replace function public.solve_word(p_party uuid, p_fragment text, p_slot int, p_guess text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_f public.fragments; v_word text; v_tries public.fragment_tries; v_name text;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select f.* into v_f from public.fragments f join public.parties p on p.series_id = f.series_id and p.season_number = f.season_number
  where p.id = p_party and f.id = p_fragment and (f.week < v_week or (f.week = v_week and f.day <= v_day));
  if v_f.id is null or p_slot not in (1, 2) then raise exception 'no such fragment'; end if;
  if exists (select 1 from public.fragment_words where party_id = p_party and fragment_id = p_fragment and slot = p_slot) then
    return jsonb_build_object('ok', false, 'taken', true);
  end if;
  select * into v_tries from public.fragment_tries where party_id = p_party and user_id = auth.uid() and fragment_id = p_fragment and slot = p_slot;
  if v_tries.wait_until is not null and v_tries.wait_until > now() then
    return jsonb_build_object('ok', false, 'waitUntil', v_tries.wait_until);
  end if;
  v_word := case when p_slot = 1 then v_f.word1 else v_f.word2 end;
  if lower(btrim(coalesce(p_guess, ''))) <> lower(v_word) then
    insert into public.fragment_tries (party_id, user_id, fragment_id, slot, wrong) values (p_party, auth.uid(), p_fragment, p_slot, 1)
    on conflict (party_id, user_id, fragment_id, slot) do update
      set wrong = case when public.fragment_tries.wrong + 1 >= 5 then 0 else public.fragment_tries.wrong + 1 end,
          wait_until = case when public.fragment_tries.wrong + 1 >= 5 then now() + interval '2 minutes' else null end;
    return jsonb_build_object('ok', false,
      'waitUntil', (select wait_until from public.fragment_tries where party_id = p_party and user_id = auth.uid() and fragment_id = p_fragment and slot = p_slot));
  end if;
  insert into public.fragment_words (party_id, fragment_id, slot, solved_by) values (p_party, p_fragment, p_slot, auth.uid())
  on conflict do nothing;
  if not found then return jsonb_build_object('ok', false, 'taken', true); end if; -- the first to arrive gets it
  update public.member_progress set gold = gold + 25 where party_id = p_party and user_id = auth.uid();
  select character_name into v_name from public.party_members where party_id = p_party and user_id = auth.uid();
  insert into public.party_messages (party_id, kind, body)
  values (p_party, 'notice', v_name || ' found a missing word in the Week ' || v_f.week || ', Day ' || v_f.day || ' fragment.');
  return jsonb_build_object('ok', true, 'word', v_word);
end;
$$;
