# Standards Trainer — project context

A React PWA that tracks **jazz repertoire**: which tunes you know, how well,
and what to review before it fades. The 8th tool in the **Fretworks** toolbox
(sibling to Chord Trainer, Focused Chord Trainer, Triad Trainer,
DiatonicChordsTrainer, MelodicMinorTrainer, AlteredTrainer, Circle of Fifths).
Single dev + end user: Zak. The goal it serves is concrete — turn up to a jam
and be able to call a tune.

- Toolbox-wide conventions (git-dep workflow, multi-zone, single PWA,
  verify-in-prod, naming): the Fretworks root `CLAUDE.md`.
- The app shell, SRS engine and UI primitives are lifted from
  **Focused-Chord-Trainer**. When changing shared behaviour, check that repo
  first — it is the reference implementation.

## The constraint that shapes everything

Real Book charts are under copyright. `data/tunes.js` ships each tune's
**facts** — title, composer, usual key, form, bar count, feel, tempo range —
because facts are not copyrightable. The melodies and the changes are **not**
shipped and must never be added; the user types them into his own browser,
where they stay.

`scripts/verify.mjs` enforces this: a `changes`/`chart`/`melody`/`chords` field
on a tune, or something that looks like a chart in a prose field, fails the
build check. That is not paranoia — it is the one mistake that would turn this
repo into a licensing problem, and it is exactly the kind of "helpful" edit a
future session might make.

Writing the changes out by hand is also, genuinely, how you learn a form.

## Data model

Prefix **`js_`** (`lib/store.js`). Load-bearing twice: `ProgressBackup` exports
by prefix, and the shell's `/backup` screen sweeps every key on the origin — so
this app is covered by both with no extra wiring.

- `data/tunes.js` → `CORE_TUNES` (25, facts only), `TIERS`, `SKILLS`.
  Reference data, never written to. **Array order is the curriculum** — the
  verify script asserts tiers never go backwards.
- `js_active` — tune ids taken on. A core tune is **inert until activated**, so
  browsing the path costs nothing and the queue can't open with 100 cards.
- `js_srs` — SM-2 state keyed `` `${tuneId}.${skill}` ``.
- `js_charts` — the bar grid per tune:
  `{ [tuneId]: { sections: [{ label, bars: ['Cm7', …] }] } }`. A bar is a plain
  **string**, so "B♭Δ D7" is simply two chords in one bar — no nested structure
  invented for the handful of tunes that need it.
- `js_notes` — free text per tune. It was where the changes went before the
  grid existed and it stays, now as general notes (which recording, a
  fingering, the intro). The grid landed *alongside* it, not instead of it, so
  there was no migration — and `ChartEditor` offers to read pipe-delimited bars
  back out of a note rather than making anyone retype a form.
- `js_custom` — tunes the user added, same shape plus `custom: true`.

**Charts are built lazily too.** `chartFor()` returns the blank layout for a
tune with nothing stored rather than writing one — browsing 25 tunes must not
fill storage with 25 empty grids. `defaultSections()` derives that layout from
facts the tune already carries, and ships every bar empty; `verify.mjs` asserts
both (the right bar count, and no pre-filled bar) for all 25.

**Cards are created lazily, not on activation.** `dueCards()` treats a missing
`js_srs` entry as fresh-and-due, so activating a tune writes nothing to the
schedule. That means no storage churn, and the `SKILLS` list can gain a fifth
skill later without a migration — every existing tune simply grows a new fresh
card. Do not "fix" this by eagerly writing four entries.

## Spaced repetition

`lib/srs.js` — SM-2, copied verbatim from `Focused-Chord-Trainer/lib/srs.js`
(which took it from Chord Trainer). Deliberately unchanged so a fix in one can
be carried to the others.

What differs is only what a **card** is: elsewhere a chord or a shape, here one
skill on one tune. That is the whole point — the changes to a tune you play
weekly stay solid while its head quietly comes due.

`tuneIsReady()` = all four skills at `reps >= 2`, the same "learned" bar
Diatonic uses. That drives the Progress tab's headline number: how many tunes
you could actually call tonight.

## Tabs

- **Today** 🌅 — the due queue, one card at a time. The set is **snapshotted at
  mount** (as Focused's TodayTab does): grading rewrites the schedule, and
  without the snapshot the list reorders underneath you mid-session.
- **Tunes** 🎵 — the repertoire. **Opens on Mine once anything is active**; the
  core path is the right first screen exactly once. Mine is one flat list
  ordered by `byAttention` (due count, then soonest review) — a handful of
  tunes spread across five tier headings is chrome, not information. Core and
  All stay grouped by tier, because there the curriculum's shape *is* the
  point. Tune detail is pushed from here, not a tab. **Every hook must run
  before the early return that swaps in `TuneDetail`** — a `useMemo` below it
  renders fewer hooks on the renders where a tune is open, which is how this
  shipped broken the first time.
- **Progress** 📊 — tunes you could call tonight, then **Working on**: every
  active tune with its four skill dots and what it wants, in the same
  `byAttention` order the Tunes tab uses. One repertoire must not appear in two
  orders depending on which tab you reached it from. Rows tap through to the
  tune — App holds an `openTune` request that `TunesTab` consumes and clears.
  Then the skill breakdown and the 7-day forecast.
- **Guide** 📖 — the four skills, how reviews work, why you type the changes in,
  and a **jam mechanics** reference (calling, counting off, head–solos–head,
  comping behind a soloist, trading fours, endings, holding the form). Text
  only, deliberately not tracked: most of it is learn-once rather than per-tune,
  so scheduling it per tune would be noise.
- **Settings** ⚙️ — `ProgressBackup`, build stamp.

## The keyboard and the scroll container

Same fix as Focused Chord Trainer, and needed for the same reason — see that
repo's CLAUDE.md for the full explanation. In short: the app is a fixed `100dvh`
column with its own scroller, `dvh` does not shrink for the keyboard, and the
container is already at max `scrollTop` — so `apply()` pads the scroller by the
keyboard's overlap *first*, then scrolls the field into that room. The window
scroll lock stands down while a field is focused.

Two fields need it: the notes textarea, and every bar in the chart grid.

**The chart's keypad is an accessory bar, and that interacts with the fix.**
`ChartEditor` pins the Δ ø ° ♭ ♯ keypad above the keyboard with `position:
fixed; bottom: <keyboard inset>`. But `apply()` scrolls the focused input to
just above where the keyboard starts — which is exactly where the keypad sits,
so the bar being typed into ended up underneath it. The bar publishes its
measured height as `--kbd-accessory` on the root element, and `apply()` adds
that to both the padding and the bottom margin. One number, one place; do not
hardcode an estimate at either end.

## Fretworks integration

Vite `base: '/standards/'`, served as a Vercel zone. Registry key `standards`,
accent violet `#a78bfa`, emoji 🎺, path `/standards/`.

`components/StandardsHeader.jsx` falls back to the local descriptor in
`lib/tool.js` when `toolByKey('standards')` is undefined — which is what makes
the app buildable from a checkout whose design pin predates the registry entry.
**Keep `lib/tool.js` in sync with `fretworks-design/src/tools.js`.** The shell
also needs `/standards` in its `vercel.json` rewrites and in `public/sw.js`'s
`ZONE_RE`.

`@fretworks/design` is a git dep pinned to an exact commit in every consumer's
lockfile, and Vercel builds from the lockfile — so a registry change is
invisible until each consumer is repinned. It fails quietly. See
`Focused-Chord-Trainer/docs/fretworks-rollout.md`.

## The bar grid

`lib/chart.js` + `components/BarGrid.jsx` + `components/ChartEditor.jsx`.

**Each bar is its own `<input>`.** The obvious alternative — one editor docked
under the grid showing "the current bar" — fails on a phone for the reason the
fret-button rows failed in Focused Chord Trainer's Build tab: the keyboard
takes half the screen, the app scrolls the focused input just above it, and the
grid gets pushed off the top. A grid of real inputs has no gap to open, because
the thing you type into *is* the bar you are looking at. Read-only mode (no
`onChange`) renders divs instead, which is what the Today tab's peek panel uses.

Other things that are the way they are on purpose:
- **Sections are independent, and copying is explicit.** AABA means playing A
  three times, but the last bars of each A differ — that is what a first and
  second ending *is*. Linking repeated letters would make endings impossible to
  write, so a repeated section's heading offers `copySection` instead.
- **`minmax(0, 1fr)` on the grid columns.** A plain `1fr` track takes its
  automatic minimum from its content, so one long chord symbol would stretch
  the line past the viewport. Same trap as Focused's Build tab.
- **Bar inputs stay at the global 16px.** The app's stylesheet pins every input
  to 16px so iOS does not zoom the page on focus. Do not shrink them to fit
  more text; the input scrolls instead.
- **Imports never change the shape of the form.** `fillBars` drops extra bars
  rather than growing the grid: the form comes from the tune's facts, and a
  paste that disagrees with it is a typo, not a discovery.

## Not built yet (in order)

1. **Metronome + count-in**, unlocking an "at tempo" fifth skill.
2. **Play-along over the entered changes** — the roadmap's shared backing
   engine; build it in `@fretworks/design` so every trainer benefits. The grid
   is already structured for it: one string per bar, in playing order.
3. Jam mechanics as tracked items; transposition / horn keys; ear training
   ("name the tune from its changes").

## Before shipping any change

- `npm run verify` must pass — especially the no-copyrighted-material check.
- `npm run build` must pass.
- Verify at ~393px in the browser; the tune detail and Today card are the two
  screens that matter. For the grid, check with a **simulated keyboard** (stub
  `visualViewport.height` and fire `resize`, as
  `scratchpad/chart.mjs` does) that the focused bar still sits above the
  accessory bar — that is the failure the whole layout is arranged to avoid.
