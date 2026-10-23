// What is due today, as a list you can work through in any order.
//
// It used to be one card at a time: answer it and the next appeared, so the
// queue decided what you practised. Zak practises a tune at a time, in
// iReal Pro or forScore, and wants to choose which tune and which skill — so
// every due tune is a card with its due skills on it, each answered on its
// own, and a row of skill chips narrows the list to one area across all tunes.
//
// The set is still snapshotted at mount (as Focused Chord Trainer's TodayTab
// does): grading moves a skill's due date, and without the snapshot the row
// you just answered would vanish and the list would jump under your thumb.
// Answered rows stay where they are, showing the result and the next review,
// with Undo — that is also the feedback that a tap registered.

import { useState, useMemo } from 'react';
import { btn, panel, labelCss, EmptyState } from '../components/ui.jsx';
import { ACCENT } from '../lib/tool.js';
import { dueCards, todayStr, relativeDay } from '../lib/srs.js';

const GOT = '#00b894', SHAKY = '#ff6363';

// One skill on one tune. Unanswered: what it asks, and the two answers.
// Answered: one line with the result, when it comes back, and Undo.
function SkillRow({ card, skill, result, nextDue, today, onAnswer, onUndo }) {
  const answered = result !== undefined;
  return (
    <div style={{ borderTop: '1px solid #1f1d2e', padding: '9px 0' }}>
      {answered ? (
        <div className="st-pop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#bbb', minWidth: '62px' }}>{skill?.label || card.skill}</span>
          <span role="status" style={{ flex: 1, fontSize: '11.5px', color: '#999', lineHeight: 1.4 }}>
            <b style={{ color: result ? GOT : '#ff8f8f' }}>{result ? '✓ Got it' : '↺ Shaky'}</b> · back {relativeDay(nextDue, today)}
          </span>
          <button onClick={onUndo} style={{ ...btn(false), minHeight: '40px', padding: '6px 12px', color: '#bbb' }}>Undo</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
              {skill?.label || card.skill}
              {card.fresh && <span style={{ fontSize: '10px', fontWeight: 700, color: ACCENT, marginLeft: '6px' }}>first time</span>}
            </div>
            <div style={{ fontSize: '11px', color: '#888', lineHeight: 1.45, marginTop: '2px' }}>{skill?.blurb}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button onClick={() => onAnswer(true)} style={{ ...btn(true, GOT), minHeight: '42px', padding: '6px 10px' }}>Got it</button>
            <button onClick={() => onAnswer(false)} style={{ ...btn(true, SHAKY), minHeight: '42px', padding: '6px 10px' }}>Shaky</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TodayTab({ byId, active, srs, notes, skills, onGrade, onUngrade, onGoTunes, onGoTune }) {
  // Snapshot: computed once, from the schedule as it stood when the tab opened.
  const [queue] = useState(() => dueCards(srs, active, skills));
  const [done, setDone] = useState({});     // cardId -> true|false, this visit
  const [only, setOnly] = useState(null);   // a skill id, or null for all
  const today = todayStr();
  const skillById = useMemo(() => new Map(skills.map(s => [s.id, s])), [skills]);
  const skillOrder = useMemo(() => new Map(skills.map((s, i) => [s.id, i])), [skills]);

  // One card per tune, in the order its most pressing skill came due (the
  // queue is longest-overdue first, never-seen last); its skills in their
  // usual order.
  const tunes = useMemo(() => {
    const m = new Map();
    for (const c of queue) { if (!m.has(c.tuneId)) m.set(c.tuneId, []); m.get(c.tuneId).push(c); }
    return [...m].map(([tuneId, cards]) => ({ tuneId, cards: cards.sort((a, b) => skillOrder.get(a.skill) - skillOrder.get(b.skill)) }));
  }, [queue, skillOrder]);

  const answer = (id, correct) => { onGrade(id, correct); setDone(d => ({ ...d, [id]: correct })); };
  const undo = id => { onUngrade(id); setDone(d => { const { [id]: _gone, ...rest } = d; return rest; }); };

  if (active.length === 0) {
    return <EmptyState icon="🌅" title="Nothing to practise yet"
      body="Take a tune on from the Tunes tab and it starts showing up here — head, changes, form and solo, each on its own schedule."
      action="Pick a tune" onAction={onGoTunes} />;
  }

  const gradedCount = Object.keys(done).length;
  const remaining = queue.length - gradedCount;
  const left = id => queue.filter(c => done[c.id] === undefined && (!id || c.skill === id)).length;
  // Only the skills that actually have something due today get a chip.
  const dueSkills = skills.filter(s => queue.some(c => c.skill === s.id));

  if (queue.length === 0) {
    return (
      <div style={{ padding: '14px', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ ...panel, textAlign: 'center', padding: '26px 14px' }}>
          <div style={{ fontSize: '38px', marginBottom: '8px' }}>🌤</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '5px' }}>Nothing due today</div>
          <div style={{ fontSize: '12px', color: '#999', lineHeight: 1.6 }}>
            Everything you have taken on is still fresh. Add a tune, or go and play.
          </div>
        </div>
        <button onClick={onGoTunes} style={{ ...btn(false), width: '100%', marginTop: '12px', padding: '10px' }}>Browse tunes</button>
      </div>
    );
  }

  const chip = (id, label, n) => {
    const on = only === id;
    return (
      <button key={id || 'all'} onClick={() => setOnly(id)} aria-pressed={on}
        style={{ padding: '6px 11px', minHeight: '36px', borderRadius: '20px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 700, border: `1px solid ${on ? ACCENT : '#2a2840'}`, background: on ? ACCENT + '22' : '#13121f', color: on ? ACCENT : '#888', touchAction: 'manipulation' }}>
        {label} <span style={{ opacity: 0.7 }}>{n}</span>
      </button>
    );
  };

  const shown = tunes
    .map(t => ({ ...t, cards: only ? t.cards.filter(c => c.skill === only) : t.cards }))
    .filter(t => t.cards.length);

  return (
    <div style={{ padding: '14px', maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
        <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>Today</div>
        <div style={{ color: '#999', fontSize: '11px' }}>{remaining} to go{gradedCount ? ` · ${gradedCount} done` : ''}</div>
      </div>

      {/* Progress through the day */}
      <div style={{ height: '5px', background: '#13121f', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden', border: '1px solid #2a2840' }}>
        <div style={{ width: `${(gradedCount / queue.length) * 100}%`, height: '100%', background: ACCENT, transition: 'width .3s ease' }} />
      </div>

      {remaining === 0 ? (
        <div className="st-pop" style={{ ...panel, borderColor: ACCENT + '55', marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>✅ Done — {gradedCount} reviewed</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px', lineHeight: 1.6 }}>Come back tomorrow. Anything you marked shaky returns then.</div>
        </div>
      ) : (
        <div style={{ fontSize: '11.5px', color: '#888', lineHeight: 1.6, marginBottom: '10px' }}>
          Pick any tune and any skill. Play it — from memory, or along with iReal Pro — then answer honestly:
          the schedule is only as good as the grading.
        </div>
      )}

      {/* Work on one area across every tune */}
      {dueSkills.length > 1 && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {chip(null, 'All', left(null))}
          {dueSkills.map(s => chip(s.id, s.label, left(s.id)))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {shown.map(({ tuneId, cards }) => {
          const tune = byId.get(tuneId);
          const note = notes[tuneId];
          // One guitar tip per tune, a different one each day.
          const dayNo = Math.floor(Date.parse(today) / 86400000);
          const tip = tune?.guitar?.length ? tune.guitar[dayNo % tune.guitar.length] : null;
          const open = cards.filter(c => done[c.id] === undefined).length;
          return (
            <div key={tuneId} style={{ ...panel, padding: '11px 12px 4px', borderColor: open ? '#2a2840' : GOT + '44' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div onClick={() => onGoTune?.(tuneId)}
                    style={{ fontSize: '16px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1.25, cursor: onGoTune ? 'pointer' : 'default' }}>
                    {tune?.title || tuneId}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>
                    {tune ? `${tune.key === 'modal' ? 'modal' : tune.key} · ${tune.bars} bars · ${tune.feel}` : ''}
                  </div>
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: open ? '#e8a838' : GOT, whiteSpace: 'nowrap' }}>
                  {open ? `${open} to go` : '✓ done'}
                </span>
              </div>

              {cards.map(c => (
                <SkillRow key={c.id} card={c} skill={skillById.get(c.skill)} result={done[c.id]}
                  nextDue={srs[c.id]?.nextDue} today={today}
                  onAnswer={ok => answer(c.id, ok)} onUndo={() => undo(c.id)} />
              ))}

              {/* Behind a tap on purpose: your notes may hold the changes, and
                  the card asks you to play from memory — one tap away is the
                  difference between a hint and an answer key. */}
              {(tip || note) && (
                <details style={{ borderTop: '1px solid #1f1d2e', padding: '8px 0' }}>
                  <summary style={{ ...labelCss, marginBottom: 0, cursor: 'pointer' }}>
                    {note ? 'Guitar tip · your notes — peek only if stuck' : 'Guitar tip'}
                  </summary>
                  {tip && <div style={{ fontSize: '12.5px', color: '#c8c6da', lineHeight: 1.65, marginTop: '8px' }}>{tip}</div>}
                  {note && (
                    <pre style={{ fontSize: '12px', color: '#bbb', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '10px 0 0', lineHeight: 1.7 }}>{note}</pre>
                  )}
                </details>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '10px', color: '#666', marginTop: '12px', textAlign: 'center', lineHeight: 1.6 }}>
        Shaky brings it back tomorrow. Got it pushes it further out each time you get it right.
      </div>
    </div>
  );
}
