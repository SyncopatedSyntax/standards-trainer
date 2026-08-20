// Where a tune stands, in a strip small enough to sit in a list row.
//
// One component rather than three, because the Tunes list, the Progress tab
// and the tune's own detail view all have to answer the same question — how
// far along is this, and does it want me today — and answering it differently
// in each place is how a list and a detail view start disagreeing.

import { ACCENT } from '../lib/tool.js';
import { cardId, skillState, tuneStatus, relativeDay, todayStr } from '../lib/srs.js';

// Solid is the accent; learning is amber (the same amber the Progress bar
// uses); never-seen is a hollow outline, so "not started" reads as absence
// rather than as another colour to decode.
const STATE = {
  solid: { fill: ACCENT, border: ACCENT },
  learning: { fill: '#e8a838', border: '#e8a838' },
  fresh: { fill: 'transparent', border: '#3a3852' },
};

export function SkillDots({ srs, tuneId, skills, size = 8 }) {
  return (
    <span style={{ display: 'inline-flex', gap: '4px', flexShrink: 0 }}>
      {skills.map(s => {
        const st = STATE[skillState(srs[cardId(tuneId, s.id)])];
        return (
          <span key={s.id} title={s.label}
            style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: st.fill, border: `1.5px solid ${st.border}`, boxSizing: 'border-box' }} />
        );
      })}
    </span>
  );
}

// The line under a tune's title: the dots, then what it wants from you. A
// count of due cards beats a date here — "2 due now" is an instruction, while
// "due 2026-08-20" is a lookup.
export default function TuneStatus({ srs, tuneId, skills, today = todayStr() }) {
  const st = tuneStatus(srs, tuneId, skills, today);
  const label = st.due > 0
    ? `${st.due} due now`
    : st.ready ? 'all solid' : relativeDay(st.next, today);
  const colour = st.due > 0 ? '#e8a838' : st.ready ? ACCENT : '#888';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
      <SkillDots srs={srs} tuneId={tuneId} skills={skills} />
      <span style={{ fontSize: '10px', color: colour, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{label}</span>
    </span>
  );
}

// Sort key for "what needs me most": anything due first and by how much, then
// whatever comes back soonest. Used by both the Mine list and Progress so the
// two never present the same repertoire in a different order.
export function byAttention(srs, skills, today = todayStr()) {
  return (a, b) => {
    const sa = tuneStatus(srs, a, skills, today), sb = tuneStatus(srs, b, skills, today);
    if (sa.due !== sb.due) return sb.due - sa.due;
    return String(sa.next || '9999').localeCompare(String(sb.next || '9999'));
  };
}
