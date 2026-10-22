// Every answer behind one tune's schedule, newest first, each one editable.
//
// This is not a cosmetic log. The schedule is replayed from it (lib/srs.js
// `replay`), so turning an old Got it into Shaky pulls the next review in,
// exactly as if that is what you had said at the time — which is the point:
// a mis-tap three days ago should not keep a skill out of the queue for weeks.

import { useState } from 'react';
import { btn, panel, labelCss } from './ui.jsx';
import { ACCENT } from '../lib/tool.js';
import { historyOf, tuneHistory, earlierAnswers, relativeDay, dayLabel } from '../lib/srs.js';

const SHOW = 12;
const okColor = ok => (ok ? '#00b894' : '#ff8f8f');
const okText = ok => (ok ? '✓ Got it' : '↺ Shaky');
const small = { ...btn(false), minHeight: '40px', padding: '6px 12px', color: '#bbb' };

// The open entry. `taken` is the other days this skill already has an answer
// on, so moving the date onto one can be flagged before Save replaces it.
function Editor({ entry, skillLabel, taken, today, onSave, onDelete, onCancel }) {
  const [ok, setOk] = useState(entry.ok);
  const [d, setD] = useState(entry.d);
  const [confirm, setConfirm] = useState(false);
  const isDate = /^\d{4}-\d{2}-\d{2}$/.test(d);
  const future = isDate && d > today;
  const clash = isDate && d !== entry.d && taken.has(d);
  const pick = (val, color, ink) => ok === val
    ? { ...btn(true, color), flex: 1, background: color, color: ink, borderColor: color, fontWeight: 800 }
    : { ...btn(false, color), flex: 1, color: okColor(val), borderColor: color + '44' };

  return (
    <div className="st-pop" style={{ background: '#0f0e17', border: `1px solid ${ACCENT}55`, borderRadius: '9px', padding: '10px', margin: '4px 0' }}>
      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Edit — {skillLabel}</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => setOk(true)} aria-pressed={ok} style={pick(true, '#00b894', '#04241c')}>Got it</button>
        <button onClick={() => setOk(false)} aria-pressed={!ok} style={pick(false, '#ff6363', '#2a0808')}>Shaky</button>
      </div>
      <label style={{ display: 'block', marginTop: '9px' }}>
        <span style={{ ...labelCss, display: 'block', marginBottom: '4px' }}>Day</span>
        <input type="date" value={d} max={today} onChange={e => setD(e.target.value)}
          style={{ display: 'block', width: '100%', minHeight: '40px', background: '#13121f', border: '1px solid #2a2840', borderRadius: '8px', padding: '7px 10px', color: '#fff', colorScheme: 'dark', fontFamily: 'inherit' }} />
      </label>
      {future && <div style={{ fontSize: '11px', color: '#ff8f8f', marginTop: '6px' }}>That day hasn&rsquo;t happened yet.</div>}
      {clash && (
        <div style={{ fontSize: '11px', color: '#e8a838', marginTop: '6px', lineHeight: 1.5 }}>
          {skillLabel} already has an answer on {dayLabel(d, today)}. Saving replaces it — one answer per day.
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
        <button onClick={() => onSave({ ok, d })} disabled={!isDate || future}
          style={{ ...btn(true), flex: 1, minHeight: '40px', opacity: !isDate || future ? 0.4 : 1 }}>Save</button>
        <button onClick={onCancel} style={small}>Cancel</button>
      </div>
      {/* Two taps, because a deleted answer cannot be got back. */}
      {confirm ? (
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
          <button onClick={onDelete} style={{ ...btn(true, '#ff6363'), flex: 1, minHeight: '40px' }}>Delete for good</button>
          <button onClick={() => setConfirm(false)} style={small}>Keep it</button>
        </div>
      ) : (
        <button onClick={() => setConfirm(true)}
          style={{ ...btn(false, '#ff6363'), width: '100%', minHeight: '40px', marginTop: '6px', color: '#ff8f8f', borderColor: '#ff636333' }}>
          Delete this answer
        </button>
      )}
    </div>
  );
}

// Answers from before the history was kept can only be cleared, not edited:
// there is no list of them to edit, only the schedule they added up to.
function EarlierEditor({ skillLabel, listed, onClear, onCancel }) {
  return (
    <div className="st-pop" style={{ background: '#0f0e17', border: '1px solid #ff636355', borderRadius: '9px', padding: '10px', margin: '4px 0' }}>
      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Clear earlier answers — {skillLabel}</div>
      <div style={{ fontSize: '11.5px', color: '#aaa', lineHeight: 1.6 }}>
        These were saved before the history existed, as a running total rather than one by one — including
        taps the old version counted more than once. They can&rsquo;t be edited, only cleared.{' '}
        {listed
          ? `The schedule is then worked out from the ${skillLabel} answers listed above alone.`
          : `With nothing else listed, ${skillLabel} goes back to not started.`}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
        <button onClick={onClear} style={{ ...btn(true, '#ff6363'), flex: 1, minHeight: '40px' }}>Clear for good</button>
        <button onClick={onCancel} style={small}>Cancel</button>
      </div>
    </div>
  );
}

export default function AnswerHistory({ tune, srs, skills, today, onEdit, onDelete, onClearEarlier }) {
  const [editing, setEditing] = useState(null);   // `${cardId}|${day}`
  const [all, setAll] = useState(false);
  const [done, setDone] = useState(null);         // the last change, for the line that confirms it
  const list = tuneHistory(srs, tune.id, skills);
  const earlier = earlierAnswers(srs, tune.id, skills);
  const label = Object.fromEntries(skills.map(s => [s.id, s.label]));
  const shown = all ? list : list.slice(0, SHOW);

  // One heading per day; within it, the skills in their usual order.
  const days = [];
  for (const e of shown) {
    const g = days[days.length - 1];
    if (g && g.d === e.d) g.items.push(e); else days.push({ d: e.d, items: [e] });
  }

  const finish = (e, what) => { setEditing(null); setDone({ id: e.id, skill: e.skill, what, n: Date.now() }); };

  return (
    <div style={{ ...panel, marginBottom: '12px' }}>
      <div style={labelCss}>History</div>

      {done && (
        <div key={done.n} className="st-pop" role="status" style={{ fontSize: '11.5px', color: '#bbb', lineHeight: 1.5, background: ACCENT + '14', border: `1px solid ${ACCENT}33`, borderRadius: '8px', padding: '7px 9px', marginBottom: '8px' }}>
          <b style={{ color: ACCENT }}>{done.what}</b> — {label[done.skill]}
          {srs[done.id] ? `: next review ${relativeDay(srs[done.id].nextDue, today)}.` : ' is back to not started.'}
        </div>
      )}

      {list.length === 0 && earlier.length === 0 ? (
        <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>
          Nothing answered yet. Every Got it and Shaky lands here — one per skill per day — and can be changed or deleted later.
        </div>
      ) : (
        <div>
          {days.map(g => (
            <div key={g.d} style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '10.5px', color: '#777', fontWeight: 700, padding: '4px 0 2px', borderTop: '1px solid #1f1d2e' }}>{dayLabel(g.d, today)}</div>
              {g.items.map(e => {
                const k = `${e.id}|${e.d}`;
                if (editing === k) {
                  const taken = new Set(historyOf(srs[e.id]).hist.map(x => x.d).filter(x => x !== e.d));
                  return (
                    <Editor key={k} entry={e} skillLabel={label[e.skill]} taken={taken} today={today}
                      onCancel={() => setEditing(null)}
                      onSave={({ ok, d }) => {
                        if (ok === e.ok && d === e.d) { setEditing(null); return; }   // nothing changed: do not count an edit
                        onEdit(e.id, e.d, { ok, d });
                        finish(e, 'Saved');
                      }}
                      onDelete={() => { onDelete(e.id, e.d); finish(e, 'Deleted'); }} />
                  );
                }
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                    <span style={{ flex: 1, fontSize: '12.5px', color: '#ddd', fontWeight: 700 }}>{label[e.skill]}</span>
                    <span style={{ fontSize: '12px', color: okColor(e.ok), fontWeight: 700 }}>{okText(e.ok)}</span>
                    <button onClick={() => { setEditing(k); setDone(null); }} style={small}>Edit</button>
                  </div>
                );
              })}
            </div>
          ))}
          {list.length > SHOW && (
            <button onClick={() => setAll(a => !a)} style={{ ...btn(false), width: '100%', minHeight: '40px', marginTop: '2px' }}>
              {all ? 'Show fewer' : `Show all ${list.length}`}
            </button>
          )}
          {/* The oldest part of the record, so it goes last. */}
          {earlier.length > 0 && (
            <div style={{ marginTop: '6px' }}>
              <div style={{ fontSize: '10.5px', color: '#777', fontWeight: 700, padding: '4px 0 2px', borderTop: '1px solid #1f1d2e' }}>Earlier — not saved one by one</div>
              {earlier.map(e => {
                const k = `${e.id}|earlier`;
                if (editing === k) {
                  return (
                    <EarlierEditor key={k} skillLabel={label[e.skill]} listed={historyOf(srs[e.id]).hist.length > 0}
                      onCancel={() => setEditing(null)}
                      onClear={() => { onClearEarlier(e.id); finish(e, 'Cleared earlier answers'); }} />
                  );
                }
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                    <span style={{ flex: 1, fontSize: '12.5px', color: '#ddd', fontWeight: 700 }}>{label[e.skill]}</span>
                    <span style={{ fontSize: '12px', color: okColor(e.reps > 0), fontWeight: 700 }}>{e.reps > 0 ? `✓ ${e.reps} in a row` : '↺ ended Shaky'}</span>
                    <button onClick={() => { setEditing(k); setDone(null); }} style={small}>Clear</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '10.5px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
        Change or delete an answer and the schedule is worked out again, as if you had answered that way at the time.
        {earlier.length > 0 && ' Earlier rows are answers from before this history was kept: they still count toward the schedule, but were saved as a running total, so they can be cleared but not edited.'}
      </div>
    </div>
  );
}
