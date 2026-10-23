// The bar grid is gone. The app sits beside iReal Pro and forScore, which
// hold the charts; this one tracks what you know. But anything typed into the
// grid is the user's own work, so before the key is retired its contents are
// moved into that tune's notes — written out the way people write changes in
// plain text, four bars to a line — rather than left invisible in storage.
//
// Called from App's load effect, never at module load (the sync engine
// applies remote changes at import time; reading earlier would see stale
// data). Idempotent: a note that already contains the text is left alone, and
// the key is removed once moved, so it runs at most once per device.

import { K_CHARTS, K_NOTES, read, write, remove } from './store.js';

const HEADING = 'Changes (moved here from the old chart grid):';

export function chartText(chart) {
  const sections = (chart?.sections || []).filter(s => (s.bars || []).some(b => String(b).trim()));
  if (!sections.length) return '';
  const lines = [HEADING];
  if (chart.from) lines.push('(started from a generic form template, not checked against this tune)');
  for (const s of chart.sections) {
    const bars = (s.bars || []).map(b => String(b).trim() || '-');
    for (let i = 0; i < bars.length; i += 4) {
      const row = `| ${bars.slice(i, i + 4).join(' | ')} |`;
      lines.push(i === 0 && s.label ? `${s.label}: ${row}` : `   ${row}`);
    }
  }
  return lines.join('\n');
}

// Returns the notes to use (unchanged if there was nothing to move).
export function migrateCharts(notes) {
  const charts = read(K_CHARTS, null);
  if (!charts || typeof charts !== 'object') return notes;
  const next = { ...notes };
  for (const [tuneId, chart] of Object.entries(charts)) {
    const text = chartText(chart);
    if (!text) continue;
    const had = next[tuneId] || '';
    if (had.includes(text)) continue;
    next[tuneId] = had.trim() ? `${had.trimEnd()}\n\n${text}` : text;
  }
  write(K_NOTES, next);
  remove(K_CHARTS);
  return next;
}
