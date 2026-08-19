# Standards Trainer

Part of the [Fretworks](https://fretworks.vercel.app) guitar toolbox. Tracks
jazz repertoire — which tunes you know, how well, and what to review before it
fades — so you can turn up to a jam and call a tune.

Twenty-five standards in teaching order, four skills each (head, changes, form,
solo), and a spaced-repetition queue that tells you what to practise today.

**Charts are not included.** The app ships each tune's facts — key, form, bar
count, feel, tempo — and you write the changes in yourself. Real Book charts are
under copyright, and copying out a form bar by bar is one of the better ways to
learn it anyway. What you type stays on your device.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173/standards/
npm run verify    # checks the shipped curriculum is internally consistent
npm run build
```

Served at `/standards/` on the Fretworks origin as a Vercel zone.
