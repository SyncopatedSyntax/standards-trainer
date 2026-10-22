// The due queue. One card is one skill on one tune.
//
// The set is snapshotted at mount, the same trick TodayTab uses in Focused
// Chord Trainer: grading rewrites the schedule, and without a snapshot the
// list would reorder underneath you mid-session.

import { useState, useMemo, useRef, useEffect } from 'react';
import { btn, panel, labelCss, EmptyState } from '../components/ui.jsx';
import BarGrid from '../components/BarGrid.jsx';
import { ACCENT } from '../lib/tool.js';
import { dueCards, todayStr, relativeDay } from '../lib/srs.js';
import { chartFor, isChartEmpty } from '../lib/chart.js';

// What you just answered, floating at the foot of the screen. The card has
// already moved on by the time you read it, so without this a tap leaves no
// trace of whether it registered — or of what it did to the schedule.
function GradedToast({ toast, srs, onUndo }) {
  if (!toast) return null;
  const when = relativeDay(srs[toast.id]?.nextDue);
  return (
    <div key={toast.n} className="st-pop" role="status" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(16px + env(safe-area-inset-bottom))', width: 'calc(100% - 24px)', maxWidth: '420px', zIndex: 50, display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1830', border: `1px solid ${toast.correct ? '#00b89466' : '#ff636366'}`, borderRadius: '12px', padding: '10px 12px', boxShadow: '0 8px 30px #0008' }}>
      <span style={{ fontSize: '18px' }}>{toast.correct ? '✓' : '↺'}</span>
      <span style={{ flex: 1, fontSize: '12px', color: '#ddd', lineHeight: 1.45 }}>
        <b style={{ color: toast.correct ? '#00b894' : '#ff8f8f' }}>{toast.correct ? 'Got it' : 'Shaky'}</b> — {toast.label}, back {when}.
      </span>
      <button onClick={onUndo} style={{ ...btn(false), minHeight: '40px', padding: '6px 12px', color: '#ddd' }}>Undo</button>
    </div>
  );
}

export default function TodayTab({ tunes, byId, active, srs, notes, charts, skills, onGrade, onUngrade, onGoTunes }) {
  // Snapshot: computed once, from the schedule as it stood when the tab opened.
  const [queue] = useState(() => dueCards(srs, active, skills));
  const [done, setDone] = useState({});   // cardId -> true|false, this session
  const [toast, setToast] = useState(null);
  const lockUntil = useRef(0);
  const skillById = useMemo(() => new Map(skills.map(s => [s.id, s])), [skills]);
  const today = todayStr();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const undo = () => {
    if (!toast) return;
    onUngrade(toast.id);
    setDone(d => { const { [toast.id]: _gone, ...rest } = d; return rest; });
    setToast(null);
  };
  const toastEl = <GradedToast toast={toast} srs={srs} onUndo={undo} />;

  const remaining = queue.filter(c => done[c.id] === undefined);
  const current = remaining[0];
  const gradedCount = Object.keys(done).length;

  if (active.length === 0) {
    return <EmptyState icon="🌅" title="Nothing to practise yet"
      body="Take a tune on from the Tunes tab and it starts showing up here — head, changes, form and solo, each on its own schedule."
      action="Pick a tune" onAction={onGoTunes} />;
  }

  if (!current) {
    return (
      <div style={{ padding: '14px', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ ...panel, textAlign: 'center', padding: '26px 14px' }}>
          <div style={{ fontSize: '38px', marginBottom: '8px' }}>{gradedCount ? '✅' : '🌤'}</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '5px' }}>
            {gradedCount ? `Done — ${gradedCount} card${gradedCount === 1 ? '' : 's'} reviewed` : 'Nothing due today'}
          </div>
          <div style={{ fontSize: '12px', color: '#999', lineHeight: 1.6 }}>
            {gradedCount
              ? 'Come back tomorrow. Anything you marked shaky returns then.'
              : 'Everything you have taken on is still fresh. Add a tune, or go and play.'}
          </div>
        </div>
        <button onClick={onGoTunes} style={{ ...btn(false), width: '100%', marginTop: '12px', padding: '10px' }}>Browse tunes</button>
        {toastEl}
      </div>
    );
  }

  const tune = byId.get(current.tuneId);
  const skill = skillById.get(current.skill);
  const note = notes[current.tuneId];
  // Behind a <details> on purpose. The card asks you to play the thing from
  // memory, so the chart being one tap away is the difference between a hint
  // and an answer key.
  const chart = tune ? chartFor(charts, tune) : null;
  const hasChart = chart && !isChartEmpty(chart);
  const skillIdx = skills.findIndex(s => s.id === current.skill);
  const tip = tune?.guitar?.length ? tune.guitar[Math.max(0, skillIdx) % tune.guitar.length] : null;

  // The card swaps the instant you answer, so a quick double tap would land
  // the second tap on the NEXT card and grade it unseen. Ignore taps for a
  // moment after each answer.
  const answer = correct => {
    if (Date.now() < lockUntil.current) return;
    lockUntil.current = Date.now() + 500;
    onGrade(current.id, correct);
    setDone(d => ({ ...d, [current.id]: correct }));
    setToast({ id: current.id, correct, label: `${skill?.label || current.skill} on ${tune?.title || current.tuneId}`, n: Date.now() });
  };

  return (
    <div style={{ padding: '14px', maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>Today</div>
        <div style={{ color: '#999', fontSize: '11px' }}>{remaining.length} to go{gradedCount ? ` · ${gradedCount} done` : ''}</div>
      </div>

      {/* Progress through the session */}
      <div style={{ height: '5px', background: '#13121f', borderRadius: '3px', marginBottom: '14px', overflow: 'hidden', border: '1px solid #2a2840' }}>
        <div style={{ width: `${queue.length ? (gradedCount / queue.length) * 100 : 0}%`, height: '100%', background: ACCENT, transition: 'width .3s ease' }} />
      </div>

      <div style={{ ...panel, marginBottom: '12px' }}>
        <div style={labelCss}>{skill?.label || current.skill}{current.fresh ? ' · first time' : ''}</div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>{tune?.title || current.tuneId}</div>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>
          {tune ? `${tune.key === 'modal' ? 'modal' : tune.key} · ${tune.bars} bars · ${tune.feel}` : ''}
        </div>
        <div style={{ fontSize: '13px', color: '#ccc', marginTop: '12px', lineHeight: 1.6, borderTop: '1px solid #1a1928', paddingTop: '10px' }}>
          {skill?.blurb}
        </div>
        <div style={{ fontSize: '11px', color: '#777', marginTop: '10px', lineHeight: 1.6 }}>
          Put the phone down and actually play it. Then answer honestly — the schedule is only as good as the grading.
        </div>
      </div>

      {/* One guitar note, not the whole list — this is the moment you are about
          to play, so it wants a single thing to try. Which one is keyed to the
          skill rather than random, so the four cards for a tune surface
          different advice instead of repeating one tip four times. */}
      {tip && (
        <div style={{ ...panel, marginBottom: '12px', borderColor: ACCENT + '33' }}>
          <div style={{ ...labelCss, color: ACCENT }}>Try this on guitar</div>
          <div style={{ fontSize: '12.5px', color: '#c8c6da', lineHeight: 1.65 }}>{tip}</div>
        </div>
      )}

      {(hasChart || note) && (
        <details style={{ ...panel, marginBottom: '12px' }}>
          <summary style={{ ...labelCss, marginBottom: 0, cursor: 'pointer' }}>
            {hasChart ? 'The changes' : 'Your notes'} — peek only if stuck
          </summary>
          <div style={{ marginTop: '11px' }}>
            {hasChart && <BarGrid chart={chart} compact />}
            {note && (
              <pre style={{ fontSize: '12px', color: '#bbb', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: hasChart ? '12px' : 0, lineHeight: 1.7 }}>{note}</pre>
            )}
          </div>
        </details>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => answer(true)} style={{ ...btn(true, '#00b894'), flex: 1, padding: '14px', fontSize: '14px' }}>Got it</button>
        <button onClick={() => answer(false)} style={{ ...btn(true, '#ff6363'), flex: 1, padding: '14px', fontSize: '14px' }}>Shaky</button>
      </div>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '9px', textAlign: 'center' }}>
        Shaky brings it back tomorrow. Got it pushes it further out each day you get it right.
      </div>
      {toastEl}
    </div>
  );
}
