/**
 * Light and dark mode. The mode is `data-mode` on <html> ("light" or "dark"), which switches the colour tokens in
 * styles/tokens.css. Light is the default; a reader's choice is remembered in this browser.
 *
 * Only pages built for dark mode apply it (they call applySavedMode() before rendering and put the toggle in their
 * footer): the others stay light whatever was chosen. FAQ is the first.
 *
 * (Not `data-theme`: sections already use that to tell the nav whether it sits over a light or a dark background.)
 */

export type Mode = 'light' | 'dark';

const KEY = 'ditto:colour-mode';
const listeners = new Set<(mode: Mode) => void>();

export function savedMode(): Mode {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function currentMode(): Mode {
  return document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light';
}

/** Puts the remembered mode on the page. Call before the page renders, so it never flashes the other one. */
export function applySavedMode() {
  document.documentElement.dataset.mode = savedMode();
}

/** Called with the new mode whenever the reader switches (the shaders and the CTA's join follow it). */
export function onModeChange(fn: (mode: Mode) => void) {
  listeners.add(fn);
}

export function setMode(mode: Mode) {
  if (mode === currentMode()) return;
  document.documentElement.dataset.mode = mode;
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable: it just won't be remembered */
  }
  syncToggles();
  listeners.forEach((fn) => fn(mode));
}

/** The footer's Light / Dark switch, as one more footer column. */
export function modeToggleHtml() {
  return `
    <div class="footer__col footer__mode">
      <p class="footer__title" id="mode-label">Appearance</p>
      <div class="mode-toggle" role="group" aria-labelledby="mode-label">
        <button type="button" class="mode-toggle__btn" data-set-mode="light" aria-pressed="false">Light</button>
        <button type="button" class="mode-toggle__btn" data-set-mode="dark" aria-pressed="false">Dark</button>
      </div>
    </div>`;
}

function syncToggles() {
  const mode = currentMode();
  document.querySelectorAll<HTMLButtonElement>('[data-set-mode]').forEach((b) => {
    const on = b.dataset.setMode === mode;
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('is-on', on);
  });
}

/** Wires the footer's switch. */
export function initModeToggle() {
  syncToggles();
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-set-mode]');
    if (btn) setMode(btn.dataset.setMode === 'dark' ? 'dark' : 'light');
  });
}
