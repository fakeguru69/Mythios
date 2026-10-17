-- Sharing at the fire (Fake Guru, 17 Oct: "go with your suggestion" to the gameplay verdict, group A;
-- docs/design/gameplay-verdict-17oct.md). Each friend sees a different Notice line and only a passer sees the pass
-- text, and until now nothing let friends put those pieces together:
-- * "Share what you noticed": a friend posts the Notice line they saw today onto the fire's board. The server writes
--   the line itself from the chapter, so nobody can post anything else.
-- * "What the others saw": a friend who failed today's Challenge sees what each friend who passed read (canon's
--   "Someone at the fire may have seen it", the demo's catch-up card), and everyone sees a friend's [PRESS ON] find.
-- A Notice line's second sentence now shows from Apprentice (26) instead of Adept (51), in the chapter and here.
-- Before the party has met (a narrated fire), nothing of another friend's is shown.

create table public.fire_shares (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  attr text not null,
  body text not null,
  at timestamptz not null default now(),
  primary key (party_id, user_id, week, day),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);
alter table public.fire_shares enable row level security;
revoke all on public.fire_shares from anon, authenticated;

-- The Notice line a friend sees today (ChapterScriptParts.pickNoticeLine): the line for their highest Attribute, a
-- tie going to their class Attribute and then to canon's order; its second sentence from Apprentice (26).
create function public.notice_line_for(p_party uuid, p_user uuid, p_week int, p_day int) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_lines jsonb; v_attrs jsonb; v_class text; v_best text; v_top int := -1; a text; v int; e jsonb;
begin
  v_lines := public.today_step(p_party, p_week, p_day, 'notice') -> 'lines';
  if v_lines is null then return null; end if;
  select attrs into v_attrs from public.member_progress where party_id = p_party and user_id = p_user;
  select public.class_attribute(class) into v_class from public.party_members where party_id = p_party and user_id = p_user;
  foreach a in array array['Might', 'Agility', 'Intellect', 'Charm', 'Craft', 'Aim'] loop
    if v_lines ? a then
      v := coalesce((v_attrs ->> a)::int, 0);
      if v > v_top or (v = v_top and a = v_class) then v_top := v; v_best := a; end if;
    end if;
  end loop;
  if v_best is null then return null; end if;
  e := v_lines -> v_best;
  return jsonb_build_object('attr', v_best,
    'text', (e ->> 'first') || case when v_top >= 26 and coalesce(e ->> 'second', '') <> '' then ' ' || (e ->> 'second') else '' end);
end;
$$;

-- What the fire shows of each other's day: your own Notice line (and whether it is shared), the lines friends
-- shared, what passers saw (to a friend who did not pass), and [PRESS ON] finds (to everyone else).
create function public.fire_shares(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_me uuid := auth.uid(); v_narrated boolean; v_passed boolean; v_pass_text text;
        v_press_text text; v_press jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  v_narrated := coalesce((public.campfire_data(p_party, v_week, v_day) ->> 'narrated')::boolean, false);
  select coalesce((challenge ->> 'pass')::boolean, false) into v_passed from public.member_days
  where party_id = p_party and user_id = v_me and week = v_week and day = v_day;
  -- The pass-only lines of today's chapter, and the [PRESS ON] find with its lines.
  select string_agg(s ->> 'text', E'\n\n' order by o) into v_pass_text
  from public.chapters c join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  cross join lateral jsonb_array_elements(c.script -> 'steps') with ordinality x(s, o)
  where p.id = p_party and c.week = v_week and c.day = v_day and s ->> 't' = 'say'
    and s -> 'cond' ->> 'on' = 'challenge' and (s -> 'cond' ->> 'pass')::boolean;
  v_press := public.today_step(p_party, v_week, v_day, 'press');
  select string_agg(s ->> 'text', E'\n\n' order by o) into v_press_text
  from public.chapters c join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  cross join lateral jsonb_array_elements(c.script -> 'steps') with ordinality x(s, o)
  where p.id = p_party and c.week = v_week and c.day = v_day and s ->> 't' = 'say' and s -> 'cond' ->> 'on' = 'press';

  return jsonb_build_object(
    'mine', public.notice_line_for(p_party, v_me, v_week, v_day),
    'shared', exists (select 1 from public.fire_shares where party_id = p_party and user_id = v_me and week = v_week and day = v_day),
    'noticed', case when v_narrated then '[]'::jsonb else (
      select coalesce(jsonb_agg(jsonb_build_object('name', m.character_name, 'attr', f.attr, 'body', f.body) order by f.at), '[]'::jsonb)
      from public.fire_shares f join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
      where f.party_id = p_party and f.week = v_week and f.day = v_day and f.user_id <> v_me) end,
    'saw', case when v_narrated then '[]'::jsonb else (
      select coalesce(jsonb_agg(x.item order by x.o), '[]'::jsonb) from (
        select 1 o, jsonb_build_object('name', m.character_name, 'kind', 'pass', 'text', v_pass_text) item
        from public.member_days md join public.party_members m on m.party_id = md.party_id and m.user_id = md.user_id
        where md.party_id = p_party and md.week = v_week and md.day = v_day and md.user_id <> v_me
          and not v_passed and v_pass_text is not null and coalesce((md.challenge ->> 'pass')::boolean, false)
        union all
        select 2, jsonb_build_object('name', m.character_name, 'kind', 'press', 'title', v_press ->> 'title',
                 'detail', v_press ->> 'detail', 'text', v_press_text)
        from public.member_days md join public.party_members m on m.party_id = md.party_id and m.user_id = md.user_id
        where md.party_id = p_party and md.week = v_week and md.day = v_day and md.user_id <> v_me
          and v_press is not null and coalesce((md.press ->> 'pass')::boolean, false)
      ) x) end);
end;
$$;

-- "Share what you noticed": posts the caller's own Notice line for today, once.
create function public.share_notice(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_line jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  v_line := public.notice_line_for(p_party, auth.uid(), v_week, v_day);
  if v_line is null then raise exception 'nothing to share'; end if;
  insert into public.fire_shares (party_id, user_id, week, day, attr, body)
  values (p_party, auth.uid(), v_week, v_day, v_line ->> 'attr', v_line ->> 'text')
  on conflict (party_id, user_id, week, day) do nothing;
  return public.fire_shares(p_party);
end;
$$;

revoke execute on function public.notice_line_for(uuid, uuid, int, int) from public, anon, authenticated;
revoke execute on function public.fire_shares(uuid), public.share_notice(uuid) from public, anon;
grant execute on function public.fire_shares(uuid), public.share_notice(uuid) to authenticated;

-- The case so far, read back at the Gathering's opening (Fan Out and Campfire proposal §3.4, as the demo already
-- does): the week's question and at most three friends' week lines by name (Campfire v2.3 §M), the most recently
-- updated first; where a friend's line changed during the week, their first day's line too. Never graded.
create function public.gathering_case(p_party uuid, p_week int) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_q text; v_lines jsonb; v_count int;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid() and status = 'approved') then
    raise exception 'not in this party';
  end if;
  select c.data ->> 'weekQuestion' into v_q from public.campfire_days c join public.parties p
    on p.series_id = c.series_id and p.season_number = c.season_number
  where p.id = p_party and c.week = p_week and c.day = 1;
  select count(distinct user_id) into v_count from public.fire_notes where party_id = p_party and week = p_week and kind = 'week';
  select coalesce(jsonb_agg(x.item order by x.last_day desc, x.last_at desc), '[]'::jsonb) into v_lines from (
    select f.user_id,
      max(f.day) last_day, max(f.at) last_at,
      jsonb_build_object('name', m.character_name,
        'firstDay', min(f.day),
        'first', (select body from public.fire_notes f1 where f1.party_id = p_party and f1.user_id = f.user_id and f1.week = p_week and f1.kind = 'week' order by f1.day limit 1),
        'lastDay', max(f.day),
        'last', (select body from public.fire_notes f2 where f2.party_id = p_party and f2.user_id = f.user_id and f2.week = p_week and f2.kind = 'week' order by f2.day desc limit 1)) item
    from public.fire_notes f join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
    where f.party_id = p_party and f.week = p_week and f.kind = 'week'
    group by f.user_id, m.character_name
    order by max(f.day) desc, max(f.at) desc limit 3) x;
  return jsonb_build_object('question', v_q, 'lines', v_lines, 'more', v_count > 3);
end;
$$;
revoke execute on function public.gathering_case(uuid, int) from public, anon;
grant execute on function public.gathering_case(uuid, int) to authenticated;
