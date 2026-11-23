import { gsap, ScrollTrigger } from '../animations/gsap';

/** How long the reader has to be still inside a held section before the cue comes up, in ms. */
const IDLE = 5000;

/**
 * How far through a held section the cue stays up; it fades out over the rest, just before the section lets go. Late
 * enough to stay on the last resting point (Home's Place panel settles at 92%), where a nudge is still needed.
 */
const UNTIL = 0.96;

/**
 * "Keep scrolling." (Figma 2438:243): a quiet line and chevron at the foot of the screen, a gentle nudge for a reader
 * who has stopped for a while (IDLE) inside a section that holds the page in place (Home's Source / Engage / Place and
 * AI cards, the About and Product lens stages), so nobody thinks the page has stuck. Any scroll, wheel, touch, key or
 * click hides it at once and starts the wait again.
 *
 * Any ScrollTrigger that pins with pin spacing counts, so new held sections get it without wiring; layers pinned
 * without spacing (backgrounds, the About rows) don't hold the page and are left out.
 *
 * Decorative (aria-hidden): the page scrolls on regardless.
 */
export function initScrollCue() {
  const cue = document.createElement('div');
  cue.className = 'scroll-cue';
  cue.setAttribute('aria-hidden', 'true');
  cue.innerHTML = `<span class="scroll-cue__inner"><span class="scroll-cue__text">Keep scrolling.</span><svg class="scroll-cue__chev" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5306 6.53062L8.53063 11.5306C8.46095 11.6005 8.37815 11.656 8.28699 11.6939C8.19583 11.7317 8.09809 11.7512 7.99937 11.7512C7.90066 11.7512 7.80292 11.7317 7.71176 11.6939C7.6206 11.656 7.5378 11.6005 7.46812 11.5306L2.46813 6.53062C2.32723 6.38973 2.24807 6.19863 2.24807 5.99937C2.24807 5.80012 2.32723 5.60902 2.46813 5.46812C2.60902 5.32723 2.80012 5.24807 2.99938 5.24807C3.19863 5.24807 3.38973 5.32723 3.53063 5.46812L8 9.9375L12.4694 5.4675C12.6103 5.3266 12.8014 5.24745 13.0006 5.24745C13.1999 5.24745 13.391 5.3266 13.5319 5.4675C13.6728 5.6084 13.7519 5.79949 13.7519 5.99875C13.7519 6.19801 13.6728 6.3891 13.5319 6.53L13.5306 6.53062Z"/></svg></span>`;
  document.body.appendChild(cue);

  let held: ScrollTrigger[] = [];
  let count = -1;
  let shown = false;
  // The last time the reader did anything. Snapping and smoothing scroll the page too, so the wait starts once all
  // movement has settled.
  let lastActive = performance.now();
  const active = () => {
    lastActive = performance.now();
    if (shown) {
      shown = false;
      cue.classList.remove('is-on');
    }
  };
  for (const type of ['scroll', 'wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown']) {
    window.addEventListener(type, active, { passive: true, capture: true });
  }

  gsap.ticker.add(() => {
    // Some held sections are set up late (the lens stages wait for their fonts), so re-list when the set changes.
    const all = ScrollTrigger.getAll();
    if (all.length !== count) {
      count = all.length;
      held = all.filter((st) => st.pin && st.vars.pinSpacing !== false);
    }
    const on = performance.now() - lastActive >= IDLE && held.some((st) => st.isActive && st.progress < UNTIL);
    if (on !== shown) {
      shown = on;
      cue.classList.toggle('is-on', on);
    }
  });
}
