// Reference. The four skills, how the schedule works, and the jam mechanics —
// everything at a session that isn't the notes, which is usually what makes a
// first jam go badly even when you know the tune.
//
// Jam mechanics are deliberately NOT tracked as checklist items: most of them
// are learn-once, not per-tune, so scheduling them per tune would be noise.

import { useState } from 'react';
import { panel, GRADE_UI } from '../components/ui.jsx';
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

const Item = ({ term, color = '#fff', children }) => (
  <p style={{ margin: '0 0 10px' }}>
    <b style={{ color }}>{term}</b> — {children}
  </p>
);

// What each answer means, skill by skill: the jam test applied to it.
const SKILL_TEST = [
  ['Head', 'the melody once through, every note there, no stops.', 'you needed a peek, stopped, or guessed a phrase.'],
  ['Changes', 'comped the whole form with no hesitation at the bridge or the turnaround.', 'you hesitated, or hit a wrong chord and had to recover.'],
  ['Form', 'two choruses without losing your place — you knew where bar 1 was each time.', 'you lost count, or came in early or late at the top.'],
  ['Solo', 'two choruses where your lines landed on the changes.', 'you lost the changes, or noodled without hearing them.'],
];

export default function GuideTab() {
  const [open, setOpen] = useState('skills');
  const t = id => () => setOpen(o => (o === id ? null : id));

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>Guide</div>
      <p style={{ fontSize: '12px', color: '#999', lineHeight: 1.6, margin: '0 0 14px' }}>
        What the four skills mean, how a tune moves from learning to learned, how the reviews work, and the things at a jam that nobody explains.
      </p>

      <Section title="The four skills" open={open === 'skills'} onToggle={t('skills')}>
        <p style={{ margin: '0 0 10px' }}>
          Knowing a tune is not one thing. Each of these is tracked separately, so the changes
          to a tune you play weekly can stay solid while its head quietly comes due.
        </p>
        {SKILLS.map(s => <Item key={s.id} term={s.label}>{s.blurb}</Item>)}
        <p style={{ margin: '10px 0 0', color: '#888' }}>
          A tune counts as <b style={{ color: ACCENT }}>learned</b> once all four are solid at the
          same time — three Got its in a row each.
        </p>
        <p style={{ margin: '10px 0 0', color: '#888' }}>
          Not every tune needs all four. On a tune&rsquo;s page you can switch a skill off — the head
          of a vocal tune you only ever comp on, say. It stops coming up in Today and stops counting
          toward learned; its answers are kept, so switching it back on picks up where it was.
        </p>
      </Section>

      <Section title="Got it, Almost, Shaky" open={open === 'answers'} onToggle={t('answers')}>
        <p style={{ margin: '0 0 10px' }}>
          Play the skill with the chart out of sight — a backing track is fine — then ask one
          question: could I play this at a jam tonight?
        </p>
        <Item term="Got it" color={GRADE_UI.got.text}>yes: from memory, in time, through the whole
          form without stopping, and at least at the slow end of the tune&rsquo;s tempo range.</Item>
        <Item term="Almost" color={GRADE_UI.almost.text}>you got through it from memory, but with
          slips — a hesitation, a fumble you recovered from, or slower than the tempo range.</Item>
        <Item term="Shaky" color={GRADE_UI.shaky.text}>you couldn&rsquo;t get through it: you
          needed the chart, stopped, or got lost.</Item>
        <p style={{ margin: '4px 0 6px', color: '#fff', fontWeight: 700 }}>Skill by skill, Got it means&hellip;</p>
        {SKILL_TEST.map(([skill, got, shaky]) => (
          <p key={skill} style={{ margin: '0 0 8px' }}>
            <b style={{ color: '#fff' }}>{skill}</b> — {got} <span style={{ color: '#888' }}>Shaky if {shaky}</span>
          </p>
        ))}
        <p style={{ margin: '6px 0 0', color: '#888' }}>
          Anything between the two is Almost. Grade honestly — the schedule is only as good as the
          grading, and the person it fools is you.
        </p>
      </Section>

      <Section title="How the reviews work" open={open === 'srs'} onToggle={t('srs')}>
        <p style={{ margin: '0 0 10px' }}>
          Spaced repetition: each answer decides when that skill comes back. While you are still
          learning a skill:
        </p>
        <Item term="Got it" color={GRADE_UI.got.text}>back in a day, then six days, then further
          out each time (15, 38&hellip;). Three in a row and the skill is solid.</Item>
        <Item term="Almost" color={GRADE_UI.almost.text}>back in two days, then a day longer each
          time, up to six. It doesn&rsquo;t count toward solid, but it doesn&rsquo;t break your run
          of Got its either.</Item>
        <Item term="Shaky" color={GRADE_UI.shaky.text}>back tomorrow, and your run of Got its
          starts again. Being shaky while learning is normal, so it costs nothing later.</Item>
        <p style={{ margin: '0 0 10px' }}>
          Once a skill is solid, <b style={{ color: GRADE_UI.almost.text }}>Almost</b> brings it back
          in half the time it had been away (at least three days), and it stays solid.{' '}
          <b style={{ color: GRADE_UI.shaky.text }}>Shaky</b> means you really did lose it: back
          tomorrow, and it has to be built up again.
        </p>
        <p style={{ margin: '0 0 10px' }}>
          Left alone, the gaps would keep growing — past a year for a tune you know well. Not
          forgetting means hearing from every tune now and then, so the gap stops at a ceiling:
          two months unless you change it in <b style={{ color: '#fff' }}>Settings</b>.
        </p>
        <p style={{ margin: '0 0 10px' }}>
          Nothing is scheduled until you take a tune on, so browsing the core path costs you
          nothing. Take on one tune at a time; four cards each adds up faster than it looks.
        </p>
        <p style={{ margin: '0 0 10px' }}>
          One answer per skill per day: tapping again changes today&rsquo;s answer rather than
          adding another. Every answer is kept under <b style={{ color: '#fff' }}>History</b> on
          the tune&rsquo;s page. Change one to a different answer, move it to another day or
          delete it, and the schedule is worked out again as if you had answered that way at the
          time.
        </p>
      </Section>

      <Section title="Learning, learned, needs a refresher" open={open === 'stages'} onToggle={t('stages')}>
        <p style={{ margin: '0 0 10px' }}>
          This app sits beside iReal Pro, forScore and your Real Book rather than replacing them:
          they hold the music, this keeps track of what you know. Every tune you take on is in one
          of three places, and the Tunes tab&rsquo;s <b style={{ color: '#fff' }}>Mine</b> list is
          grouped by them.
        </p>
        <Item term="Learning">taken on, but not yet solid on all its skills at once. Its cards
          come up in Today like any other — practise it in whichever app you use, then grade it.</Item>
        <Item term="In repertoire">all its skills have been solid together, and nothing is due.
          It comes back on its own.</Item>
        <Item term="Needs a refresher">learned, but a skill is due or has slipped. A slip does not
          send a tune back to Learning — you learned it once, and it is a refresher you need.</Item>
        <p style={{ margin: 0 }}>
          <b style={{ color: '#fff' }}>Up next</b> is a plain list of what you plan to learn, so the
          repertoire grows in a direction. Add a tune from its page; starting it takes it off.
          Progress keeps the other end: every tune you have learned, and the day you learned it.
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
