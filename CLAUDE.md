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

- `data/tunes.js` → `CORE_TUNES` (40, facts only), `TIERS`, `SKILLS`.
  Reference data, never written to. **Array order is the curriculum** — the
  verify script asserts tiers never go backwards. Each tune also carries
  `facts[]` and `guitar[]` — see *Facts and guitar notes* below.
- `js_active` — tune ids taken on. A core tune is **inert until activated**, so
  browsing the path costs nothing and the queue can't open with 100 cards.
- `js_srs` — SM-2 state keyed `` `${tuneId}.${skill}` ``, each card carrying its
  own answer log (`hist`) — see *The answer history* below. There is no
  separate history key, so backup and sync carry it with no extra wiring.
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
tune with nothing stored rather than writing one — browsing 40 tunes must not
fill storage with 40 empty grids. `defaultSections()` derives that layout from
facts the tune already carries, and ships every bar empty; `verify.mjs` asserts
both (the right bar count, and no pre-filled bar) for every tune.

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

**One answer per card per day** (`gradeCard`). Zak found that tapping Got it
several times on a tune's page kept pushing the next review further out —
every tap was a fresh SM-2 success. Now a repeat tap the same day *replaces*
that day's answer, so it counts once, and tapping the other button changes
today's answer rather than adding one. `ungradeCard` takes today's answer back
(to no card at all, if it was the first). `last`/`lastOk` are how the tune page
knows to light the chosen button.

### The answer history

Zak asked to see past answers and to fix or delete them. So a card keeps
`hist` — `[{ d: 'YYYY-MM-DD', ok }]`, at most one per day — and its schedule
(`ef`, `interval`, `reps`, `nextDue`) is **never stored independently of it**:
every change goes through `replay(base, hist, edits)`, which folds the
unchanged SM-2 engine over the log in date order, each answer dated its own day
(`updateSRS` gained an `on` date for exactly this). Editing an old answer —
result, day, or both — or deleting it therefore re-derives the schedule as if
the history had always read that way. A mis-tapped Got it from last week stops
holding a skill out of the queue the moment it is corrected.

- `base` is where the replay starts: `null` for a card first answered with the
  log in place, otherwise the running state the card had before it. Answers
  from before the log existed were only ever stored as that state, so they are
  **never itemised**, and are not invented now. Do not "recover" them from
  `reps`/`seen` — a fabricated entry would be editable, and editing a guess
  would corrupt a real schedule.
- But the base **must be visible and removable.** The first cut only
  mentioned it in a footnote, and Zak deleted every listed answer on Boogie
  Woogie Bugle Boy only to find its Changes still solid, 38 days out: the taps
  behind it were made under the old count-every-tap bug, before the log, and
  nothing on screen could reach them. So History ends with an **Earlier — not
  saved one by one** row per skill that has a base (`earlierAnswers`, showing
  `base.reps` as "✓ 4 in a row"), with **Clear** (two taps): `clearEarlier`
  drops the base, leaving the listed answers alone — or no card at all, so the
  skill reads not started. Clearable, never editable.
- The previous version stored `prev` (the state before the latest answer).
  `historyOf()` reads that shape as one recoverable entry on top of `prev`, and
  older cards as a bare `base`; both convert on their next change, never on
  read. verify.mjs pins that a converted card's schedule does not move.
- `seen` = `base.seen` + answers on record + `edits`. Sync settles two devices
  that both changed a card by more-`seen`-wins, so an edit bumps `edits`: a
  corrected history must not lose to an older, uncorrected copy. A delete
  removes one entry and adds one edit, so `seen` never goes *down* on either.
  The Undo straight after answering is not an edit and does lower it, as before.
  `clearEarlier` carries `base.seen` into `edits` for the same reason.
- Edits refuse a future day, and moving an answer onto a day that already has
  one replaces it (the editor warns first) — still one per day.
- A save that changes nothing does not count as an edit (`AnswerHistory`
  checks before calling), so idly opening and saving cannot inflate `seen`.

verify.mjs re-derives the schedule independently (a plain fold of `updateSRS`)
for 400 random answer runs, then flips, moves and deletes a random entry of
each and checks the card against that fold every time.

**Where it shows.** The tune page's **History** panel (`components/AnswerHistory.jsx`),
under the four skills: newest first, one heading per day, Edit opens an inline
editor (Got it/Shaky, a date input capped at today, Save, Delete — two taps).
A confirmation line after each change reads the new next review back from the
schedule. Progress has **Recent answers** across all tunes, read-only, tapping
through to the tune — an answer is edited next to the other skills it is
scheduled with, not from a list of strangers. Dates are UTC days (`todayStr`),
so `dayLabel()` formats them in UTC; formatting one in local time puts it on the
previous day anywhere west of Greenwich. The Progress forecast's weekday letters
had exactly that bug and now pass `timeZone: 'UTC'` too.

Feedback, because a tap that leaves no trace reads as a tap that did not
register: the tune page lights the chosen button and adds a "Saved for today —
next review …" line with Undo; Today shows a floating toast with Undo, since
the card has already moved on. Today also ignores taps for 500 ms after an
answer — the card swaps instantly, so a double tap used to grade the *next*
card unseen.

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
  Then the skill breakdown, the 7-day forecast, and **Recent answers** (the
  last eight across every tune, tapping through the same way).
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

## Facts and guitar notes

Every tune carries `facts[]` (2–3 researched notes on where it came from) and
`guitar[]` (2–3 things to actually do with it on this instrument). They are
separate fields, and separate panels in the UI, because mixing them buries the
practical half under the trivia. The Today card shows **one** guitar note,
picked by the skill's index rather than at random, so a tune's four cards
surface different advice instead of repeating one tip four times.

**These were researched, not invented, and the next edit must be too.** Every
fact came from a source that was actually read — publication dates, session
dates, personnel, the Chuck Wayne authorship evidence at the Library of
Congress, the Yardley jingle, the Hucklebuck chart run. Where an origin story
is contested (Doxy's name, who Billie's Bounce is named for, whether Bigard
wrote the C Jam Blues melody) the text says so rather than picking a side.
Do not add a fact you have not checked; a plausible invention is worse here
than a gap, because nothing downstream can catch it.

**The October 2026 additions** (fifteen tunes Zak asked for: the swing-era
vocal standards at the end of tier 3, Boogie Woogie Bugle Boy in tier 1, Work
Song in tier 2) were researched the same way, through web search, since the
session's network could not reach Wikipedia or jazzstandards.com directly. Keys
are the ones Zak gave where he gave one; otherwise the original published key
(jazzstandards.com's analysis, or the sheet music). Three form calls are weaker
than the rest and worth checking against a chart:
- **L-O-V-E** as ABAC 32 — no source states the form; it is read from the
  song's structure (the "Love is all that I can give to you" phrase returns to
  the opening).
- **Work Song** as AB 16 — sixteen bars is sourced; splitting it 8 + 8 is a
  layout choice for the grid, not a claim from a source.
- **No Moon at All** as AABA 32 — supported only by weak sources.
Boogie Woogie Bugle Boy is filed as a 12-bar blues on the strength of
Wikipedia listing it among well-known twelve-bar songs; its sheet music key is
C.

`verify.mjs` catches the mechanical failures only: both fields present, at
least two entries each, nothing under 40 characters (a one-clause note is
almost always an unfinished placeholder), and every tune having at least one
guitar note that mentions something physical about the instrument — a string,
a fret, a position, a voicing. That last check earned its place immediately: it
caught All of Me shipping two notes of general musical advice with nothing
guitar-specific in either.

The copyright guard now also sweeps `facts` and `guitar`. Describing a tune's
harmony is fine; spelling out its changes is not, so the prose check rejects
pipe-delimited bars *and* three or more absolute chord symbols in a row.

## Form templates — the one place harmony ships

`data/forms.js` + `lib/roman.js`. Read the header comment in `forms.js` before
touching either.

**Why these can ship when the tunes cannot.** The curriculum is a 1920s–60s
body of work. In the US the 95-year term has now freed everything published in
1930 or earlier — Blue Skies, Bye Bye Blackbird, Exactly Like You and a few
more — but copyright elsewhere runs for the writers' lives plus seventy years
(Irving Berlin died in 1989, so the UK protects his songs until the end of
2059), and a Real Book *chart* is a copyright of its own. So the rule does not
soften for the old tunes: no tune's changes ship, whatever its date. The
twelve-bar blues and rhythm changes
are a different kind of thing: shared idioms that predate and outlive any
particular tune, which is why the whole practice of writing contrafacts works.

Two rules keep it that way, both enforced by `verify.mjs`:

1. **Templates are written only in roman numerals.** A sequence that renders in
   all twelve keys is a form; a sequence in one key is a transcription. The
   verify script rejects an absolute chord name anywhere in `forms.js`.
2. **A template is never attached to a tune.** `templatesFor()` matches on the
   tune's *stated form, key quality and section shape* — facts already in
   `tunes.js` — and the user picks from what fits. The app never claims "these
   are this tune's changes". Do not add a `template:` field to a tune; that
   would be an assertion about its harmony, and it is what the copyright guard
   in `verify.mjs` exists to stop.

The second rule is also the pedagogy, and the more important half. C Jam Blues,
Blue Monk and Billie's Bounce are all "a 12-bar blues" and all differ; the
differences are why they are separate entries. So an applied template records
`from: <templateId>` on the chart and the UI keeps a banner up — *the generic
form, not this tune's changes* — until the user confirms they have checked it.
An unlabelled template is indistinguishable from a chart you had actually
verified, which is the real hazard here, not the legal one.

`verify.mjs` re-derives the jazz blues in F, the minor blues in C minor and
rhythm changes in B♭ against what a player would write by hand. That is the
toolbox's standard applied to harmony the app generates.

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

0. **More form templates** if they earn it — a modal vamp, a bossa 16. The bar
   is the same: a shared idiom, expressible in degrees, matched on form rather
   than named per tune.
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
