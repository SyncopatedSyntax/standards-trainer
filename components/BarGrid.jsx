// The chart, drawn. Sections stacked down the page, four bars to a line —
// the way changes are written on paper, so the shape of the form is visible
// at a glance rather than buried in a paragraph of text.
//
// EACH BAR IS ITS OWN INPUT when editing. The alternative was a single editor
// docked under the grid showing "the current bar", and it fails on a phone for
// the reason the fret-button rows failed in Focused Chord Trainer's Build tab:
// the keyboard takes half the screen, the app scrolls the focused input just
// above it, and everything above the input — i.e. the grid — is pushed off. A
// grid of real inputs has no such gap to open, because the thing you type into
// IS the bar you are looking at. The symbol keypad that a phone keyboard
// cannot supply floats above the keyboard instead (see ChartEditor).
//
// Read-only mode (no `onChange`) renders plain divs, so the Today tab can show
// a chart without dragging an input per bar into a peek panel.

import { useRef, useEffect } from 'react';
import { BARS_PER_LINE } from '../lib/chart.js';
import { ACCENT } from '../lib/tool.js';

export default function BarGrid({ chart, onChange, focused, onFocus, registerInput, compact = false, sectionAction }) {
  const editable = !!onChange;
  const H = compact ? 32 : 42;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '8px' : '12px' }}>
      {chart.sections.map((s, si) => {
        const lines = [];
        for (let i = 0; i < s.bars.length; i += BARS_PER_LINE) lines.push([i, s.bars.slice(i, i + BARS_PER_LINE)]);
        return (
          <div key={si}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
              <span style={{ fontSize: compact ? '11px' : '13px', fontWeight: 900, color: ACCENT, fontFamily: 'var(--font-heading)' }}>{s.label}</span>
              <span style={{ fontSize: '10px', color: '#666' }}>{s.bars.length} bars</span>
              {sectionAction?.(si)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {lines.map(([start, cells]) => (
                // minmax(0, 1fr): a plain 1fr track takes its automatic minimum
                // from its content, so one long chord symbol would stretch the
                // line past the viewport instead of being constrained by it.
                <div key={start} style={{ display: 'grid', gridTemplateColumns: `repeat(${BARS_PER_LINE}, minmax(0, 1fr))`, gap: '4px' }}>
                  {cells.map((value, k) => {
                    const bi = start + k;
                    const on = editable && focused && focused.si === si && focused.bi === bi;
                    const filled = !!value.trim();
                    const shared = {
                      minHeight: `${H}px`, borderRadius: '7px', textAlign: 'center', padding: '2px 3px',
                      background: on ? ACCENT + '1e' : '#0f0e17',
                      border: `1px solid ${on ? ACCENT : filled ? '#3a3852' : '#242235'}`,
                      fontFamily: 'var(--font-mono)', fontWeight: filled ? 700 : 400,
                      color: filled ? '#fff' : '#3f3d55',
                      touchAction: 'manipulation',
                    };
                    return editable ? (
                      <input key={bi} value={value}
                        // The global stylesheet pins every input to 16px so iOS
                        // does not zoom the page on focus. Do not shrink these.
                        ref={el => registerInput?.(si, bi, el)}
                        onChange={e => onChange(si, bi, e.target.value)}
                        onFocus={() => onFocus?.(si, bi)}
                        placeholder={String(bi + 1)}
                        autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
                        style={{ ...shared, width: '100%', minWidth: 0, outline: 'none' }} />
                    ) : (
                      <div key={bi} style={{ ...shared, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: value.length > 8 ? '10px' : value.length > 5 ? '11px' : '13px', lineHeight: 1.25, wordBreak: 'break-word' }}>
                        {value.trim() || (compact ? '' : bi + 1)}
                      </div>
                    );
                  })}
                  {/* Pad a short last line so its bars keep the width every
                      other line's have, rather than stretching to fill. */}
                  {Array.from({ length: BARS_PER_LINE - cells.length }, (_, j) => <div key={`p${j}`} />)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
