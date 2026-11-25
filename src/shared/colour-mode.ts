/**
 * Light and dark mode. The mode is `data-mode` on <html> ("light" or "dark"), which switches the colour tokens in
 * styles/tokens.css.
 *
 * The site is light by default, whatever the reader's system setting. Dark mode is there for anyone who picks it with
 * the switch: that choice is remembered in this browser. Each page's <head> runs the same check inline before first
 * paint, so the boot cover is already the right colour.
 *
 * The switch is in the nav: a sun / moon button beside "Book a demo" on desktop, and a sun and moon pair at the foot
 * of the mobile menu.
 *
 * (Not `data-theme`: sections already use that to tell the nav whether it sits over a light or a dark background.)
 */

export type Mode = 'light' | 'dark';

const KEY = 'ditto:colour-mode';
const listeners = new Set<(mode: Mode) => void>();

/** The mode the reader picked with the switch, if they have. */
export function chosenMode(): Mode | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
}

/** The reader's choice, or else light. */
export function savedMode(): Mode {
  return chosenMode() ?? 'light';
}

export function currentMode(): Mode {
  return document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light';
}

function apply(mode: Mode) {
  if (mode === currentMode() && document.documentElement.dataset.mode) return;
  document.documentElement.dataset.mode = mode;
  syncToggles();
  listeners.forEach((fn) => fn(mode));
}

/** Puts the reader's mode on the page. Call before the page renders, so it never flashes the other one. */
export function applySavedMode() {
  document.documentElement.dataset.mode = savedMode();
}

/** Called with the new mode whenever it changes (the shaders and the CTA's join follow it). */
export function onModeChange(fn: (mode: Mode) => void) {
  listeners.add(fn);
}

/** The reader's choice: applied and remembered. */
export function setMode(mode: Mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable: it just won't be remembered */
  }
  apply(mode);
}

const SUN = `<svg class="mode-icon mode-icon--sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2.75v1.5M12 19.75v1.5M2.75 12h1.5M19.75 12h1.5M5.46 5.46l1.06 1.06M17.48 17.48l1.06 1.06M5.46 18.54l1.06-1.06M17.48 6.52l1.06-1.06"/></svg>`;
const MOON = `<svg class="mode-icon mode-icon--moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20.25 14.6A8.25 8.25 0 0 1 9.4 3.75a8.25 8.25 0 1 0 10.85 10.85Z"/></svg>`;

/** Desktop: a round button beside "Book a demo", in the same glass. Shows the moon in light mode, the sun in dark. */
export function navModeHtml() {
  return `<button class="nav__cta nav__mode" type="button" data-toggle-mode aria-label="Switch to dark mode">${MOON}${SUN}</button>`;
}

/** Phones: a sun and moon pair at the foot of the menu, the current mode's side filled. */
export function menuModeHtml() {
  return `
    <div class="menu__mode" role="group" aria-label="Appearance">
      <button type="button" class="menu__mode-btn" data-set-mode="light" aria-label="Light mode" aria-pressed="false">${SUN}</button>
      <button type="button" class="menu__mode-btn" data-set-mode="dark" aria-label="Dark mode" aria-pressed="false">${MOON}</button>
    </div>`;
}

function syncToggles() {
  const mode = currentMode();
  document.querySelectorAll<HTMLButtonElement>('[data-set-mode]').forEach((b) => {
    const on = b.dataset.setMode === mode;
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('is-on', on);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-toggle-mode]').forEach((b) => {
    b.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

/** Wires the switches. */
export function initModeToggle() {
  syncToggles();
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const set = target.closest<HTMLButtonElement>('[data-set-mode]');
    if (set) return setMode(set.dataset.setMode === 'dark' ? 'dark' : 'light');
    if (target.closest('[data-toggle-mode]')) setMode(currentMode() === 'dark' ? 'light' : 'dark');
  });
}
