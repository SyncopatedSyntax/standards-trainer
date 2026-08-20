// The chart panel in a tune's detail view: the grid, the keypad a phone
// keyboard cannot give you, and the few structural actions the grid needs.
//
// The keypad is a floating accessory bar pinned just above the on-screen
// keyboard, not a row inside the page. Inside the page it would sit below the
// grid, and the app scrolls a focused input to just above the keyboard — so
// the keypad would push the bar you are typing into off the top of the screen.
// Pinned, it costs the layout nothing and always sits within thumb reach.
// visualViewport is the only thing that reports where the keyboard actually
// starts; innerHeight and dvh both keep reporting the whole screen.

import { useState, useRef, useEffect, useMemo } from 'react';
import BarGrid from './BarGrid.jsx';
import { btn, panel, labelCss } from './ui.jsx';
import { ACCENT } from '../lib/tool.js';
import {
  chartFor, emptyChart, countBars, countFilled, flatten, sectionLengths,
  setBar, copySection, priorSameLabel, parsePipedBars, fillBars,
  applyTemplate, clearProvenance,
} from '../lib/chart.js';
import { FORM_TEMPLATES, templatesFor } from '../data/forms.js';
import { parseKey } from '../lib/roman.js';

const GLYPHS = ['Δ', 'ø', '°', '♭', '♯', '/', '−'];
const SUFFIXES = ['maj7', 'm7', '7', '9', '13', 'sus4', 'alt'];

export default function ChartEditor({ tune, charts, onSetChart, note }) {
  const chart = useMemo(() => chartFor(charts, tune), [charts, tune]);
  const [focused, setFocused] = useState(null);      // { si, bi }
  const [confirmReset, setConfirmReset] = useState(false);
  const [picking, setPicking] = useState(false);
  const [inset, setInset] = useState(0);
  const inputs = useRef(new Map());
  const caret = useRef(null);                        // { key, pos }
  const barRef = useRef(null);

  const key = (si, bi) => `${si}:${bi}`;
  const registerInput = (si, bi, el) => { if (el) inputs.current.set(key(si, bi), el); else inputs.current.delete(key(si, bi)); };

  // Where the keyboard starts. Re-measured on visualViewport resize because
  // the keyboard animates in — a value read at focus time is the old one.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const measure = () => setInset(Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height))));
    measure();
    vv.addEventListener('resize', measure);
    vv.addEventListener('scroll', measure);
    return () => { vv.removeEventListener('resize', measure); vv.removeEventListener('scroll', measure); };
  }, []);

  // App's keyboard handler scrolls the focused input to just above where the
  // keyboard starts — which is exactly where this bar sits, so without telling
  // it how tall the bar is, it parks the bar you are typing into underneath
  // the keypad. Publishing the height as a CSS variable keeps that one number
  // in one place rather than hardcoding an estimate at both ends.
  useEffect(() => {
    const el = barRef.current;
    const root = document.documentElement;
    if (!el) { root.style.setProperty('--kbd-accessory', '0px'); return; }
    const publish = () => root.style.setProperty('--kbd-accessory', `${Math.round(el.getBoundingClientRect().height)}px`);
    publish();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null;
    ro?.observe(el);
    return () => { ro?.disconnect(); root.style.setProperty('--kbd-accessory', '0px'); };
  }, [focused]);

  // Restore the caret after React commits a keypad insertion; setting it in
  // the click handler would be undone by the controlled re-render.
  useEffect(() => {
    if (!caret.current) return;
    const el = inputs.current.get(caret.current.key);
    if (el) el.setSelectionRange(caret.current.pos, caret.current.pos);
    caret.current = null;
  });

  const flat = useMemo(() => flatten(chart), [chart]);
  const filled = countFilled(chart);
  const total = countBars(chart);
  const here = focused ? flat.find(f => f.si === focused.si && f.bi === focused.bi) : null;

  const change = (si, bi, value) => onSetChart(tune.id, setBar(chart, si, bi, value));

  const insert = text => {
    if (!focused) return;
    const k = key(focused.si, focused.bi);
    const el = inputs.current.get(k);
    const value = chart.sections[focused.si].bars[focused.bi];
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    change(focused.si, focused.bi, value.slice(0, start) + text + value.slice(end));
    caret.current = { key: k, pos: start + text.length };
    el?.focus();
  };

  const step = delta => {
    if (!here) return;
    const i = flat.indexOf(here) + delta;
    if (i < 0 || i >= flat.length) return;
    const next = flat[i];
    inputs.current.get(key(next.si, next.bi))?.focus();
  };

  // Which generic forms fit this tune — matched on its stated form, key and
  // section shape, never on the tune itself. See data/forms.js.
  const tuneKey = useMemo(() => parseKey(tune.key), [tune.key]);
  const templates = useMemo(
    () => templatesFor(tune, tuneKey, sectionLengths(chart)),
    [tune, tuneKey, chart]);
  const cameFrom = chart.from ? FORM_TEMPLATES.find(t => t.id === chart.from) : null;

  // Bars already written into the slice-1 notes field, if any. Reading them
  // back beats making anyone retype a form they have written out once.
  const importable = useMemo(() => parsePipedBars(note).filter(Boolean).length, [note]);

  const chipStyle = extra => ({
    padding: '7px 9px', borderRadius: '7px', cursor: 'pointer', fontWeight: 700,
    border: '1px solid #2a2840', background: '#0f0e17', color: '#cfcde0',
    minHeight: '38px', minWidth: '36px', touchAction: 'manipulation', ...extra,
  });

  // The one-line strip of copy actions on a repeated section header.
  const sectionAction = si => {
    const from = priorSameLabel(chart, si);
    if (from < 0) return null;
    if (!chart.sections[from].bars.some(b => b.trim())) return null;
    return (
      <button onClick={() => onSetChart(tune.id, copySection(chart, from, si))}
        style={{ ...btn(false), marginLeft: 'auto', fontSize: '10px', minHeight: '26px', padding: '3px 8px' }}>
        ⧉ copy the {chart.sections[from].label} above
      </button>
    );
  };

  return (
    <div style={{ ...panel, marginBottom: '12px' }}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(null); }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
        <div style={{ ...labelCss, marginBottom: 0 }}>The changes</div>
        <div style={{ marginLeft: 'auto', fontSize: '11px', color: filled === total ? ACCENT : '#777', fontFamily: 'var(--font-mono)' }}>
          {filled}/{total} bars
        </div>
      </div>

      <BarGrid chart={chart} onChange={change} focused={focused}
        onFocus={(si, bi) => setFocused({ si, bi })}
        registerInput={registerInput} sectionAction={sectionAction} />

      <div style={{ fontSize: '10px', color: '#666', marginTop: '11px', lineHeight: 1.6 }}>
        Tap a bar and type. Two chords in one bar is just two words — “B{'Δ'} D7”.
        Kept on this device only: charts are copyrighted, so the app ships the facts
        above and you supply the rest. Writing them out is half of learning the tune.
      </div>

      {/* Provenance. A template that looked like a finished chart would be the
          real hazard here — every blues is "a 12-bar blues" and they all
          differ, so the banner stays until you say you have checked it. */}
      {cameFrom && (
        <div style={{ background: '#1c1733', border: `1px solid ${ACCENT}44`, borderRadius: '9px', padding: '10px', marginTop: '11px' }}>
          <div style={{ fontSize: '11.5px', color: '#ddd', lineHeight: 1.6 }}>
            Filled from <strong style={{ color: ACCENT }}>{cameFrom.name}</strong> — the generic form, not this tune's
            changes. Play it against a chart or a recording and correct the bars where {tune.title} goes somewhere else.
          </div>
          <button onClick={() => onSetChart(tune.id, clearProvenance(chart))}
            style={{ ...btn(false), width: '100%', marginTop: '8px' }}>✓ Checked it against the tune</button>
        </div>
      )}

      {templates.length > 0 && filled === 0 && !picking && (
        <button onClick={() => setPicking(true)} style={{ ...btn(false), width: '100%', marginTop: '10px' }}>
          ⌗ Start from a form template
        </button>
      )}

      {picking && (
        <div style={{ marginTop: '10px', border: '1px solid #2a2840', borderRadius: '9px', padding: '10px' }}>
          <div style={{ fontSize: '11px', color: '#999', lineHeight: 1.6, marginBottom: '9px' }}>
            Generic forms in {tune.key}, not anyone's chart — the twelve-bar blues and rhythm changes are shared
            idioms, which is why contrafacts exist. Pick one as a starting point, then correct it.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {templates.map(t => (
              <button key={t.id}
                onClick={() => { onSetChart(tune.id, applyTemplate(chart, t, tuneKey)); setPicking(false); }}
                style={{ textAlign: 'left', background: '#0f0e17', border: '1px solid #2a2840', borderRadius: '9px', padding: '10px', cursor: 'pointer', touchAction: 'manipulation' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: ACCENT, fontFamily: 'var(--font-heading)' }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '3px', lineHeight: 1.5 }}>{t.blurb}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setPicking(false)} style={{ ...btn(false), width: '100%', marginTop: '8px' }}>Cancel</button>
        </div>
      )}

      {importable > 0 && (
        <button onClick={() => onSetChart(tune.id, fillBars(chart, parsePipedBars(note)))}
          style={{ ...btn(false), width: '100%', marginTop: '10px' }}>
          ↓ Pull {importable} bar{importable === 1 ? '' : 's'} in from your notes
        </button>
      )}

      {filled > 0 && (
        confirmReset ? (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={() => { onSetChart(tune.id, emptyChart(tune)); setConfirmReset(false); }}
              style={{ ...btn(true, '#ff6363'), flex: 1 }}>Clear every bar</button>
            <button onClick={() => setConfirmReset(false)} style={btn(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)}
            style={{ ...btn(false), width: '100%', marginTop: '8px', color: '#888' }}>Start the grid over</button>
        )
      )}

      {/* ── The accessory bar ──────────────────────────────────────────── */}
      {focused && (
        <div ref={barRef} style={{
          position: 'fixed', left: 0, right: 0, bottom: `${inset}px`, zIndex: 60,
          background: '#13121f', borderTop: `1px solid ${ACCENT}44`,
          padding: '7px 10px', paddingBottom: inset ? '7px' : 'max(7px, env(safe-area-inset-bottom))',
          boxShadow: '0 -6px 18px rgba(0,0,0,.45)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: ACCENT, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {here?.label} · bar {here?.bar}
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
              {/* preventDefault keeps focus — and so the keyboard and the
                  caret — on the bar you are editing. */}
              <button onMouseDown={e => e.preventDefault()} onClick={() => step(-1)} style={chipStyle({ minWidth: '40px' })}>◀</button>
              <button onMouseDown={e => e.preventDefault()} onClick={() => step(1)} style={chipStyle({ minWidth: '40px' })}>▶</button>
              <button onMouseDown={e => e.preventDefault()} onClick={() => { inputs.current.get(key(focused.si, focused.bi))?.blur(); setFocused(null); }}
                style={chipStyle({ fontSize: '11px', color: ACCENT, borderColor: ACCENT + '55' })}>done</button>
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {GLYPHS.map(g => (
              <button key={g} onMouseDown={e => e.preventDefault()} onClick={() => insert(g)}
                style={chipStyle({ fontSize: '16px', color: ACCENT, borderColor: ACCENT + '44' })}>{g}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
            {SUFFIXES.map(x => (
              <button key={x} onMouseDown={e => e.preventDefault()} onClick={() => insert(x)}
                style={chipStyle({ fontSize: '12px' })}>{x}</button>
            ))}
            <button onMouseDown={e => e.preventDefault()} onClick={() => { change(focused.si, focused.bi, ''); inputs.current.get(key(focused.si, focused.bi))?.focus(); }}
              style={chipStyle({ fontSize: '12px', color: '#ff8f8f', borderColor: '#ff636344', marginLeft: 'auto' })}>clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
