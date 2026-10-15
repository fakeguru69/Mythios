// The connection to the game's server (Supabase project "mythios", Singapore).
// The address and the publishable key are public by design: what each player may read or change
// is decided by the server's access rules (supabase/migrations), not by keeping these secret.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://toqeuurdsyeifhpecagr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  'sb_publishable_ICXEO9nRuilWdVF1WDSRMA_SVng5ADV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Name lengths (Core Rules §12a): a player's name is 1 to 12 characters; a party's name is 1 to 20.
export const MAX_PLAYER_NAME = 12;
export const MAX_PARTY_NAME = 20;
export const MAX_PARTY_SIZE = 6;

export type MemberStatus = 'pending' | 'approved' | 'left' | 'removed';

export interface PartyRow {
  id: string;
  name: string;
  host_id: string;
  invite_code: string;
  invite_open: boolean;
}

export interface MemberRow {
  party_id: string;
  user_id: string;
  character_name: string;
  status: MemberStatus;
  joined_at: string;
  session_zero_done_at: string | null;
}

// The server's refusals, in plain words for the player.
export const plainError = (message: string | undefined): string => {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password do not match.';
  if (m.includes('email not confirmed')) return 'Open the link in your email first, then sign in.';
  if (m.includes('user already registered')) return 'That email already has an account. Sign in instead.';
  if (m.includes('password should be at least')) return 'The password needs at least 6 characters.';
  if (m.includes('rate limit')) return 'Too many tries. Wait a minute and try again.';
  if (m.includes('this invite no longer works')) return 'This invite no longer works. Ask for a new link.';
  if (m.includes('this party is full')) return 'This party is full.';
  if (m.includes('you cannot come back')) return 'You left this story, so you cannot join it again.';
  if (m.includes('only the host')) return 'Only the host can do that.';
  if (m.includes('character_name') || m.includes('display_name')) return `A name is 1 to ${MAX_PLAYER_NAME} characters.`;
  if (m.includes('parties_name') || m.includes('name_check')) return `A party's name is 1 to ${MAX_PARTY_NAME} characters.`;
  if (m.includes('failed to fetch') || m.includes('network')) return 'No connection to the server. Try again.';
  return 'Something went wrong. Try again.';
};
