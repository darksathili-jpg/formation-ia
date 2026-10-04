const STORAGE_KEY = 'latent-v3-display-mode';
const MODES = new Set(['dark', 'light', 'projector']);

function readStoredMode() {
  try {
    const value = globalThis.localStorage?.getItem(STORAGE_KEY);
    return MODES.has(value) ? value : null;
  } catch {
    return null;
  }
}

function requestedMode() {
  try {
    const value = new URLSearchParams(globalThis.location?.search || '').get('theme');
    return MODES.has(value) ? value : null;
  } catch {
    return null;
  }
}

export function applyDisplayMode(mode, { persist = true } = {}) {
  const safeMode = MODES.has(mode) ? mode : 'dark';
  document.documentElement.dataset.theme = safeMode;
  document.documentElement.style.colorScheme = safeMode === 'dark' ? 'dark' : 'light';

  for (const button of document.querySelectorAll('[data-display-mode]')) {
    const active = button.dataset.displayMode === safeMode;
    button.setAttribute('aria-pressed', String(active));
    button.dataset.active = String(active);
  }

  if (persist) {
    try { globalThis.localStorage?.setItem(STORAGE_KEY, safeMode); } catch {}
  }
  return safeMode;
}

export function initDisplayMode() {
  const initial = requestedMode() || readStoredMode() || 'dark';
  applyDisplayMode(initial, { persist: false });

  for (const button of document.querySelectorAll('[data-display-mode]')) {
    button.addEventListener('click', () => applyDisplayMode(button.dataset.displayMode));
  }

  return initial;
}

initDisplayMode();
