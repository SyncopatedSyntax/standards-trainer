// ── Standards Trainer ────────────────────────────────────────────────────
// Repertoire, not theory. The other trainers teach the materials; this one
// tracks which tunes you can actually call at a jam, and reminds you before
// they fade.
//
// The shell (scroll container, iOS fixes, keyboard handling, tab wiring) is
// lifted from Focused-Chord-Trainer/App.jsx. Those fixes were each found the
// hard way on a real iPhone — see the comments — so they are copied rather
// than re-derived.

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TabBar } from '@fretworks/design';
import StandardsHeader from './components/StandardsHeader.jsx';
import { TOOL, ACCENT } from './lib/tool.js';
import { CORE_TUNES, SKILLS } from './data/tunes.js';
import { K_ACTIVE, K_SRS, K_NOTES, K_CUSTOM, read, write } from './lib/store.js';
import { updateSRS, cardId } from './lib/srs.js';
import TodayTab from './tabs/TodayTab.jsx';
import TunesTab from './tabs/TunesTab.jsx';
import ProgressTab from './tabs/ProgressTab.jsx';
import GuideTab from './tabs/GuideTab.jsx';
import SettingsTab from './tabs/SettingsTab.jsx';

// Anything the on-screen keyboard opens for. <select> counts: iOS shows a
// picker wheel that covers the page the same way.
const isFormField = el => !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);

const TABS = [
  { id: 'today', label: 'Today', icon: '🌅' },
  { id: 'tunes', label: 'Tunes', icon: '🎵' },
  { id: 'progress', label: 'Progress', icon: '📊' },
  { id: 'guide', label: 'Guide', icon: '📖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const [tab, setTab] = useState('today');
  const [active, setActive] = useState([]);
  const [srs, setSrs] = useState({});
  const [notes, setNotes] = useState({});
  const [custom, setCustom] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(null);

  // Refs so the callbacks below stay stable while still seeing fresh state.
  const srsRef = useRef(srs); srsRef.current = srs;
  const activeRef = useRef(active); activeRef.current = active;
  const notesRef = useRef(notes); notesRef.current = notes;

  useEffect(() => {
    setActive(read(K_ACTIVE, []));
    setSrs(read(K_SRS, {}));
    setNotes(read(K_NOTES, {}));
    setCustom(read(K_CUSTOM, []));
    setLoaded(true);
  }, []);

  // Core tunes plus the user's own, in one list. Custom tunes sort after the
  // curriculum, since the curriculum's order is its whole point.
  const tunes = useMemo(() => [...CORE_TUNES, ...custom], [custom]);
  const byId = useMemo(() => new Map(tunes.map(t => [t.id, t])), [tunes]);

  // ── Actions ────────────────────────────────────────────────────────────
  // Taking a tune on is what creates its cards; a core tune sitting in the
  // curriculum untouched must not schedule anything, or the queue would open
  // with a hundred cards on day one.
  const activate = useCallback(id => {
    if (activeRef.current.includes(id)) return;
    const next = [...activeRef.current, id];
    setActive(next); write(K_ACTIVE, next);
  }, []);

  // Dropping a tune removes its cards too. Keeping orphaned SRS state would
  // resurrect old intervals if it were ever taken back on, which reads as a
  // bug rather than a feature.
  const deactivate = useCallback(id => {
    const next = activeRef.current.filter(x => x !== id);
    setActive(next); write(K_ACTIVE, next);
    const s = { ...srsRef.current };
    for (const sk of SKILLS) delete s[cardId(id, sk.id)];
    setSrs(s); write(K_SRS, s);
  }, []);

  const grade = useCallback((id, correct) => {
    const s = { ...srsRef.current, [id]: updateSRS(srsRef.current[id], correct) };
    setSrs(s); write(K_SRS, s);
  }, []);

  const setNote = useCallback((tuneId, text) => {
    const n = { ...notesRef.current, [tuneId]: text };
    setNotes(n); write(K_NOTES, n);
  }, []);

  const addTune = useCallback(tune => {
    setCustom(prev => { const next = [...prev, tune]; write(K_CUSTOM, next); return next; });
    activate(tune.id);
  }, [activate]);

  const removeCustom = useCallback(id => {
    setCustom(prev => { const next = prev.filter(t => t.id !== id); write(K_CUSTOM, next); return next; });
    deactivate(id);
  }, [deactivate]);

  const goTab = id => { setTab(id); if (scrollRef.current) scrollRef.current.scrollTop = 0; };

  // ── Chrome, meta and the iOS fixes ─────────────────────────────────────
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
      html,body{height:100%;overflow:hidden;background:#0f0e17;}
      button,a,label,[role=button]{touch-action:manipulation;-webkit-user-select:none;user-select:none;}
      input,textarea,select{font-size:16px!important;}
      :root{--sat:env(safe-area-inset-top);--sab:env(safe-area-inset-bottom);}
    `;
    document.head.appendChild(style);

    const setMeta = (name, content) => { let m = document.querySelector(`meta[name="${name}"]`); if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m); } m.content = content; };
    setMeta('theme-color', '#0f0e17');
    setMeta('viewport', 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title', 'Fretworks');

    // Single PWA: point at the shell's manifest rather than competing with it.
    let mlink = document.querySelector('link[rel="manifest"]');
    if (!mlink) { mlink = document.createElement('link'); mlink.rel = 'manifest'; document.head.appendChild(mlink); }
    mlink.href = '/manifest.webmanifest';

    // In standalone PWA mode WebKit initialises window.scrollY to the
    // safe-area inset (~50px), so taps register ~50px above where they look.
    // Pin the page at 0,0 — but stand down while a field is focused, because
    // with the keyboard up iOS scrolls the window to reveal the input and
    // fighting that is what buries the caret.
    window.scrollTo(0, 0);
    const lockScroll = () => {
      if (isFormField(document.activeElement)) return;
      if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0);
    };
    window.addEventListener('scroll', lockScroll, { passive: true });
    return () => { document.head.removeChild(style); window.removeEventListener('scroll', lockScroll); };
  }, []);

  // Keep the focused field above the keyboard. The app is a fixed 100dvh
  // column with its own scroller, and dvh does not shrink for the keyboard —
  // so the container is already at max scrollTop with nothing to scroll into.
  // Pad it by however much the keyboard covers FIRST, then scroll into that
  // room. visualViewport is the only thing that reports the space left.
  useEffect(() => {
    const vv = window.visualViewport;
    const apply = () => {
      const scroller = scrollRef.current;
      if (!scroller) return;
      const inset = vv ? Math.max(0, window.innerHeight - (vv.offsetTop + vv.height)) : 0;
      const want = isFormField(document.activeElement) ? inset : 0;
      if (scroller.style.paddingBottom !== `${want}px`) scroller.style.paddingBottom = `${want}px`;

      const el = document.activeElement;
      if (!isFormField(el) || !scroller.contains(el)) return;
      const r = el.getBoundingClientRect();
      const top = vv ? vv.offsetTop : 0;
      const bottom = top + (vv ? vv.height : window.innerHeight);
      const M = 16;
      if (r.bottom > bottom - M) scroller.scrollTop += r.bottom - bottom + M;
      else if (r.top < top + M) scroller.scrollTop -= top + M - r.top;
    };
    // The keyboard animates in, so measuring at focusin still sees the old
    // viewport; visualViewport's resize is the real signal.
    const onFocusIn = e => { if (isFormField(e.target)) setTimeout(apply, 300); };
    const onFocusOut = () => setTimeout(apply, 100);
    const onResize = () => requestAnimationFrame(apply);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    vv?.addEventListener('resize', onResize);
    vv?.addEventListener('scroll', onResize);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      vv?.removeEventListener('resize', onResize);
      vv?.removeEventListener('scroll', onResize);
      if (scrollRef.current) scrollRef.current.style.paddingBottom = '';
    };
  }, []);

  if (!loaded) return (
    <div style={{ background: '#0f0e17', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, fontSize: '16px' }}>Loading…</div>
  );

  const shared = { tunes, byId, active, srs, notes, skills: SKILLS };

  return (
    <div style={{ background: '#0f0e17', height: '100dvh', display: 'flex', flexDirection: 'column', color: '#fffffe', fontFamily: 'var(--font-body)', WebkitFontSmoothing: 'antialiased' }}>
      <StandardsHeader />
      <TabBar toolKey={TOOL.key} accent={ACCENT} tabs={TABS} active={tab} onChange={goTab} />

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'none' }}>
        <div style={{ paddingBottom: 'max(32px,env(safe-area-inset-bottom))' }}>
          {tab === 'today' && <TodayTab {...shared} onGrade={grade} onGoTunes={() => goTab('tunes')} scrollRef={scrollRef} />}
          {tab === 'tunes' && <TunesTab {...shared} onActivate={activate} onDeactivate={deactivate} onSetNote={setNote} onAddTune={addTune} onRemoveCustom={removeCustom} onGrade={grade} scrollRef={scrollRef} />}
          {tab === 'progress' && <ProgressTab {...shared} onGoTunes={() => goTab('tunes')} />}
          {tab === 'guide' && <GuideTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
