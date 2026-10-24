-- Phase 3 (24 Oct): the road a player takes can change a later passage or make a later Challenge harder.
-- party_claims now also gives the caller's own roads: "W-D:took:<choice id>:<option>", the first option picked at
-- each choice of each day they played (chapter scripts: "*If you took THE LANE on Day 2:*"). The Challenge roll
-- (roll_card) and the day's passages read it as they read every other claim. Nothing else changes.
create or replace function public.party_claims(p_party uuid)
 returns jsonb
 language sql
 stable security definer
 set search_path to ''
as $function$
  select coalesce(jsonb_agg(k), '[]'::jsonb) from (
    select 'G' || week || ':united-effort-lost' k from public.gatherings
    where party_id = p_party and state -> 'ue' ->> 'outcome' = 'lost'
    union all
    select week || '-' || day || ':challenge-failed' from public.member_days
    where party_id = p_party and user_id = auth.uid() and challenge is not null
      and not coalesce((challenge ->> 'pass')::boolean, false) and not coalesce((challenge ->> 'expired')::boolean, false)
    union all
    select md.week || '-' || md.day || ':took:' || c.key || ':' || (c.value ->> 0)
    from public.member_days md, jsonb_each(md.picks) c
    where md.party_id = p_party and md.user_id = auth.uid()
      and jsonb_typeof(c.value) = 'array' and jsonb_array_length(c.value) > 0
  ) x;
$function$;
