// ── Roman numerals → chord names ─────────────────────────────────────────
// Turns a degree template ("I7", "ii7 V7", "♯IV°7") into real chords in a
// given key. Everything in data/forms.js is written this way, and that is not
// a stylistic choice: a sequence expressed only in degrees, which renders in
// all twelve keys, is a generic form rather than a transcription of anybody's
// tune. It is the same reason contrafacts are legal — the form is not the
// composition. scripts/verify.mjs enforces that nothing in forms.js parses as
// an absolute chord name.

const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const DEGREE_PC = { i: 0, ii: 2, iii: 4, iv: 5, v: 7, vi: 9, vii: 11 };

// Keys notated with sharps. Everything else gets flats — which covers every
// key in the shipped curriculum except B, and matches how jazz is written.
const SHARP_MAJOR = new Set([7, 2, 9, 4, 11, 6]);         // G D A E B F♯
const SHARP_MINOR = new Set([4, 11, 6, 1, 8, 3]);         // Em Bm F♯m C♯m G♯m D♯m

// "B♭", "Cm", "F" → { pc, minor }. Returns null for anything else, including
// the 'modal' tunes, which have no tonic to transpose to.
export function parseKey(key) {
  const m = /^([A-G])([b♭#♯]?)(m?)$/.exec(String(key || '').trim());
  if (!m) return null;
  let pc = LETTER_PC[m[1]];
  if (m[2] === 'b' || m[2] === '♭') pc -= 1;
  if (m[2] === '#' || m[2] === '♯') pc += 1;
  return { pc: (pc + 12) % 12, minor: m[3] === 'm' };
}

export const usesSharps = key => (key.minor ? SHARP_MINOR : SHARP_MAJOR).has(key.pc);

// One numeral: optional accidentals, the numeral itself, then the quality.
// Roman numerals up to vii use only the letters I and V, so no chord suffix
// can be mistaken for part of the numeral.
const TOKEN = /^([b♭#♯]*)([IViv]+)(.*)$/;

// A suffix that already states the quality wins. Otherwise a lowercase
// numeral means minor — the ordinary convention, so `ii7` is a minor seventh
// and `V7` is dominant, without having to spell either out.
const EXPLICIT = /^(m|°|ø|Δ|\+|dim|aug|maj|sus|6|add)/;

export function parseNumeral(token) {
  const m = TOKEN.exec(token);
  if (!m) throw new Error(`"${token}" is not a roman numeral`);
  const [, accidentals, numeral, rest] = m;
  const base = DEGREE_PC[numeral.toLowerCase()];
  if (base == null) throw new Error(`"${numeral}" is not a degree I–VII`);

  let offset = base;
  for (const a of accidentals) offset += (a === 'b' || a === '♭') ? -1 : 1;

  const isMinor = numeral === numeral.toLowerCase();
  const quality = EXPLICIT.test(rest) || !isMinor ? rest : `m${rest}`;
  return { offset: ((offset % 12) + 12) % 12, quality };
}

export function renderNumeral(token, key) {
  const { offset, quality } = parseNumeral(token);
  const names = usesSharps(key) ? SHARP : FLAT;
  return names[(key.pc + offset) % 12] + quality;
}

// One bar, which may hold more than one chord: "ii7 V7" → "Gm7 C7" in F.
export const renderBar = (bar, key) =>
  String(bar).trim().split(/\s+/).filter(Boolean).map(t => renderNumeral(t, key)).join(' ');
