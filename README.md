# Standards Trainer

Part of the [Fretworks](https://fretworks.vercel.app) guitar toolbox. Tracks
jazz repertoire — which tunes you know, how well, and what to review before it
fades — so you can turn up to a jam and call a tune.

It is a companion to the apps you already practise with — iReal Pro, forScore,
a Real Book — not a replacement for them. Those hold the music; this keeps track
of three things: which standards you are **learning**, which you have
**learned**, and which **need a refresher** before they fade.

Forty standards in teaching order, four skills each (head, changes, form,
solo), and a spaced-repetition queue that tells you what to play today. Your
tunes are grouped by stage, with an **Up next** list for what you plan to learn,
and a ceiling on how long any tune can go unreviewed (two months unless you
change it). Every answer is kept, and can be changed or deleted later. Each tune
carries a few researched notes on where it came from, and a few things to try
with it on guitar specifically.

**No charts are included, or stored.** The app ships each tune's facts — key,
form, bar count, feel, tempo — because facts are not copyrightable; the changes
and melodies are, and they live in the apps above.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173/standards/
npm run verify    # checks the curriculum, the schedule and the stages
npm run build
```

Served at `/standards/` on the Fretworks origin as a Vercel zone.
