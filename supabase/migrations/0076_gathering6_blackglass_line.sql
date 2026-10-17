-- Gathering 6: "He never lied to us. He only never told us the price." was dropped by a generator bug
-- (scripts/gen-gathering-scripts.cjs); it is back, alone on the screen, as canon writes it (episode-6:832-834).
-- It goes in as step 44, so every later step moves on by one and the act's pick is now step 62. The summary's
-- {pick:N:…} tokens are now filled by g_fill through g_pick_tokens, whatever N is, so g_view's fixed steps 31 and 61
-- (0032) find nothing left to fill. The data matches scripts/gen-gathering-sql.ts 6.

-- {pick:N:a|b|c}: the option chosen at step N; any other value, or none, gives the last option
-- (as before: the fifth held back on a tie, "nothing" when the act did nothing).
create or replace function public.g_pick_tokens(p_line text, p_result jsonb) returns text
language plpgsql immutable set search_path = '' as $$
declare m text[]; opts text[]; v int; out text := p_line;
begin
  for m in select regexp_matches(p_line, '\{pick:(\d+):([^}]*)\}', 'g') loop
    opts := string_to_array(m[2], '|');
    v := (p_result ->> m[1])::int;
    out := replace(out, '{pick:' || m[1] || ':' || m[2] || '}',
                   opts[case when v is not null and v >= 0 and v < cardinality(opts) - 1 then v + 1 else cardinality(opts) end]);
  end loop;
  return out;
end;
$$;
revoke execute on function public.g_pick_tokens(text, jsonb) from public, anon, authenticated;

create or replace function public.g_fill(p_party uuid, p_text text, s jsonb) returns text language plpgsql stable security definer set search_path = '' as $$
declare v text := p_text; w text := public.g_word(coalesce((s ->> 'n')::int, 1));
begin
  if v is null then return null; end if;
  v := regexp_replace(v, '(^|[.!?]\s+|\n)\{N\}', '\1' || upper(left(w, 1)) || substr(w, 2), 'g');
  v := replace(v, '{N}', w);
  if s ? 'risk' then v := replace(v, '{RISK}', public.g_name(p_party, (s ->> 'risk')::uuid)); end if;
  v := replace(v, '{TAPPER}', coalesce(s ->> 'tapper', 'One of you'));
  if s ? 'chosen' then v := replace(v, '{CHOSEN}', public.g_name(p_party, (s ->> 'chosen')::uuid)); end if;
  if strpos(v, '{pick:') > 0 then v := public.g_pick_tokens(v, coalesce(s -> 'result', '{}'::jsonb)); end if;
  return v;
end;
$$;

update public.gathering_scripts
set data = jsonb_set(data, '{steps}',
  (select jsonb_agg(x order by o) from (
     select o, x from jsonb_array_elements(data -> 'steps') with ordinality a(x, o) where o <= 44
     union all
     select 44.5, '{"t":"say","text":"*\"He never lied to us. He only never told us the price.\"*","alone":true,"section":"The first twist"}'::jsonb
     union all
     select o, case when x ->> 't' = 'summary' then replace(x::text, '{pick:61:', '{pick:62:')::jsonb else x end
     from jsonb_array_elements(data -> 'steps') with ordinality a(x, o) where o > 44
   ) z))
where series_id = 'dark-moon' and season_number = 1 and week = 6
  and (data -> 'steps' -> 44 ->> 'alone') is null;
