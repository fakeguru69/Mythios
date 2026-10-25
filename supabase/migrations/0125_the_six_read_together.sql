-- Phase 4, part 4 (25 Oct; Fake Guru: "Ok, go on"): the week's six fragments are read aloud at each Gathering, before
-- the reveal, as the party holds them. The Gathering scripts carry "{SIX:<week>}" (gen-gathering-scripts.cjs, from the
-- episode files' new "The six, read together" sections); g_fill fills it with g_six: each fragment with the words the
-- party found, and a blank for a word nobody found, so nothing is given away.
create or replace function public.g_six(p_party uuid, p_week int)
 returns text
 language sql
 stable security definer
 set search_path to ''
as $function$
  select string_agg(
    '*Day ' || f.day || ', ' || lower(left(f.place_label, 1)) || substr(f.place_label, 2) || ':* “' ||
    replace(replace(f.template,
      '{0}', case when exists (select 1 from public.fragment_words w where w.party_id = p_party and w.fragment_id = f.id
                               and w.slot = 1 and w.solved_by is not null) then f.word1 else '____' end),
      '{1}', case when exists (select 1 from public.fragment_words w where w.party_id = p_party and w.fragment_id = f.id
                               and w.slot = 2 and w.solved_by is not null) then f.word2 else '____' end) || '”',
    E'\n\n' order by f.day)
  from public.fragments f
  join public.parties p on p.id = p_party and p.series_id = f.series_id and p.season_number = f.season_number
  where f.week = p_week;
$function$;
revoke execute on function public.g_six(uuid, int) from public, anon, authenticated;

do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_fill(uuid,text,jsonb)'::regprocedure);
  n := replace(d, $o$  if strpos(v, '{pick:') > 0 then v := public.g_pick_tokens(v, coalesce(s -> 'result', '{}'::jsonb)); end if;$o$,
    $n$  if strpos(v, '{pick:') > 0 then v := public.g_pick_tokens(v, coalesce(s -> 'result', '{}'::jsonb)); end if;
  if v ~ '\{SIX:[1-6]\}' then
    v := regexp_replace(v, '\{SIX:([1-6])\}', replace(coalesce(public.g_six(p_party, substring(v from '\{SIX:([1-6])\}')::int), ''), '\', '\\'));
  end if;$n$);
  if n = d then raise exception 'g_fill: text not found'; end if;
  execute n;
end $mig$;
