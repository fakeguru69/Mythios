// The "garrick" server function on Supabase (Deno). The logic is in handler.ts; garrickRouter.ts and garrickPrompt.ts
// are exact copies of src/data/ (scripts/sync-garrick-function.cjs makes and checks them).
// GEMINI_API_KEY is an Edge Function secret; without it, Garrick answers from his stored lines only.
import { handleGarrick } from './handler.ts';

Deno.serve((req: Request) =>
  handleGarrick(req, {
    url: Deno.env.get('SUPABASE_URL') ?? '',
    anonKey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    geminiKey: Deno.env.get('GEMINI_API_KEY') ?? undefined,
    geminiModel: Deno.env.get('GEMINI_MODEL') ?? undefined,
  })
);
