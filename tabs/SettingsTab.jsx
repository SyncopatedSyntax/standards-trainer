import { ProgressBackup } from '@fretworks/design';
import { btn, panel, labelCss } from '../components/ui.jsx';
import { TOOL } from '../lib/tool.js';
import { PREFIX } from '../lib/store.js';

// The longest gap between refreshers (lib/srs.js capDue). 0 = no ceiling,
// which is plain SM-2: 1, 6, 15, 38, 95, 238, 595 days.
const GAPS = [[30, '1 month'], [60, '2 months'], [90, '3 months'], [180, '6 months'], [0, 'No limit']];

export default function SettingsTab({ maxGap, onSetMaxGap }) {
  return (
    <div style={{ padding: '14px', maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ ...panel, marginBottom: '12px' }}>
        <div style={labelCss}>Longest gap between refreshers</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {GAPS.map(([days, label]) => (
            <button key={days} onClick={() => onSetMaxGap(days)} aria-pressed={maxGap === days}
              style={{ ...btn(maxGap === days), minHeight: '40px', padding: '6px 12px' }}>{label}</button>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '9px', lineHeight: 1.6 }}>
          Every Got it pushes a skill further out — left alone, past a year for a tune you know well.
          This is the most it will wait: even your best-known tunes come back at least this often.
          Changing it takes effect straight away; your history is not touched.
        </div>
      </div>

      <div style={{ ...panel, marginBottom: '12px' }}>
        <div style={labelCss}>Backup</div>
        <ProgressBackup toolKey={TOOL.key} prefix={PREFIX} />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '10px', lineHeight: 1.6 }}>
          Your repertoire, schedule, answer history and notes all live on this device.
          For the whole toolbox at once, use <b>Backup</b> on the launcher — it copies every
          trainer's progress to a private GitHub repo in one go.
        </div>
      </div>

      <div style={{ ...panel }}>
        <div style={labelCss}>Build</div>
        <div style={{ fontSize: '11px', color: '#888', fontFamily: 'var(--font-mono)' }}>{__BUILD_ID__}</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
          If this looks old after an update, use <b>↻ Update app</b> in the menu.
        </div>
      </div>
    </div>
  );
}
