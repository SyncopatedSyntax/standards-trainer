# Standards Trainer — project context

A React PWA that tracks **jazz repertoire**: which tunes you know, how well,
and what to review before it fades. The 8th tool in the **Fretworks** toolbox
(sibling to Chord Trainer, Focused Chord Trainer, Triad Trainer,
DiatonicChordsTrainer, MelodicMinorTrainer, AlteredTrainer, Circle of Fifths).
Single dev + end user: Zak. The goal it serves is concrete — turn up to a jam
and be able to call a tune.

## What it is for — and what it is not

**It accompanies other practice apps; it does not replace them.** Zak practises
with iReal Pro, forScore and a Real Book. Those hold the music — charts,
backing tracks, tempo, keys. This app is the logbook beside them, with three
jobs, in Zak's words: keep track of which standards **need a refresher**, which
are **currently being learnt**, and which are **done learning** — so the
repertoire grows without anything being forgotten.

So features that belong in those apps do not belong here: no chart editor (the
bar grid and form templates were removed in October 2026 for exactly this
reason), no play-along, metronome or transposition. Before proposing a feature,
ask whether it serves one of the three jobs or duplicates the other apps.

- Toolbox-wide conventions (git-dep workflow, multi-zone, single PWA,
  verify-in-prod, naming): the Fretworks root `CLAUDE.md`.
- The app shell, SRS engine and UI primitives are lifted from
  **Focused-Chord-Trainer**. When changing shared behaviour, check that repo
  first — it is the reference implementation.

## The constraint that shapes everything

Real Book charts are under copyright. `data/tunes.js` ships each tune's
**facts** — title, composer, usual key, form, bar count, feel, tempo range —
because facts are not copyrightable. The melodies and the changes are **not**
shipped and must never be added — they live in the apps Zak already uses.

`scripts/verify.mjs` enforces this: a `changes`/`chart`/`melody`/`chords` field
on a tune, or something that looks like a chart in a prose field, fails the
build check. That is not paranoia — it is the one mistake that would turn this
repo into a licensing problem, and it is exactly the kind of "helpful" edit a
future session might make.

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
- `js_notes` — free text per tune (which recording, which iReal Pro chart, a
  fingering, the intro).
- `js_custom` — tunes the user added, same shape plus `custom: true`.
- `js_next` — **Up next**: tune ids Zak plans to learn, in the order added.
  A list, not a schedule — nothing is created for them. Activating a tune
  removes it (`activate` in App).
- `js_settings` — `{ maxGap }`, the refresher ceiling in days (`0` = none).
  Absent reads as `DEFAULT_MAX_GAP` (60), and it is written only when changed.
- `js_charts` — **retired** with the bar grid. `lib/migrate.js` runs once from
  App's load effect: any grid with something typed in it is written into that
  tune's notes as plain text (`A: | Cm7 | F7 | … |`, four bars a line, a
  `-` for an empty bar), then the key is removed. Idempotent — a note that
  already holds the text is left alone, so a second device that also had the
  grid cannot double it. verify.mjs pins that.

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

**Dates are UTC calendar days**, and `addDays` does UTC arithmetic to match
(see the root CLAUDE.md, *Dates in the SRS trainers*). This file's copy used
local `setDate`, which lost a day whenever a gap crossed a clock change.

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

### Stages: learning, in repertoire, needs a refresher

The app's three jobs as data (`tuneStage` in lib/srs.js; labels, colours and
`groupByStage` in components/TuneStatus.jsx, shared by the Mine list, Progress
and the tune page's badge so they can never disagree):

- **learning** — never learned.
- **repertoire** — learned, nothing due, every skill solid.
- **refresher** — learned, and something is due or a skill is no longer solid.

**"Learned" is a fact about the past.** `learnedOn()` replays each skill's
answers in date order and finds the first day all four were solid together;
`tuneIsReady()` only says whether they are solid *now*. Using the latter was
the obvious way and is wrong: one Shaky would drop a known tune back to
"learning", which is not what happened — it needs a refresher. Because it is a
replay of the history, editing or deleting answers moves it (verify pins that
deleting the answer that completed a tune un-learns it). `on` is null for a
tune that was already solid before the history was kept.

**Repertoire growth** is built on it: `learnedTimeline()` lists every learned
tune with its day, newest first, undated ones last, and `learnedThisMonth()`
counts the current calendar month. Progress shows both ("4 tunes learned · +2
this month" over the list), and the tune page says "Learned Fri, Oct 9" (or
"before the history was kept") under the composer. Nothing is stored: it is a
replay, so it follows any edit to the history, and a later slip neither removes
a tune from the list nor moves its day (verify pins both).

Learning tunes stay in Today like everything else — Zak's call. **Up next** is
the fourth group in Mine (between learning and repertoire), and it is a
planning list, never scheduled.

### The refresher ceiling

SM-2 alone spaces a run of Got its 1, 6, 15, 38, 95, 238, 595 days apart: after
seven, a tune is unseen for a year and a half — the opposite of "not
forgetting". Settings caps the gap (1, 2, 3 or 6 months, or none; default 2).

**Applied on read, never written.** A card's last answer is always
`nextDue - interval`, so `capDue()` returns `nextDue` pulled back to last +
cap. App builds the capped view once (`withMaxGap`, memoised) and passes it as
`srs` to every screen; grading and history edits still go to the raw cards
through `srsRef`. So the setting needs no migration, changes every card the
moment it changes, leaves the stored schedule exactly as the engine made it,
and can be switched off to get plain SM-2 back. Do not "simplify" this by
clamping `interval` inside `updateSRS` — that would rewrite history on every
answer and make the setting irreversible.

## Tabs

- **Today** 🌅 — the due queue, one card at a time. The set is **snapshotted at
  mount** (as Focused's TodayTab does): grading rewrites the schedule, and
  without the snapshot the list reorders underneath you mid-session.
- **Tunes** 🎵 — the repertoire. **Opens on Mine once anything is active or
  planned**; the core path is the right first screen exactly once. Mine is
  grouped by **stage** — Needs a refresher · Learning · Up next · In repertoire
  — each in `byAttention` order (due count, then soonest review); tier headings
  there would be chrome, not information. The header counts learned / learning
  / up next. Core and All stay grouped by tier, because there the
  curriculum's shape *is* the point. Tune detail is pushed from here, not a
  tab.

  **Adding a tune is core path first, your own tune last** — Zak's rule. Mine
  carries **+ Add a tune** in its header, so it never sinks below a long list,
  and it opens the *core path* (with a one-line hint), not a blank form. A
  search in Mine falls through to an **In the core path** group of matching
  presets you have not taken on. "Add a tune of your own" appears only at the
  **end** of Core/All, or when a search finds nothing anywhere — then as
  "Add “<what you typed>” as your own tune", title pre-filled. It is
  deliberately absent from Mine, where it used to sit at the foot: the most
  prominent way to add a tune, and out of reach once the list grew.

  **Every hook must run before the early return that swaps in
  `TuneDetail`** — a `useMemo` below it renders fewer hooks on the renders
  where a tune is open, which is how this shipped broken the first time.
- **Progress** 📊 — tunes you could call tonight, then **Your repertoire**:
  the three stage counts, then every active tune under its stage, grouped and
  ordered exactly as Mine is. One repertoire must not appear in two shapes
  depending on which tab you reached it from. Rows tap through to the
  tune — App holds an `openTune` request that `TunesTab` consumes and clears.
  Then **Repertoire growth** (learned count, +N this month, every learned tune
  with its day), the skill breakdown, the 7-day forecast, and **Recent
  answers** (the last eight across every tune, tapping through the same way).
- **Guide** 📖 — the four skills, the three stages (and that the app sits
  beside iReal Pro / forScore), how reviews and the ceiling work, and a **jam
  mechanics** reference (calling, counting off, head–solos–head,
  comping behind a soloist, trading fours, endings, holding the form). Text
  only, deliberately not tracked: most of it is learn-once rather than per-tune,
  so scheduling it per tune would be noise.
- **Settings** ⚙️ — the refresher ceiling, `ProgressBackup`, build stamp.

## The keyboard and the scroll container

Same fix as Focused Chord Trainer, and needed for the same reason — see that
repo's CLAUDE.md for the full explanation. In short: the app is a fixed `100dvh`
column with its own scroller, `dvh` does not shrink for the keyboard, and the
container is already at max `scrollTop` — so `apply()` pads the scroller by the
keyboard's overlap *first*, then scrolls the field into that room. The window
scroll lock stands down while a field is focused.

It matters most for the notes textarea, the search field and the history's
date input. (The chart grid's floating chord keypad, and the
`--kbd-accessory` allowance `apply()` used to make for it, went with the grid.)

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
- **Work Song** as AB 16 — sixteen bars is sourced; splitting it 8 + 8 is
  not a claim from a source.
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

## Not built yet (in order)

Each serves one of the three jobs; none duplicates iReal Pro or forScore.

1. **One refresher per learned tune** instead of four: "play it through" →
   Got it, or Shaky + which skill slipped, and only that skill drops back.
   At 40 tunes × 4 skills the queue is 160 cards; this is the fix for that, and
   the biggest change on the list — discuss with Zak before building.
2. **A link per tune into iReal Pro / forScore**, so a refresher is one tap
   from the chart. Check first whether either app opens a specific song by
   URL; if not, a copy-title button.
3. **"N refreshers due" on the launcher** — needs a hook in `@fretworks/design`.

## Before shipping any change

- `npm run verify` must pass — especially the no-copyrighted-material check.
- `npm run build` must pass.
- Verify at ~393px in the browser; the tune detail, the Mine list and the
  Today card are the screens that matter.
