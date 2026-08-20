// The due queue. One card is one skill on one tune.
//
// The set is snapshotted at mount, the same trick TodayTab uses in Focused
// Chord Trainer: grading rewrites the schedule, and without a snapshot the
// list would reorder underneath you mid-session.

import { useState, useMemo } from 'react';
import { btn, panel, labelCss, EmptyState } from '../components/ui.jsx';
import BarGrid from '../components/BarGrid.jsx';
import { ACCENT } from '../lib/tool.js';
import { dueCards, todayStr } from '../lib/srs.js';
import { chartFor, isChartEmpty } from '../lib/chart.js';

export default function TodayTab({ tunes, byId, active, srs, notes, charts, skills, onGrade, onGoTunes }) {
  // Snapshot: computed once, from the schedule as it stood when the tab opened.
  const [queue] = useState(() => dueCards(srs, active, skills));
  const [done, setDone] = useState({});   // cardId -> true|false, this session
  const skillById = useMemo(() => new Map(skills.map(s => [s.id, s])), [skills]);
  const today = todayStr();

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

  const answer = correct => {
    onGrade(current.id, correct);
    setDone(d => ({ ...d, [current.id]: correct }));
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
        Shaky brings it back tomorrow. Got it pushes it further out each time.
      </div>
    </div>
  );
}
