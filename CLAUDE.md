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
- `js_notes` — free text per tune. In slice 1 this is where the changes go; it
  stays afterwards as general notes.
- `js_custom` — tunes the user added, same shape plus `custom: true`.

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
- **Tunes** 🎵 — the repertoire, grouped by tier so the curriculum's shape is
  visible. Filters Mine / Core path / All. Tune detail is pushed from here, not
  a tab. **Every hook must run before the early return that swaps in
  `TuneDetail`** — a `useMemo` below it renders fewer hooks on the renders
  where a tune is open, which is how this shipped broken the first time.
- **Progress** 📊 — tunes you could call tonight, skill breakdown, 7-day forecast.
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

The notes field is the one that needs it.

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

## Not built yet (in order)

1. **The bar grid** — structured changes, one cell per bar, replacing the notes
   field as the place the chart lives. Store as `js_charts`
   (`{ [tuneId]: { sections: [{ label, bars: [...] }] } }`) *alongside* the
   notes, not instead of them, so no migration is needed. Take `SymbolField`
   (the Δ ø ° ♭ ♯ keypad) from `Focused-Chord-Trainer/components/ui.jsx` rather
   than writing another one.
2. **Metronome + count-in**, unlocking an "at tempo" fifth skill.
3. **Play-along over the entered changes** — the roadmap's shared backing
   engine; build it in `@fretworks/design` so every trainer benefits.
4. Jam mechanics as tracked items; transposition / horn keys; ear training
   ("name the tune from its changes").

## Before shipping any change

- `npm run verify` must pass — especially the no-copyrighted-material check.
- `npm run build` must pass.
- Verify at ~393px in the browser; the tune detail and Today card are the two
  screens that matter.
