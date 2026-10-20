# Mythios — Grok Audit Remediation & Phase C/D Roadmap

Resolution plan to address all verified findings from the Grok audit report and proceed with remaining Phase C, D, and E gameplay features.

## Audit Findings Verification Summary

> [!IMPORTANT]
> All primary claims in the Grok audit were verified directly in the codebase and are **100% justified**:
> 1. **Garrick Fire State Bug (Blocker 1 - CONFIRMED)**: In `supabase/functions/garrick/handler.ts` (lines 149–150), `garrick_state` is called using the `serviceKey` (system role). In `supabase/migrations/0096_garrick_at_fire.sql` (lines 36–45), `garrick_state` calls `public.my_fire_day(p_party)`, which checks `user_id = auth.uid()`. Since `auth.uid()` is null/service_role when invoked by the Edge function, `my_fire_day` throws an exception, causing `v_at_fire` to be set to `false` on every single query.
> 2. **GitHub Repo Secrets Exposure (Blocker 2 - CONFIRMED)**: `fakeguru69/Mythios` is currently public. Setting it to private on GitHub is an essential user administration step.
> 3. **Crafted "Place" Parameter Override (Blocker 3 - CONFIRMED)**: `handler.ts` (line 137) trusts `body.place` passed from the client, allowing custom HTTP requests to force daytime private rules even while at the fire.
> 4. **Test Script Mocking (Problem 8 - CONFIRMED)**: `tests/online/garrick-at-fire.cjs` and `tests/online/spoiler-hardening.cjs` rely on static mock message arrays and regex file checks without querying the local database RPCs.

---

## 1. Overview & Remediation Strategy

The primary goal is to immediately fix the high-severity Garrick fire check and server security vulnerabilities, upgrade test coverage to execute against actual database RPCs, and then resume building the remaining Phase C/D items (Record tab, Bag verses, Gathering stats announcements, etc.).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Garrick Edge Function                            │
│  (1) Receives ask request with user auth & p_asked_by (asker UUID)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Database RPC: public.garrick_state(p_party, p_asked_by)   │
│  (2) Queries member_days / fan_outs explicitly for p_asked_by           │
│      (Does NOT rely on auth.uid() or my_fire_day)                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Server Enforcement & Routing                        │
│  (3) If p_asked_by finished chapter & fire open => Force atFire = true  │
│  (4) Ignores client 'place' override for fire participants               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Product & Technical Decisions

### Decision 1: Fix `garrick_state` RPC Lookup
* **Chosen Approach**: Create migration `0098_garrick_fire_asker_fix.sql`. Replace `my_fire_day(p_party)` inside `garrick_state` with a direct parameter-driven check on `p_asked_by` in `fan_outs` and `member_days` for today's active fire week/day.
* **Why**: The Edge function operates under the service role credentials (`env.serviceKey`), so `auth.uid()` returns null. Looking up `p_asked_by` directly accurately determines if the specific user asking the question is at the fire.

### Decision 2: Ignore Client 'Place' Parameter for Active Fire Participants
* **Chosen Approach**: Update `handler.ts` to compute `atFire` via `garrick_state` before evaluating private routes. If the user is currently at the fire, force fire rules regardless of any client-supplied `place` attribute.
* **Why**: Prevents crafted HTTP requests from bypassing fire rules or discovering forbidden names during evening campfire sessions.

### Decision 3: Filter "Last Night at the Fire" Chat
* **Chosen Approach**: Modify `FireChat.tsx` and `party_chat_messages` RPC to explicitly filter previous night messages where `at_fire = true` when rendering "Last night at the fire".
* **Why**: Ensures daytime conversations and unrelated messages do not leak into the evening campfire historical log.

### Decision 4: Real Database RPC Test Script
* **Chosen Approach**: Update `tests/online/garrick-at-fire.cjs` and `tests/online/spoiler-hardening.cjs` to issue real Supabase client / RPC requests against the local PostgreSQL test instance.
* **Why**: Validates that actual SQL policies, trigger logic, and RPC permissions function correctly in an environment mirroring production.

---

## 3. Step-by-Step Implementation Roadmap

### Step 1: Database Migration `0098_garrick_fire_asker_fix.sql`
- Redefine `public.garrick_state(p_party uuid, p_asked_by uuid)` to check `p_asked_by` in `member_days` and `fan_outs` for the party's current fire day.
- Ensure failure gracefully falls back without throwing unhandled exceptions, returning accurate `atCampfire` boolean in the result JSON.

### Step 2: Hardening `supabase/functions/garrick/handler.ts`
- Pass `p_asked_by` to `garrick_state` first before checking private question routes.
- Enforce `atFire` server-side so `body.place` cannot override fire restrictions.

### Step 3: "Last Night at the Fire" Filtering
- Update `FireChat.tsx` lines 329–331 and `party_chat_messages` RPC to filter `at_fire = true` for historical campfire lines.

### Step 4: Real Database Security Test Execution
- Update `tests/online/garrick-at-fire.cjs` and `tests/online/spoiler-hardening.cjs` to run against local Supabase / PostgreSQL.
- Verify test passes cleanly with the new SQL function definition.

### Step 5: Resume Phase C/D Features
- **C4–C9**: Finish Party Panel polish, Record tab (12 statistics display), Bag verses & shelves, and Store item cards.
- **D1–D4**: Implement Gathering announcements (natural 20s, badges, crown awards, level ups) for big moments.

---

## 4. Verification & Testing

1. **Local Test Execution**:
   - Run `node tests/online/garrick-at-fire.cjs`
   - Run `node tests/online/spoiler-hardening.cjs`
   - Run `node tests/online/assert-checks.cjs`
2. **Applet Compilation**:
   - Run `compile_applet` to verify zero TypeScript or Vite build errors.
