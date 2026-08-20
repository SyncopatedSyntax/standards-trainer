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
import { defaultSections, countBars, emptyChart, parsePipedBars, fillBars } from '../lib/chart.js';
import { FORM_TEMPLATES, templatesFor } from '../data/forms.js';
import { parseKey, parseNumeral, renderBar } from '../lib/roman.js';

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

// ── The bar grid's layout ────────────────────────────────────────────────
// `defaultSections` derives an empty grid from a tune's form and bar count. A
// grid that loses or invents bars is silently wrong — you would only notice
// weeks later, having written a chart into the wrong shape — so re-derive it
// for every tune rather than trusting the arithmetic by eye.
console.log('\nlib/chart.js');

check('every tune lays out into exactly its own bar count', () => {
  for (const t of CORE_TUNES) {
    const total = countBars(emptyChart(t));
    if (total !== t.bars) fail(`${t.id}: form ${t.form} laid out ${total} bars, but the tune is ${t.bars}`);
  }
});

check('a letter form gets one section per letter, all equal length', () => {
  for (const t of CORE_TUNES) {
    if (!LETTER_FORMS.test(t.form) || t.bars % t.form.length !== 0) continue;
    const secs = defaultSections(t);
    if (secs.length !== t.form.length) fail(`${t.id}: ${t.form} gave ${secs.length} sections`);
    if (secs.map(x => x.label).join('') !== t.form) fail(`${t.id}: section labels ${secs.map(x => x.label).join('')} do not spell ${t.form}`);
    const per = t.bars / t.form.length;
    for (const x of secs) if (x.bars.length !== per) fail(`${t.id}: section ${x.label} has ${x.bars.length} bars, expected ${per}`);
  }
});

check('a blues is one undivided section', () => {
  for (const t of CORE_TUNES.filter(x => x.form === 'blues')) {
    const secs = defaultSections(t);
    if (secs.length !== 1) fail(`${t.id}: a blues should be one section, got ${secs.length}`);
  }
});

check('a short tail joins the last section rather than becoming a stub', () => {
  // All The Things You Are is 8+8+8+12. A naive chunker gives 8+8+8+8+4 and
  // misrepresents the form, so this pins the behaviour for every long tail.
  for (const t of CORE_TUNES.filter(x => x.form === 'through')) {
    for (const x of defaultSections(t)) {
      if (x.bars.length < 8) fail(`${t.id}: section ${x.label} is only ${x.bars.length} bars — a stub, not a section`);
    }
  }
});

check('every grid starts completely empty', () => {
  // The guard below stops chord data reaching data/tunes.js; this stops it
  // reaching the user through the grid builder instead.
  for (const t of CORE_TUNES) {
    for (const s of defaultSections(t)) {
      for (const b of s.bars) if (b !== '') fail(`${t.id}: section ${s.label} ships a pre-filled bar "${b}"`);
    }
  }
});

check('notes written with pipes read back as bars', () => {
  const bars = parsePipedBars('A section\n| Cm7 | F7 | B♭Δ | E♭Δ |\n| Aø |  | G7 | Cm7 |');
  const expect = ['Cm7', 'F7', 'B♭Δ', 'E♭Δ', 'Aø', '', 'G7', 'Cm7'];
  if (bars.length !== expect.length) fail(`got ${bars.length} bars, expected ${expect.length}: ${JSON.stringify(bars)}`);
  bars.forEach((b, i) => { if (b !== expect[i]) fail(`bar ${i + 1}: got "${b}", expected "${expect[i]}"`); });
  if (parsePipedBars('just some prose, no pipes').length !== 0) fail('a line without pipes is prose and must be skipped');
});

check('an import never changes the shape of the form', () => {
  const t = CORE_TUNES.find(x => x.id === 'blue-bossa');
  const before = emptyChart(t);
  const after = fillBars(before, Array.from({ length: 200 }, (_, i) => `X${i}`));
  if (countBars(after) !== countBars(before)) fail('extra bars grew the grid — they must be dropped');
});

// ── The form templates ───────────────────────────────────────────────────
// These are the one place harmonic content ships, so they carry the heaviest
// checks: that they are genuinely generic (degrees only, working in all twelve
// keys), and that they render the changes a musician would actually expect.
console.log('\ndata/forms.js');

check('templates are written only in roman numerals', () => {
  // This is the check that keeps a template a *form* rather than somebody's
  // chart. A sequence with an absolute chord name in it is a transcription.
  for (const t of FORM_TEMPLATES) {
    for (const bar of t.grid) {
      for (const tok of bar.split(/\s+/).filter(Boolean)) {
        if (/^[A-G][b♭#♯]?(m|maj|min|dim|aug|sus|Δ|ø|°|\d|$)/.test(tok)) {
          fail(`${t.id}: "${tok}" is an absolute chord name, not a degree`);
        }
        parseNumeral(tok);   // throws if it is not a numeral at all
      }
    }
  }
});

check('every template fills exactly the sections it claims', () => {
  for (const t of FORM_TEMPLATES) {
    const total = t.sections.reduce((a, b) => a + b, 0);
    if (t.grid.length !== total) fail(`${t.id}: ${t.grid.length} bars for sections ${t.sections.join('+')} (${total})`);
    if (!t.name || !t.blurb) fail(`${t.id}: missing a name or blurb`);
    if (!['major', 'minor'].includes(t.tonality)) fail(`${t.id}: tonality "${t.tonality}"`);
  }
});

check('a template renders in all twelve keys without throwing', () => {
  const keys = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  for (const t of FORM_TEMPLATES) {
    for (const name of keys) {
      const k = parseKey(t.tonality === 'minor' ? name.replace(/^([A-G][b♭#♯]?)$/, '$1m') : name);
      if (!k) fail(`${t.id}: could not parse key ${name}`);
      for (const bar of t.grid) {
        const out = renderBar(bar, k);
        if (!out || /undefined|NaN/.test(out)) fail(`${t.id} in ${name}: bar rendered "${out}"`);
      }
    }
  }
});

// Re-derive the two forms every player already knows by heart. If the
// transposition engine or a template drifts, this is what catches it — the
// same "check it against first principles" rule the theory trainers use.
check('the jazz blues in F is the jazz blues in F', () => {
  const k = parseKey('F');
  const got = FORM_TEMPLATES.find(t => t.id === 'blues-jazz').grid.map(b => renderBar(b, k));
  const want = ['F7', 'B♭7', 'F7', 'Cm7 F7', 'B♭7', 'B°7', 'F7', 'Am7 D7', 'Gm7', 'C7', 'F7 D7', 'Gm7 C7'];
  got.forEach((g, i) => { if (g !== want[i]) fail(`bar ${i + 1}: got "${g}", expected "${want[i]}"`); });
});

check('the minor blues in C minor is the minor blues in C minor', () => {
  const k = parseKey('Cm');
  const got = FORM_TEMPLATES.find(t => t.id === 'blues-minor').grid.map(b => renderBar(b, k));
  const want = ['Cm7', 'Cm7', 'Cm7', 'Cm7', 'Fm7', 'Fm7', 'Cm7', 'Cm7', 'A♭7', 'G7', 'Cm7', 'G7'];
  got.forEach((g, i) => { if (g !== want[i]) fail(`bar ${i + 1}: got "${g}", expected "${want[i]}"`); });
});

check('rhythm changes in B♭ is rhythm changes in B♭', () => {
  const k = parseKey('B♭');
  const got = FORM_TEMPLATES.find(t => t.id === 'rhythm-changes').grid.map(b => renderBar(b, k));
  const wantA = ['B♭ G7', 'Cm7 F7', 'B♭ G7', 'Cm7 F7', 'B♭7', 'E♭ E°7', 'B♭ G7', 'Cm7 F7'];
  const wantB = ['D7', 'D7', 'G7', 'G7', 'C7', 'C7', 'F7', 'F7'];
  const want = [...wantA, ...wantA, ...wantB, ...wantA];
  got.forEach((g, i) => { if (g !== want[i]) fail(`bar ${i + 1}: got "${g}", expected "${want[i]}"`); });
});

check('templates are offered on form and key, never per tune', () => {
  const offers = new Map();
  for (const t of CORE_TUNES) {
    const key = parseKey(t.key);
    const secs = defaultSections(t).map(s => s.bars.length);
    offers.set(t.id, templatesFor(t, key, secs).map(x => x.id));
  }
  // A modal tune has no tonic, so nothing can be transposed for it.
  if (offers.get('maiden-voyage').length !== 0) fail('maiden-voyage is modal and must be offered nothing');
  // A minor blues must not be offered the major templates, or the other way.
  if (offers.get('mr-pc').join() !== 'blues-minor') fail(`mr-pc got ${offers.get('mr-pc')}`);
  if (offers.get('c-jam-blues').includes('blues-minor')) fail('a major blues was offered the minor template');
  if (offers.get('c-jam-blues').length !== 3) fail(`c-jam-blues got ${offers.get('c-jam-blues')}`);
  // So What is an AABA 32 in a minor key: rhythm changes is major, so no.
  if (offers.get('so-what').length !== 0) fail(`so-what got ${offers.get('so-what')}`);
  if (!offers.get('oleo').includes('rhythm-changes')) fail('oleo is the rhythm-changes tune and was offered none');
  // Through-composed tunes have no letter form to match.
  if (offers.get('giant-steps').length !== 0) fail('giant-steps is through-composed');
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

console.log(failures === 0 ? `\nAll checks passed. ${CORE_TUNES.length} tunes.\n` : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
