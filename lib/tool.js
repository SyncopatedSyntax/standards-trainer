// Local mirror of this app's entry in the Fretworks tool registry
// (@fretworks/design → src/tools.js). AppHeader and TabBar resolve name and
// accent through toolByKey() only, so this descriptor is what the header falls
// back to until the registry entry ships — and once it has, the two agree.
// Keep them in sync.
export const TOOL = {
  key: 'standards',
  name: 'Standards Trainer',
  emoji: '🎺',
  accent: '#a78bfa',
  path: '/standards/',
};

export const ACCENT = TOOL.accent;
