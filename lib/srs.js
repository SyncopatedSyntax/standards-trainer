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
// Days are UTC calendar days (todayStr), so the arithmetic is done in UTC too.
// Local-time arithmetic put "tomorrow" on today anywhere east of Greenwich,
// and lost a day whenever a gap crossed a clock change.
export const todayStr = () => new Date().toISOString().split('T')[0];
export const addDays = (d, n) => { const dt = new Date(d); dt.setUTCDate(dt.getUTCDate() + n); return dt.toISOString().split('T')[0]; };

// SM-2: a correct answer nudges the ease factor up and stretches the interval
// (1 day → 6 days → interval × ef); a miss drops the ease factor and resets the
// interval to tomorrow. `on` is the day of the answer: today, except when an
// answer from the history is replayed (below). The arithmetic is unchanged.
export function updateSRS(card, correct, on = todayStr()) {
  const ef = card?.ef ?? 2.5, reps = card?.reps ?? 0, interval = card?.interval ?? 1;
  if (correct) {
    const nef = Math.min(2.5, Math.max(1.3, ef + 0.1));
    const nreps = reps + 1;
    const nint = nreps === 1 ? 1 : nreps === 2 ? 6 : Math.round(interval * nef);
    return { ef: nef, interval: nint, reps: nreps, nextDue: addDays(on, nint) };
  }
  return { ef: Math.max(1.3, ef - 0.2), interval: 1, reps: 0, nextDue: addDays(on, 1) };
}

// ── Grading and the answer history ──────────────────────────────────────
// A card keeps the log of its answers — `hist`, [{ d: 'YYYY-MM-DD', ok }], at
// most one per day — and its schedule (ef, interval, reps, nextDue) is always
// the SM-2 engine above replayed over that log. So editing or deleting an old
// answer re-derives the schedule as if the history had always read that way,
// and the schedule can never drift out of step with the log it is shown next
// to.
//
// `base` is where the replay starts: the card's state from before its history
// was kept, or null for a card first answered with the log in place. Answers
// from before the log existed were only ever stored as that running state;
// they are counted, never listed, and never invented now.
//
// One answer per card per day: answering again the same day replaces that
// day's entry, so ten taps of Got it count once. (They used to count ten
// times, and the next review drifted weeks out.)
//
// `seen` is what the toolbox's sync compares when two devices both changed a
// card offline — more wins. It is the answers on record plus `edits`: every
// edit or delete adds one, so a corrected history never loses to an older,
// uncorrected copy just because that copy is longer.
const strip = c => { const { prev: _p, hist: _h, base: _b, edits: _e, ...rest } = c; return rest; };

export function historyOf(card) {
  if (!card) return { base: null, hist: [], edits: 0 };
  if (Array.isArray(card.hist)) return { base: card.base ?? null, hist: card.hist, edits: card.edits ?? 0 };
  // Older shapes, read without being rewritten (they convert on the next
  // change). A card answered under the previous version carries `prev` — its
  // state before that answer — and `last`/`lastOk`: one recoverable entry.
  // Anything older has no log at all, only its running state.
  if (card.last && card.prev !== undefined) return { base: card.prev ? strip(card.prev) : null, hist: [{ d: card.last, ok: !!card.lastOk }], edits: 0 };
  return { base: strip(card), hist: [], edits: 0 };
}

export function replay(base, hist, edits = 0) {
  const log = [...hist].sort((a, b) => a.d.localeCompare(b.d));
  // Nothing on record: the card is simply its base again — never-reviewed if
  // there is none. An edit still has to be counted, though, so a card whose
  // listed answers were all deleted keeps its count of them in `seen`.
  if (!log.length && (!base || !edits)) return base ?? null;
  let st = base ? { ...base } : {};
  for (const e of log) st = { ...st, ...updateSRS(st, e.ok, e.d) };
  const end = log[log.length - 1];
  return {
    ...st,
    seen: (base?.seen ?? 0) + log.length + edits,
    last: end ? end.d : base?.last, lastOk: end ? end.ok : base?.lastOk,
    base, hist: log, edits,
  };
}

export function gradeCard(card, correct, today = todayStr()) {
  const { base, hist, edits } = historyOf(card);
  return replay(base, [...hist.filter(e => e.d !== today), { d: today, ok: correct }], edits);
}
// Take back today's answer, as if it was never given (the Undo right after
// answering — so it is not counted as an edit).
export function ungradeCard(card, today = todayStr()) {
  const { base, hist, edits } = historyOf(card);
  if (!hist.some(e => e.d === today)) return card;
  return replay(base, hist.filter(e => e.d !== today), edits);
}
export const gradedToday = (card, today = todayStr()) => !!card && card.last === today;

// Change one answer in the history — its result, its day, or both. A day in
// the future is refused; a day that already holds an answer is replaced by
// this one (still one per day — the UI warns before it gets that far).
export function editAnswer(card, date, { ok, d = date }, today = todayStr()) {
  const { base, hist, edits } = historyOf(card);
  if (!hist.some(e => e.d === date) || d > today) return card;
  return replay(base, [...hist.filter(e => e.d !== date && e.d !== d), { d, ok }], edits + 1);
}
// Remove one answer. If it was the only thing on record the card goes back to
// never-reviewed (null).
export function deleteAnswer(card, date) {
  const { base, hist, edits } = historyOf(card);
  if (!hist.some(e => e.d === date)) return card;
  return replay(base, hist.filter(e => e.d !== date), edits + 1);
}

// Every answer on record for one tune, newest first (skills in their usual
// order within a day), and the most recent across a whole repertoire.
export function tuneHistory(srs, tuneId, skills) {
  const out = [];
  skills.forEach((s, i) => {
    const id = cardId(tuneId, s.id);
    for (const e of historyOf(srs[id]).hist) out.push({ ...e, id, tuneId, skill: s.id, order: i });
  });
  return out.sort((a, b) => b.d.localeCompare(a.d) || a.order - b.order);
}
export function recentAnswers(srs, tuneIds, skills, n = 12) {
  return tuneIds.flatMap(t => tuneHistory(srs, t, skills)).sort((a, b) => b.d.localeCompare(a.d)).slice(0, n);
}
// Whether a card was answered before its log was kept — those answers count
// in its schedule but cannot be listed one by one.
export const hasUnloggedPast = card => !!historyOf(card).base;

// The unlogged past of each skill on a tune, as one row apiece. It cannot be
// itemised, but it has to be visible and removable: Zak deleted every listed
// answer on a tune and its Changes still read solid, 38 days out, because the
// taps behind it (made before the log existed, under the bug that counted
// every tap) were invisible and undeletable. `reps` is what it still counts
// for: Got it answers since the last Shaky.
export function earlierAnswers(srs, tuneId, skills) {
  const out = [];
  skills.forEach((s, i) => {
    const id = cardId(tuneId, s.id);
    const { base } = historyOf(srs[id]);
    if (base) out.push({ id, tuneId, skill: s.id, order: i, reps: base.reps ?? 0 });
  });
  return out;
}
// Drop a card's unlogged past, so its schedule is the listed answers alone —
// or nothing, if none are listed. `base.seen` leaves the sum, so it is carried
// into `edits`: seen must not go down (sync settles two devices by it).
export function clearEarlier(card) {
  const { base, hist, edits } = historyOf(card);
  if (!base) return card;
  return replay(null, hist, edits + 1 + (base.seen ?? 0));
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

// Where one tune stands, in the four numbers every view of it wants: how many
// skills are solid, how many are in flight, how many have never been seen, and
// how many want reviewing today. `next` is the soonest future review, so a
// tune with nothing due can still say when it comes back.
export function tuneStatus(srs, tuneId, skills, today = todayStr()) {
  let solid = 0, learning = 0, fresh = 0, due = 0, next = null;
  for (const s of skills) {
    const c = srs[cardId(tuneId, s.id)];
    if (!c) { fresh++; due++; continue; }   // never reviewed counts as due
    if (isSkillSolid(c)) solid++; else learning++;
    if (c.nextDue <= today) due++;
    else if (!next || c.nextDue < next) next = c.nextDue;
  }
  return { solid, learning, fresh, due, next, ready: solid === skills.length };
}

// Which state one skill is in, as a single word the UI can colour by.
export function skillState(card) {
  if (!card) return 'fresh';
  return isSkillSolid(card) ? 'solid' : 'learning';
}

// The day an answer was given, for the history lists: "Today", "Yesterday",
// else "Mon 19 Oct". Dates are stored as UTC days (todayStr), so they are
// formatted in UTC too — formatting '2026-10-19' in local time puts it on the
// 18th anywhere west of Greenwich.
export function dayLabel(date, today = todayStr()) {
  if (date === today) return 'Today';
  if (date === addDays(today, -1)) return 'Yesterday';
  const opts = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' };
  if (date.slice(0, 4) !== today.slice(0, 4)) opts.year = 'numeric';
  return new Date(date).toLocaleDateString(undefined, opts);
}

// "due now" / "tomorrow" / "in 5 days" — the same phrasing everywhere, so a
// tune reads the same on the Tunes list as it does in its own detail view.
export function relativeDay(date, today = todayStr()) {
  if (!date) return 'not started';
  if (date <= today) return 'due now';
  const days = Math.round((new Date(date) - new Date(today)) / 86400000);
  return days === 1 ? 'tomorrow' : `in ${days} days`;
}

// ── Stages: learning, in repertoire, needs a refresher ─────────────────
// The app sits beside iReal Pro and forScore rather than replacing them: it
// answers which tunes are being learned, which are done, and which need a
// refresher. So a taken-on tune is in one of three stages, and the line
// between the first and the others is a fact about the past, not the present:
// a tune whose Changes slipped last week has not gone back to being "learned
// from scratch" — it needs a refresher.
//
// Learned = there was a day when all of its skills were solid at once. Found
// by replaying each skill's answers in date order (the same fold `replay`
// does), so editing or deleting an answer moves it too. `on` is that day, or
// null if it was already learned before the history was kept.
export function learnedOn(srs, tuneId, skills) {
  const logs = skills.map(s => historyOf(srs[cardId(tuneId, s.id)]));
  const st = logs.map(h => h.base);
  const all = () => st.every(isSkillSolid);
  if (all()) return { learned: true, on: null };
  const days = [...new Set(logs.flatMap(h => h.hist.map(e => e.d)))].sort();
  for (const d of days) {
    logs.forEach((h, i) => {
      const e = h.hist.find(x => x.d === d);
      if (e) st[i] = { ...st[i], ...updateSRS(st[i], e.ok, e.d) };
    });
    if (all()) return { learned: true, on: d };
  }
  return { learned: false, on: null };
}
// The repertoire growing: every learned tune with the day it was learned,
// newest first, and those learned before the history was kept (no day on
// record) last, in the order given. Replayed from the history like
// learnedOn itself, so it is never stored and cannot drift.
export function learnedTimeline(srs, tuneIds, skills) {
  const out = [];
  for (const id of tuneIds) {
    const l = learnedOn(srs, id, skills);
    if (l.learned) out.push({ tuneId: id, on: l.on });
  }
  return out.sort((a, b) => (a.on === null) - (b.on === null) || String(b.on).localeCompare(String(a.on)));
}
// How many of those were learned in today's calendar month.
export const learnedThisMonth = (timeline, today = todayStr()) =>
  timeline.filter(e => e.on && e.on.slice(0, 7) === today.slice(0, 7)).length;

// 'learning' until learned; then 'refresher' while anything is due or any
// skill is no longer solid, else 'repertoire'.
export function tuneStage(srs, tuneId, skills, today = todayStr()) {
  if (!learnedOn(srs, tuneId, skills).learned) return 'learning';
  const st = tuneStatus(srs, tuneId, skills, today);
  return st.due > 0 || !st.ready ? 'refresher' : 'repertoire';
}

// ── The longest gap between refreshers ─────────────────────────────────
// SM-2 on its own spaces a run of Got its 1, 6, 15, 38, 95, 238, 595 days
// apart — after seven, a tune is not seen for a year and a half. That is the
// opposite of not forgetting, so a setting caps the gap. It is applied when
// the schedule is READ, never written: a card's last answer is always
// `nextDue - interval`, so the capped due date is that plus the cap, which
// needs no migration, changes every card the moment the setting does, and
// leaves the stored schedule — and its history — exactly as the engine made
// it. App passes the capped view to every screen and grades the raw cards.
export function capDue(card, cap) {
  if (!card || !cap || !(card.interval > cap) || !card.nextDue) return card;
  return { ...card, nextDue: addDays(card.nextDue, cap - card.interval) };
}
export const withMaxGap = (srs, cap) => (cap
  ? Object.fromEntries(Object.entries(srs).map(([id, c]) => [id, capDue(c, cap)]))
  : srs);
export const DEFAULT_MAX_GAP = 60;

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
//
// A card with no SRS entry has never been reviewed, which counts as due today
// — the same rule dueCards() and tuneStatus() apply. Skipping them here (an
// earlier version did) made the forecast disagree with the queue it is meant
// to describe: a tune reading "4 due now" would show a bar of 1.
export function forecast(srs, activeIds, skills, days = 7, today = todayStr()) {
  const buckets = Array.from({ length: days }, (_, i) => ({ date: addDays(today, i), n: 0 }));
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const tuneId of activeIds) {
    for (const s of skills) {
      const c = srs[cardId(tuneId, s.id)];
      if (!c?.nextDue) { buckets[0].n++; continue; }
      if (c.nextDue <= today) { buckets[0].n++; continue; }
      const i = index.get(c.nextDue);
      if (i != null) buckets[i].n++;
    }
  }
  return buckets;
}
