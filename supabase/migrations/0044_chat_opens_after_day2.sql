-- The party chat opens for a friend once they have read Week 1 Day 2's chapter, where the party assembles at the inn and
-- the innkeeper gives his name (Fake Guru, 16 Oct: "Day 2"). Before, it opened for everyone at 5:00am on Day 2, so the
-- chat named Garrick before the story did. 0008 foresaw this ("becomes when the friend has finished Day 2's chapter").
-- From Day 3 on it is open to every friend, read or not (a friend who missed Day 2 is not shut out).
-- Same shape, replaced in place: the read rule on party_messages, post_message and garrick_morning all follow it.
create or replace function public.party_chat_open(p_party uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select p.day1_opens_at is not null and now() >= p.day1_opens_at + interval '1 day' and (
      -- Day 3 or later on the party's clock (a new day every 5:00am, as party_today counts them).
      ((now() at time zone p.time_zone) - interval '5 hours')::date
        - ((p.day1_opens_at at time zone p.time_zone) - interval '5 hours')::date >= 2
      or exists (select 1 from public.member_days md
                 where md.party_id = p.id and md.user_id = auth.uid() and md.week = 1 and md.day = 2 and md.finished_at is not null)
    )
    from public.parties p where p.id = p_party), false);
$$;
