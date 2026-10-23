// One tune: the facts it ships with, the four skills and where they stand,
// its answer history, and your notes. The chart itself lives in iReal Pro or
// forScore — this app tracks what you know, not the music.

import { useState } from 'react';
import { btn, panel, labelCss, TextArea } from './ui.jsx';
import AnswerHistory from './AnswerHistory.jsx';
import { StageBadge, UP_NEXT } from './TuneStatus.jsx';
import { ACCENT } from '../lib/tool.js';
import { cardId, isSkillSolid, todayStr, tuneStage, relativeDay, gradedToday } from '../lib/srs.js';

export default function TuneDetail({ tune, active, upNext, srs, notes, skills, onBack, onActivate, onDeactivate, onSetNote, onToggleNext, onGrade, onUngrade, onEditAnswer, onDeleteAnswer, onClearEarlier, onRemoveCustom }) {
  const today = todayStr();
  const isActive = active.includes(tune.id);
  const planned = !isActive && upNext.includes(tune.id);
  const stage = isActive ? tuneStage(srs, tune.id, skills, today) : planned ? 'next' : null;
  const ready = stage === 'repertoire';
  const [confirmDrop, setConfirmDrop] = useState(false);

  const fact = (k, v) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '12px', padding: '3px 0' }}>
      <span style={{ color: '#888' }}>{k}</span>
      <span style={{ color: '#ddd', textAlign: 'right' }}>{v}</span>
    </div>
  );

  return (
    <div style={{ padding: '14px', maxWidth: '640px', margin: '0 auto' }}>
      <button onClick={onBack} style={{ ...btn(false), marginBottom: '12px' }}>← All tunes</button>

      <div style={{ ...panel, marginBottom: '12px', borderColor: ready ? ACCENT + '66' : '#2a2840' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>{tune.title}</div>
          <StageBadge stage={stage} />
        </div>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{tune.composer}</div>
        <div style={{ marginTop: '10px', borderTop: '1px solid #1a1928', paddingTop: '8px' }}>
          {fact('Usual key', tune.key === 'modal' ? 'modal — no single key' : tune.key)}
          {fact('Form', `${tune.form === 'through' ? 'through-composed' : tune.form} · ${tune.bars} bars`)}
          {fact('Feel', tune.feel)}
          {fact('Tempo', `${tune.tempoLo}–${tune.tempoHi} bpm`)}
        </div>
        {tune.why && <div style={{ fontSize: '12px', color: '#bbb', marginTop: '10px', lineHeight: 1.6, fontStyle: 'italic' }}>{tune.why}</div>}
      </div>

      {/* Two panels rather than one: the facts are why the tune is interesting,
          the guitar notes are what to do about it on this instrument. Mixing
          them would bury the practical half under the trivia. */}
      {tune.facts?.length > 0 && (
        <div style={{ ...panel, marginBottom: '12px' }}>
          <div style={labelCss}>Worth knowing</div>
          <ul style={{ margin: 0, paddingLeft: '17px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tune.facts.map((f, i) => (
              <li key={i} style={{ fontSize: '12.5px', color: '#c8c6da', lineHeight: 1.65 }}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {tune.guitar?.length > 0 && (
        <div style={{ ...panel, marginBottom: '12px', borderColor: ACCENT + '33' }}>
          <div style={{ ...labelCss, color: ACCENT }}>On guitar</div>
          <ul style={{ margin: 0, paddingLeft: '17px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tune.guitar.map((g, i) => (
              <li key={i} style={{ fontSize: '12.5px', color: '#c8c6da', lineHeight: 1.65 }}>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {!isActive ? (
        <div style={{ ...panel, marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#bbb', marginBottom: '10px', lineHeight: 1.6 }}>
            Taking this on creates its four review cards. Nothing is scheduled until you do.
          </div>
          <button onClick={() => onActivate(tune.id)} style={{ ...btn(true), width: '100%', padding: '12px' }}>Start learning this</button>
          {/* Planning, not practice: a list of what to learn next, so growing
              the repertoire has a direction. Starting the tune takes it off. */}
          <button onClick={() => onToggleNext(tune.id)}
            style={{ ...btn(planned, UP_NEXT.colour), width: '100%', marginTop: '8px', minHeight: '40px', color: planned ? '#ddd' : '#999' }}>
            {planned ? '✓ On your Up next list — remove' : '+ Add to Up next'}
          </button>
        </div>
      ) : (
        <div style={{ ...panel, marginBottom: '12px' }}>
          <div style={labelCss}>The four skills</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {skills.map(s => {
              const id = cardId(tune.id, s.id);
              const card = srs[id];
              const solid = isSkillSolid(card);
              // Answered today: the chosen button stays lit and a line says it
              // was saved. Tapping again does not grade twice — the other button
              // changes today's answer instead (lib/srs.js gradeCard).
              const done = gradedToday(card, today);
              const pick = (ok, color, ink) => done && card.lastOk === ok
                ? { ...btn(true, color), flex: 1, background: color, color: ink, borderColor: color, fontWeight: 800 }
                : { ...btn(false, color), flex: 1, color: ok ? '#00b894' : '#ff8f8f', borderColor: color + '44' };
              return (
                <div key={s.id} style={{ background: '#0f0e17', border: `1px solid ${solid ? ACCENT + '55' : '#2a2840'}`, borderRadius: '9px', padding: '9px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: solid ? ACCENT : '#555', fontSize: '14px' }}>{solid ? '●' : '○'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', flex: 1 }}>{s.label}</span>
                    <span style={{ fontSize: '10px', color: '#888', fontFamily: 'var(--font-mono)' }}>{relativeDay(card?.nextDue, today)}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', margin: '4px 0 7px', lineHeight: 1.5 }}>{s.blurb}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => onGrade(id, true)} aria-pressed={done && card.lastOk === true} style={pick(true, '#00b894', '#04241c')}>{done && card.lastOk ? '✓ Got it' : 'Got it'}</button>
                    <button onClick={() => onGrade(id, false)} aria-pressed={done && card.lastOk === false} style={pick(false, '#ff6363', '#2a0808')}>{done && !card.lastOk ? '✓ Shaky' : 'Shaky'}</button>
                  </div>
                  {done && (
                    <div key={String(card.lastOk)} className="st-pop" role="status" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '7px', fontSize: '11px', color: '#aaa', lineHeight: 1.5 }}>
                      <span style={{ flex: 1 }}>
                        <b style={{ color: card.lastOk ? '#00b894' : '#ff8f8f' }}>Saved for today</b> — next review {relativeDay(card.nextDue, today)}. Tap the other button to change it.
                      </span>
                      <button onClick={() => onUngrade(id)} style={{ ...btn(false), minHeight: '40px', padding: '6px 12px', color: '#bbb' }}>Undo</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isActive && <AnswerHistory tune={tune} srs={srs} skills={skills} today={today} onEdit={onEditAnswer} onDelete={onDeleteAnswer} onClearEarlier={onClearEarlier} />}

      <div style={{ ...panel, marginBottom: '12px' }}>
        <TextArea label="Notes" value={notes[tune.id] || ''} onChange={v => onSetNote(tune.id, v)}
          rows={5}
          placeholder={'Which recording, which iReal Pro or forScore chart, a fingering, the intro, what went wrong last time.'} />
      </div>

      {isActive && (
        <div style={{ ...panel }}>
          {confirmDrop ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { onDeactivate(tune.id); setConfirmDrop(false); onBack(); }} style={{ ...btn(true, '#ff6363'), flex: 1 }}>Drop it — loses the schedule and history</button>
              <button onClick={() => setConfirmDrop(false)} style={btn(false)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDrop(true)} style={{ ...btn(false, '#ff6363'), width: '100%', color: '#ff8f8f', borderColor: '#ff636333' }}>
              Drop from repertoire
            </button>
          )}
          {tune.custom && !confirmDrop && (
            <button onClick={() => { onRemoveCustom(tune.id); onBack(); }} style={{ ...btn(false), width: '100%', marginTop: '8px', color: '#888' }}>
              Delete this tune entirely
            </button>
          )}
          <div style={{ fontSize: '10px', color: '#666', marginTop: '8px' }}>Your notes are kept either way.</div>
        </div>
      )}
    </div>
  );
}
