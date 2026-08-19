import { ProgressBackup } from '@fretworks/design';
import { panel, labelCss } from '../components/ui.jsx';
import { TOOL } from '../lib/tool.js';
import { PREFIX } from '../lib/store.js';

export default function SettingsTab() {
  return (
    <div style={{ padding: '14px', maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ ...panel, marginBottom: '12px' }}>
        <div style={labelCss}>Backup</div>
        <ProgressBackup toolKey={TOOL.key} prefix={PREFIX} />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '10px', lineHeight: 1.6 }}>
          Your repertoire, schedule and the changes you have typed in all live on this device.
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
