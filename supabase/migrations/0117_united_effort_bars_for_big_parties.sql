-- 0117 (24 Oct): the United Effort's two bars grow for a big party (rule-breaking word list, row 21, option (a);
-- decided by Claude on Fake Guru's "use your judgement and proceed accordingly").
--
-- Each bar was 100 whatever the party size (60 for a friend alone). With six friends, simulation showed one friend never
-- got a roll in 6% to 29% of Gatherings (five friends: 1% to 4%). Now each bar is 100, plus 20 for every friend taking
-- part past four: five friends 120, six 140. Both bars grow, so the chance of doing the job is as for a smaller party;
-- only the number of turns rises, so everyone rolls. Core Rules §5 and CLAUDE.md §6 say the same.
-- g_advance is changed by swapping its three start lines in place, and the swap is checked.

do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_advance(uuid,integer)'::regprocedure);
  n := replace(d, 'case when coalesce((s ->> ''n'')::int, 1) <= 1 then 60 else 100 end',
                  'case when coalesce((s ->> ''n'')::int, 1) <= 1 then 60 else 100 + 20 * greatest(0, coalesce(array_length(v_list, 1), 0) - 4) end');
  if n = d or (length(n) - length(d)) <> 3 * (length('100 + 20 * greatest(0, coalesce(array_length(v_list, 1), 0) - 4)') - 3) then
    raise exception 'g_advance: the three start lines were not found';
  end if;
  execute n;
end
$mig$;
