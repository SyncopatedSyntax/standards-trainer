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

import { CORE_TUNES, TIERS, SKILLS, LETTER_FORMS } from '../data/tunes.js';

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
    for (const k of ['why', 'feel']) {
      if (/\|\s*[A-G][b#]?(m|maj|min|dim|aug|sus)?\d?\s*\|/.test(t[k] || '')) {
        fail(`${t.id}: "${k}" looks like it contains a chart`);
      }
    }
  }
});

console.log(failures === 0 ? `\nAll checks passed. ${CORE_TUNES.length} tunes.\n` : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
