-- Piece E5 (22 Oct): The Bag's shelves ("The Dark Moon Verses" and "Found Along the Road", plus Relics in the Bag).
-- Additive migration: security-definer RPC public.bag_shelves(p_party uuid) with empty search_path.
-- * verses: extracted word for word from public.gathering_scripts (matching src/data/bagVerses.ts), gated strictly to
--   Gatherings that the party has read to their end (g.ended_at is not null).
-- * carried: items from completed days' summary cards (and Gathering 5's summary card if completed), newest first,
--   with the day-card prefix stripped so the shelf never uses the day card's words ("You learned", "You hold", "Tomorrow").
-- * clues: every clue found along the road on days the caller has reached (last-light leads from fan_outs, fork road-finds,
--   passed Notice lines, and [PRESS ON] finds), newest first; Week 1 Day 1 stays solitary (only the caller's own finds,
--   no friend names).
-- * relics & gifts: the caller's held Relics and recent gifts from friends, so Relics live in the Bag as well as the Store.

create or replace function public.bag_shelves(p_party uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
  v_series text;
  v_season int;
  v_week int;
  v_day int;
  v_verses jsonb := '[]'::jsonb;
  v_carried jsonb := '[]'::jsonb;
  v_clues jsonb := '[]'::jsonb;
  v_relics jsonb := '{}'::jsonb;
  v_gifts jsonb := '[]'::jsonb;
  r_day record;
  v_fork jsonb;
  v_notice jsonb;
  v_press jsonb;
begin
  if not exists (
    select 1 from public.party_members
    where party_id = p_party and user_id = v_me and status = 'approved' and session_zero_done_at is not null
  ) then
    raise exception 'not in this party';
  end if;

  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;

  -- 1. The Dark Moon Verses: word for word from public.gathering_scripts, only for Gatherings read to their end.
  with done_gatherings as (
    select gs.week, gs.data
    from public.gathering_scripts gs
    join public.gatherings g on g.party_id = p_party and g.week = gs.week
    where gs.series_id = v_series and gs.season_number = v_season
      and (g.ended_at is not null or g.cursor >= jsonb_array_length(gs.data -> 'steps'))
  ),
  verse_steps as (
    select dg.week, s ->> 'section' as title, string_agg(s ->> 'text', E'\n\n' order by o) as text, min(o) as ord
    from done_gatherings dg
    cross join lateral jsonb_array_elements(dg.data -> 'steps') with ordinality x(s, o)
    where (s ->> 'section') like 'The Verse of%'
      and s ->> 't' = 'say'
      and not exists (
        select 1 from regexp_split_to_table(s ->> 'text', E'\\n\\n+') p
        where btrim(p) <> '' and not (btrim(p) ~ '^\*[^"][\s\S]*\*$')
      )
    group by dg.week, s ->> 'section'
  ),
  doc_steps as (
    select dg.week, d.title,
      case when d.within then substr(s ->> 'text', position(d.opens in (s ->> 'text'))) else s ->> 'text' end as text,
      1000 + d.doc_ord as ord
    from done_gatherings dg
    cross join (values
      (1, 'The torn page', 'The torn page', '*From the Second Book of the Order of the Dark Moon. Even in the old telling', false),
      (2, 'The Watch', 'The Watch', '*From the Third Book of the Order of the Dark Moon — The Watch.*', false),
      (3, 'The untorn page', 'The second twist', '**"Four were given to the wind', true)
    ) as d(doc_ord, title, section, opens, within)
    cross join lateral jsonb_array_elements(dg.data -> 'steps') with ordinality x(s, o)
    where s ->> 'section' = d.section and s ->> 't' = 'say'
      and (case when d.within then position(d.opens in (s ->> 'text')) > 0 else (s ->> 'text') like (d.opens || '%') end)
  )
  select coalesce(jsonb_agg(jsonb_build_object('week', week, 'title', title, 'text', text) order by week desc, ord asc), '[]'::jsonb)
  into v_verses
  from (
    select * from verse_steps
    union all
    select * from doc_steps
  ) all_v;

  -- 2. Carried from the road: summary card items from days the caller has completed (or past days), plus Gathering 5 if ended.
  with completed_chapters as (
    select c.week, c.day, coalesce(c.script ->> 'title', 'Day ' || c.day) as place,
      regexp_replace(l, '^You hold:\s*', '') as item_text
    from public.chapters c
    cross join lateral jsonb_array_elements(c.script -> 'steps') s
    cross join lateral jsonb_array_elements_text(
      case when s ->> 't' = 'summary' then coalesce(s -> 'lines', '[]'::jsonb) else '[]'::jsonb end
    ) l
    where c.series_id = v_series and c.season_number = v_season
      and l like 'You hold:%'
      and (
        exists (
          select 1 from public.member_days md
          where md.party_id = p_party and md.user_id = v_me and md.week = c.week and md.day = c.day and md.finished_at is not null
        )
        or c.week < v_week
        or (c.week = v_week and c.day < v_day)
      )
  ),
  completed_gathering_hold as (
    select gs.week, 7 as day, 'The Gathering' as place,
      regexp_replace(l, '^You hold:\s*', '') as item_text
    from public.gathering_scripts gs
    join public.gatherings g on g.party_id = p_party and g.week = gs.week
    cross join lateral jsonb_array_elements(gs.data -> 'steps') s
    cross join lateral jsonb_array_elements_text(
      case when s ->> 't' = 'summary' then coalesce(s -> 'lines', '[]'::jsonb) else '[]'::jsonb end
    ) l
    where gs.series_id = v_series and gs.season_number = v_season
      and (g.ended_at is not null or g.cursor >= jsonb_array_length(gs.data -> 'steps'))
      and l like 'You hold:%'
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'week', week, 'day', day, 'place', place, 'text', item_text
  ) order by week desc, day desc), '[]'::jsonb)
  into v_carried
  from (
    select * from completed_chapters
    union all
    select * from completed_gathering_hold
  ) all_c;

  -- 3. Clues found along the road: iterate newest day first over days the caller has played or passed.
  for r_day in
    select c.week, c.day, coalesce(c.script ->> 'title', 'Day ' || c.day) as place
    from public.chapters c
    where c.series_id = v_series and c.season_number = v_season
      and (
        c.week < v_week
        or (c.week = v_week and c.day < v_day)
        or exists (
          select 1 from public.member_days md
          where md.party_id = p_party and md.user_id = v_me and md.week = c.week and md.day = c.day
            and (md.finished_at is not null or md.picks <> '{}'::jsonb or md.notice is not null)
        )
        or exists (
          select 1 from public.fan_outs fo
          where fo.party_id = p_party and fo.user_id = v_me and fo.week = c.week and fo.day = c.day
        )
      )
    order by c.week desc, c.day desc
  loop
    -- 3a. Last-light leads (fan_outs) on this day: on W1D1 (solitary night), only the caller's own lead and no names.
    v_clues := v_clues || coalesce((
      select jsonb_agg(x.item order by x.first_at)
      from (
        select min(f.at) as first_at,
          jsonb_build_object(
            'key', r_day.week || '-' || r_day.day || ':lead:' || (l ->> 'id'),
            'week', r_day.week,
            'day', r_day.day,
            'place', r_day.place,
            'kind', 'lead',
            'title', l ->> 'clueTitle',
            'text', l ->> 'clueText',
            'by', case when r_day.week = 1 and r_day.day = 1 then '[]'::jsonb
                       else jsonb_agg(m.character_name order by f.at) end
          ) as item
        from jsonb_array_elements(public.campfire_data(p_party, r_day.week, r_day.day) -> 'leads') l
        join public.fan_outs f on f.party_id = p_party and f.week = r_day.week and f.day = r_day.day and f.lead_id = l ->> 'id'
        join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
        where (not (r_day.week = 1 and r_day.day = 1) or f.user_id = v_me)
          and (
            r_day.week < v_week
            or (r_day.week = v_week and r_day.day < v_day)
            or f.user_id = v_me
            or exists (
              select 1 from public.member_days md
              where md.party_id = p_party and md.user_id = v_me and md.week = r_day.week and md.day = r_day.day and md.finished_at is not null
            )
          )
        group by l
      ) x
    ), '[]'::jsonb);

    -- 3b. Caller's own road finds from forks (fire_fork_pieces_for).
    for v_fork in
      select * from jsonb_array_elements(public.fire_fork_pieces_for(p_party, v_me, r_day.week, r_day.day))
    loop
      v_clues := v_clues || jsonb_build_array(jsonb_build_object(
        'key', r_day.week || '-' || r_day.day || ':' || (v_fork ->> 'kind'),
        'week', r_day.week,
        'day', r_day.day,
        'place', r_day.place,
        'kind', 'fork',
        'title', v_fork ->> 'title',
        'text', v_fork ->> 'text',
        'by', case when r_day.week = 1 and r_day.day = 1 then '[]'::jsonb
                   else jsonb_build_array(coalesce(public.g_name(p_party, v_me), 'You')) end
      ));
    end loop;

    -- 3c. Caller's own passed Notice line (notice_line_for).
    v_notice := public.notice_line_for(p_party, v_me, r_day.week, r_day.day);
    if v_notice is not null then
      v_clues := v_clues || jsonb_build_array(jsonb_build_object(
        'key', r_day.week || '-' || r_day.day || ':notice:' || v_me::text,
        'week', r_day.week,
        'day', r_day.day,
        'place', r_day.place,
        'kind', 'notice',
        'title', 'Noticed (' || (v_notice ->> 'attr') || ')',
        'text', v_notice ->> 'text',
        'by', case when r_day.week = 1 and r_day.day = 1 then '[]'::jsonb
                   else jsonb_build_array(coalesce(public.g_name(p_party, v_me), 'You')) end
      ));
    end if;

    -- 3d. Caller's own [PRESS ON] find if passed.
    if exists (
      select 1 from public.member_days md
      where md.party_id = p_party and md.user_id = v_me and md.week = r_day.week and md.day = r_day.day
        and coalesce((md.press ->> 'pass')::boolean, false)
    ) then
      v_press := public.fire_press_piece(p_party, r_day.week, r_day.day);
      if v_press is not null then
        v_clues := v_clues || jsonb_build_array(jsonb_build_object(
          'key', r_day.week || '-' || r_day.day || ':press',
          'week', r_day.week,
          'day', r_day.day,
          'place', r_day.place,
          'kind', 'press',
          'title', v_press ->> 'title',
          'text', v_press ->> 'text',
          'by', case when r_day.week = 1 and r_day.day = 1 then '[]'::jsonb
                     else jsonb_build_array(coalesce(public.g_name(p_party, v_me), 'You')) end
        ));
      end if;
    end if;
  end loop;

  -- 4. Relics & recent gifts for the caller.
  perform public.ensure_progress(p_party, v_me);
  select coalesce(mp.relics, '{}'::jsonb) into v_relics
  from public.member_progress mp
  where mp.party_id = p_party and mp.user_id = v_me;

  select coalesce(jsonb_agg(jsonb_build_object(
    'from', coalesce(m.character_name, 'A friend'),
    'relic', g.relic,
    'at', g.given_at
  ) order by g.given_at desc), '[]'::jsonb)
  into v_gifts
  from (
    select * from public.relic_gifts
    where party_id = p_party and to_user = v_me
    order by given_at desc limit 10
  ) g
  left join public.party_members m on m.party_id = p_party and m.user_id = g.from_user;

  return jsonb_build_object(
    'week', v_week,
    'day', v_day,
    'verses', v_verses,
    'carried', v_carried,
    'clues', v_clues,
    'relics', v_relics,
    'gifts', v_gifts
  );
end;
$$;

revoke execute on function public.bag_shelves(uuid) from public, anon;
grant execute on function public.bag_shelves(uuid) to authenticated;
