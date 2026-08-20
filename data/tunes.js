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
    why: 'A two-note head. Nothing to memorise, so the blues form itself is the lesson.',
    facts: [
      'The whole melody is two notes, G and C. That was the point: Ellington could hand it to any guest sitting in and they had it after one chorus.',
      'The tune is credited to Ellington, but the melody most likely came from his clarinettist Barney Bigard in 1941. It later picked up a lyric as “Duke’s Place”.',
      'Django Reinhardt recorded it — one of the first guitarists to take an Ellington head as a blowing vehicle.',
    ],
    guitar: [
      'Two notes means no excuses. Play the head with the metronome clicking only on 2 and 4, and the moment you drift the tune tells you.',
      'Spend a whole chorus doing Freddie Green’s job instead of soloing: three-note voicings, four even quarter-notes to the bar, weight on 2 and 4. He played that way, unamplified, for fifty years with Basie.',
      'It is in C, which is nobody’s horn key. Once it is solid, move it to F and B♭ — that is what will get called.',
    ],
  },
  { id: 'blue-monk', title: 'Blue Monk', composer: 'Thelonious Monk', key: 'Bb', form: 'blues', bars: 12,
    feel: 'Medium swing', tempoLo: 110, tempoHi: 160, tier: 1,
    why: 'A simple riff head over a plain blues — your first tune with an actual melody.',
    facts: [
      'Monk’s biographer Laurent de Wilde reports this was Monk’s own favourite of everything he wrote.',
      'Part of the melody is a straight quotation of “Pastel Blue” by trumpeter Charlie Shavers.',
      'First recorded in 1954 for Thelonious Monk Trio. He kept coming back to it for the rest of his life.',
    ],
    guitar: [
      'The head is a chromatic climb. Play it on one string first — the G string works — so you hear the intervals instead of grabbing a shape, then move it into position.',
      'Monk is all placement and space. Let the long notes ring rather than damping them; the guitar’s decay does the work if you leave it alone.',
      'B♭ is a horn key. Learn it from a root-on-6 position and a root-on-5 position so you can start the form anywhere on the neck.',
    ],
  },
  { id: 'mr-pc', title: 'Mr. P.C.', composer: 'John Coltrane', key: 'Cm', form: 'blues', bars: 12,
    feel: 'Fast swing', tempoLo: 180, tempoHi: 280, tier: 1,
    why: 'The minor blues template. Same shape you already know, one chord quality different.',
    facts: [
      'Named for bassist Paul Chambers, who had been alongside Coltrane for years in Miles Davis’s band. It closes the Giant Steps album, recorded in May 1959.',
      'It is the minor blues template in its plainest form — the twelve bars you already know with the quality flipped.',
      'Coltrane took it fast. That is the tune’s only real difficulty, and it is a real one.',
    ],
    guitar: [
      'Set a tempo where you can play the head cleanly, not the tempo on the record. Add five bpm a day; you will pass 200 within a fortnight.',
      'Fast single-note lines live or die on your picking hand. Practise the head with strict alternate picking, then with economy picking, and keep whichever survives at tempo.',
      'Over the V7 try the altered scale rather than the minor scale you are using everywhere else — Altered Trainer has the shapes.',
    ],
  },
  { id: 'so-what', title: 'So What', composer: 'Miles Davis', key: 'Dm', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 120, tempoHi: 160, tier: 1,
    why: 'Two chords in the whole tune, a half step apart. AABA form with nothing else to think about.',
    facts: [
      'From Kind of Blue (1959). The whole harmonic event is a half step: sixteen bars of D dorian, eight of E♭ dorian, then eight back home.',
      'Miles and Bill Evans were both reading George Russell’s Lydian Chromatic Concept, which argued for improvising on modes rather than running chords.',
      'The “So What chord” is named after this tune — Evans’s voicing in the response to the head, three perfect fourths with a major third stacked on top.',
    ],
    guitar: [
      'That voicing is easier on guitar than on piano: stacked fourths fall naturally across the strings. Learn one grip, then shove the whole thing up a fret for the bridge and back down.',
      'Two chords in thirty-two bars leaves nowhere to hide. Play a chorus using only D dorian in one position, then the same chorus somewhere else on the neck.',
      'Comping here is rhythm, not harmony. Try a chorus where you only play on the beats you would normally leave empty.',
    ],
  },
  { id: 'cantaloupe-island', title: 'Cantaloupe Island', composer: 'Herbie Hancock', key: 'Fm', form: 'ABCA', bars: 16,
    feel: 'Funk / straight eighths', tempoLo: 100, tempoHi: 130, tier: 1,
    why: 'Three chords and a groove. Teaches you to hold a vamp without rushing.',
    facts: [
      'From Empyrean Isles (1964), with Freddie Hubbard, Ron Carter and Tony Williams.',
      'US3 sampled it for “Cantaloop (Flip Fantasia)” in 1993, which became the biggest-selling record ever issued on Blue Note.',
    ],
    guitar: [
      'Three chords over sixteen bars: this is a time exercise wearing a tune’s clothes. Lock the vamp and refuse to rush the gaps.',
      'Straight eighths, not swung. Mute across the strings with the left hand and let the right hand be percussive — closer to funk rhythm playing than to jazz comping.',
      'A guitar can carry the piano figure outright here. Voice it in fourths and you will not need a keyboard player.',
    ],
  },

  // ── Tier 2 · Short forms ───────────────────────────────────────────────
  { id: 'blue-bossa', title: 'Blue Bossa', composer: 'Kenny Dorham', key: 'Cm', form: 'AB', bars: 16,
    feel: 'Bossa nova', tempoLo: 130, tempoHi: 170, tier: 2,
    why: 'The classic first jazz tune: one ii–V in C minor, one in D-flat, and out.',
    facts: [
      'Written by trumpeter Kenny Dorham and introduced on Joe Henderson’s debut, Page One (1963).',
      'A hard-bop and bossa hybrid, most likely out of Dorham’s visit to the Rio de Janeiro jazz festival in 1961 — a year after Stan Getz’s Jazz Samba put Brazilian rhythm in front of every American jazz musician.',
    ],
    guitar: [
      'One ii–V in C minor, one in D♭ a half step above. Play the same grip and slide it — the guitar makes that relationship visible in a way no other instrument does.',
      'Bossa comping is fingers, not a pick: thumb on the bass note, fingers on the upper voices, and never strum. Two-note guide-tone voicings are enough.',
      'It is the standard first jazz tune for good reason. Get it genuinely clean before you add a single extension.',
    ],
  },
  { id: 'summertime', title: 'Summertime', composer: 'George Gershwin', key: 'Am', form: 'AB', bars: 16,
    feel: 'Slow swing or latin', tempoLo: 80, tempoHi: 130, tier: 2,
    why: 'Minor, slow-moving, and everybody knows it — a safe tune to call when you are nervous.',
    facts: [
      'From Porgy and Bess (1935), where it is a lullaby sung to a baby. It may be the most-covered song in existence — one archive counts north of 33,000 recordings.',
      'Billie Holiday cut the first jazz version in 1936, a year after the opera opened, and reached the US pop charts with it.',
      'Wes Montgomery’s “Four on Six”, from The Incredible Jazz Guitar (1960), is a contrafact on these changes in G minor — he kept the frame and put descending ii–Vs through bars 5 to 8.',
    ],
    guitar: [
      'Learn this and you are most of the way into Four on Six. Play them back to back and hear exactly what Wes changed.',
      'Slow tempos are where guitar is weakest — the note dies. Fill with vibrato, slides and rearticulation rather than with more notes.',
      'It is a lullaby, so try it as a chord melody: tune in the top voice, thumb keeping a bass note underneath.',
    ],
  },
  { id: 'song-for-my-father', title: 'Song for My Father', composer: 'Horace Silver', key: 'Fm', form: 'AAB', bars: 24,
    feel: 'Bossa / latin', tempoLo: 120, tempoHi: 150, tier: 2,
    why: 'A repetitive, forgiving set of changes over an unmistakable bass figure.',
    facts: [
      'Written for Silver’s father, John Tavares Silva, born on the Cape Verdean island of Maio — whose photograph is the album cover.',
      'The rhythm came from a trip to Rio for Carnival as Sérgio Mendes’s guest. Silver recorded it on his return, in October 1964.',
      'Steely Dan’s “Rikki Don’t Lose That Number” opens by lifting the bass figure outright.',
    ],
    guitar: [
      'The bass figure is the tune. Learn it in the low register before you touch the melody — if you can play that, people will know what you are calling.',
      'It is twenty-four bars, not thirty-two. Count it out loud until the AAB stops surprising you.',
      'F minor sits in the middle of the neck with no open strings to lean on, which is exactly why it is worth practising here.',
    ],
  },
  { id: 'footprints', title: 'Footprints', composer: 'Wayne Shorter', key: 'Cm', form: 'blues', bars: 12,
    feel: '6/8, or swung in 3', tempoLo: 120, tempoHi: 180, tier: 2,
    why: 'A minor blues in three. Same harmony you know, counted a way that will catch you out.',
    facts: [
      'First recorded on Shorter’s Adam’s Apple (1966). The Miles Davis Quintet cut the better-known version for Miles Smiles the following year.',
      'It is a minor blues counted in six — harmony you already own, in a metre that will catch you out.',
    ],
    guitar: [
      'Comp a chorus playing nothing but the root on beat 1 until you stop losing where bar 1 is. Everything else can wait.',
      'The Miles version floats between a 6/4 and a 4/4 feel. Play the head over both and hear how the phrasing changes.',
      'Three is uncomfortable for a pick hand trained on four. Practise the strumming pattern away from the tune first.',
    ],
  },
  { id: 'maiden-voyage', title: 'Maiden Voyage', composer: 'Herbie Hancock', key: 'modal', form: 'AABA', bars: 32,
    feel: 'Straight eighths, floating', tempoLo: 110, tempoHi: 140, tier: 2,
    why: 'Four sus chords, four bars each. Teaches patience — the hard part is not filling the space.',
    facts: [
      'It started life as a jingle for a Yardley cologne advert, and sat on the album’s master tape labelled “TV Jingle” until a friend of Hancock’s sister named it.',
      'Hancock’s liner note says he was after “the splendour of a sea-going vessel on its maiden voyage”.',
      'Four suspended chords, four bars each, and nothing in the tune ever resolves.',
    ],
    guitar: [
      'Sus chords have no third. A guitar shape fingered from habit will slip one in and spoil the whole effect — check every voicing note by note.',
      'The same stacked-fourths grip you use on So What walks through all four chords here. One shape, four positions.',
      'The difficulty is not filling the space. Set yourself a chorus of under twenty notes and mean it.',
    ],
  },
  { id: 'recorda-me', title: 'Recorda Me', composer: 'Joe Henderson', key: 'Am', form: 'AB', bars: 16,
    feel: 'Latin into swing', tempoLo: 140, tempoHi: 190, tier: 2,
    why: 'ii–Vs that move through three keys in sixteen bars. Your first real modulation workout.',
    facts: [
      'Henderson wrote it when he was fifteen, originally in a Latin style, and reworked it later with a bossa feel.',
      'Portuguese for “remember me”; you will also see it as Recorda-Me or Recordame. Henderson later cut an uptempo version titled “Não Me Esqueça”.',
      'It is on Page One (1963) — the same debut album that introduced Blue Bossa.',
    ],
    guitar: [
      'The ii–Vs move through three key centres in sixteen bars. Play guide tones only, thirds and sevenths on the D and G strings, and let your ear follow the voice leading.',
      'The head is usually straight and the solos usually swing. Practise the switch itself — that transition is where bands fall apart.',
      'Because it modulates so fast, it is a good tune for testing whether you actually know your ii–V shapes or just one of them.',
    ],
  },

  // ── Tier 3 · Standard 32-bar forms ─────────────────────────────────────
  { id: 'autumn-leaves', title: 'Autumn Leaves', composer: 'Joseph Kosma', key: 'Gm', form: 'AABC', bars: 32,
    feel: 'Medium swing', tempoLo: 120, tempoHi: 180, tier: 3,
    why: 'The ii–V–I drill made into a tune, alternating between a major key and its relative minor.',
    facts: [
      'It began as “Les Feuilles mortes”, written by Joseph Kosma to a Jacques Prévert lyric for the 1946 film Les Portes de la nuit. Johnny Mercer wrote the English words in 1950.',
      'Cannonball Adderley’s 1958 Somethin’ Else version — with Miles Davis appearing, unusually, as a sideman — is what made it a jazz staple.',
      'More than a thousand commercial recordings are known.',
    ],
    guitar: [
      'It alternates between a major key and its relative minor, which is the entire ii–V–I drill inside one tune. Play it thinking in G minor, then thinking in B♭ major, and notice they are the same seven notes.',
      'Chord-melody territory: in G minor the tune sits comfortably on the top two strings.',
      'The Circle of Fifths Trainer is the companion here — the changes walk the circle almost the whole way round.',
    ],
  },
  { id: 'solar', title: 'Solar', composer: 'Miles Davis', key: 'Cm', form: 'through', bars: 12,
    feel: 'Medium-up swing', tempoLo: 160, tempoHi: 220, tier: 3,
    why: 'Twelve bars of descending ii–Vs. More harmony per bar than anything else this short.',
    facts: [
      'It is almost certainly not Miles’s tune. Guitarist Chuck Wayne wrote it in 1946 as “Sonny”, for trumpeter Sonny Berman, while with Woody Herman’s band. A 1946 acetate from Wayne’s own collection surfaced at the Library of Congress in 2011 and settled it.',
      'Davis copyrighted it under his name in 1963, nearly a decade after recording it, having changed Wayne’s opening major chord to a minor one.',
      'The first two bars are carved on Miles Davis’s headstone in Woodlawn Cemetery.',
    ],
    guitar: [
      'A guitarist wrote it, and it plays like it — twelve bars of descending ii–Vs that stay under one hand if you pick the right position.',
      'More harmony per bar than anything else this short. Practise it as one-octave arpeggios only, no scales, until the root movement is automatic.',
      'Then move it: the same shape sequence works from any starting fret, which is the whole lesson.',
    ],
  },
  { id: 'doxy', title: 'Doxy', composer: 'Sonny Rollins', key: 'Bb', form: 'AB', bars: 16,
    feel: 'Medium swing, heavy', tempoLo: 110, tempoHi: 150, tier: 3,
    why: 'A riff head over bluesy changes — the bridge between blues form and standard form.',
    facts: [
      'Recorded at Miles Davis’s Bags’ Groove session in 1954, with Rollins, Horace Silver, Percy Heath and Kenny Clarke.',
      'The changes are lifted from “Ja-Da”, Bob Carleton’s sixteen-bar song from 1918.',
      'Rollins later named his record label Doxy. The story that the title came from a bread spread on a European tour is doubted — he did not tour Europe until 1959.',
    ],
    guitar: [
      'A riff head. Use a pick and dig in — nothing about this tune wants to be played legato.',
      'Sixteen bars, medium and heavy: an ideal tune to play one full chorus of four-to-the-bar comping before you take a solo.',
      'B♭ again. If you learned Blue Monk from a root-on-5 position, this is the same neighbourhood — use that.',
    ],
  },
  { id: 'all-of-me', title: 'All of Me', composer: 'Gerald Marks & Seymour Simons', key: 'C', form: 'ABAC', bars: 32,
    feel: 'Medium swing', tempoLo: 130, tempoHi: 180, tier: 3,
    why: 'Secondary dominants in plain sight. Called constantly, and singers love it.',
    facts: [
      'It was Gerald Marks’s first complete song. Belle Baker sang it on the radio in 1931 days after her husband died, broke down partway through, and the press coverage made it a hit.',
      'Louis Armstrong took it to No. 1 in 1932. The critic Ted Gioia calls Billie Holiday’s 1941 recording the definitive one.',
      'At 1931 it is the oldest tune in this list — the first that will reach the US public domain, in 2027.',
    ],
    guitar: [
      'Secondary dominants in plain sight: chord after chord is a dominant pointing at the next one. Comp it with guide tones only — thirds and sevenths on the D and G strings — and you will hear a single chromatic line walking through the whole tune.',
      'In C it sits low enough to use open strings, which is rare in this repertoire. Work out a chord-melody chorus in open position, then the same one up at the 8th fret, and keep both.',
      'Singers call this constantly, usually in C. Know it there first, then move the shapes to E♭ and F before someone asks.',
    ],
  },
  { id: 'satin-doll', title: 'Satin Doll', composer: 'Duke Ellington & Billy Strayhorn', key: 'C', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 110, tempoHi: 150, tier: 3,
    why: 'ii–Vs stacked end to end. If you can comp this cleanly you can comp most standards.',
    facts: [
      'Ellington closed most of his concerts with it.',
      'It was an instrumental hit first; Johnny Mercer’s lyric was written afterwards, to a tune that was already famous.',
      'Wes Montgomery recorded it, and it is a clean example of his block chords and octaves in the same performance.',
    ],
    guitar: [
      'ii–Vs stacked end to end. If you can comp this cleanly and quietly, you can comp most standards.',
      'Study Wes’s octaves here: thumb on the lower note, skip a string, and damp everything you are not playing. Slow, then slower.',
      'Then do the opposite for a chorus — Freddie Green style, three notes, four to the bar, no octaves at all.',
    ],
  },
  { id: 'take-the-a-train', title: 'Take the A Train', composer: 'Billy Strayhorn', key: 'C', form: 'AABA', bars: 32,
    feel: 'Medium-up swing', tempoLo: 150, tempoHi: 200, tier: 3,
    why: 'The #11 on the II7 in bar 3 — your ear’s first proper taste of an altered colour.',
    facts: [
      'Ellington hired Strayhorn and posted him subway directions from Pittsburgh to the house in Harlem. They began “Take the A train”. Strayhorn set the directions to music.',
      'It became the Ellington orchestra’s signature tune. The famous recording is from February 1941, made during the ASCAP radio ban that had taken Ellington’s older catalogue off the air.',
      'The G♯ in bars 3 and 4 is the ♯11 of the D7 — a lydian dominant. Ellington liked the sound enough that several of his intros for the tune are built on the whole-tone scale.',
    ],
    guitar: [
      'That ♯11 is your ear’s first proper taste of an altered colour. The scale for it is lydian dominant — Melodic Minor Trainer has the shapes and the parent-key rule.',
      'A chord-melody standard: in C the tune sits singably on the B and top E strings, which is why every guitarist eventually arranges it.',
      'Play the II7 with and without the ♯11 back to back so you know what you are choosing.',
    ],
  },
  { id: 'fly-me-to-the-moon', title: 'Fly Me to the Moon', composer: 'Bart Howard', key: 'C', form: 'ABAC', bars: 32,
    feel: 'Medium swing or bossa', tempoLo: 120, tempoHi: 170, tier: 3,
    why: 'A circle-of-fifths sequence you can hear coming. Great for practising anticipation.',
    facts: [
      'It was written as “In Other Words”, and as a slow waltz in 3/4. Quincy Jones’s arrangement for Sinatra with Count Basie put it into 4/4 swing, which is how it is played now.',
      'Kaye Ballard made the first recording in 1954. Sinatra’s 1964 version travelled with the Apollo missions.',
    ],
    guitar: [
      'It is a circle-of-fifths sequence and you can hear it coming. Practise arriving on each chord a beat early — anticipation is what makes a line sound like it knew where it was going.',
      'Because it began as a waltz, play a chorus in 3. It re-hears the melody completely and it is good metre practice.',
      'Easy changes, so use it to work on tone and time rather than on notes.',
    ],
  },
  { id: 'there-will-never-be-another-you', title: 'There Will Never Be Another You', composer: 'Harry Warren', key: 'Eb', form: 'ABAC', bars: 32,
    feel: 'Medium-up swing', tempoLo: 160, tempoHi: 210, tier: 3,
    why: 'Long-form ii–Vs in a flat key — where horn players live, so expect to be called on it.',
    facts: [
      'Written by Harry Warren with a Mack Gordon lyric for the 1942 Fox musical Iceland, and introduced to jazz by Woody Herman the same year.',
      'Its changes carry several contrafacts, among them “Split Kick” and “Status Quo”.',
    ],
    guitar: [
      'E♭ is a horn key and it stays awkward on guitar for exactly as long as you keep avoiding it. This is the tune to stop avoiding it on.',
      'Long-form ii–Vs make it ideal for a one-position discipline: play a whole chorus without shifting, then a whole chorus shifting every four bars.',
      'It gets called at a brisk tempo. Learn the head slowly enough that it survives being sped up.',
    ],
  },

  // ── Tier 4 · Bebop & rhythm changes ────────────────────────────────────
  { id: 'nows-the-time', title: "Now's the Time", composer: 'Charlie Parker', key: 'F', form: 'blues', bars: 12,
    feel: 'Medium swing', tempoLo: 140, tempoHi: 190, tier: 4,
    why: 'Bebop phrasing on a form you already own. All the difficulty is in the articulation.',
    facts: [
      'Recorded at the Savoy session of 26 November 1945 — the same day as Billie’s Bounce and Ko-Ko — with a nineteen-year-old Miles Davis on trumpet and Dizzy Gillespie playing piano on the blues.',
      'In 1949 Paul Williams’s “The Hucklebuck” took essentially the same melody to the top of the R&B chart and started a national dance craze.',
    ],
    guitar: [
      'Every bit of the difficulty is articulation, not notes. Play the head with strict alternate picking, then all downstrokes, and listen to what changes.',
      'An F blues played in first position wastes the instrument. Learn the form from the 5th, 8th and 13th frets and pick whichever suits the line.',
      'Bebop phrasing accents the offbeats. Practise the head against a metronome on 2 and 4 only, so the accents have something to push against.',
    ],
  },
  { id: 'billies-bounce', title: "Billie's Bounce", composer: 'Charlie Parker', key: 'F', form: 'blues', bars: 12,
    feel: 'Medium swing', tempoLo: 150, tempoHi: 200, tier: 4,
    why: 'The same form again with a genuinely hard head. This is the one that takes weeks.',
    facts: [
      'Same session, same day and same key as Now’s the Time — and a far harder head.',
      'Nothing to do with Billie Holiday. It is for Billie or Billy Shaw — Parker’s booking agent, or his secretary, depending on the account — and the spelling may simply be a record-label error.',
      'George Benson’s version is a standing lesson in building bebop lines from triads and enclosures.',
    ],
    guitar: [
      'This is the one that takes weeks. Learn it four bars at a time and refuse to move on until each four is clean at tempo.',
      'Bebop lines cross strings constantly. Decide one fingering and commit to it — changing fingerings while learning is why heads never stick.',
      'Once the head is solid, steal from it. Parker’s own phrases here are better vocabulary than any lick book.',
    ],
  },
  { id: 'oleo', title: 'Oleo', composer: 'Sonny Rollins', key: 'Bb', form: 'AABA', bars: 32,
    feel: 'Fast swing', tempoLo: 200, tempoHi: 280, tier: 4,
    why: 'Rhythm changes — the second form, after the blues, that jams assume you know cold.',
    facts: [
      'Named after oleomargarine, the wartime butter substitute that was a household word in 1954.',
      'It is a contrafact on I Got Rhythm, so learning it hands you rhythm changes — the second form, after the blues, that a jam assumes you have cold.',
      'First recorded on 29 June 1954 by the Miles Davis Quintet at Rudy Van Gelder’s studio in Hackensack.',
    ],
    guitar: [
      'Fast, and the head is written in eighths. Practise at half tempo with the metronome only on 2 and 4, then creep up.',
      'The bridge is four dominants round the circle, two bars each. Voice-lead it with drop-2 shapes on the middle four strings and your hand will barely move.',
      'Rhythm changes is a form, not a tune — once this is solid, try soloing over it without playing the head at all.',
    ],
  },

  // ── Tier 5 · The walls ─────────────────────────────────────────────────
  { id: 'all-the-things-you-are', title: 'All The Things You Are', composer: 'Jerome Kern', key: 'Ab', form: 'through', bars: 36,
    feel: 'Medium swing', tempoLo: 140, tempoHi: 190, tier: 5,
    why: 'Modulates through four key centres, and the last section runs long (8+8+8+12). The harmony test.',
    facts: [
      'Written for the 1939 Broadway musical Very Warm for May, which the critics savaged and which closed after two months. The song outlived it by nearly a century.',
      'It moves through four key centres. The critic William Zinsser called it “the most perfectly constructed of all popular standards”.',
      'The last section runs long — 8+8+8+12 — which is why it is thirty-six bars and not thirty-two.',
    ],
    guitar: [
      'Every ii–V–I in it is the same shape moved somewhere else. Play the whole tune with one grip per function and let your hand do the modulating for you.',
      'Count it. The twelve-bar final section is where people get lost, and getting lost here is the classic way to lose a jam.',
      'Good tune for testing whether you know your shapes in flat keys or only in the two you like.',
    ],
  },
  { id: 'stella-by-starlight', title: 'Stella by Starlight', composer: 'Victor Young', key: 'Bb', form: 'through', bars: 32,
    feel: 'Medium swing or ballad', tempoLo: 120, tempoHi: 180, tier: 5,
    why: 'Changes that refuse to sit in one key, starting on a chord that is not the tonic.',
    facts: [
      'It began as instrumental theme music for The Uninvited (1944), a ghost story — a serenade to a character called Stella. Ned Washington added the lyric two years later.',
      'It opens on a chord that is not the tonic and spends the rest of the tune declining to settle, which is why it is a rite of passage rather than a first tune.',
    ],
    guitar: [
      'Do not learn it as a sequence of grips. Learn the bass line first — the changes only make sense once you can hear the root movement underneath them.',
      'Half-diminished chords are everywhere. Get two ø voicings on the middle four strings so comfortable you can play them without looking.',
      'Take it as a ballad before you take it in time. At a slow tempo you cannot fake knowing where you are.',
    ],
  },
  { id: 'giant-steps', title: 'Giant Steps', composer: 'John Coltrane', key: 'B', form: 'through', bars: 16,
    feel: 'Very fast swing', tempoLo: 220, tempoHi: 290, tier: 5,
    why: 'Three key centres a major third apart, two chords per bar. The wall, and everyone knows it.',
    facts: [
      'Recorded 4 and 5 May 1959 with Tommy Flanagan, Paul Chambers and Art Taylor. Flanagan’s hesitant piano solo at that tempo is one of the most discussed moments in recorded jazz.',
      'Three tonal centres a major third apart — B, G and E♭ — with the music modulating roughly every two beats.',
      'Coltrane had been working through Nicolas Slonimsky’s Thesaurus of Scales and Melodic Patterns (1947). The shape is pattern number 286.',
    ],
    guitar: [
      'Do not start with scales. Play the three major triads — B, G, E♭ — until you can find each one anywhere on the neck, then play the whole tune using nothing but triads.',
      'Take it at 60 bpm. Every guitarist who can play this learned it slowly, and there is no version of learning it fast.',
      'Triad Trainer is the companion here: this tune is a straight test of whether you can see a triad in any key without thinking about it.',
    ],
  },
];

// Forms whose letters describe equal-length sections, so bar count must divide.
export const LETTER_FORMS = /^[A-C]+$/;
