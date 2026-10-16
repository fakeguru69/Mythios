-- How 0025-0030 reached the server (16 Oct): a one-time loader function, locked with a secret key, was switched on,
-- given the same 36 rows (scripts/gen-campfire-sql.ts <week> --json), and switched off right after. Applied as two
-- migrations, "campfire_loader_on" and "campfire_loader_off". The secret is not kept here; the function no longer runs.
-- To reload after a change to the Campfire data, apply the regenerated 0025-0030 files (or a new loader the same way).
revoke execute on function public.load_campfire_once from public, anon, authenticated;
