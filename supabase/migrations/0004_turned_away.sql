-- A friend the host does not let in is "turned away", which is not the same as being removed after joining:
-- they see "Not this time." rather than "You're no longer in this party." (review-accounts-and-invites.md §3, §4).
alter type public.member_status add value if not exists 'turned_away';
