-- Phase 4, part 2 (25 Oct; Fake Guru: "You decide and proceed"): one decision a round in the Gathering's Battle.
-- Each friend strikes, as before, unless they choose to Cover a friend whose HP is below 40: then they give up their
-- own strike that round, and the next blow aimed at that friend is rolled against the coverer's Armour and lands on
-- the coverer. No new numbers: the Armour, hit and damage rules are the ones in force (Core Rules §4). A cover lasts
-- one round and is cleared after it; the rounds still run by themselves, so nobody waits on anyone.
--   gathering_do(..., 'cover', {"to": "<friend id>" | null}): set or clear your cover for the next round.
--   g_battle_round: the coverer skips their strike ("covering"); the covered friend's enemy rolls at the coverer.
--   g_view: each fighter's `cover` (a name); a friend sees the blows they took for another in their own rounds.
-- Each function is patched in place from its live definition; the patch stops if the text it replaces is not there.
do $mig$
declare d text; n text;
begin
  -- g_battle_round
  d := pg_get_functiondef('public.g_battle_round(uuid,integer,jsonb)'::regprocedure);
  n := replace(d, $o$  phase int;$o$, $o$  phase int; c int;$o$);
  -- the coverer gives up their own strike (a reinforcer too)
  n := replace(n, $o$        if (f[h] ->> 'lose')::boolean then
          f[h] := f[h] || '{"lose": false}';$o$,
    $n$        if f[h] ->> 'cover' is not null then
          if k <= nf then
            lines := jsonb_set(lines, array[f[h] ->> 'id'], (lines -> (f[h] ->> 'id')) || jsonb_build_object(
              'attacker', f[h] ->> 'name', 'side', 'party', 'covering',
              (select x ->> 'name' from unnest(f) x where x ->> 'id' = f[h] ->> 'cover')));
          end if;
          continue;
        end if;
        if (f[h] ->> 'lose')::boolean then
          f[h] := f[h] || '{"lose": false}';$n$);
  -- the blow aimed at a covered friend lands on the coverer
  n := replace(n, $o$          roll := public.d20();
          def := (f[k] ->> 'armor')::int + case when f[k] ->> 'relicFrom' is not null then 1 else 0 end;
          margin := roll + (e[k] ->> 'atk')::int - def; hit := margin >= 1; dmg := case when hit then margin * 5 else 0 end;
          before := (f[k] ->> 'hp')::int;
          f[k] := f[k] || jsonb_build_object('hp', greatest(0, before - dmg), 'fallen', before - dmg <= 0);
          if hit and p_week = 3 then f[k] := f[k] || '{"burn": true}'; end if;
          if p_week = 4 and roll <= 3 then e[k] := e[k] || '{"lose": true}'; end if;
          ln := jsonb_build_object('attacker', e[k] ->> 'name', 'target', f[k] ->> 'name', 'side', 'enemy', 'roll', roll,
            'attack', (e[k] ->> 'atk')::int, 'defence', def, 'margin', margin, 'hit', hit, 'damage', dmg, 'hpBefore', before,
            'hpAfter', (f[k] ->> 'hp')::int);$o$,
    $n$          roll := public.d20();
          c := null;
          select o into c from unnest(f) with ordinality a(x, o)
           where x ->> 'cover' = f[k] ->> 'id' and not (x ->> 'fallen')::boolean and o <> k order by o limit 1;
          if c is null then c := k; end if;
          def := (f[c] ->> 'armor')::int + case when f[c] ->> 'relicFrom' is not null then 1 else 0 end;
          margin := roll + (e[k] ->> 'atk')::int - def; hit := margin >= 1; dmg := case when hit then margin * 5 else 0 end;
          before := (f[c] ->> 'hp')::int;
          f[c] := f[c] || jsonb_build_object('hp', greatest(0, before - dmg), 'fallen', before - dmg <= 0);
          if hit and p_week = 3 then f[c] := f[c] || '{"burn": true}'; end if;
          if p_week = 4 and roll <= 3 then e[k] := e[k] || '{"lose": true}'; end if;
          ln := jsonb_build_object('attacker', e[k] ->> 'name', 'target', f[c] ->> 'name', 'side', 'enemy', 'roll', roll,
            'attack', (e[k] ->> 'atk')::int, 'defence', def, 'margin', margin, 'hit', hit, 'damage', dmg, 'hpBefore', before,
            'hpAfter', (f[c] ->> 'hp')::int);
          if c <> k then ln := ln || jsonb_build_object('note', (f[c] ->> 'name') || ' takes the blow meant for ' || (f[k] ->> 'name') || '.'); end if;$n$);
  -- a cover lasts one round
  n := replace(n, $o$  if not exists (select 1 from unnest(e) x where (x ->> 'hp')::int > 0) then outcome := 'won';$o$,
    $n$  for k in 1..nf loop f[k] := f[k] - 'cover'; end loop;
  if not exists (select 1 from unnest(e) x where (x ->> 'hp')::int > 0) then outcome := 'won';$n$);
  if n = d or strpos(n, 'c int;') = 0 or strpos(n, 'takes the blow meant for') = 0 or strpos(n, '''covering''') = 0
     or strpos(n, 'f[k] - ''cover''') = 0 then raise exception 'g_battle_round: text not found'; end if;
  execute n;

  -- gathering_do: the 'cover' action
  d := pg_get_functiondef('public.gathering_do(uuid,text,jsonb)'::regprocedure);
  n := replace(d, $o$    when 'tap' then$o$,
    $n$    when 'cover' then
      -- Cover a friend below 40 HP for the next round, or clear it (to = null). Not while fallen; not yourself.
      if st ->> 't' = 'battle' and coalesce(s -> 'battle' ->> 'outcome', 'ongoing') = 'ongoing' then
        select o - 1 into v_idx from jsonb_array_elements(s -> 'battle' -> 'fighters') with ordinality a(x, o)
         where x ->> 'id' = v_me and not (x ->> 'fallen')::boolean;
        if v_idx is not null then
          if p_args ->> 'to' is null then
            s := jsonb_set(s, array['battle', 'fighters', v_idx::text], (s -> 'battle' -> 'fighters' -> v_idx) - 'cover');
          elsif p_args ->> 'to' <> v_me and exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'fighters') x
                where x ->> 'id' = p_args ->> 'to' and not (x ->> 'fallen')::boolean and (x ->> 'hp')::int < 40) then
            s := jsonb_set(s, array['battle', 'fighters', v_idx::text, 'cover'], to_jsonb(p_args ->> 'to'));
          end if;
        end if;
      end if;
    when 'tap' then$n$);
  if n = d then raise exception 'gathering_do: text not found'; end if;
  execute n;

  -- g_view: each fighter's cover; the blows you took for a friend show in your own rounds
  d := pg_get_functiondef('public.g_view(uuid,integer,uuid)'::regprocedure);
  n := replace(d, $o$                         'late', x -> 'late', 'foe',$o$,
    $n$                         'late', x -> 'late',
                         'cover', (select y ->> 'name' from jsonb_array_elements(s -> 'battle' -> 'fighters') y where y ->> 'id' = x ->> 'cover'),
                         'foe',$n$);
  n := replace(n, $o$jsonb_array_elements(fl.value) l where fl.key <> v_me and l ->> 'attacker' = public.g_name(p_party, p_user)))$o$,
    $n$jsonb_array_elements(fl.value) l where fl.key <> v_me and (l ->> 'attacker' = public.g_name(p_party, p_user)
                           or l ->> 'target' = public.g_name(p_party, p_user))))$n$);
  if n = d or strpos(n, '''cover'', (select y') = 0 or strpos(n, 'l ->> ''target'' = public.g_name') = 0 then
    raise exception 'g_view: text not found'; end if;
  execute n;
end $mig$;
