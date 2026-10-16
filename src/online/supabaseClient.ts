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

// Whether the server has Google sign-in switched on. A button shows only once its sign-in is set up
// in the Supabase dashboard, so nothing half-ready reaches a player.
export const enabledSignIns = async (): Promise<{ google: boolean }> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } });
    const data = await res.json();
    return { google: !!data?.external?.google };
  } catch {
    return { google: false };
  }
};

// Name lengths (Core Rules §12a): a player's name is 1 to 12 characters; a party's name is 1 to 20.
export const MAX_PLAYER_NAME = 12;
export const MAX_PARTY_NAME = 20;
export const MAX_PARTY_SIZE = 6;

export type MemberStatus = 'pending' | 'approved' | 'left' | 'removed' | 'turned_away';

export interface PartyRow {
  id: string;
  name: string;
  host_id: string;
  invite_code: string;
  invite_open: boolean;
  time_zone: string;
  season_started_at: string | null;
  day1_opens_at: string | null;
  series_id: string;
  season_number: number;
}

export interface MemberRow {
  party_id: string;
  user_id: string;
  character_name: string;
  status: MemberStatus;
  joined_at: string;
  session_zero_done_at: string | null;
  class: string | null;
  second_attr: string | null;
  ready: boolean;
}

export const PARTY_COLUMNS = 'id,name,host_id,invite_code,invite_open,time_zone,season_started_at,day1_opens_at,series_id,season_number';
export const MEMBER_COLUMNS = 'party_id,user_id,character_name,status,joined_at,session_zero_done_at,class,second_attr,ready';

// What the invite page may show before joining (server function invite_details).
export interface InviteDetails {
  party_name: string;
  host_name: string;
  members: string | null;
  open: boolean;
  set_off: boolean;
  full: boolean;
}

// The party's clock: every IANA zone the browser knows, labelled "Singapore (GMT+8)".
export const allTimeZones = (): string[] => {
  try {
    return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone');
  } catch {
    return ['Asia/Singapore'];
  }
};
export const homeTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Singapore';
  } catch {
    return 'Asia/Singapore';
  }
};
export const timeZoneLabel = (tz: string): string => {
  const city = (tz.split('/').pop() || tz).replace(/_/g, ' ');
  try {
    const part = new Intl.DateTimeFormat('en-GB', { timeZone: tz, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName');
    return part ? `${city} (${part.value})` : city;
  } catch {
    return city;
  }
};
// "today" if it is before 5:00am on the party's clock, otherwise "tomorrow" (Core Rules §12a).
export const dayOneWord = (tz: string): 'today' | 'tomorrow' => {
  try {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
    return hour < 5 ? 'today' : 'tomorrow';
  } catch {
    return 'tomorrow';
  }
};

// The server's refusals, in plain words for the player.
export const plainError = (message: string | undefined): string => {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password do not match.';
  if (m.includes('email not confirmed')) return 'Open the link in your email first, then sign in.';
  if (m.includes('user already registered')) return 'That email already has an account. Sign in instead.';
  if (m.includes('password should be at least')) return 'The password needs at least 6 characters.';
  if (m.includes('email rate limit')) return 'Too many emails just now. Try again in an hour.';
  if (m.includes('rate limit')) return 'Too many tries. Wait a minute and try again.';
  if (m.includes('not authorized') || m.includes('address_not_authorized')) return "We couldn't send an email to that address.";
  if (m.includes('this invite no longer works')) return 'This invite no longer works. Ask for a new link.';
  if (m.includes('this party is full')) return 'This party is full. Six is as many as the road will hold.';
  if (m.includes('this party has set off')) return 'This party has set off.';
  if (m.includes('not this time')) return 'Not this time.';
  if (m.includes('you cannot come back')) return "You can't come back to this story.";
  if (m.includes('only the host')) return 'Only the host can do that.';
  if (m.includes('needs two of you ready')) return 'Needs two of you ready.';
  if (m.includes('choose a clock')) return 'Choose a clock for the party.';
  if (m.includes('clock is locked')) return 'The clock cannot be changed once the story starts.';
  if (m.includes('too late to change')) return 'Your choices are set now that Day 1 has opened.';
  if (m.includes('character_name') || m.includes('display_name')) return `A name is 1 to ${MAX_PLAYER_NAME} characters.`;
  if (m.includes('parties_name') || m.includes('name_check')) return `A party's name is 1 to ${MAX_PARTY_NAME} characters.`;
  if (m.includes('failed to fetch') || m.includes('network')) return 'No connection to the server. Try again.';
  return 'Something went wrong. Try again.';
};

// The party's calendar date (YYYY-MM-DD) on its own clock, `addDays` from today.
export const partyDate = (tz: string, addDays = 0): string => {
  const d = new Date(Date.now() + addDays * 86400000);
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
};
// The first day the story can start: today if it is before 5:00am on the party's clock, otherwise tomorrow.
export const earliestStartDate = (tz: string): string => partyDate(tz, dayOneWord(tz) === 'today' ? 0 : 1);
// "today", "tomorrow" or "on Monday 20 October", for when Day 1 opens.
export const dayOneOpening = (day1Iso: string, tz: string): string => {
  const fmt = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const day1 = new Date(day1Iso);
  try {
    const label = fmt(day1);
    if (label === partyDate(tz, 0)) return 'today';
    if (label === partyDate(tz, 1)) return 'tomorrow';
    return `on ${new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(day1)}`;
  } catch {
    return 'soon';
  }
};
// The same, for a chosen date (YYYY-MM-DD) before it is saved.
export const dateOpening = (date: string, tz: string): string => {
  if (date === partyDate(tz, 0)) return 'today';
  if (date === partyDate(tz, 1)) return 'tomorrow';
  const [y, m, d] = date.split('-').map(Number);
  return `on ${new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(Date.UTC(y, m - 1, d, 12)))}`;
};
