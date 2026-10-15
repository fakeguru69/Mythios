// Core Rules §6: after five wrong tries at one fragment word, that friend waits two minutes.
// Shared by the Bag's Seeker Chest and the Campfire so both use the same count.

const MAX_WRONG_TRIES = 5;
const LOCK_MS = 2 * 60 * 1000;
const STORAGE_KEY = 'mythios_word_locks_v1';

type LockState = Record<string, { wrong: number; lockedUntil: number }>;

function load(): LockState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LockState) : {};
  } catch {
    return {};
  }
}

function save(state: LockState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable; the lock then lasts only for this page.
  }
}

let locks: LockState = typeof window !== 'undefined' ? load() : {};

const keyFor = (fragId: string, wordIndex: 1 | 2) => `${fragId}:${wordIndex}`;

/** Seconds left on this word's wait, or 0 if it can be tried now. */
export function wordLockSecondsLeft(fragId: string, wordIndex: 1 | 2): number {
  const entry = locks[keyFor(fragId, wordIndex)];
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.lockedUntil - Date.now()) / 1000));
}

/** Records a wrong try; returns the seconds to wait if this try started a lock. */
export function registerWrongWordTry(fragId: string, wordIndex: 1 | 2): number {
  const key = keyFor(fragId, wordIndex);
  const entry = locks[key] ?? { wrong: 0, lockedUntil: 0 };
  const wrong = entry.wrong + 1;
  if (wrong >= MAX_WRONG_TRIES) {
    locks = { ...locks, [key]: { wrong: 0, lockedUntil: Date.now() + LOCK_MS } };
  } else {
    locks = { ...locks, [key]: { ...entry, wrong } };
  }
  save(locks);
  return wordLockSecondsLeft(fragId, wordIndex);
}

/** A correct answer clears the count. */
export function clearWordTries(fragId: string, wordIndex: 1 | 2) {
  const key = keyFor(fragId, wordIndex);
  if (!locks[key]) return;
  const { [key]: _removed, ...rest } = locks;
  locks = rest;
  save(locks);
}
