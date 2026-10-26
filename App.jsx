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
import { K_ACTIVE, K_SRS, K_NOTES, K_CUSTOM, K_NEXT, K_SETTINGS, K_TUNE_SKILLS, read, write } from './lib/store.js';
import { gradeCard, ungradeCard, editAnswer, deleteAnswer, clearEarlier, cardId, withMaxGap, DEFAULT_MAX_GAP, withTuneSkills } from './lib/srs.js';
import { migrateCharts } from './lib/migrate.js';
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
  const [upNext, setUpNext] = useState([]);
  const [settings, setSettings] = useState({});
  const [tuneSkillMap, setTuneSkillMap] = useState({});   // js_skills
  // A tune the user asked to open from another tab. TunesTab owns the actual
  // detail-view state; this is just the request, cleared once it lands.
  const [openTune, setOpenTune] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(null);

  // Refs so the callbacks below stay stable while still seeing fresh state.
  const srsRef = useRef(srs); srsRef.current = srs;
  const activeRef = useRef(active); activeRef.current = active;
  const notesRef = useRef(notes); notesRef.current = notes;
  const nextRef = useRef(upNext); nextRef.current = upNext;
  const tuneSkillRef = useRef(tuneSkillMap); tuneSkillRef.current = tuneSkillMap;

  useEffect(() => {
    setActive(read(K_ACTIVE, []));
    setSrs(read(K_SRS, {}));
    setNotes(migrateCharts(read(K_NOTES, {})));
    setCustom(read(K_CUSTOM, []));
    setUpNext(read(K_NEXT, []));
    setSettings(read(K_SETTINGS, {}));
    setTuneSkillMap(read(K_TUNE_SKILLS, {}));
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
    // Starting a tune takes it off Up next: it is being learned now.
    if (nextRef.current.includes(id)) {
      const n = nextRef.current.filter(x => x !== id);
      setUpNext(n); write(K_NEXT, n);
    }
  }, []);

  // Up next: tunes you plan to learn. Nothing is scheduled for them — it is a
  // list, kept in the order you added to it.
  const toggleNext = useCallback(id => {
    const cur = nextRef.current;
    const n = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    setUpNext(n); write(K_NEXT, n);
  }, []);

  // Written only when changed; an absent setting reads as the default.
  const setMaxGap = useCallback(days => {
    setSettings(prev => { const s = { ...prev, maxGap: days }; write(K_SETTINGS, s); return s; });
  }, []);
  const maxGap = settings.maxGap === undefined ? DEFAULT_MAX_GAP : settings.maxGap;
  // Every screen reads the schedule through the refresher ceiling; grading
  // and history edits go to the raw cards via srsRef (lib/srs.js capDue).
  const srsView = useMemo(() => withMaxGap(srs, maxGap), [srs, maxGap]);

  // Dropping a tune removes its cards too. Keeping orphaned SRS state would
  // resurrect old intervals if it were ever taken back on, which reads as a
  // bug rather than a feature.
  const deactivate = useCallback(id => {
    const next = activeRef.current.filter(x => x !== id);
    setActive(next); write(K_ACTIVE, next);
    const s = { ...srsRef.current };
    for (const sk of SKILLS) delete s[cardId(id, sk.id)];
    setSrs(s); write(K_SRS, s);
    // Its skill choice goes with it: taken back on later, it starts with all four.
    if (tuneSkillRef.current[id]) {
      const { [id]: _gone, ...rest } = tuneSkillRef.current;
      setTuneSkillMap(rest); write(K_TUNE_SKILLS, rest);
    }
  }, []);

  // Switch one skill on or off for one tune (lib/srs.js withTuneSkills). At
  // least one always stays on. A tune back to all four is removed from the
  // map, so only tunes that differ are ever stored.
  const setTuneSkill = useCallback((tuneId, skillId, on) => {
    const cur = tuneSkillRef.current[tuneId] || SKILLS.map(s => s.id);
    const nextIds = SKILLS.map(s => s.id).filter(id => (id === skillId ? on : cur.includes(id)));
    if (!nextIds.length) return;
    const m = { ...tuneSkillRef.current };
    if (nextIds.length === SKILLS.length) delete m[tuneId]; else m[tuneId] = nextIds;
    setTuneSkillMap(m); write(K_TUNE_SKILLS, m);
  }, []);
  const skillsView = useMemo(() => withTuneSkills(SKILLS, tuneSkillMap), [tuneSkillMap]);

  // Every change to a card goes through lib/srs.js, which keeps its answer
  // history and replays the schedule from it: a repeat answer on the same day
  // replaces the first rather than stacking on it, and editing or deleting an
  // old answer re-derives the schedule. A null card has nothing left on record
  // (a first answer undone, an only answer deleted) and is removed outright.
  const putCard = useCallback((id, card) => {
    const s = { ...srsRef.current };
    if (card) s[id] = card; else delete s[id];
    setSrs(s); write(K_SRS, s);
  }, []);
  const grade = useCallback((id, correct) => putCard(id, gradeCard(srsRef.current[id], correct)), [putCard]);
  const ungrade = useCallback(id => putCard(id, ungradeCard(srsRef.current[id])), [putCard]);
  const editAns = useCallback((id, date, change) => putCard(id, editAnswer(srsRef.current[id], date, change)), [putCard]);
  const deleteAns = useCallback((id, date) => putCard(id, deleteAnswer(srsRef.current[id], date)), [putCard]);
  const clearEarly = useCallback(id => putCard(id, clearEarlier(srsRef.current[id])), [putCard]);

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
    if (nextRef.current.includes(id)) toggleNext(id);
  }, [deactivate, toggleNext]);

  const goTab = id => { setTab(id); if (scrollRef.current) scrollRef.current.scrollTop = 0; };
  const goTune = id => { setOpenTune(id); goTab('tunes'); };
  const clearOpenTune = useCallback(() => setOpenTune(null), []);

  // ── Chrome, meta and the iOS fixes ─────────────────────────────────────
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
      html,body{height:100%;overflow:hidden;background:#0f0e17;}
      button,a,label,[role=button]{touch-action:manipulation;-webkit-user-select:none;user-select:none;}
      input,textarea,select{font-size:16px!important;}
      :root{--sat:env(safe-area-inset-top);--sab:env(safe-area-inset-bottom);}
      @keyframes stPop{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
      .st-pop{animation:stPop .22s ease-out}
      @media (prefers-reduced-motion:reduce){.st-pop{animation:none}}
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

  const shared = { tunes, byId, active, upNext, srs: srsView, notes, skills: skillsView };

  return (
    <div style={{ background: '#0f0e17', height: '100dvh', display: 'flex', flexDirection: 'column', color: '#fffffe', fontFamily: 'var(--font-body)', WebkitFontSmoothing: 'antialiased' }}>
      <StandardsHeader />
      <TabBar toolKey={TOOL.key} accent={ACCENT} tabs={TABS} active={tab} onChange={goTab} />

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'none' }}>
        <div style={{ paddingBottom: 'max(32px,env(safe-area-inset-bottom))' }}>
          {tab === 'today' && <TodayTab {...shared} onGrade={grade} onUngrade={ungrade} onGoTunes={() => goTab('tunes')} onGoTune={goTune} />}
          {tab === 'tunes' && <TunesTab {...shared} onActivate={activate} onDeactivate={deactivate} onSetNote={setNote} onToggleNext={toggleNext} onAddTune={addTune} onRemoveCustom={removeCustom} onGrade={grade} onUngrade={ungrade} onEditAnswer={editAns} onDeleteAnswer={deleteAns} onClearEarlier={clearEarly} onSetTuneSkill={setTuneSkill} scrollRef={scrollRef} openId={openTune} onOpened={clearOpenTune} />}
          {tab === 'progress' && <ProgressTab {...shared} onGoTunes={() => goTab('tunes')} onGoTune={goTune} />}
          {tab === 'guide' && <GuideTab />}
          {tab === 'settings' && <SettingsTab maxGap={maxGap} onSetMaxGap={setMaxGap} />}
        </div>
      </div>
    </div>
  );
}
