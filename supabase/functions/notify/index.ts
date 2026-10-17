// The "notify" server function on Supabase (Deno), called every five minutes by the database's timer (pg_cron,
// migration 0071). The logic is in handler.ts. The VAPID key pair is made by handler.ts once and kept in the database
// (app_secrets, migration 0070), never here.
import webpush from 'npm:web-push@3.6.7';
import { runNotify, type WebPushLib } from './handler.ts';

Deno.serve(async () => {
  try {
    const out = await runNotify(
      { url: Deno.env.get('SUPABASE_URL') ?? '', serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' },
      webpush as unknown as WebPushLib
    );
    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ message: (e as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
