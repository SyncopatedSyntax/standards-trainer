# Standards Trainer

Part of the [Fretworks](https://fretworks.vercel.app) guitar toolbox. Tracks
jazz repertoire — which tunes you know, how well, and what to review before it
fades — so you can turn up to a jam and call a tune.

Twenty-five standards in teaching order, four skills each (head, changes, form,
solo), and a spaced-repetition queue that tells you what to practise today. Each
tune carries a few researched notes on where it came from, and a few things to
try with it on guitar specifically.

**Charts are not included.** The app ships each tune's facts — key, form, bar
count, feel, tempo — and you write the changes in yourself, into a bar grid the
app lays out from the form (an AABA 32 gives you four eight-bar sections). Real
Book charts are under copyright, and copying out a form bar by bar is one of the
better ways to learn it anyway. What you type stays on your device.

The exception is the **generic forms** — the twelve-bar blues in its usual
variations, and rhythm changes. Those are shared idioms rather than anyone's
composition (it is why contrafacts exist), so they ship as degree templates that
transpose to any key. An empty grid offers whichever ones fit the tune's form, as
a starting point you then correct — never as the tune's actual changes.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173/standards/
npm run verify    # checks the curriculum and the grid layout it implies
npm run build
```

Served at `/standards/` on the Fretworks origin as a Vercel zone.
