// Where a tune stands, in a strip small enough to sit in a list row.
//
// One component rather than three, because the Tunes list, the Progress tab
// and the tune's own detail view all have to answer the same question — how
// far along is this, and does it want me today — and answering it differently
// in each place is how a list and a detail view start disagreeing.

import { ACCENT } from '../lib/tool.js';
import { cardId, skillState, tuneStatus, tuneStage, relativeDay, todayStr } from '../lib/srs.js';

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

// The three stages, in the order a list shows them: what wants you first, the
// reference shelf last. One definition, used by the Mine list, Progress and
// the tune page's badge, so a tune is never "learning" in one place and
// "needs a refresher" in another.
export const STAGES = [
  { id: 'refresher', label: 'Needs a refresher', colour: '#ff8f8f',
    blurb: 'Learned, but something is due or has slipped. Play it through and grade it.' },
  { id: 'learning', label: 'Learning', colour: '#e8a838',
    blurb: 'Taken on, not yet solid on all four skills at once.' },
  { id: 'repertoire', label: 'In repertoire', colour: ACCENT,
    blurb: 'Learned, and nothing due. These come back on their own.' },
];
export const UP_NEXT = { id: 'next', label: 'Up next', colour: '#8a88a0',
  blurb: 'Tunes you plan to learn. Nothing is scheduled until you start one.' };

// Taken-on tune ids split by stage, each group in `byAttention` order.
export function groupByStage(ids, srs, skills, today = todayStr()) {
  const out = { refresher: [], learning: [], repertoire: [] };
  for (const id of [...ids].sort(byAttention(srs, skills, today))) out[tuneStage(srs, id, skills, today)].push(id);
  return out;
}

// The stage as a small label, for the tune page's title row.
export function StageBadge({ stage }) {
  const s = stage === 'next' ? UP_NEXT : STAGES.find(x => x.id === stage);
  if (!s) return null;
  return (
    <span style={{ fontSize: '10.5px', fontWeight: 800, color: s.colour, border: `1px solid ${s.colour}55`, background: s.colour + '14', borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}
