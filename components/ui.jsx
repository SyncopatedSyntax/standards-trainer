import { ACCENT } from '../lib/tool.js';

// Small shared UI primitives, the same set Focused Chord Trainer uses so the
// two apps look like siblings. Its `SymbolField` is deliberately NOT ported:
// the chord-symbol keypad here has to float above the on-screen keyboard
// rather than sit under a field, so it lives in ChartEditor with the layout
// constraint that shapes it.

// Toggle/pill button style. `on` highlights it in `color`.
export const btn = (on, color = ACCENT) => ({
  padding: '5px 9px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
  border: `1px solid ${on ? color : '#2a2840'}`, background: on ? color + '22' : '#13121f',
  color: on ? color : '#888', minHeight: '32px', touchAction: 'manipulation',
});
export const panel = { background: '#13121f', border: '1px solid #2a2840', borderRadius: '11px', padding: '12px' };
export const labelCss = { fontSize: '10px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' };

// Labelled text input.
export function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <div style={labelCss}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: '#0f0e17', border: '1px solid #2a2840', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '13px', outline: 'none', fontFamily: mono ? 'monospace' : 'inherit' }} />
    </div>
  );
}

// Shared first-run / nothing-here card. The library starts empty, so every tab
// needs one of these rather than rendering a blank panel.
export function EmptyState({ icon, title, body, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '360px', margin: '0 auto' }}>
      <div style={{ fontSize: '42px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '13px', color: '#999', lineHeight: 1.6, marginBottom: action ? '18px' : 0 }}>{body}</div>
      {action && (
        <button onClick={onAction} style={{ background: '#4ecdc4', color: '#111', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 900, cursor: 'pointer', minHeight: '44px', touchAction: 'manipulation' }}>
          {action}
        </button>
      )}
    </div>
  );
}

// Multi-line field. In slice 1 this is where the changes go; afterwards it
// stays as general notes. Rows are generous because a 32-bar form written out
// four bars to a line needs the room, and it grows rather than scrolling
// internally — a nested scroll area on a phone is a trap.
export function TextArea({ label, value, onChange, placeholder, rows = 8 }) {
  return (
    <div>
      <div style={labelCss}>{label}</div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: '100%', background: '#0f0e17', border: '1px solid #2a2840', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-mono)', lineHeight: 1.7, resize: 'vertical' }} />
    </div>
  );
}

