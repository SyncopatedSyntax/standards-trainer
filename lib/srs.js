// ── Spaced repetition ────────────────────────────────────────────────────
// The SM-2 engine, taken verbatim from Focused-Chord-Trainer/lib/srs.js (which
// took it from Chord Trainer) — the same algorithm Anki and Triad Trainer use.
// Deliberately unchanged so a fix in one place can be carried to the others.
//
// What differs here is only what a *card* is. Elsewhere a card is a chord or a
// shape; here it is one skill on one tune, keyed `<tuneId>.<skill>`, so the
// changes to a tune you play weekly can stay green while its head quietly
// comes due.

export const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const todayStr = () => new Date().toISOString().split('T')[0];
export const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };

// SM-2: a correct answer nudges the ease factor up and stretches the interval
// (1 day → 6 days → interval × ef); a miss drops the ease factor and resets the
// interval to tomorrow.
export function updateSRS(card, correct) {
  const ef = card?.ef ?? 2.5, reps = card?.reps ?? 0, interval = card?.interval ?? 1;
  if (correct) {
    const nef = Math.min(2.5, Math.max(1.3, ef + 0.1));
    const nreps = reps + 1;
    const nint = nreps === 1 ? 1 : nreps === 2 ? 6 : Math.round(interval * nef);
    return { ef: nef, interval: nint, reps: nreps, nextDue: addDays(todayStr(), nint) };
  }
  return { ef: Math.max(1.3, ef - 0.2), interval: 1, reps: 0, nextDue: addDays(todayStr(), 1) };
}

// Seeded pseudo-random number generator (mulberry32) — deterministic for a
// given seed, so the day's set stays stable however often you reopen the app.
export function seededRng(seed) {
  return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function strHash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = Math.imul(31, h) + s.charCodeAt(i) | 0; } return h; }
export function seededShuffle(arr, seed) {
  const a = [...arr], rng = seededRng(seed);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ── Cards ────────────────────────────────────────────────────────────────
// A card id is `<tuneId>.<skill>`. Tune ids are kebab-case and contain no
// dots, so splitting on the last one is unambiguous — done explicitly rather
// than with split('.') so a future id format can't silently break it.
export const cardId = (tuneId, skill) => `${tuneId}.${skill}`;
export const parseCardId = id => {
  const i = id.lastIndexOf('.');
  return i < 0 ? { tuneId: id, skill: null } : { tuneId: id.slice(0, i), skill: id.slice(i + 1) };
};

// Every due card for the tunes currently taken on: longest-overdue first, and
// a card with no SRS entry has never been reviewed, so it counts as due.
export function dueCards(srs, activeIds, skills, today = todayStr()) {
  const out = [];
  for (const tuneId of activeIds) {
    for (const s of skills) {
      const id = cardId(tuneId, s.id);
      const card = srs[id];
      if (!card) { out.push({ id, tuneId, skill: s.id, card: null, fresh: true }); continue; }
      if (card.nextDue <= today) out.push({ id, tuneId, skill: s.id, card, fresh: false });
    }
  }
  // Never-seen cards last: finish reviewing what you know before adding load.
  return out.sort((a, b) => (a.fresh - b.fresh) || String(a.card?.nextDue).localeCompare(String(b.card?.nextDue)));
}

// A tune counts as jam-ready when all four of its skills have been got right
// at least twice — the same `reps >= 2` bar Diatonic uses for "learned".
export const LEARNED_REPS = 2;
export const isSkillSolid = card => (card?.reps ?? 0) >= LEARNED_REPS;
export function tuneIsReady(srs, tuneId, skills) {
  return skills.every(s => isSkillSolid(srs[cardId(tuneId, s.id)]));
}

// Counts for the Progress tab.
export function stats(srs, activeIds, skills) {
  let solid = 0, learning = 0, fresh = 0;
  for (const tuneId of activeIds) {
    for (const s of skills) {
      const c = srs[cardId(tuneId, s.id)];
      if (!c) fresh++;
      else if (isSkillSolid(c)) solid++;
      else learning++;
    }
  }
  const ready = activeIds.filter(id => tuneIsReady(srs, id, skills)).length;
  return { solid, learning, fresh, ready, total: activeIds.length * skills.length };
}

// Cards coming due over the next `days` days, for the forecast bars.
export function forecast(srs, activeIds, skills, days = 7, today = todayStr()) {
  const buckets = Array.from({ length: days }, (_, i) => ({ date: addDays(today, i), n: 0 }));
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const tuneId of activeIds) {
    for (const s of skills) {
      const c = srs[cardId(tuneId, s.id)];
      if (!c?.nextDue) continue;
      if (c.nextDue <= today) { buckets[0].n++; continue; }
      const i = index.get(c.nextDue);
      if (i != null) buckets[i].n++;
    }
  }
  return buckets;
}
