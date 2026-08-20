// Reference. The four skills, how the schedule works, and the jam mechanics —
// everything at a session that isn't the notes, which is usually what makes a
// first jam go badly even when you know the tune.
//
// Jam mechanics are deliberately NOT tracked as checklist items: most of them
// are learn-once, not per-tune, so scheduling them per tune would be noise.

import { useState } from 'react';
import { panel, labelCss } from '../components/ui.jsx';
import { ACCENT } from '../lib/tool.js';
import { SKILLS } from '../data/tunes.js';

function Section({ title, children, open, onToggle }) {
  return (
    <div style={{ ...panel, marginBottom: '10px', padding: 0, overflow: 'hidden' }}>
      <button onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '14px', fontWeight: 700, textAlign: 'left' }}>
        <span style={{ color: ACCENT, fontSize: '11px' }}>{open ? '▾' : '▸'}</span>
        <span style={{ flex: 1 }}>{title}</span>
      </button>
      {open && <div style={{ padding: '0 12px 14px', fontSize: '13px', color: '#bbb', lineHeight: 1.7 }}>{children}</div>}
    </div>
  );
}

const Item = ({ term, children }) => (
  <p style={{ margin: '0 0 10px' }}>
    <b style={{ color: '#fff' }}>{term}</b> — {children}
  </p>
);

export default function GuideTab() {
  const [open, setOpen] = useState('skills');
  const t = id => () => setOpen(o => (o === id ? null : id));

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>Guide</div>
      <p style={{ fontSize: '12px', color: '#999', lineHeight: 1.6, margin: '0 0 14px' }}>
        What the four skills mean, how the reviews work, and the things at a jam that nobody explains.
      </p>

      <Section title="The four skills" open={open === 'skills'} onToggle={t('skills')}>
        <p style={{ margin: '0 0 10px' }}>
          Knowing a tune is not one thing. Each of these is tracked separately, so the changes
          to a tune you play weekly can stay solid while its head quietly comes due.
        </p>
        {SKILLS.map(s => <Item key={s.id} term={s.label}>{s.blurb}</Item>)}
        <p style={{ margin: '10px 0 0', color: '#888' }}>
          A tune counts as <b style={{ color: ACCENT }}>jam ready</b> when all four have been
          got right at least twice.
        </p>
      </Section>

      <Section title="How the reviews work" open={open === 'srs'} onToggle={t('srs')}>
        <p style={{ margin: '0 0 10px' }}>
          Spaced repetition. Get a card right and it comes back later each time — a day, then
          six, then further out. Mark it shaky and it returns tomorrow.
        </p>
        <p style={{ margin: '0 0 10px' }}>
          Nothing is scheduled until you take a tune on, so browsing the core path costs you
          nothing. Take on one tune at a time; four cards each adds up faster than it looks.
        </p>
        <p style={{ margin: 0, color: '#888' }}>
          Grade honestly. The schedule is only as good as the grading, and the person it fools
          is you.
        </p>
      </Section>

      <Section title="Why you type the changes in" open={open === 'why'} onToggle={t('why')}>
        <p style={{ margin: '0 0 10px' }}>
          The app ships each tune's facts — key, form, bar count, feel, tempo — because those are
          facts. The melodies and the changes are under copyright, so they are not shipped and
          never will be.
        </p>
        <p style={{ margin: '0 0 10px' }}>
          Write them out yourself from your Real Book or by ear. It is not a workaround: copying
          out a form bar by bar is one of the more effective ways to learn it.
        </p>
        <p style={{ margin: '0 0 10px' }}>
          The exception is the <strong>form templates</strong>. The twelve-bar blues and rhythm
          changes are shared idioms rather than anyone's composition — that is why contrafacts
          exist, and why Oleo can be built on I Got Rhythm. Those ship, written as degrees so they
          work in any key, and an empty grid offers whichever ones fit the tune's form. Treat one
          as a starting point, never as the answer: C Jam Blues, Blue Monk and Billie's Bounce are
          all “a 12-bar blues” and all three differ, which is exactly why they are separate tunes
          here. The app keeps saying so until you tell it you have checked.
        </p>
        <p style={{ margin: 0 }}>
          Open a tune and tap a bar in the grid. The grid comes pre-shaped from the tune's form —
          an AABA 32 gives you four eight-bar sections — so the shape is right before you start.
          Two chords in one bar is just two words in the cell. The keypad above the keyboard has
          the symbols a phone cannot type: {'Δ'} {'ø'} {'°'} {'♭'} {'♯'}. Where a section repeats,
          its heading offers to copy the one above, which you can then edit — the last bars of a
          second A are usually where it differs.
        </p>
      </Section>

      <Section title="Jam mechanics — everything that isn't the notes" open={open === 'jam'} onToggle={t('jam')}>
        <p style={{ margin: '0 0 12px', color: '#888' }}>
          Not tracked here, because most of it is learn-once rather than per-tune. Read it before
          your first session.
        </p>
        <Item term="Calling a tune">
          Say the title, the key, and the feel, in that order: “Autumn Leaves, G minor, medium
          swing.” Stating the key is the bit people forget.
        </Item>
        <Item term="Counting it off">
          You set the tempo and count it in yourself. Swing is “1… 2… 1-2-3-4”, not a flat four.
          Start slower than you think — nerves push tempos up.
        </Item>
        <Item term="Head, solos, head">
          Melody once through, then solos in rotation, then the melody again to end. Know when
          you are up, and know to come back in for the head.
        </Item>
        <Item term="Taking or passing a solo">
          Signalled by eye contact and a nod, not words. You can decline — pointing at the next
          player is a complete sentence.
        </Item>
        <Item term="Comping behind a soloist">
          The guitar trap. If there is a piano, two people comping is mud: lay out, or play far
          sparser and quieter. Knowing when <i>not</i> to play is the skill.
        </Item>
        <Item term="Trading fours">
          After the last solo, alternate four-bar phrases with the drummer. The form keeps
          running underneath, so keep counting.
        </Item>
        <Item term="Intros and endings">
          Most tunes have a default: the tag (last four bars, three times), a ritard, a Basie
          ending. “Who is taking the intro?” is a normal question, not an admission.
        </Item>
        <Item term="Not losing the form">
          The most common wipeout. Count bars while you solo so you always know where bar 1 of
          the next chorus is. If you get lost, stop playing and listen for the top.
        </Item>
        <Item term="Etiquette">
          Two or three choruses, not six. No noodling between tunes. Plug in quietly. Say yes
          when someone calls something you half-know — that is how you learn it.
        </Item>
      </Section>
    </div>
  );
}
