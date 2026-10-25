-- 0130 (25 Oct 2026): the slots Garrick's fire lines are kept under.
-- fire_said (0095) accepts only the slots it knew then. The fire screen has since said lines in two more, 'nudge-laid'
-- (Phase 2, 24 Oct) and 'leaning' (Campfire v3), and from today in three more, Garrick's hosting lines ('split-pair',
-- 'quiet-friend', 'unanswered'; docs/design/garrick-fire-host-lines-draft-25oct.md, approved 25 Oct). A row in an
-- unknown slot failed the check, and fire_remember refused the whole batch, so on any night with one of those lines
-- nothing that night was kept on the server (the phone's own memory still held it). The check is widened to every slot
-- the screen uses; nothing else changes.
alter table public.fire_said drop constraint if exists fire_said_slot_check;
alter table public.fire_said add constraint fire_said_slot_check
  check (slot ~ '^(cup|greet|opener|notice-[0-9]{1,2}|nudge|nudge-laid|callback|leaning|split-pair|quiet-friend|unanswered|closer)$');
