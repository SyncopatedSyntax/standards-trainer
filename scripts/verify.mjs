// Smoke test for data/tunes.js — the shipped curriculum.
//
// The rest of the toolbox verifies music theory it generates. There is no
// generated theory here: this file is hand-written facts, and the failure mode
// is a wrong fact rather than a wrong formula. So these assertions pin the
// things that a typo would break silently — a form that does not match its bar
// count, a key that is not a key, a tune with no tier — plus one guard that
// matters more than the rest: nothing copyrighted may creep into this file.
//
//   node scripts/verify.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { CORE_TUNES, TIERS, SKILLS, LETTER_FORMS } from '../data/tunes.js';
import { gradeCard, ungradeCard, gradedToday, updateSRS, todayStr, addDays, editAnswer, deleteAnswer, historyOf, tuneHistory, recentAnswers, hasUnloggedPast, earlierAnswers, clearEarlier, isSkillSolid, cardId, learnedOn, tuneStage, capDue, withMaxGap, DEFAULT_MAX_GAP, learnedTimeline, learnedThisMonth } from '../lib/srs.js';
import { chartText, migrateCharts } from '../lib/migrate.js';

let failures = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (e) { failures++; console.log(`  ✗ ${name}\n      ${e.message}`); }
};
const fail = m => { throw new Error(m); };

console.log('\ndata/tunes.js');

check('every tune has a unique, url-safe id', () => {
  const seen = new Set();
  for (const t of CORE_TUNES) {
    if (!t.id) fail(`"${t.title}" has no id`);
    if (!/^[a-z0-9-]+$/.test(t.id)) fail(`id "${t.id}" is not lowercase-kebab`);
    if (seen.has(t.id)) fail(`duplicate id "${t.id}"`);
    seen.add(t.id);
  }
});

check('every tune is attributed and described', () => {
  for (const t of CORE_TUNES) {
    if (!t.title?.trim()) fail(`${t.id}: no title`);
    if (!t.composer?.trim()) fail(`${t.id}: no composer`);
    if (!t.why?.trim()) fail(`${t.id}: no "why" — the teaching reason is the point of the list`);
    if (!t.feel?.trim()) fail(`${t.id}: no feel`);
  }
});

check('every tune carries researched facts and guitar notes', () => {
  for (const t of CORE_TUNES) {
    for (const [field, min] of [['facts', 2], ['guitar', 2]]) {
      const v = t[field];
      if (!Array.isArray(v)) fail(`${t.id}: ${field} must be an array`);
      if (v.length < min) fail(`${t.id}: only ${v.length} ${field} — the point is that each tune earns its place`);
      for (const line of v) {
        if (typeof line !== 'string' || !line.trim()) fail(`${t.id}: an empty ${field} entry`);
        // A one-clause note is almost always a placeholder someone meant to
        // come back to. Better to fail here than to ship "Nice tune."
        if (line.trim().length < 40) fail(`${t.id}: ${field} entry too thin to be worth reading — "${line}"`);
      }
    }
  }
});

check('guitar notes are actually about the guitar', () => {
  // Cheap but effective: a note that mentions nothing physical about the
  // instrument is general advice that has drifted into the wrong field.
  const GUITARISH = /string|fret|neck|position|pick|voicing|shape|grip|chord melody|octave|damp|thumb|comp|open|barre|triad|arpeggi|fingering|register|strum|mute|slide|vibrato/i;
  for (const t of CORE_TUNES) {
    if (!t.guitar.some(g => GUITARISH.test(g))) {
      fail(`${t.id}: no guitar note mentions anything specific to the instrument`);
    }
  }
});

check('every key is a real key (or explicitly modal)', () => {
  for (const t of CORE_TUNES) {
    if (t.key === 'modal') continue;
    if (!/^[A-G](b|#)?m?$/.test(t.key)) fail(`${t.id}: "${t.key}" is not a key name`);
  }
});

check('bar counts agree with the stated form', () => {
  for (const t of CORE_TUNES) {
    if (!Number.isInteger(t.bars) || t.bars <= 0) fail(`${t.id}: bars must be a positive integer`);
    if (t.form === 'blues') {
      if (t.bars !== 12) fail(`${t.id}: a blues is 12 bars, not ${t.bars}`);
    } else if (t.form === 'through') {
      // Through-composed: no repeating sections, so nothing to divide.
    } else if (LETTER_FORMS.test(t.form)) {
      const sections = t.form.length;
      if (t.bars % sections !== 0) {
        fail(`${t.id}: form ${t.form} is ${sections} sections but ${t.bars} bars does not divide evenly`);
      }
    } else {
      fail(`${t.id}: unknown form "${t.form}"`);
    }
  }
});

check('tempo ranges are sane', () => {
  for (const t of CORE_TUNES) {
    if (!(t.tempoLo < t.tempoHi)) fail(`${t.id}: tempoLo ${t.tempoLo} is not below tempoHi ${t.tempoHi}`);
    if (t.tempoLo < 40 || t.tempoHi > 400) fail(`${t.id}: tempo range ${t.tempoLo}–${t.tempoHi} is implausible`);
  }
});

check('tiers exist, and the list is in teaching order', () => {
  const known = new Set(TIERS.map(t => t.n));
  let last = 0;
  for (const t of CORE_TUNES) {
    if (!known.has(t.tier)) fail(`${t.id}: tier ${t.tier} is not in TIERS`);
    if (t.tier < last) fail(`${t.id}: tier ${t.tier} comes after tier ${last} — the array order IS the curriculum`);
    last = t.tier;
  }
  for (const tier of TIERS) {
    if (!CORE_TUNES.some(t => t.tier === tier.n)) fail(`tier ${tier.n} (${tier.label}) has no tunes`);
  }
});

check('the four skills are well-formed', () => {
  if (SKILLS.length !== 4) fail(`expected 4 skills, got ${SKILLS.length}`);
  const ids = new Set();
  for (const s of SKILLS) {
    if (!/^[a-z]+$/.test(s.id)) fail(`skill id "${s.id}" is not a plain lowercase word`);
    if (ids.has(s.id)) fail(`duplicate skill id "${s.id}"`);
    ids.add(s.id);
    if (!s.label || !s.blurb) fail(`skill ${s.id} is missing a label or blurb`);
  }
});

console.log('\nlib/srs.js — grading');

check('tapping Got it again the same day counts once', () => {
  const today = todayStr();
  const once = gradeCard(undefined, true, today);
  let many = once;
  for (let i = 0; i < 5; i++) many = gradeCard(many, true, today);
  for (const k of ['ef', 'interval', 'reps', 'nextDue', 'seen']) if (many[k] !== once[k]) fail(`${k}: ${many[k]} after six taps, ${once[k]} after one`);
  // From a card already at reps 2 (six-day interval), as in the bug report.
  const mature = { ef: 2.5, interval: 6, reps: 2, nextDue: today, seen: 2 };
  const a = gradeCard(mature, true, today), b = gradeCard(gradeCard(gradeCard(mature, true, today), true, today), true, today);
  if (a.nextDue !== b.nextDue || a.interval !== b.interval) fail(`mature card: one tap → ${a.interval}d, three taps → ${b.interval}d`);
});

check('changing your mind the same day replaces the answer', () => {
  const today = todayStr();
  const mature = { ef: 2.5, interval: 6, reps: 2, nextDue: today, seen: 2 };
  const flip = gradeCard(gradeCard(mature, true, today), false, today);
  const shaky = gradeCard(mature, false, today);
  for (const k of ['ef', 'interval', 'reps', 'nextDue', 'seen']) if (flip[k] !== shaky[k]) fail(`Got it then Shaky: ${k} ${flip[k]}, Shaky alone: ${shaky[k]}`);
  if (flip.lastOk !== false) fail('lastOk should record the latest answer');
});

check('the next day builds on today, and the engine is unchanged', () => {
  const today = todayStr(), tomorrow = addDays(today, 1);
  const d1 = gradeCard(undefined, true, today), d2 = gradeCard(d1, true, tomorrow);
  if (d2.reps !== 2 || d2.seen !== 2) fail(`two days of Got it: reps ${d2.reps}, seen ${d2.seen}`);
  const plain = updateSRS(updateSRS(undefined, true), true);
  if (d2.interval !== plain.interval || d2.ef !== plain.ef) fail('gradeCard must apply SM-2 exactly as updateSRS does');
  if (d2.hist?.length !== 2 || d2.hist[0].d !== today || d2.hist[1].d !== tomorrow) fail('both days should be on record, oldest first');
});

check('undo takes back only today, and a first answer undoes to never-reviewed', () => {
  const today = todayStr(), yesterday = addDays(today, -1);
  if (ungradeCard(gradeCard(undefined, true, today), today) !== null) fail('undoing a first-ever answer should leave no card');
  const old = { ef: 2.4, interval: 6, reps: 2, nextDue: today, seen: 3, last: yesterday };
  const back = ungradeCard(gradeCard(old, false, today), today);
  for (const k of Object.keys(old)) if (back[k] !== old[k]) fail(`undo changed ${k}`);
  if (ungradeCard(old, today) !== old) fail('a card not graded today must be left alone');
  if (!gradedToday(gradeCard(old, true, today), today) || gradedToday(old, today)) fail('gradedToday');
});

console.log('\nlib/srs.js — answer history');

// The independent re-derivation: fold the SM-2 engine over a log, in date
// order, each answer dated its own day. The app's card must always equal this
// for whatever log it shows — that is the whole promise of the History list.
const fold = (log, base = null) => [...log].sort((a, b) => a.d.localeCompare(b.d))
  .reduce((st, e) => ({ ...st, ...updateSRS(st, e.ok, e.d) }), base);
const SCHED = ['ef', 'interval', 'reps', 'nextDue'];
const sameSched = (got, want, what) => { for (const k of SCHED) if (got?.[k] !== want?.[k]) fail(`${what}: ${k} ${got?.[k]}, expected ${want?.[k]}`); };
// Deterministic pseudo-random sequences, so a failure reproduces.
let seed = 7;
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
const T0 = '2026-03-01';
// A run of answers on random days, some days answered twice (a change of mind).
const run = () => {
  let card, day = T0, len = 2 + rnd(12);
  const log = new Map();
  for (let i = 0; i < len; i++) {
    if (rnd(3)) day = addDays(day, 1 + rnd(9));
    const ok = rnd(4) !== 0;
    card = gradeCard(card, ok, day); log.set(day, ok);
  }
  return { card, log: [...log].map(([d, ok]) => ({ d, ok })), day };
};

check('the schedule always equals the engine replayed over the listed answers', () => {
  for (let i = 0; i < 400; i++) {
    const { card, log } = run();
    sameSched(card, fold(log), `run ${i}`);
    if (card.hist.length !== log.length) fail(`run ${i}: ${card.hist.length} entries listed, ${log.length} days answered`);
    if (card.seen !== log.length) fail(`run ${i}: seen ${card.seen} for ${log.length} answers`);
  }
});

check('editing or deleting any answer re-derives the schedule from scratch', () => {
  for (let i = 0; i < 400; i++) {
    const { card, log, day } = run();
    const at = log[rnd(log.length)];
    // Flip the result.
    const flipped = editAnswer(card, at.d, { ok: !at.ok }, day);
    sameSched(flipped, fold(log.map(e => e.d === at.d ? { d: e.d, ok: !e.ok } : e)), `run ${i} flip`);
    // Move it to a free earlier day.
    let to = addDays(at.d, -(1 + rnd(5)));
    while (log.some(e => e.d === to)) to = addDays(to, -1);
    const moved = editAnswer(card, at.d, { ok: at.ok, d: to }, day);
    sameSched(moved, fold([...log.filter(e => e.d !== at.d), { d: to, ok: at.ok }]), `run ${i} move`);
    // Delete it.
    const gone = deleteAnswer(card, at.d);
    const rest = log.filter(e => e.d !== at.d);
    if (!rest.length) { if (gone !== null) fail(`run ${i}: deleting the only answer should leave no card`); continue; }
    sameSched(gone, fold(rest), `run ${i} delete`);
    if (gone.hist.some(e => e.d === at.d)) fail(`run ${i}: the deleted answer is still listed`);
  }
});

check('an edit never adds a second answer to a day, and never lands in the future', () => {
  const today = '2026-03-10';
  let c = gradeCard(undefined, true, '2026-03-05');
  c = gradeCard(c, true, '2026-03-07');
  const onto = editAnswer(c, '2026-03-07', { ok: false, d: '2026-03-05' }, today);
  if (onto.hist.length !== 1 || onto.hist[0].ok !== false) fail('moving onto an answered day should replace that day, leaving one entry');
  if (editAnswer(c, '2026-03-07', { ok: true, d: '2026-03-11' }, today) !== c) fail('a future day must be refused');
  if (editAnswer(c, '2026-03-06', { ok: false }, today) !== c) fail('editing a day with no answer must change nothing');
  if (deleteAnswer(c, '2026-03-06') !== c) fail('deleting a day with no answer must change nothing');
});

check('seen never goes down on an edit or delete — sync settles two devices by it', () => {
  for (let i = 0; i < 200; i++) {
    const { card, log, day } = run();
    const at = log[rnd(log.length)];
    const e = editAnswer(card, at.d, { ok: !at.ok }, day);
    if (!(e.seen > card.seen)) fail(`run ${i}: an edit should raise seen (${card.seen} → ${e.seen})`);
    const g = deleteAnswer(card, at.d);
    if (g && g.seen < card.seen) fail(`run ${i}: a delete lowered seen (${card.seen} → ${g.seen})`);
    // And it survives the next answer: history edits are not forgotten.
    const next = gradeCard(e, true, addDays(day, 1));
    if (next.seen !== e.seen + 1) fail(`run ${i}: answering after an edit should add one to seen`);
  }
});

check('cards saved before the history existed load unchanged and list what they can', () => {
  const today = todayStr(), y = addDays(today, -1), w = addDays(today, -8);
  // The shape saved by the version before this one: the answer it took, plus
  // the state from before it (`prev`).
  const oldGrade = (base, ok, d) => {
    const { prev: _o, ...clean } = base || {};
    return { ...updateSRS(base, ok, d), seen: (base?.seen ?? 0) + 1, last: d, lastOk: ok, prev: base ? clean : null };
  };
  const legacy = { ef: 2.5, interval: 6, reps: 2, nextDue: y };     // no log, no seen
  const prevShaped = oldGrade(oldGrade(legacy, true, w), false, y);
  const h = historyOf(prevShaped);
  if (h.hist.length !== 1 || h.hist[0].d !== y || h.hist[0].ok !== false) fail('the last answer of a prev-shaped card should be its one listed entry');
  if (!hasUnloggedPast(prevShaped) || hasUnloggedPast(gradeCard(undefined, true, today))) fail('hasUnloggedPast');
  if (historyOf(legacy).hist.length !== 0) fail('a legacy card has no listable answers');
  // Converting on the next change must not move anything: deleting nothing,
  // grading today, then undoing it gets back the schedule it had.
  const back = ungradeCard(gradeCard(prevShaped, true, today), today);
  sameSched(back, prevShaped, 'prev-shaped card after grade + undo');
  if (back.seen !== prevShaped.seen) fail(`seen ${back.seen}, was ${prevShaped.seen}`);
  // Editing its one recoverable answer replays from the state before it.
  const fixed = editAnswer(prevShaped, y, { ok: true }, today);
  sameSched(fixed, fold([{ d: y, ok: true }], historyOf(prevShaped).base), 'prev-shaped edit');
  // A first answer under the old version has no base at all.
  const first = oldGrade(undefined, true, y);
  const firstBack = ungradeCard(gradeCard(first, false, today), today);
  sameSched(firstBack, first, 'first prev-shaped answer');
  if (deleteAnswer(first, y) !== null) fail('deleting the only answer of a first prev-shaped card should leave no card');
});

check('earlier answers can be cleared, leaving only the listed ones', () => {
  // The case Zak hit: Changes tapped four times under the old version (each
  // tap counted), nothing listed, every listed answer on the tune deleted —
  // and Changes still read solid, 38 days out.
  let legacy; for (let i = 0; i < 4; i++) legacy = updateSRS(legacy, true, T0);
  if (!isSkillSolid(legacy)) fail('setup: the legacy card should read solid');
  const skills = [{ id: 'head' }, { id: 'changes' }];
  const rows = earlierAnswers({ [cardId('t', 'changes')]: legacy }, 't', skills);
  if (rows.length !== 1 || rows[0].skill !== 'changes' || rows[0].reps !== 4) fail(`earlier rows: ${JSON.stringify(rows)}`);
  if (clearEarlier(legacy) !== null) fail('clearing a card with nothing listed should leave no card — not started');
  // With answers listed on top, clearing leaves exactly those answers.
  for (let i = 0; i < 200; i++) {
    const log = run().log;
    const card = log.reduce((c, e) => gradeCard(c, e.ok, e.d), { ...legacy, seen: 3 });
    const cleared = clearEarlier(card);
    sameSched(cleared, fold(log), `run ${i} clear`);
    if (hasUnloggedPast(cleared)) fail(`run ${i}: still has an unlogged past`);
    if (!(cleared.seen > card.seen)) fail(`run ${i}: clearing lowered seen (${card.seen} → ${cleared.seen})`);
    if (clearEarlier(cleared) !== cleared) fail(`run ${i}: clearing twice must change nothing`);
  }
  // A prev-shaped card's base is its earlier past too.
  const prevShaped = { ...updateSRS(legacy, true, T0), seen: 1, last: T0, lastOk: true, prev: legacy };
  const c = clearEarlier(prevShaped);
  sameSched(c, fold([{ d: T0, ok: true }]), 'prev-shaped clear');
});

check('the history lists come out newest first and stay within a tune', () => {
  const skills = [{ id: 'head' }, { id: 'changes' }, { id: 'form' }, { id: 'solo' }];
  const srs = {
    [cardId('a', 'head')]: gradeCard(gradeCard(undefined, true, '2026-03-01'), false, '2026-03-04'),
    [cardId('a', 'solo')]: gradeCard(undefined, true, '2026-03-04'),
    [cardId('b', 'form')]: gradeCard(undefined, true, '2026-03-03'),
  };
  const a = tuneHistory(srs, 'a', skills).map(e => `${e.d} ${e.skill}`);
  if (a.join(',') !== '2026-03-04 head,2026-03-04 solo,2026-03-01 head') fail(`tune a: ${a.join(', ')}`);
  const r = recentAnswers(srs, ['a', 'b'], skills, 3).map(e => `${e.tuneId} ${e.d}`);
  if (r.join(',') !== 'a 2026-03-04,a 2026-03-04,b 2026-03-03') fail(`recent: ${r.join(', ')}`);
  if (recentAnswers(srs, ['b'], skills).length !== 1) fail('recentAnswers must only read the tunes it is given');
});

console.log('\nlib/srs.js — stages and the refresher ceiling');

check('a tune is learned from the first day all four skills were solid together', () => {
  const skills = [{ id: 'head' }, { id: 'changes' }, { id: 'form' }, { id: 'solo' }];
  const D = n => addDays(T0, n);
  const srs = {};
  const answer = (skill, ok, d) => { srs[cardId('t', skill)] = gradeCard(srs[cardId('t', skill)], ok, d); };
  // Two Got its on each skill, but solo's second one comes last, on day 9.
  for (const sk of ['head', 'changes', 'form']) { answer(sk, true, D(0)); answer(sk, true, D(5)); }
  answer('solo', true, D(0));
  if (learnedOn(srs, 't', skills).learned) fail('three solid skills are not a learned tune');
  if (tuneStage(srs, 't', skills, D(1)) !== 'learning') fail('should be learning');
  answer('solo', true, D(9));
  const l = learnedOn(srs, 't', skills);
  if (!l.learned || l.on !== D(9)) fail(`learned ${l.learned} on ${l.on}, expected ${D(9)}`);
  // A slip afterwards needs a refresher; it does not unlearn the tune.
  answer('changes', false, D(12));
  if (tuneStage(srs, 't', skills, D(12)) !== 'refresher') fail('a learned tune with a shaky skill should need a refresher');
  if (learnedOn(srs, 't', skills).on !== D(9)) fail('a slip must not move the day it was learned');
  // Solid again and nothing due: back in the repertoire.
  answer('changes', true, D(13)); answer('changes', true, D(14));
  const later = D(15);
  for (const sk of ['head', 'form', 'solo']) answer(sk, true, later);
  answer('changes', true, later);
  if (tuneStage(srs, 't', skills, later) !== 'repertoire') fail(`expected repertoire, got ${tuneStage(srs, 't', skills, later)}`);
  // Deleting the answer that completed it un-learns it — the stage follows the history.
  srs[cardId('t', 'solo')] = deleteAnswer(srs[cardId('t', 'solo')], D(9));
  const after = learnedOn(srs, 't', skills);
  if (after.on === D(9)) fail('deleting the answer that completed the tune should move its learned day');
  // A tune solid before the history was kept is learned, with no day on record.
  const legacy = { ef: 2.5, interval: 15, reps: 3, nextDue: D(30) };
  const old = Object.fromEntries(skills.map(s => [cardId('o', s.id), legacy]));
  const lo = learnedOn(old, 'o', skills);
  if (!lo.learned || lo.on !== null) fail('a tune learned before the history should be learned, day unknown');
  if (tuneStage({}, 'none', skills, D(0)) !== 'learning') fail('a tune with no answers is learning');
});

check('the growth list: learned tunes newest first, the undated last, and a monthly count', () => {
  const skills = [{ id: 'head' }, { id: 'changes' }, { id: 'form' }, { id: 'solo' }];
  const srs = {};
  const learn = (t, d1, d2) => { for (const s of skills) srs[cardId(t, s.id)] = gradeCard(gradeCard(undefined, true, d1), true, d2); };
  learn('a', '2026-09-01', '2026-09-08');          // learned 8 Sep
  learn('b', '2026-10-01', '2026-10-09');          // learned 9 Oct
  learn('c', '2026-10-02', '2026-10-20');          // learned 20 Oct
  srs[cardId('d', 'head')] = gradeCard(undefined, true, '2026-10-05');   // still learning
  const legacy = { ef: 2.5, interval: 15, reps: 3, nextDue: '2026-11-01' };
  for (const s of skills) srs[cardId('e', s.id)] = legacy;              // learned before the history
  const tl = learnedTimeline(srs, ['e', 'a', 'b', 'c', 'd'], skills);
  const got = tl.map(x => `${x.tuneId}:${x.on}`).join(' ');
  if (got !== 'c:2026-10-20 b:2026-10-09 a:2026-09-08 e:null') fail(`timeline: ${got}`);
  if (learnedThisMonth(tl, '2026-10-23') !== 2) fail(`this month: ${learnedThisMonth(tl, '2026-10-23')}, expected 2`);
  if (learnedThisMonth(tl, '2026-11-01') !== 0) fail('a new month starts at zero');
  // A later slip does not remove a tune from the list, or move its day.
  srs[cardId('a', 'form')] = gradeCard(srs[cardId('a', 'form')], false, '2026-10-21');
  if (learnedTimeline(srs, ['a'], skills)[0]?.on !== '2026-09-08') fail('a slip must not unlearn a tune or move its day');
});

check('the ceiling caps the gap after the last answer, and never touches the history', () => {
  for (let i = 0; i < 300; i++) {
    const { card } = run();
    for (const cap of [30, 60, 90, 180]) {
      const c = capDue(card, cap);
      const last = addDays(card.nextDue, -card.interval);
      if (c.nextDue > addDays(last, cap)) fail(`run ${i}: capped due ${c.nextDue} is more than ${cap} days after ${last}`);
      if (c.nextDue > card.nextDue) fail(`run ${i}: the cap must never push a review later`);
      if (card.interval <= cap && c !== card) fail(`run ${i}: an interval under the cap must be left alone`);
      for (const k of ['ef', 'interval', 'reps', 'seen', 'hist', 'base']) if (c[k] !== card[k]) fail(`run ${i}: the cap changed ${k}`);
    }
  }
  // Seven straight Got its: SM-2 alone waits 595 days; two months caps it at 60.
  let c; for (let i = 0; i < 7; i++) c = gradeCard(c, true, addDays(T0, i * 700));
  const last = addDays(T0, 6 * 700);
  if (c.nextDue !== addDays(last, c.interval)) fail('setup');
  if (capDue(c, DEFAULT_MAX_GAP).nextDue !== addDays(last, 60)) fail(`expected ${addDays(last, 60)}, got ${capDue(c, 60).nextDue}`);
  const srs = { a: c, b: null };
  if (withMaxGap(srs, 0) !== srs) fail('no limit must be the raw schedule, untouched');
  if (withMaxGap(srs, 60).b !== null) fail('an empty slot must pass through');
});

console.log('\nlib/migrate.js — the retired chart grid');

check('anything typed into the old grid moves into the notes, once', () => {
  const mem = new Map();
  globalThis.localStorage = { getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k) };
  const chart = { sections: [{ label: 'A', bars: ['Cm7', 'F7', 'B♭Δ', 'E♭Δ', 'Aø', 'D7', 'Gm', ''] }, { label: 'B', bars: ['', '', '', '', '', '', '', ''] }] };
  mem.set('js_charts', JSON.stringify({ 'autumn-leaves': chart, 'blue-monk': { sections: [{ label: 'A', bars: ['', ''] }] } }));
  const notes = migrateCharts({ 'autumn-leaves': 'Chet Baker recording', 'doxy': 'keep me' });
  const t = notes['autumn-leaves'];
  if (!t.startsWith('Chet Baker recording\n\n')) fail('the existing note must be kept, first');
  if (!t.includes('A: | Cm7 | F7 | B♭Δ | E♭Δ |') || !t.includes('| Aø | D7 | Gm | - |')) fail(`bars not written out:\n${t}`);
  if (notes['blue-monk'] !== undefined) fail('an empty grid must not create a note');
  if (notes.doxy !== 'keep me') fail('other notes must be untouched');
  if (mem.has('js_charts')) fail('the grid key should be removed once moved');
  if (JSON.parse(mem.get('js_notes'))['autumn-leaves'] !== t) fail('the notes must be saved');
  if (migrateCharts(notes) !== notes) fail('a second run must change nothing');
  // A note that already holds the text (another device moved it first) is not doubled.
  mem.set('js_charts', JSON.stringify({ 'autumn-leaves': chart }));
  if (migrateCharts(notes)['autumn-leaves'] !== t) fail('the text must not be added twice');
  if (!chartText({ sections: [{ label: 'A', bars: ['C'] }], from: 'blues-jazz' }).includes('generic form template')) fail('a template-started chart should say so');
  delete globalThis.localStorage;
});

console.log('\ndata/tunes.js — the guard');

// ── The one that actually matters ────────────────────────────────────────
// Real Book charts are under copyright. This file ships facts and nothing
// else; a future edit that "helpfully" pastes in the changes would turn the
// repo into a licensing problem. Fail loudly rather than let that ship.
check('no copyrighted material has crept into the data', () => {
  const BANNED = ['changes', 'chart', 'melody', 'head', 'notes', 'lyrics', 'chords', 'bars_detail'];
  for (const t of CORE_TUNES) {
    for (const k of Object.keys(t)) {
      if (BANNED.includes(k)) fail(`${t.id}: field "${k}" must not be shipped — the user enters that himself`);
    }
    // A stray chord symbol in a prose field is the other way this leaks in.
    // The facts and guitar notes are the likeliest route now that they exist:
    // describing a tune's harmony is fine, writing out its changes is not.
    const prose = ['why', 'feel', ...(t.facts || []), ...(t.guitar || [])];
    for (const text of prose) {
      if (/\|\s*[A-G][b#♭♯]?(m|maj|min|dim|aug|sus|Δ|ø|°)?\d?\s*\|/.test(text || '')) {
        fail(`${t.id}: prose looks like it contains a chart — "${String(text).slice(0, 60)}"`);
      }
      // Three or more absolute chord symbols in a row is a progression, not a
      // description of one.
      if (/([A-G][b#♭♯]?(m|maj|min|dim|aug|sus|Δ|ø|°)?\d?\s+){2,}[A-G][b#♭♯]?(m|maj|min|dim|aug|sus|Δ|ø|°)?\d/.test(text || '')) {
        fail(`${t.id}: prose spells out a chord sequence — "${String(text).slice(0, 60)}"`);
      }
    }
  }
});

// ── Dates, in every timezone ─────────────────────────────────────────────
// Due dates are UTC calendar days (todayStr), so addDays/dayDiff have to be
// plain calendar arithmetic wherever the phone is. They were not: local-time
// arithmetic made "tomorrow" today anywhere east of Greenwich, and lost a day
// whenever a gap crossed a clock change. One run of this script only sees this
// machine's timezone, so the app's own helpers are run in a child process
// under each zone below and compared with arithmetic done in UTC alone.
const DATE_ZONES = ['UTC', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney', 'Pacific/Auckland', 'Asia/Kolkata'];
function dateErrors(file) {
  const text = readFileSync(new URL(file, import.meta.url), 'utf8');
  const grab = id => (text.match(new RegExp(`^\\s*(?:export\\s+)?const\\s+${id}\\s*=.*$`, 'm')) || [''])[0].replace(/^\s*export\s+/, '');
  const src = [grab('addDays'), grab('dayDiff')].filter(Boolean).join('\n');
  if (!src.includes('addDays')) return [`addDays not found in ${file}`];
  const probe = `const f = new Function(process.argv[1] + '; return { addDays, dayDiff: typeof dayDiff === "undefined" ? null : dayDiff };')();
const ref = (s, n) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
let out = '';
for (let i = 0; i < 730 && !out; i++) { const s = ref('2026-01-01', i);
  for (const n of [-1, 1, 6, 15, 38, 95, 238]) { const w = ref(s, n);
    if (f.addDays(s, n) !== w) { out = 'addDays(' + s + ', ' + n + ') = ' + f.addDays(s, n) + ', expected ' + w; break; }
    if (f.dayDiff && f.dayDiff(s, w) !== n) { out = 'dayDiff(' + s + ', ' + w + ') = ' + f.dayDiff(s, w) + ', expected ' + n; break; } } }
process.stdout.write(out);`;
  return DATE_ZONES
    .map(tz => [tz, execFileSync(process.execPath, ['-e', probe, src], { env: { ...process.env, TZ: tz } }).toString()])
    .filter(([, e]) => e).map(([tz, e]) => `${tz}: ${e}`);
}

console.log('\ndates — every timezone');
check('due dates are calendar arithmetic in every timezone', () => {
  const e = dateErrors('../lib/srs.js');
  if (e.length) fail(e.join('\n      '));
});

console.log(failures === 0 ? `\nAll checks passed. ${CORE_TUNES.length} tunes.\n` : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
