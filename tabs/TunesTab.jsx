// The repertoire. Two things in one list: the shipped curriculum, in teaching
// order, and whatever you have taken on — including tunes you added yourself.

import { useState, useMemo, useRef, useEffect } from 'react';
import TuneDetail from '../components/TuneDetail.jsx';
import { btn, panel, labelCss, Field } from '../components/ui.jsx';
import { ACCENT } from '../lib/tool.js';
import TuneStatus, { byAttention } from '../components/TuneStatus.jsx';
import { TIERS, CORE_TUNES } from '../data/tunes.js';
import { tuneIsReady, todayStr } from '../lib/srs.js';
import { chartFor, countBars, countFilled } from '../lib/chart.js';

const slug = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

export default function TunesTab({ tunes, byId, active, srs, notes, charts, skills, onActivate, onDeactivate, onSetNote, onSetChart, onAddTune, onRemoveCustom, onGrade, onUngrade, scrollRef, openId, onOpened }) {
  const [sel, setSel] = useState(null);
  // Open on your own repertoire once you have one. The core path is the right
  // first screen exactly once — after that, "what am I working on" is the
  // question this tab is opened to answer.
  const [filter, setFilter] = useState(() => (active.length ? 'mine' : 'core'));
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: '', composer: '', key: '', form: 'AABA', bars: 32, feel: '' });
  const savedScrollY = useRef(0);

  const list = useMemo(() => {
    let r = filter === 'mine' ? tunes.filter(t => active.includes(t.id))
      : filter === 'core' ? tunes.filter(t => !t.custom)
        : tunes;
    const q = search.trim().toLowerCase();
    if (q) r = r.filter(t => t.title.toLowerCase().includes(q) || (t.composer || '').toLowerCase().includes(q));
    return r;
  }, [tunes, active, filter, search]);

  const today = todayStr();

  // Group by tier so the curriculum's shape is visible, not just a flat list —
  // except in Mine, where a handful of tunes spread across five tier headings
  // is all chrome and no information. There they go in one list, ordered by
  // what is asking for attention.
  const grouped = useMemo(() => {
    if (filter === 'mine') {
      const ids = list.map(t => t.id).sort(byAttention(srs, skills, today));
      const order = new Map(ids.map((id, i) => [id, i]));
      return [{ tier: { n: -1, label: 'Working on', blurb: 'Ordered by what wants reviewing. Tap one to grade it, edit the changes, or drop it.' },
                tunes: [...list].sort((a, b) => order.get(a.id) - order.get(b.id)) }];
    }
    const out = [];
    for (const tier of TIERS) {
      const inTier = list.filter(t => t.tier === tier.n);
      if (inTier.length) out.push({ tier, tunes: inTier });
    }
    const custom = list.filter(t => t.custom);
    if (custom.length) out.push({ tier: { n: 0, label: 'Your own tunes', blurb: 'Added by you — they schedule exactly like the rest.' }, tunes: custom });
    return out;
  }, [list, filter, srs, skills, today]);

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
    return <TuneDetail tune={tune} active={active} srs={srs} notes={notes} charts={charts} skills={skills}
      onBack={back} onActivate={onActivate} onDeactivate={onDeactivate}
      onSetNote={onSetNote} onSetChart={onSetChart} onGrade={onGrade} onUngrade={onUngrade} onRemoveCustom={onRemoveCustom} />;
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
    setFilter('mine');
  };

  const pill = (id, label, n) => {
    const on = filter === id;
    return (
      <button key={id} onClick={() => setFilter(id)}
        style={{ padding: '5px 11px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, border: `1px solid ${on ? ACCENT : '#2a2840'}`, background: on ? ACCENT + '22' : '#13121f', color: on ? ACCENT : '#777' }}>
        {label}{n != null && <span style={{ opacity: 0.7 }}> ({n})</span>}
      </button>
    );
  };

  return (
    <div style={{ padding: '14px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>Tunes</div>
        <div style={{ color: '#999', fontSize: '11px' }}>{active.length} in your repertoire</div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or composer…"
        style={{ width: '100%', background: '#13121f', border: '1px solid #2a2840', borderRadius: '9px', padding: '9px 12px', color: '#fff', fontSize: '13px', marginBottom: '10px', outline: 'none' }} />

      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {pill('mine', '★ Mine', active.length)}
        {pill('core', 'Core path', CORE_TUNES.length)}
        {pill('all', 'All', tunes.length)}
      </div>

      {filter === 'mine' && active.length === 0 && (
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
          <div style={{ ...labelCss, marginBottom: '2px' }}>{tier.n > 0 ? `Tier ${tier.n} · ` : ''}{tier.label}</div>
          <div style={{ fontSize: '11px', color: '#777', marginBottom: '8px', lineHeight: 1.5 }}>{tier.blurb}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {group.map(t => {
              const isActive = active.includes(t.id);
              const ready = isActive && tuneIsReady(srs, t.id, skills);
              const chart = isActive ? chartFor(charts, t) : null;
              const written = chart ? countFilled(chart) : 0;
              const barsTotal = chart ? countBars(chart) : 0;
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
                      : <span style={{ fontSize: '10px', color: '#666' }}>not started</span>}
                  </div>
                  {isActive && (
                    <div style={{ fontSize: '10px', color: written === barsTotal ? '#6b6980' : '#8a88a0', marginTop: '6px' }}>
                      {written === 0 ? '○ changes not written out yet'
                        : written < barsTotal ? `◐ changes ${written}/${barsTotal} bars`
                          : '● changes written out'}
                    </div>
                  )}
                  {!isActive && t.why && <div style={{ fontSize: '11px', color: '#8a88a0', marginTop: '5px', lineHeight: 1.5 }}>{t.why}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add your own */}
      <div style={panel}>
        {adding ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={labelCss}>Add a tune</div>
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
        ) : (
          <button onClick={() => setAdding(true)} style={{ ...btn(false), width: '100%' }}>+ Add a tune of your own</button>
        )}
      </div>
    </div>
  );
}
