// How far along you are — and the one number that matters before a jam:
// how many tunes you could actually call tonight.

import { useMemo } from 'react';
import { panel, labelCss, EmptyState } from '../components/ui.jsx';
import TuneStatus, { byAttention } from '../components/TuneStatus.jsx';
import { ACCENT } from '../lib/tool.js';
import { stats, forecast, tuneIsReady, todayStr, recentAnswers, dayLabel } from '../lib/srs.js';
import { chartFor, countBars, countFilled } from '../lib/chart.js';

export default function ProgressTab({ tunes, byId, active, srs, charts, skills, onGoTunes, onGoTune }) {
  const today = todayStr();
  const s = useMemo(() => stats(srs, active, skills), [srs, active, skills]);
  const days = useMemo(() => forecast(srs, active, skills, 7, today), [srs, active, skills, today]);
  const readyTunes = useMemo(() => active.filter(id => tuneIsReady(srs, id, skills)).map(id => byId.get(id)).filter(Boolean), [active, srs, skills, byId]);
  // Same ordering the Tunes tab's Mine list uses — one repertoire should not
  // appear in two different orders depending on which tab you reached it from.
  const working = useMemo(
    () => [...active].sort(byAttention(srs, skills, today)).map(id => byId.get(id)).filter(Boolean),
    [active, srs, skills, byId, today]);
  const recent = useMemo(() => recentAnswers(srs, active, skills, 8), [srs, active, skills]);
  const skillLabel = useMemo(() => Object.fromEntries(skills.map(k => [k.id, k.label])), [skills]);

  if (active.length === 0) {
    return <EmptyState icon="📊" title="Nothing tracked yet"
      body="Take a tune on and this fills up: how many skills are solid, what is due when, and how many tunes you could call at a jam tonight."
      action="Pick a tune" onAction={onGoTunes} />;
  }

  const pct = s.total ? Math.round((s.solid / s.total) * 100) : 0;
  const maxDay = Math.max(1, ...days.map(d => d.n));

  return (
    <div style={{ padding: '14px', maxWidth: '560px', margin: '0 auto' }}>
      {/* The headline: tunes you could call */}
      <div style={{ ...panel, border: `1px solid ${ACCENT}44`, marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: ACCENT, lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{s.ready}</div>
          <div style={{ fontSize: '13px', color: '#ccc' }}>tune{s.ready === 1 ? '' : 's'} you could call tonight</div>
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '6px', lineHeight: 1.6 }}>
          All four skills solid — head, changes, form and solo, each got right at least twice.
        </div>
        {readyTunes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
            {readyTunes.map(t => (
              <span key={t.id} style={{ fontSize: '11px', color: ACCENT, background: ACCENT + '18', border: `1px solid ${ACCENT}44`, borderRadius: '20px', padding: '3px 9px' }}>{t.title}</span>
            ))}
          </div>
        )}
      </div>

      {/* Every tune you have taken on. The headline above answers "am I ready";
          this answers "what am I actually working on, and what does it want". */}
      <div style={{ ...panel, marginBottom: '12px' }}>
        <div style={labelCss}>Working on</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {working.map(t => {
            const chart = chartFor(charts, t);
            const written = countFilled(chart), barsTotal = countBars(chart);
            return (
              <div key={t.id} onClick={() => onGoTune?.(t.id)}
                style={{ background: '#0f0e17', border: '1px solid #242235', borderRadius: '9px', padding: '9px', cursor: onGoTune ? 'pointer' : 'default', touchAction: 'manipulation' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: '10px', color: '#777', marginTop: '1px' }}>
                      {t.key === 'modal' ? 'modal' : t.key} · {written}/{barsTotal} bars written
                    </div>
                  </div>
                  <TuneStatus srs={srs} tuneId={t.id} skills={skills} today={today} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '11px', marginTop: '9px', fontSize: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: ACCENT }}>● solid</span>
          <span style={{ color: '#e8a838' }}>● learning</span>
          <span style={{ color: '#8a88a0' }}>○ not started</span>
          <span style={{ color: '#666', marginLeft: 'auto' }}>head · changes · form · solo</span>
        </div>
      </div>

      {/* Skill breakdown */}
      <div style={{ ...panel, marginBottom: '12px' }}>
        <div style={labelCss}>Skills across {active.length} tune{active.length === 1 ? '' : 's'}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)' }}>{s.solid}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>of {s.total} solid</div>
          <div style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 800, color: ACCENT, fontFamily: 'var(--font-mono)' }}>{pct}%</div>
        </div>
        <div style={{ display: 'flex', height: '9px', borderRadius: '5px', overflow: 'hidden', marginTop: '9px', border: '1px solid #2a2840', background: '#0f0e17' }}>
          <div style={{ width: `${(s.solid / Math.max(1, s.total)) * 100}%`, background: ACCENT }} />
          <div style={{ width: `${(s.learning / Math.max(1, s.total)) * 100}%`, background: '#e8a838' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', flexWrap: 'wrap' }}>
          <span style={{ color: ACCENT }}>● {s.solid} solid</span>
          <span style={{ color: '#e8a838' }}>● {s.learning} learning</span>
          <span style={{ color: '#666' }}>● {s.fresh} not started</span>
        </div>
      </div>

      {/* Forecast */}
      <div style={panel}>
        <div style={labelCss}>Coming up</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '70px', marginTop: '6px' }}>
          {days.map((d, i) => (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '9px', color: d.n ? '#bbb' : '#555', fontFamily: 'var(--font-mono)' }}>{d.n || ''}</div>
              <div style={{ width: '100%', height: `${(d.n / maxDay) * 44}px`, minHeight: d.n ? '3px' : '0', background: i === 0 ? ACCENT : ACCENT + '66', borderRadius: '3px 3px 0 0' }} />
              <div style={{ fontSize: '9px', color: '#666' }}>
                {i === 0 ? 'now' : new Date(d.date).toLocaleDateString(undefined, { weekday: 'narrow', timeZone: 'UTC' })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
          Cards due each day for the next week. A tall bar today means catch up before adding a new tune.
        </div>
      </div>

      {/* Looking back, under the forecast looking forward. Read-only here: an
          answer is edited on its tune's page, next to the other three skills
          it is scheduled alongside, so this just takes you there. */}
      {recent.length > 0 && (
        <div style={{ ...panel, marginTop: '12px' }}>
          <div style={labelCss}>Recent answers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recent.map(e => {
              const t = byId.get(e.tuneId);
              return (
                <div key={`${e.id}|${e.d}`} onClick={() => onGoTune?.(e.tuneId)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f0e17', border: '1px solid #242235', borderRadius: '9px', padding: '8px 9px', cursor: onGoTune ? 'pointer' : 'default', touchAction: 'manipulation' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t?.title || e.tuneId}</div>
                    <div style={{ fontSize: '10px', color: '#777', marginTop: '1px' }}>{dayLabel(e.d, today)} · {skillLabel[e.skill]}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: e.ok ? '#00b894' : '#ff8f8f' }}>{e.ok ? '✓ Got it' : '↺ Shaky'}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
            Tap one to open the tune. Its History section is where an answer can be changed or deleted.
          </div>
        </div>
      )}
    </div>
  );
}
