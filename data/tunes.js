// ── The core curriculum ───────────────────────────────────────────────────
// Twenty-five tunes that actually get called at jams, ordered so each tier
// only asks for one new thing.
//
// WHAT IS IN HERE, AND WHY IT STOPS THERE
//
// Only *facts*: title, composer, the key it is usually called in, the form,
// the bar count, the feel, a sensible tempo range. None of that is anybody's
// creative work, so none of it is copyrightable.
//
// The melodies and the changes are NOT here and must never be added. A Real
// Book chart is under copyright; shipping one would make this repo a piracy
// problem rather than a practice tool. The user types the changes into his own
// browser, where they stay (`js_notes` in slice 1, `js_charts` later) — and
// typing them in is a genuine part of learning a tune, not a workaround.
//
// `tier` is the teaching order, not fame: what does this tune ask of you that
// the previous tier did not. `why` is the one-line answer to "why this tune".

export const TIERS = [
  { n: 1, label: 'Blues & modal', blurb: 'The form is nearly free, so all your attention goes to time and feel.' },
  { n: 2, label: 'Short forms', blurb: 'One ii–V at a time, over sixteen bars rather than thirty-two.' },
  { n: 3, label: 'Standard 32-bar forms', blurb: 'The bulk of any jam. Longer forms, more places to get lost.' },
  { n: 4, label: 'Bebop & rhythm changes', blurb: 'Harder heads, and the second form you have to own outright.' },
  { n: 5, label: 'The walls', blurb: 'Tunes that are hard on purpose. Not for your first jam.' },
];

export const SKILLS = [
  { id: 'head', label: 'Head', blurb: 'Play the melody from memory, in time, without the page.' },
  { id: 'changes', label: 'Changes', blurb: 'Comp the whole form from memory — no chart, no hesitation at the turnaround.' },
  { id: 'form', label: 'Form', blurb: 'Know where you are at all times: sections, bar count, where bar 1 comes back.' },
  { id: 'solo', label: 'Solo', blurb: 'Improvise over it — guide tones and arpeggios that land on the changes.' },
];

export const CORE_TUNES = [
  // ── Tier 1 · Blues & modal ─────────────────────────────────────────────
  { id: 'c-jam-blues', title: 'C Jam Blues', composer: 'Duke Ellington', key: 'C', form: 'blues', bars: 12,
    feel: 'Medium swing', tempoLo: 140, tempoHi: 200, tier: 1,
    why: 'A two-note head. Nothing to memorise, so the blues form itself is the lesson.' },
  { id: 'blue-monk', title: 'Blue Monk', composer: 'Thelonious Monk', key: 'Bb', form: 'blues', bars: 12,
    feel: 'Medium swing', tempoLo: 110, tempoHi: 160, tier: 1,
    why: 'A simple riff head over a plain blues — your first tune with an actual melody.' },
  { id: 'mr-pc', title: 'Mr. P.C.', composer: 'John Coltrane', key: 'Cm', form: 'blues', bars: 12,
    feel: 'Fast swing', tempoLo: 180, tempoHi: 280, tier: 1,
    why: 'The minor blues template. Same shape you already know, one chord quality different.' },
  { id: 'so-what', title: 'So What', composer: 'Miles Davis', key: 'Dm', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 120, tempoHi: 160, tier: 1,
    why: 'Two chords in the whole tune, a half step apart. AABA form with nothing else to think about.' },
  { id: 'cantaloupe-island', title: 'Cantaloupe Island', composer: 'Herbie Hancock', key: 'Fm', form: 'ABCA', bars: 16,
    feel: 'Funk / straight eighths', tempoLo: 100, tempoHi: 130, tier: 1,
    why: 'Three chords and a groove. Teaches you to hold a vamp without rushing.' },

  // ── Tier 2 · Short forms ───────────────────────────────────────────────
  { id: 'blue-bossa', title: 'Blue Bossa', composer: 'Kenny Dorham', key: 'Cm', form: 'AB', bars: 16,
    feel: 'Bossa nova', tempoLo: 130, tempoHi: 170, tier: 2,
    why: 'The classic first jazz tune: one ii–V in C minor, one in D-flat, and out.' },
  { id: 'summertime', title: 'Summertime', composer: 'George Gershwin', key: 'Am', form: 'AB', bars: 16,
    feel: 'Slow swing or latin', tempoLo: 80, tempoHi: 130, tier: 2,
    why: 'Minor, slow-moving, and everybody knows it — a safe tune to call when you are nervous.' },
  { id: 'song-for-my-father', title: 'Song for My Father', composer: 'Horace Silver', key: 'Fm', form: 'AAB', bars: 24,
    feel: 'Bossa / latin', tempoLo: 120, tempoHi: 150, tier: 2,
    why: 'A repetitive, forgiving set of changes over an unmistakable bass figure.' },
  { id: 'footprints', title: 'Footprints', composer: 'Wayne Shorter', key: 'Cm', form: 'blues', bars: 12,
    feel: '6/8, or swung in 3', tempoLo: 120, tempoHi: 180, tier: 2,
    why: 'A minor blues in three. Same harmony you know, counted a way that will catch you out.' },
  { id: 'maiden-voyage', title: 'Maiden Voyage', composer: 'Herbie Hancock', key: 'modal', form: 'AABA', bars: 32,
    feel: 'Straight eighths, floating', tempoLo: 110, tempoHi: 140, tier: 2,
    why: 'Four sus chords, four bars each. Teaches patience — the hard part is not filling the space.' },
  { id: 'recorda-me', title: 'Recorda Me', composer: 'Joe Henderson', key: 'Am', form: 'AB', bars: 16,
    feel: 'Latin into swing', tempoLo: 140, tempoHi: 190, tier: 2,
    why: 'ii–Vs that move through three keys in sixteen bars. Your first real modulation workout.' },

  // ── Tier 3 · Standard 32-bar forms ─────────────────────────────────────
  { id: 'autumn-leaves', title: 'Autumn Leaves', composer: 'Joseph Kosma', key: 'Gm', form: 'AABC', bars: 32,
    feel: 'Medium swing', tempoLo: 120, tempoHi: 180, tier: 3,
    why: 'The ii–V–I drill made into a tune, alternating between a major key and its relative minor.' },
  { id: 'solar', title: 'Solar', composer: 'Miles Davis', key: 'Cm', form: 'through', bars: 12,
    feel: 'Medium-up swing', tempoLo: 160, tempoHi: 220, tier: 3,
    why: 'Twelve bars of descending ii–Vs. More harmony per bar than anything else this short.' },
  { id: 'doxy', title: 'Doxy', composer: 'Sonny Rollins', key: 'Bb', form: 'AB', bars: 16,
    feel: 'Medium swing, heavy', tempoLo: 110, tempoHi: 150, tier: 3,
    why: 'A riff head over bluesy changes — the bridge between blues form and standard form.' },
  { id: 'all-of-me', title: 'All of Me', composer: 'Gerald Marks & Seymour Simons', key: 'C', form: 'ABAC', bars: 32,
    feel: 'Medium swing', tempoLo: 130, tempoHi: 180, tier: 3,
    why: 'Secondary dominants in plain sight. Called constantly, and singers love it.' },
  { id: 'satin-doll', title: 'Satin Doll', composer: 'Duke Ellington & Billy Strayhorn', key: 'C', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 110, tempoHi: 150, tier: 3,
    why: 'ii–Vs stacked end to end. If you can comp this cleanly you can comp most standards.' },
  { id: 'take-the-a-train', title: 'Take the A Train', composer: 'Billy Strayhorn', key: 'C', form: 'AABA', bars: 32,
    feel: 'Medium-up swing', tempoLo: 150, tempoHi: 200, tier: 3,
    why: 'The #11 on the II7 in bar 3 — your ear’s first proper taste of an altered colour.' },
  { id: 'fly-me-to-the-moon', title: 'Fly Me to the Moon', composer: 'Bart Howard', key: 'C', form: 'ABAC', bars: 32,
    feel: 'Medium swing or bossa', tempoLo: 120, tempoHi: 170, tier: 3,
    why: 'A circle-of-fifths sequence you can hear coming. Great for practising anticipation.' },
  { id: 'there-will-never-be-another-you', title: 'There Will Never Be Another You', composer: 'Harry Warren', key: 'Eb', form: 'ABAC', bars: 32,
    feel: 'Medium-up swing', tempoLo: 160, tempoHi: 210, tier: 3,
    why: 'Long-form ii–Vs in a flat key — where horn players live, so expect to be called on it.' },

  // ── Tier 4 · Bebop & rhythm changes ────────────────────────────────────
  { id: 'nows-the-time', title: "Now's the Time", composer: 'Charlie Parker', key: 'F', form: 'blues', bars: 12,
    feel: 'Medium swing', tempoLo: 140, tempoHi: 190, tier: 4,
    why: 'Bebop phrasing on a form you already own. All the difficulty is in the articulation.' },
  { id: 'billies-bounce', title: "Billie's Bounce", composer: 'Charlie Parker', key: 'F', form: 'blues', bars: 12,
    feel: 'Medium swing', tempoLo: 150, tempoHi: 200, tier: 4,
    why: 'The same form again with a genuinely hard head. This is the one that takes weeks.' },
  { id: 'oleo', title: 'Oleo', composer: 'Sonny Rollins', key: 'Bb', form: 'AABA', bars: 32,
    feel: 'Fast swing', tempoLo: 200, tempoHi: 280, tier: 4,
    why: 'Rhythm changes — the second form, after the blues, that jams assume you know cold.' },

  // ── Tier 5 · The walls ─────────────────────────────────────────────────
  { id: 'all-the-things-you-are', title: 'All The Things You Are', composer: 'Jerome Kern', key: 'Ab', form: 'through', bars: 36,
    feel: 'Medium swing', tempoLo: 140, tempoHi: 190, tier: 5,
    why: 'Modulates through four key centres, and the last section runs long (8+8+8+12). The harmony test.' },
  { id: 'stella-by-starlight', title: 'Stella by Starlight', composer: 'Victor Young', key: 'Bb', form: 'through', bars: 32,
    feel: 'Medium swing or ballad', tempoLo: 120, tempoHi: 180, tier: 5,
    why: 'Changes that refuse to sit in one key, starting on a chord that is not the tonic.' },
  { id: 'giant-steps', title: 'Giant Steps', composer: 'John Coltrane', key: 'B', form: 'through', bars: 16,
    feel: 'Very fast swing', tempoLo: 220, tempoHi: 290, tier: 5,
    why: 'Three key centres a major third apart, two chords per bar. The wall, and everyone knows it.' },
];

// Forms whose letters describe equal-length sections, so bar count must divide.
export const LETTER_FORMS = /^[A-C]+$/;
