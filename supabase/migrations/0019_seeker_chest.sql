-- The Seeker Chest online (Core Rules §6, §12a "Fragments"). One fragment each weekday, in every friend's Chest from
-- the moment its day opens. Two missing words, letters jumbled; each word is its own lock worth 25g, showing the
-- solver's name. Until the fragment's own day ends a friend may fill only one of its two words. The server checks each
-- try and never sends the answer; after five wrong tries at one word that friend waits two minutes. At the end of Day 6
-- anything unsolved completes itself, with no gold and no name.

create table public.fragments (
  series_id text not null references public.series (id),
  season_number int not null,
  id text not null,               -- '1-1'
  week int not null,
  day int not null,
  place_label text not null,
  template text not null,         -- {0} and {1} mark the two missing words
  word1 text not null,
  jumble1 text[] not null,
  word2 text not null,
  jumble2 text[] not null,
  primary key (series_id, season_number, id)
);
alter table public.fragments enable row level security;
revoke all on public.fragments from anon, authenticated;

create table public.fragment_words (
  party_id uuid not null references public.parties (id) on delete cascade,
  fragment_id text not null,
  slot int not null check (slot in (1, 2)),
  solved_by uuid references public.profiles (id) on delete set null, -- null when it completed itself
  solved_at timestamptz not null default now(),
  primary key (party_id, fragment_id, slot)
);
alter table public.fragment_words enable row level security;
revoke all on public.fragment_words from anon, authenticated;

create table public.fragment_tries (
  party_id uuid not null references public.parties (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  fragment_id text not null,
  slot int not null,
  wrong int not null default 0,
  wait_until timestamptz,
  primary key (party_id, user_id, fragment_id, slot)
);
alter table public.fragment_tries enable row level security;
revoke all on public.fragment_tries from anon, authenticated;

-- The Chest: every fragment up to today, with what is solved and by whom. Unsolved words are sent as jumbled letters only.
create function public.seeker_chest(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_series text; v_season int; r jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  -- At the end of each week's Day 6, its unsolved words complete themselves (no gold, no name).
  insert into public.fragment_words (party_id, fragment_id, slot, solved_by)
  select p_party, f.id, s.slot, null
  from public.fragments f cross join (values (1), (2)) s(slot)
  where f.series_id = v_series and f.season_number = v_season and (f.week < v_week or (f.week = v_week and v_day = 7))
  on conflict do nothing;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', f.id, 'week', f.week, 'day', f.day, 'place', f.place_label, 'template', f.template,
    'today', f.week = v_week and f.day = v_day,
    'slots', (select jsonb_agg(jsonb_build_object(
        'slot', s.slot,
        'jumble', case when s.slot = 1 then to_jsonb(f.jumble1) else to_jsonb(f.jumble2) end,
        'word', case when w.slot is not null then (case when s.slot = 1 then f.word1 else f.word2 end) end,
        'solver', case when w.solved_by is not null then (select m.character_name from public.party_members m
                                                           where m.party_id = p_party and m.user_id = w.solved_by) end,
        'mine', w.solved_by = auth.uid(),
        'auto', w.slot is not null and w.solved_by is null,
        'waitUntil', (select t.wait_until from public.fragment_tries t where t.party_id = p_party and t.user_id = auth.uid()
                      and t.fragment_id = f.id and t.slot = s.slot and t.wait_until > now())
      ) order by s.slot)
      from (values (1), (2)) s(slot)
      left join public.fragment_words w on w.party_id = p_party and w.fragment_id = f.id and w.slot = s.slot)
  ) order by f.week, f.day), '[]'::jsonb)
  into r
  from public.fragments f
  where f.series_id = v_series and f.season_number = v_season and (f.week < v_week or (f.week = v_week and f.day <= v_day));
  return jsonb_build_object('week', v_week, 'day', v_day, 'fragments', r,
    'mySolved', (select count(*) from public.fragment_words w where w.party_id = p_party and w.solved_by = auth.uid()));
end;
$$;

-- A try at one word. Right: +25g, the word is the friend's, one line in the party chat.
create function public.solve_word(p_party uuid, p_fragment text, p_slot int, p_guess text) returns jsonb
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
  -- One word per friend until the fragment's own day ends.
  if v_f.week = v_week and v_f.day = v_day and exists (
    select 1 from public.fragment_words where party_id = p_party and fragment_id = p_fragment and solved_by = auth.uid()) then
    return jsonb_build_object('ok', false, 'oneToday', true);
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

revoke execute on function public.seeker_chest, public.solve_word from public, anon;
grant execute on function public.seeker_chest, public.solve_word to authenticated;
