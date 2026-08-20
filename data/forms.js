// ── Generic form templates ───────────────────────────────────────────────
//
// WHY THESE CAN SHIP WHEN THE TUNES CANNOT
//
// data/tunes.js holds no changes, because every tune in the curriculum is
// still under copyright — the jazz repertoire is a 1930s–60s body of work,
// which is exactly the window copyright covers. The oldest tune in the list,
// All of Me, was published in 1931 and does not reach the US public domain
// until 2027 (and, being life+70 there, not the UK until much later).
//
// What IS here is different in kind. The twelve-bar blues and rhythm changes
// are shared idioms, not compositions: they predate and outlive any particular
// tune, every method book prints them, and the entire practice of writing
// contrafacts — Oleo over I Got Rhythm, Donna Lee over Indiana — rests on the
// fact that a form is not a work. Rhythm changes takes its name from I Got
// Rhythm (1930), which entered the US public domain in January 2026.
//
// Two rules keep it that way, and both are enforced by scripts/verify.mjs:
//
//   1. Templates are written ONLY in roman numerals. A sequence that renders
//      in all twelve keys is a form; a sequence in one key is a transcription.
//      Nothing here may contain an absolute chord name.
//   2. A template is never attached to a tune. Tunes are offered whichever
//      templates fit their *stated form* — facts already in tunes.js — and the
//      user picks. The app never claims "these are this tune's changes".
//
// That second rule is also the pedagogy. C Jam Blues, Blue Monk and Billie's
// Bounce are all "a 12-bar blues" and all differ; the differences are why they
// are separate entries in the curriculum. A template is a starting point you
// then correct against the actual tune, and the UI says so.

// A rhythm-changes A section. Bar 5 turns the tonic into a dominant to reach
// the IV, and bar 6 walks back through the ♯IV diminished.
const RHYTHM_A = ['I VI7', 'ii7 V7', 'I VI7', 'ii7 V7', 'I7', 'IV #IV°7', 'I VI7', 'ii7 V7'];
// The bridge is four dominants, two bars each, round the circle to V.
const RHYTHM_B = ['III7', 'III7', 'VI7', 'VI7', 'II7', 'II7', 'V7', 'V7'];

export const FORM_TEMPLATES = [
  {
    id: 'blues-basic',
    name: 'Basic 12-bar blues',
    blurb: 'Three chords and no movement in bar 2 — the shape every other blues is a variation on.',
    tonality: 'major', forms: ['blues'], sections: [12],
    grid: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
  },
  {
    id: 'blues-quick-change',
    name: 'Quick-change blues',
    blurb: 'The same, but bar 2 steps up to the IV and back. Commoner at a jam than the plain version.',
    tonality: 'major', forms: ['blues'], sections: [12],
    grid: ['I7', 'IV7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
  },
  {
    id: 'blues-jazz',
    name: 'Jazz blues',
    blurb: 'The bebop twelve: a ♯IV°7 in bar 6, a ii–V in bars 9–10, and a turnaround at the end.',
    tonality: 'major', forms: ['blues'], sections: [12],
    grid: ['I7', 'IV7', 'I7', 'v7 I7', 'IV7', '#IV°7', 'I7', 'iii7 VI7', 'ii7', 'V7', 'I7 VI7', 'ii7 V7'],
  },
  {
    id: 'blues-minor',
    name: 'Minor blues',
    blurb: 'i and iv throughout, then ♭VI–V into the turnaround. The same twelve bars, one quality different.',
    tonality: 'minor', forms: ['blues'], sections: [12],
    grid: ['i7', 'i7', 'i7', 'i7', 'iv7', 'iv7', 'i7', 'i7', 'bVI7', 'V7', 'i7', 'V7'],
  },
  {
    id: 'rhythm-changes',
    name: 'Rhythm changes',
    blurb: 'The AABA form built on I Got Rhythm (1930, US public domain since January 2026). After the blues, the form a jam assumes you know cold.',
    tonality: 'major', forms: ['AABA'], sections: [8, 8, 8, 8],
    grid: [...RHYTHM_A, ...RHYTHM_A, ...RHYTHM_B, ...RHYTHM_A],
  },
];

// Which templates fit a tune: its stated form, its bar count, its section
// lengths, and whether its key is major or minor. All four come from facts
// already in tunes.js — nothing here asserts anything new about the tune.
export function templatesFor(tune, key, sectionLengths) {
  if (!key) return [];   // a modal tune has no tonic to transpose to
  return FORM_TEMPLATES.filter(t =>
    t.forms.includes(tune.form) &&
    t.tonality === (key.minor ? 'minor' : 'major') &&
    t.sections.length === sectionLengths.length &&
    t.sections.every((n, i) => n === sectionLengths[i]));
}
