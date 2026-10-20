-- Piece C6 (docs/design/handoff-ledger.md): The Notice roll (server function, DC 3), pass/fail lines, first-time card, skill label, "Lay it on the table" at the fire.

alter table public.member_days add column if not exists notice jsonb;

-- Execute the server-side Notice roll: d20 + tier bonus vs DC 3.
-- Novice (bonus 0) succeeds on 4 or more.
-- Pass: Noticed line (2nd sentence from Apprentice, 26 pts).
-- Fail: "Nothing catches your eye."
-- Novice Pass note: "A more practised eye would see more here."
create or replace function public.roll_notice(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_week int;
  v_day int;
  v_user uuid := auth.uid();
  v_existing jsonb;
  v_attrs jsonb;
  v_class text;
  v_class_attr text;
  v_best text;
  v_top int := -1;
  a text;
  v int;
  v_d20 int;
  v_bonus int := 0;
  v_total int;
  v_pass boolean;
  v_notice_line jsonb;
  v_text text;
  v_novice_note text := null;
  v_res jsonb;
begin
  if v_user is null then raise exception 'not signed in'; end if;

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then raise exception 'the story has not started'; end if;

  select notice into v_existing from public.member_days
  where party_id = p_party and user_id = v_user and week = v_week and day = v_day;

  if v_existing is not null then
    return v_existing;
  end if;

  select attrs into v_attrs from public.member_progress where party_id = p_party and user_id = v_user;
  select class into v_class from public.party_members where party_id = p_party and user_id = v_user;
  v_class_attr := public.class_attribute(v_class);

  foreach a in array array['Might', 'Agility', 'Intellect', 'Charm', 'Craft', 'Aim'] loop
    v := coalesce((v_attrs ->> a)::int, 10);
    if v > v_top or (v = v_top and a = v_class_attr) then
      v_top := v;
      v_best := a;
    end if;
  end loop;

  if v_best is null then v_best := coalesce(v_class_attr, 'Intellect'); v_top := 10; end if;

  v_bonus := case
    when v_top >= 101 then 10
    when v_top >= 76 then 6
    when v_top >= 51 then 4
    when v_top >= 26 then 2
    else 0
  end;

  v_d20 := floor(random() * 20 + 1)::int;
  v_total := v_d20 + v_bonus;
  v_pass := (v_total >= 4);

  if v_pass then
    v_notice_line := public.notice_line_for(p_party, v_user, v_week, v_day);
    if v_notice_line is not null and coalesce(v_notice_line ->> 'text', '') <> '' then
      v_text := v_notice_line ->> 'text';
    else
      v_text := 'You notice subtle details in your surroundings.';
    end if;
    if v_top < 26 then
      v_novice_note := 'A more practised eye would see more here.';
    end if;
  else
    v_text := 'Nothing catches your eye.';
  end if;

  v_res := jsonb_build_object(
    'attr', v_best,
    'score', v_top,
    'd20', v_d20,
    'bonus', v_bonus,
    'total', v_total,
    'dc', 3,
    'pass', v_pass,
    'text', v_text,
    'noviceNote', v_novice_note
  );

  insert into public.member_days (party_id, user_id, week, day, notice)
  values (p_party, v_user, v_week, v_day, v_res)
  on conflict (party_id, user_id, week, day)
  do update set notice = v_res;

  return v_res;
end;
$$;

revoke execute on function public.roll_notice(uuid) from public, anon;
grant execute on function public.roll_notice(uuid) to authenticated;
