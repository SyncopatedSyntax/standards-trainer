// The repertoire. Two things in one list: the shipped curriculum, in teaching
// order, and whatever you have taken on — including tunes you added yourself.
//
// Adding a tune means the core path first, your own tune only as a fallback.
// Mine opens with "+ Add a tune", which goes to the core path rather than to a
// blank form; a search in Mine falls through to the core path's matches; and
// "add your own" lives at the END of the core path, or appears when a search
// finds nothing anywhere — with what you typed already in the title. It used to
// sit at the foot of Mine, where it was both the most prominent way to add a
// tune and, once the list grew, the hardest to reach.

import { useState, useMemo, useRef, useEffect } from 'react';
import TuneDetail from '../components/TuneDetail.jsx';
import { btn, panel, labelCss, Field } from '../components/ui.jsx';
import { ACCENT } from '../lib/tool.js';
import TuneStatus, { groupByStage, STAGES, UP_NEXT } from '../components/TuneStatus.jsx';
import { TIERS, CORE_TUNES } from '../data/tunes.js';
import { tuneIsReady, todayStr } from '../lib/srs.js';

const slug = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

export default function TunesTab({ tunes, byId, active, upNext, srs, notes, skills, onActivate, onDeactivate, onSetNote, onToggleNext, onAddTune, onRemoveCustom, onGrade, onUngrade, onEditAnswer, onDeleteAnswer, onClearEarlier, scrollRef, openId, onOpened }) {
  const [sel, setSel] = useState(null);
  // Open on your own repertoire once you have one. The core path is the right
  // first screen exactly once — after that, "what am I working on" is the
  // question this tab is opened to answer.
  const [filter, setFilter] = useState(() => (active.length || upNext.length ? 'mine' : 'core'));
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [pickHint, setPickHint] = useState(false);   // arrived at the core path via "+ Add a tune"

  const [draft, setDraft] = useState({ title: '', composer: '', key: '', form: 'AABA', bars: 32, feel: '' });
  const savedScrollY = useRef(0);

  const list = useMemo(() => {
    let r = filter === 'mine' ? tunes.filter(t => active.includes(t.id) || upNext.includes(t.id))
      : filter === 'core' ? tunes.filter(t => !t.custom)
        : tunes;
    const q = search.trim().toLowerCase();
    if (q) r = r.filter(t => t.title.toLowerCase().includes(q) || (t.composer || '').toLowerCase().includes(q));
    return r;
  }, [tunes, active, upNext, filter, search]);
  const q = search.trim();
  // Searching Mine for a tune you have not taken on yet: show the core path's
  // matches under your own, rather than "no results".
  const coreMatches = useMemo(() => {
    if (filter !== 'mine' || !q) return [];
    const lq = q.toLowerCase();
    return tunes.filter(t => !t.custom && !active.includes(t.id) && !upNext.includes(t.id)
      && (t.title.toLowerCase().includes(lq) || (t.composer || '').toLowerCase().includes(lq)));
  }, [tunes, active, upNext, filter, q]);

  const today = todayStr();

  // Group by tier so the curriculum's shape is visible, not just a flat list —
  // except in Mine, which groups by STAGE instead: needs a refresher, learning,
  // up next, in repertoire. Tiers there would be chrome; what you want from
  // your own list is what to play and what you already know. Within a stage,
  // the `byAttention` order Progress uses too.
  const grouped = useMemo(() => {
    if (filter === 'mine') {
      const st = groupByStage(list.filter(t => active.includes(t.id)).map(t => t.id), srs, skills, today);
      const nextIds = upNext.filter(id => !active.includes(id) && list.some(t => t.id === id));
      const head = s => ({ n: s.id, label: s.label, blurb: s.blurb, colour: s.colour });
      return [
        ...STAGES.filter(s => s.id !== 'repertoire').map(s => ({ tier: head(s), tunes: st[s.id].map(id => byId.get(id)) })),
        { tier: head(UP_NEXT), tunes: nextIds.map(id => byId.get(id)) },
        { tier: head(STAGES.find(s => s.id === 'repertoire')), tunes: st.repertoire.map(id => byId.get(id)) },
        { tier: { n: 'core-match', label: 'In the core path', blurb: 'Not yours yet. Tap one to start learning it, or put it on Up next.', colour: '#8a88a0' }, tunes: coreMatches },
      ].filter(g => g.tunes.length);
    }
    const out = [];
    for (const tier of TIERS) {
      const inTier = list.filter(t => t.tier === tier.n);
      if (inTier.length) out.push({ tier, tunes: inTier });
    }
    const custom = list.filter(t => t.custom);
    if (custom.length) out.push({ tier: { n: 0, label: 'Your own tunes', blurb: 'Added by you — they schedule exactly like the rest.' }, tunes: custom });
    return out;
  }, [list, filter, srs, skills, today, active, upNext, byId, coreMatches]);
  const noResults = !!q && grouped.every(g => !g.tunes.length);
  const counts = useMemo(() => {
    const st = groupByStage(active, srs, skills, today);
    return { learned: st.refresher.length + st.repertoire.length, learning: st.learning.length, next: upNext.filter(id => !active.includes(id)).length };
  }, [active, upNext, srs, skills, today]);

  // Opened from another tab. This sits above the early return below, with
  // every other hook — a hook after it would not run on the renders where a
  // tune is open, which is how this file shipped broken once already.
  useEffect(() => {
    if (!openId) return;
    if (scrollRef?.current) { savedScrollY.current = 0; scrollRef.current.scrollTop = 0; }
    setSel(openId);
    onOpened?.();
  }, [openId, onOpened, scrollRef]);

  const handleSel = id => {
    savedScrollY.current = scrollRef?.current ? scrollRef.current.scrollTop : 0;
    if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    setSel(id);
  };
  const back = () => { setSel(null); requestAnimationFrame(() => { if (scrollRef?.current) scrollRef.current.scrollTop = savedScrollY.current; }); };

  const tune = sel ? byId.get(sel) : null;
  if (tune) {
    return <TuneDetail tune={tune} active={active} upNext={upNext} srs={srs} notes={notes} skills={skills}
      onBack={back} onActivate={onActivate} onDeactivate={onDeactivate}
      onSetNote={onSetNote} onToggleNext={onToggleNext} onGrade={onGrade} onUngrade={onUngrade} onEditAnswer={onEditAnswer} onDeleteAnswer={onDeleteAnswer} onClearEarlier={onClearEarlier} onRemoveCustom={onRemoveCustom} />;
  }

  const saveNew = () => {
    const title = draft.title.trim();
    if (!title) return;
    let id = slug(title) || 'tune';
    if (byId.has(id)) id = `${id}-${Date.now().toString(36).slice(-4)}`;
    onAddTune({
      id, title, composer: draft.composer.trim() || 'Unknown',
      key: draft.key.trim() || 'C', form: draft.form, bars: Number(draft.bars) || 32,
      feel: draft.feel.trim() || 'Medium swing', tempoLo: 120, tempoHi: 180, tier: 0,
      why: '', custom: true,
    });
    setDraft({ title: '', composer: '', key: '', form: 'AABA', bars: 32, feel: '' });
    setAdding(false);
    setSearch('');
    setPickHint(false);
    setFilter('mine');
  };

  const ownForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={labelCss}>Add a tune of your own</div>
      <Field label="Title" value={draft.title} onChange={v => setDraft({ ...draft, title: v })} placeholder="e.g. Bye Bye Blackbird" />
      <Field label="Composer" value={draft.composer} onChange={v => setDraft({ ...draft, composer: v })} placeholder="optional" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}><Field label="Key" value={draft.key} onChange={v => setDraft({ ...draft, key: v })} placeholder="F" /></div>
        <div style={{ flex: 1 }}><Field label="Bars" value={String(draft.bars)} onChange={v => setDraft({ ...draft, bars: v.replace(/\D/g, '') })} placeholder="32" /></div>
      </div>
      <Field label="Feel" value={draft.feel} onChange={v => setDraft({ ...draft, feel: v })} placeholder="Medium swing" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={saveNew} disabled={!draft.title.trim()} style={{ ...btn(true), flex: 1, opacity: draft.title.trim() ? 1 : 0.4 }}>Add it</button>
        <button onClick={() => setAdding(false)} style={btn(false)}>Cancel</button>
      </div>
    </div>
  );

  const pill = (id, label, n) => {
    const on = filter === id;
    return (
      <button key={id} onClick={() => { setFilter(id); setPickHint(false); }}
        style={{ padding: '5px 11px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, border: `1px solid ${on ? ACCENT : '#2a2840'}`, background: on ? ACCENT + '22' : '#13121f', color: on ? ACCENT : '#777' }}>
        {label}{n != null && <span style={{ opacity: 0.7 }}> ({n})</span>}
      </button>
    );
  };

  return (
    <div style={{ padding: '14px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>Tunes</div>
          <div style={{ color: '#999', fontSize: '11px', marginTop: '1px' }}>
            {counts.learned} learned · {counts.learning} learning{counts.next ? ` · ${counts.next} up next` : ''}
          </div>
        </div>
        {/* At the top, so it never sinks below a growing list — and it opens
            the core path, not a blank form. */}
        {filter === 'mine' && (
          <button onClick={() => { setFilter('core'); setSearch(''); setPickHint(true); setAdding(false); if (scrollRef?.current) scrollRef.current.scrollTop = 0; }}
            style={{ ...btn(true), minHeight: '40px', padding: '6px 12px', flexShrink: 0 }}>+ Add a tune</button>
        )}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or composer…"
        style={{ width: '100%', background: '#13121f', border: '1px solid #2a2840', borderRadius: '9px', padding: '9px 12px', color: '#fff', fontSize: '13px', marginBottom: '10px', outline: 'none' }} />

      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {pill('mine', '★ Mine', active.length + counts.next)}
        {pill('core', 'Core path', CORE_TUNES.length)}
        {pill('all', 'All', tunes.length)}
      </div>

      {pickHint && filter === 'core' && (
        <div className="st-pop" style={{ ...panel, borderColor: ACCENT + '55', marginBottom: '12px', fontSize: '12px', color: '#c8c6da', lineHeight: 1.6 }}>
          <b style={{ color: ACCENT }}>Pick a tune to learn.</b> Tap one, then <b style={{ color: '#fff' }}>Start learning this</b> or
          {' '}<b style={{ color: '#fff' }}>Add to Up next</b>. Search above if you know the title. Not here at all?
          You can add your own at the bottom.
        </div>
      )}

      {filter === 'mine' && !q && active.length === 0 && counts.next === 0 && (
        <div style={{ ...panel, textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '30px', marginBottom: '6px' }}>🎺</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>No tunes yet</div>
          <div style={{ fontSize: '12px', color: '#999', lineHeight: 1.6, marginBottom: '12px' }}>
            Open the core path and start with the first one. Learn a handful properly rather than many badly.
          </div>
          <button onClick={() => setFilter('core')} style={{ ...btn(true), padding: '10px 18px' }}>Show the core path</button>
        </div>
      )}

      {grouped.map(({ tier, tunes: group }) => (
        <div key={tier.n} style={{ marginBottom: '16px' }}>
          <div style={{ ...labelCss, marginBottom: '2px', color: tier.colour || labelCss.color }}>
            {typeof tier.n === 'number' && tier.n > 0 ? `Tier ${tier.n} · ` : ''}{tier.label}{tier.colour ? ` (${group.length})` : ''}
          </div>
          <div style={{ fontSize: '11px', color: '#777', marginBottom: '8px', lineHeight: 1.5 }}>{tier.blurb}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {group.map(t => {
              const isActive = active.includes(t.id);
              const ready = isActive && tuneIsReady(srs, t.id, skills);
              const planned = !isActive && upNext.includes(t.id);
              return (
                <div key={t.id} onClick={() => handleSel(t.id)}
                  style={{ background: '#13121f', border: `1px solid ${ready ? ACCENT + '66' : isActive ? '#3a3852' : '#2a2840'}`, borderRadius: '10px', padding: '10px', cursor: 'pointer', touchAction: 'manipulation' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ready && <span style={{ color: ACCENT, marginRight: '4px' }}>✓</span>}{t.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#777', marginTop: '1px' }}>
                        {t.key === 'modal' ? 'modal' : t.key} · {t.bars} bars · {t.feel}
                      </div>
                    </div>
                    {isActive
                      ? <TuneStatus srs={srs} tuneId={t.id} skills={skills} today={today} />
                      : <span style={{ fontSize: '10px', color: planned ? UP_NEXT.colour : '#666', fontWeight: planned ? 700 : 400 }}>{planned ? 'up next' : 'not started'}</span>}
                  </div>
                  {!isActive && t.why && <div style={{ fontSize: '11px', color: '#8a88a0', marginTop: '5px', lineHeight: 1.5 }}>{t.why}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Your own tune — the fallback, never the first choice. Either a search
          found nothing anywhere (title pre-filled), or you have reached the end
          of the core path. Not in Mine: there it outranked the core path, and
          sank out of reach as the list grew. */}
      {noResults ? (
        <div style={panel}>
          {adding ? ownForm : (
            <>
              <div style={{ fontSize: '12.5px', color: '#bbb', lineHeight: 1.6, marginBottom: '10px' }}>
                Nothing called <b style={{ color: '#fff' }}>“{q}”</b> {filter === 'mine' ? 'in your tunes or the core path' : filter === 'core' ? 'in the core path' : 'here'}.
                {filter === 'core' && ' Check the spelling, or try the composer.'}
              </div>
              <button onClick={() => { setDraft(d => ({ ...d, title: q })); setAdding(true); }}
                style={{ ...btn(false), width: '100%', minHeight: '40px' }}>+ Add “{q}” as your own tune</button>
            </>
          )}
        </div>
      ) : filter !== 'mine' && (
        <div style={panel}>
          {adding ? ownForm : (
            <>
              <div style={{ fontSize: '11.5px', color: '#888', lineHeight: 1.6, marginBottom: '8px' }}>
                Not in the core path? Add it yourself — it schedules exactly like the rest.
              </div>
              <button onClick={() => setAdding(true)} style={{ ...btn(false), width: '100%', minHeight: '40px' }}>+ Add a tune of your own</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
