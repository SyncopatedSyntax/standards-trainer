// How far along you are — and the one number that matters before a jam:
// how many tunes you could actually call tonight.

import { useMemo } from 'react';
import { panel, labelCss, EmptyState } from '../components/ui.jsx';
import { ACCENT } from '../lib/tool.js';
import { stats, forecast, tuneIsReady, todayStr } from '../lib/srs.js';

export default function ProgressTab({ tunes, byId, active, srs, skills, onGoTunes }) {
  const today = todayStr();
  const s = useMemo(() => stats(srs, active, skills), [srs, active, skills]);
  const days = useMemo(() => forecast(srs, active, skills, 7, today), [srs, active, skills, today]);
  const readyTunes = useMemo(() => active.filter(id => tuneIsReady(srs, id, skills)).map(id => byId.get(id)).filter(Boolean), [active, srs, skills, byId]);

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
                {i === 0 ? 'now' : new Date(d.date).toLocaleDateString(undefined, { weekday: 'narrow' })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
          Cards due each day for the next week. A tall bar today means catch up before adding a new tune.
        </div>
      </div>
    </div>
  );
}
