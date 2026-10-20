-- Piece C8 (docs/design/handoff-ledger.md): Party panel polish
-- Server-side member statuses for the party panel: "At the fire", "Reading Day N", etc.

create or replace function public.party_member_statuses(p_party uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_week int;
  v_day int;
  v_res jsonb;
begin
  if not public.is_party_member(p_party) then
    raise exception 'not a member';
  end if;

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then
    select coalesce(jsonb_object_agg(
      m.user_id,
      case when m.ready then 'Ready' else 'Choosing' end
    ), '{}'::jsonb) into v_res
    from public.party_members m
    where m.party_id = p_party and m.status = 'approved';
    return v_res;
  end if;

  select coalesce(jsonb_object_agg(
    m.user_id,
    case
      when v_day = 7 then
        case when exists (
          select 1 from public.member_days md
          where md.party_id = p_party and md.user_id = m.user_id and md.week = v_week and md.day = 7 and md.finished_at is not null
        ) then 'Finished Gathering'
        else 'At the Gathering' end
      when exists (
        select 1 from public.member_days md
        where md.party_id = p_party and md.user_id = m.user_id and md.week = v_week and md.day = v_day and md.finished_at is not null
      ) or exists (
        select 1 from public.fan_outs fo
        where fo.party_id = p_party and fo.user_id = m.user_id and fo.week = v_week and fo.day = v_day
      ) or exists (
        select 1 from public.fire_visits fv
        where fv.party_id = p_party and fv.user_id = m.user_id and fv.week = v_week and fv.day = v_day
      ) then 'At the fire'
      else 'Reading Day ' || v_day
    end
  ), '{}'::jsonb) into v_res
  from public.party_members m
  where m.party_id = p_party and m.status = 'approved';

  return v_res;
end;
$$;

revoke execute on function public.party_member_statuses(uuid) from public, anon;
grant execute on function public.party_member_statuses(uuid) to authenticated;
