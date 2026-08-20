// ── The bar grid ─────────────────────────────────────────────────────────
// Slice 2. Until now the changes went into a free-text note, which works but
// is a wall of text: you cannot see the shape of the form in it, and you
// cannot point at bar 19.
//
// A chart is `{ sections: [{ label, bars: ['Cm7', 'F7', …] }] }`. A bar is a
// plain string, so "Bmaj7 D7" is simply two chords in one bar — no nested
// structure to design around the handful of tunes that need it.
//
// NOTHING IN HERE SHIPS ANY MUSIC. These functions build an *empty* grid of
// the right shape from facts the tune already carries (its form and bar
// count); every chord in it is typed by the user and lives only in his
// browser. See scripts/verify.mjs, which fails the build if chord data ever
// appears in data/tunes.js.

import { LETTER_FORMS } from '../data/tunes.js';
import { renderBar } from './roman.js';

export const BARS_PER_LINE = 4;

const emptyBars = n => Array.from({ length: n }, () => '');

// Through-composed tunes have no repeating letters to divide by, so they get
// eight-bar sections — the default phrase length in this repertoire. A short
// remainder joins the last section rather than becoming a stub of its own:
// All The Things You Are runs 8+8+8+12, not 8+8+8+8+4, and a four-bar orphan
// section would misrepresent every long-tailed tune the same way.
function chunked(bars) {
  const full = Math.max(1, Math.floor(bars / 8));
  const out = Array.from({ length: full }, () => 8);
  const rest = bars - full * 8;
  if (rest > 0) out[out.length - 1] += rest;
  return out.map((n, i) => ({ label: String.fromCharCode(65 + i), bars: emptyBars(n) }));
}

// The blank grid implied by a tune's form. A letter form divides its bars
// evenly between its letters (AABA 32 → four eights); anything else — a
// blues, a through-composed tune, or a custom tune whose numbers do not
// divide — falls back to eight-bar sections.
export function defaultSections(tune) {
  const bars = Number(tune?.bars) || 0;
  if (bars <= 0) return [{ label: 'A', bars: emptyBars(8) }];
  if (tune.form === 'blues') return [{ label: 'Blues', bars: emptyBars(bars) }];
  if (LETTER_FORMS.test(tune.form || '') && bars % tune.form.length === 0) {
    const per = bars / tune.form.length;
    return tune.form.split('').map(letter => ({ label: letter, bars: emptyBars(per) }));
  }
  return chunked(bars);
}

export const emptyChart = tune => ({ sections: defaultSections(tune) });

// Read-only: a tune with no stored chart gets the blank layout rather than
// having one written for it. Same lazy rule the SRS cards follow — browsing
// the curriculum must not fill storage with a hundred empty grids.
export function chartFor(charts, tune) {
  const stored = charts?.[tune.id];
  return stored?.sections?.length ? stored : emptyChart(tune);
}

export const countBars = chart => (chart?.sections || []).reduce((n, s) => n + s.bars.length, 0);
export const countFilled = chart => (chart?.sections || []).reduce((n, s) => n + s.bars.filter(b => b.trim()).length, 0);
export const isChartEmpty = chart => countFilled(chart) === 0;

// Every bar in playing order, each carrying where it sits — used to step
// through the whole form with the ◀ ▶ arrows without caring about sections.
export function flatten(chart) {
  const out = [];
  let n = 1;
  (chart?.sections || []).forEach((s, si) => {
    s.bars.forEach((value, bi) => { out.push({ si, bi, value, label: s.label, bar: n++ }); });
  });
  return out;
}

export function setBar(chart, si, bi, value) {
  return {
    ...chart,
    sections: chart.sections.map((s, i) =>
      i !== si ? s : { ...s, bars: s.bars.map((b, j) => (j === bi ? value : b)) }),
  };
}

// AABA means playing A three times, but the last bars of each A differ —
// that is what a first and second ending IS. So sections stay independent and
// copying is an explicit action, rather than linking them and making the
// endings impossible to write.
export function copySection(chart, fromIdx, toIdx) {
  const src = chart.sections[fromIdx], dst = chart.sections[toIdx];
  if (!src || !dst) return chart;
  const bars = dst.bars.map((b, i) => src.bars[i] ?? b);
  return { ...chart, sections: chart.sections.map((s, i) => (i === toIdx ? { ...s, bars } : s)) };
}

// The nearest earlier section sharing this one's letter, or -1. Only that one
// is offered as a copy source: with three A sections, copying the one just
// before keeps any edits you already made flowing forward.
export function priorSameLabel(chart, idx) {
  const label = chart.sections[idx]?.label;
  for (let i = idx - 1; i >= 0; i--) if (chart.sections[i].label === label) return i;
  return -1;
}

// ── Importing from the slice-1 notes field ───────────────────────────────
// The notes field was where the changes went before this existed, and the
// placeholder there asked for pipes. Read those back rather than making
// anyone retype a form they have already written out.
//
// A line without pipes is prose, not bars, and is skipped. Inside a line the
// text either side of the outer pipes is discarded, so "A: | Cm7 | F7 |"
// gives two bars, but an empty cell between pipes is kept — a bar you left
// blank on purpose is still a bar.
export function parsePipedBars(text) {
  const out = [];
  for (const line of String(text || '').split('\n')) {
    if (!line.includes('|')) continue;
    const cells = line.split('|');
    cells.shift();            // before the first pipe
    if (cells.length && !cells[cells.length - 1].trim()) cells.pop();  // after the last
    for (const c of cells) out.push(c.trim());
  }
  return out;
}

// Pour a flat list of bars into the grid in playing order. Extra bars are
// dropped rather than growing the form: the form comes from the tune's facts,
// and a paste that disagrees with it is more likely a typo than a discovery.
export function fillBars(chart, values) {
  let k = 0;
  return {
    ...chart,
    sections: chart.sections.map(s => ({ ...s, bars: s.bars.map(b => (k < values.length ? values[k++] : b)) })),
  };
}

// ── Form templates ───────────────────────────────────────────────────────
// Pour a generic form (data/forms.js) into the grid, transposed to the tune's
// key. `from` records which template it came from, so the UI can keep saying
// "this is the generic form, not this tune's changes" until you confirm you
// have checked it — an unlabelled template would be indistinguishable from a
// chart you had actually verified, which is the whole risk.
export function applyTemplate(chart, template, key) {
  const bars = template.grid.map(b => renderBar(b, key));
  return { ...fillBars(chart, bars), from: template.id };
}

export const clearProvenance = chart => { const { from, ...rest } = chart; return rest; };

export const sectionLengths = chart => (chart?.sections || []).map(s => s.bars.length);
