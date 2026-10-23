// ── The core curriculum ───────────────────────────────────────────────────
// Forty tunes that actually get called at jams, ordered so each tier only
// asks for one new thing. (Twenty-five at launch; Zak added fifteen more in
// October 2026 — mostly swing-era vocal standards, which landed at the end of
// tier 3, plus a jump blues in tier 1 and a sixteen-bar minor blues in tier 2.)
//
// WHAT IS IN HERE, AND WHY IT STOPS THERE
//
// Only *facts*: title, composer, the key it is usually called in, the form,
// the bar count, the feel, a sensible tempo range. None of that is anybody's
// creative work, so none of it is copyrightable.
//
// The melodies and the changes are NOT here and must never be added. A Real
// Book chart is under copyright; shipping one would make this repo a piracy
// problem rather than a practice tool. The charts live in the apps the user
// already practises with (iReal Pro, forScore); this one tracks what he knows.
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
  { id: 'boogie-woogie-bugle-boy', title: 'Boogie Woogie Bugle Boy', composer: 'Don Raye & Hughie Prince', key: 'C', form: 'blues', bars: 12,
    feel: 'Jump blues / boogie', tempoLo: 150, tempoHi: 210, tier: 1,
    why: 'A jump blues with a boogie bass underneath — the twelve-bar form at a dance-floor tempo.',
    facts: [
      'Written by Don Raye and Hughie Prince for the Andrews Sisters, who introduced it in the Abbott and Costello film Buck Privates, released in January 1941.',
      'Their Decca record reached number six on the Billboard pop chart that spring, and the song was nominated for the Academy Award for Best Original Song.',
      'It is filed as jump blues and turns up in lists of the best-known pop songs built on the twelve-bar blues. The 1941 sheet music is in C.',
    ],
    guitar: [
      'The boogie figure is the groove. Walk it on the low E and A strings — root, 3rd, 5th, 6th, ♭7 and back down — and keep it going under a whole chorus before you play any melody.',
      'At jump tempos, comp with short, damped two- and three-note shapes on the middle strings, and leave the low end to the boogie line or the bass player.',
      'The Andrews Sisters sang in close three-part harmony. Copy it on the top three strings: one triad shape, moved along under the tune, is their sound on a guitar.',
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
  { id: 'work-song', title: 'Work Song', composer: 'Nat Adderley', key: 'Fm', form: 'AB', bars: 16,
    feel: 'Medium swing / soul jazz', tempoLo: 100, tempoHi: 150, tier: 2,
    why: 'A sixteen-bar minor blues built on a call-and-response riff — the blues form stretched by four bars.',
    facts: [
      'Nat Adderley wrote it after watching a chain gang sing as they paved the street outside his family’s home in Florida. He recorded it on 25 and 27 January 1960 for Riverside, as the title track of his album Work Song.',
      'It began as an instrumental. Oscar Brown Jr. added words on his album Sin & Soul, and the covers kept coming — Adderley called it his “Social Security song” for the royalties.',
      'Charts disagree on its tonality: the Real Book writes F minor, Jamey Aebersold’s chart a dominant F7, and the soloists on the record use both. Ethan Hein’s answer is that it is simply in F blues.',
    ],
    guitar: [
      'Wes Montgomery is the guitarist on the original record, cut the same week as his own The Incredible Jazz Guitar. Play the riff in octaves his way — thumb, with the string in between muted.',
      'The riff is call and response. Play the call low on the 6th and 5th strings and answer with a short chord stab higher up the neck — one guitar can be both halves.',
      'Because the tonality is ambiguous, try one chorus over F minor shapes and the next over F7 shapes, and listen to which one the head wants where.',
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

  { id: 'exactly-like-you', title: 'Exactly Like You', composer: 'Jimmy McHugh & Dorothy Fields', key: 'C', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 130, tempoHi: 190, tier: 3,
    why: 'An AABA in C whose bridge is two dominants each falling to the chord a fifth below — the plainest kind of 32-bar song.',
    facts: [
      'Introduced by Harry Richman and Gertrude Lawrence in Lew Leslie’s International Revue, which opened in New York on 25 February 1930 and closed after 95 performances.',
      'The revue flopped, but two of its McHugh and Fields songs outlived it: this one and On the Sunny Side of the Street.',
      'Benny Goodman’s 1936 small-group record carried Lionel Hampton’s first recorded vocal, and did much to make it a jazz standard.',
    ],
    guitar: [
      'The bridge is the same move twice: a dominant chord resolving down a fifth. Learn one dominant-seventh grip and slide it — the second half of the bridge is the first half, a step higher.',
      'The A-section melody leaps — down in fourths, then up a fourth and down an octave. Find it in one position so the leaps go across strings instead of up and down one string.',
      'Learn it next to On the Sunny Side of the Street: same writers, same year, same kind of bridge. Two tunes for one set of grips.',
    ],
  },
  { id: 'on-the-sunny-side-of-the-street', title: 'On the Sunny Side of the Street', composer: 'Jimmy McHugh & Dorothy Fields', key: 'C', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 110, tempoHi: 160, tier: 3,
    why: 'Its opening is a surprise — the I, then a dominant on the 3rd, then the IV instead of where the ear expects. A tune that teaches you to listen.',
    facts: [
      'Introduced in Lew Leslie’s International Revue in 1930 — the same short-lived show that gave us Exactly Like You.',
      'It is credited to McHugh and Fields, but a long-running rumour says Fats Waller wrote the melody and sold it for quick cash. Fields’s lyric has never been in doubt; the music’s authorship has never been settled.',
      'It opens the way Georgia on My Mind does, I to III7 — then lands on IV rather than the chord that III7 points at.',
    ],
    guitar: [
      'In C the III7 is E7 and the surprise landing is F. Take an E7 grip with its root on the 5th string at the 7th fret and the F a fret above — the surprise is one fret under your hand.',
      'The bridge is the same as Exactly Like You’s: a dominant falling to its IV, then a II7 falling to V7. Learn the two tunes as a pair.',
      'The melody spans an octave and a third. Play it in one position on the top strings, then take it up an octave — the high register is where it sings on the guitar.',
    ],
  },
  { id: 'bye-bye-blackbird', title: 'Bye Bye Blackbird', composer: 'Ray Henderson & Mort Dixon', key: 'F', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 110, tempoHi: 160, tier: 3,
    why: 'Almost all I–IV and ii–V–I, with a melody inside an octave — a Miles Davis tune you can learn in an afternoon.',
    facts: [
      'Written in 1926 by Ray Henderson (music) and Mort Dixon (words). Gene Austin had the hit that year, twelve weeks on the charts.',
      'Miles Davis recorded it in June 1956 for ’Round About Midnight, released by Columbia in 1957, with John Coltrane, Red Garland, Paul Chambers and Philly Joe Jones.',
      'The melody stays inside less than an octave. Its one surprise is a downward tritone leap three bars from the end.',
    ],
    guitar: [
      'In the later sections the half-diminished chord is often replaced by a minor 6th built a minor third higher — and the two are the same four notes. On guitar that is one grip with two names.',
      'With a range under an octave, the whole head fits in one position without a shift. Find that position, then find it again an octave up the neck.',
      'Comp it in two places — around the 1st fret and around the 8th — so the next chord is never more than a fret or two away.',
    ],
  },
  { id: 'if-i-had-you', title: 'If I Had You', composer: 'Ted Shapiro, Jimmy Campbell & Reg Connelly', key: 'Bb', form: 'AABA', bars: 32,
    feel: 'Medium swing or ballad', tempoLo: 90, tempoHi: 160, tier: 3,
    why: 'A major AABA whose bridge sits in D minor — a false key change you have to hear coming.',
    facts: [
      'Published in 1928 under the name “Irving King” — the pen name of the British team Jimmy Campbell and Reg Connelly — with Ted Shapiro, Sophie Tucker’s pianist and musical director.',
      'Rudy Vallée and Al Bowlly both had hits with it in 1929. Frank Sinatra swung it on A Swingin’ Affair in 1957.',
      'The bridge is a minor ii–V–i in D minor played three times, then a circle of fifths back to the home key’s V7 — a false key change rather than a real one.',
    ],
    guitar: [
      'The bridge is one minor ii–V–i three times. Learn a single set of grips for it — half-diminished, dominant, minor — and play it three times without moving your hand.',
      'The opening moves like Cherokee’s: from the tonic, through a ii–V into the IV, then to a minor iv. Hold the top note and change only the inner voices, so you hear a line move inside the chord.',
    ],
  },
  { id: 'dream-a-little-dream-of-me', title: 'Dream a Little Dream of Me', composer: 'Fabian Andre, Wilbur Schwandt & Gus Kahn', key: 'G', form: 'AABA', bars: 32,
    feel: 'Medium-slow swing', tempoLo: 90, tempoHi: 140, tier: 3,
    why: 'A gentle AABA with a clear bridge — slow enough to think, and everybody in the room can sing it.',
    facts: [
      'Music by Fabian Andre and Wilbur Schwandt, words by Gus Kahn. The first records came in February 1931, from Ozzie Nelson’s band and from Wayne King’s orchestra.',
      'Its biggest hit came 37 years later: Cass Elliot sang it with the Mamas & the Papas in 1968, and it went to number one in Australia.',
    ],
    guitar: [
      'Work it up as a chord melody: tune on the top string, a three-note voicing under each new melody note, and let it ring.',
      'Comp it in two first — thumb on a bass note on 1 and 3, a short chord on 2 and 4 — then go to four to the bar for the last chorus.',
    ],
  },
  { id: 'frim-fram-sauce', title: 'The Frim Fram Sauce', composer: 'Joe Ricardel & Redd Evans', key: 'Bb', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 110, tempoHi: 160, tier: 3,
    why: 'A jive novelty that is really a trio feature — the King Cole Trio sound, piano, guitar and bass, in one tune.',
    facts: [
      'Written in 1945 by Joe Ricardel (music) and Redd Evans (words). The King Cole Trio recorded it in Los Angeles on 11 October 1945 and took it to number 19 on the Billboard chart.',
      'The trio then was Nat Cole on piano, Oscar Moore on guitar and Johnny Miller on bass — no drums at all.',
      'Ella Fitzgerald and Louis Armstrong cut it as a duet in 1946, leaning hard on the scat singing.',
    ],
    guitar: [
      'Oscar Moore’s chair is the one to study: with no drummer, the guitar keeps time with the bass. Comp in short, even quarter notes on the middle strings and leave room for the piano.',
      'Learn it next to No Moon at All — same lyricist, same trio, and between them a major and a minor AABA to comp through.',
    ],
  },
  { id: 'if-i-could-be-with-you', title: 'If I Could Be with You (One Hour Tonight)', composer: 'James P. Johnson & Henry Creamer', key: 'Eb', form: 'ABAC', bars: 32,
    feel: 'Medium swing', tempoLo: 110, tempoHi: 170, tier: 3,
    why: 'ABAC, major throughout, home round the circle of fifths and a II7–V7–I to finish — the 1920s song form in its plainest dress.',
    facts: [
      'Music by the stride pianist James P. Johnson, words by Henry Creamer, published in 1926. Eva Taylor made the first record, with Clarence Williams’ Blue Five, in 1927.',
      'In 1930 McKinney’s Cotton Pickers took it to number one and made it their theme song, and Louis Armstrong’s Okeh record charted the same year.',
      'It was one of Johnson’s biggest hits, and its royalties helped carry him through the Depression.',
    ],
    guitar: [
      'The way back from the B section is a chain of dominants round the circle of fifths. Alternate a root-on-6 grip and a root-on-5 grip as you go and your hand barely moves.',
      'E♭ is a horn key that sits well on guitar with root-on-5 grips around the 6th fret. Learn it there before you look for anything nearer the nut.',
    ],
  },
  { id: 'l-o-v-e', title: 'L-O-V-E', composer: 'Bert Kaempfert & Milt Gabler', key: 'G', form: 'ABAC', bars: 32,
    feel: 'Medium-up swing', tempoLo: 140, tempoHi: 180, tier: 3,
    why: 'A spelled-out love song that steps up a half step, then another, near the end — practice at changing key without stopping.',
    facts: [
      'Bert Kaempfert wrote the music; it first appeared as an instrumental on his 1964 album Blue Midnight. Milt Gabler wrote the words.',
      'Nat King Cole recorded it on 3 June 1964. It became the title track of L-O-V-E, his last studio album, released in 1965 shortly before his death that February.',
      'Cole also sang it in other languages for international editions of the album — in French it became “Je ne repartirai pas”.',
    ],
    guitar: [
      'Cole’s version goes up a half step and then another. Learn the changes with movable grips only, no open strings, so each key change is your hand sliding up one fret.',
      'The melody comes in short phrases with space between them. Comp into the gaps with light four-to-the-bar chords and get out of the way when the tune comes back.',
    ],
  },
  { id: 'blue-skies', title: 'Blue Skies', composer: 'Irving Berlin', key: 'G', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 140, tempoHi: 200, tier: 3,
    why: 'Each A section starts in the relative minor and walks to the major over a falling chromatic bass — minor and major in eight bars.',
    facts: [
      'Irving Berlin wrote it in 1926, and Belle Baker had it put into Rodgers and Hart’s musical Betsy — to their annoyance. On opening night, 28 December 1926, the audience demanded some two dozen encores.',
      'On the last of them Baker reportedly forgot the words, and Berlin sang them for her from his seat in the front row. Betsy itself closed after 39 performances.',
      'Al Jolson sang it in The Jazz Singer (1927), the first feature film with synchronised singing.',
    ],
    guitar: [
      'The A-section harmony rides a chromatic bass line falling a fret at a time. Voice it with the bass on the 6th or 5th string moving down and the top notes held — the line does the work.',
      'In G each A section starts on E minor. Learn the walk from that chord in one position, then again five frets up, so you can play it wherever the melody sits.',
      'The bridge is simpler and busier, rising to the dominant and back. Lighten the comping there so the contrast with the A sections is audible.',
    ],
  },
  { id: 'no-moon-at-all', title: 'No Moon at All', composer: 'David Mann & Redd Evans', key: 'Em', form: 'AABA', bars: 32,
    feel: 'Medium swing', tempoLo: 120, tempoHi: 170, tier: 3,
    why: 'A minor-key AABA at a relaxed swing — the cool late-1940s vocal sound, and a break from the major-key tunes.',
    facts: [
      'Written in 1947 by David Mann (music) and Redd Evans (words); Doris Day sang the first vocal version.',
      'The King Cole Trio recorded it in New York on 3 November 1947.',
      'Redd Evans also wrote the words to The Frim Fram Sauce, so both lyrics ended up in the King Cole Trio’s book.',
    ],
    guitar: [
      'E minor is home turf on guitar: the tonic sits open and at the 12th fret on the 6th string, and at the 7th fret on the 5th. Pick one position and stay in it for a whole chorus.',
      'Keep the comping cool and sparse — short, damped chords on 2 and 4 — and let the bass carry the line.',
    ],
  },
  { id: 'softly-as-in-a-morning-sunrise', title: 'Softly, As in a Morning Sunrise', composer: 'Sigmund Romberg & Oscar Hammerstein II', key: 'Cm', form: 'AABA', bars: 32,
    feel: 'Medium swing or latin', tempoLo: 140, tempoHi: 220, tier: 3,
    why: 'Minor A sections, a bridge in the relative major — the minor AABA every jam knows.',
    facts: [
      'From Romberg and Hammerstein’s operetta The New Moon (1928), where it was written as a tango, in 2/4.',
      'Its A sections are the minor version of I–VI–ii–V; the bridge starts the same way in the relative major and ends on a deceptive cadence.',
      'John Coltrane’s quartet with McCoy Tyner recorded it at the Village Vanguard in November 1961. The open, modal way most players take it now traces back to that.',
    ],
    guitar: [
      'Many players take the A sections latin and swing the bridge. Practise the switch: straight-eighth comping on the minor chords, then four to the bar when the bridge arrives.',
      'Over the A sections, the C minor pentatonic box with its root at the 8th fret of the 6th string covers the tune. Add the 2nd and 6th for the modal colour modern versions go for.',
    ],
  },
  { id: 'im-in-the-mood-for-love', title: "I'm in the Mood for Love", composer: 'Jimmy McHugh & Dorothy Fields', key: 'C', form: 'AABA', bars: 32,
    feel: 'Ballad', tempoLo: 60, tempoHi: 100, tier: 3,
    why: 'A first ballad: an AABA built on I–ii–V, moving by step, with time to hear every chord.',
    facts: [
      'Written for the 1935 film Every Night at Eight, where Frances Langford introduced it; it became her signature song. Little Jack Little’s record went to number one.',
      'James Moody recorded it in Sweden in 1949. Eddie Jefferson later set words to Moody’s improvised solo, and “Moody’s Mood for Love” became a vocalese classic.',
      'Fields and McHugh were the team behind Exactly Like You and On the Sunny Side of the Street, five years earlier.',
    ],
    guitar: [
      'At ballad tempo, play it as a chord melody first: tune on top, a chord under each new melody note, and let the voicings ring.',
      'The melody moves mostly by step. Play it on one string to hear the steps, then in position; the big drop at the end of each A section is where to land on a chord tone.',
    ],
  },
  { id: 'stars-fell-on-alabama', title: 'Stars Fell on Alabama', composer: 'Frank Perkins & Mitchell Parish', key: 'G', form: 'AABA', bars: 32,
    feel: 'Ballad', tempoLo: 60, tempoHi: 100, tier: 3,
    why: 'A slow AABA ballad — the place to learn to play a melody, not just a progression.',
    facts: [
      'The title refers to the Leonid meteor shower seen over Alabama in November 1833, “the night the stars fell”, and seems to have been borrowed from Carl Carmer’s 1934 book of the same name.',
      'Guy Lombardo’s record, made in August 1934, spent four weeks at number one. Benny Goodman cut the first jazz version on 11 September 1934.',
      'The phrase went onto Alabama’s licence plates in 2002.',
    ],
    guitar: [
      'Play it as a solo chord melody: tune on the top string, a bass note with the thumb, and nothing in a hurry.',
      'Stan Getz recorded it in G. Practise holding a melody note with vibrato rather than picking it again — that is the difference between a ballad and a slow tune.',
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
