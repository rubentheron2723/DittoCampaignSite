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
  cue.innerHTML = `<span class="scroll-cue__inner"><span class="scroll-cue__text">Keep scrolling.</span><img class="scroll-cue__chev" src="/brand/scroll-chev.svg" width="16" height="16" alt="" /></span>`;
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
