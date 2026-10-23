// localStorage, namespaced.
//
// The `js_` prefix is load-bearing twice over: `ProgressBackup` from
// @fretworks/design exports and imports by prefix, and the shell's /backup
// screen sweeps every key on the origin — so anything stored here is already
// covered by both with no extra wiring.
//
// Reads are guarded: a private-mode browser throws on access rather than
// returning null, and a half-written value should degrade to the default
// rather than take the app down.

export const PREFIX = 'js_';

export const K_ACTIVE = PREFIX + 'active';   // tune ids taken on
export const K_SRS = PREFIX + 'srs';         // SM-2 state by card id
export const K_NOTES = PREFIX + 'notes';     // free text by tune id
export const K_CUSTOM = PREFIX + 'custom';   // tunes the user added
export const K_NEXT = PREFIX + 'next';       // tune ids you plan to learn, in order
export const K_SETTINGS = PREFIX + 'settings'; // { maxGap } — see lib/srs.js capDue
// Retired: the bar grid. Read once, moved into notes, removed (lib/migrate.js).
export const K_CHARTS = PREFIX + 'charts';

export function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

export function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function remove(key) {
  try { localStorage.removeItem(key); } catch { /* private mode */ }
}
