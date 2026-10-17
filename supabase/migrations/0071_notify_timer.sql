-- The timer for notifications (0069): every five minutes the database calls the "notify" server function, which fills
-- the outbox with what is due and sends it. Live project only (the local copy has no pg_cron; tests call notify_due()).
-- Additive only.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'mythios-notify',
  '*/5 * * * *',
  $$select net.http_post(url := 'https://toqeuurdsyeifhpecagr.supabase.co/functions/v1/notify',
                         headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb)$$
);
