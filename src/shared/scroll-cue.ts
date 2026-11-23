import { gsap, ScrollTrigger } from '../animations/gsap';

/**
 * How far through a held section the cue stays up; it fades out over the rest, just before the section lets go. Late
 * enough to stay on the last resting point (Home's Place panel settles at 92%), where a nudge is still needed.
 */
const UNTIL = 0.96;

/**
 * "Keep scrolling." (Figma 2438:243): a quiet line and chevron at the foot of the screen while a section holds the
 * page in place (Home's Source / Engage / Place and AI cards, the About and Product lens stages), so nobody thinks the
 * page has stuck. Any ScrollTrigger that pins with pin spacing counts, so new held sections get it without wiring;
 * layers pinned without spacing (backgrounds, the About rows) don't hold the page and are left out.
 *
 * Decorative (aria-hidden): the page scrolls on regardless.
 */
export function initScrollCue() {
  const cue = document.createElement('div');
  cue.className = 'scroll-cue';
  cue.setAttribute('aria-hidden', 'true');
  cue.innerHTML = `<span class="scroll-cue__text">Keep scrolling.</span><img class="scroll-cue__chev" src="/brand/scroll-chev.svg" width="16" height="16" alt="" />`;
  document.body.appendChild(cue);

  let held: ScrollTrigger[] = [];
  let count = -1;
  let shown = false;
  gsap.ticker.add(() => {
    // Some held sections are set up late (the lens stages wait for their fonts), so re-list when the set changes.
    const all = ScrollTrigger.getAll();
    if (all.length !== count) {
      count = all.length;
      held = all.filter((st) => st.pin && st.vars.pinSpacing !== false);
    }
    const on = held.some((st) => st.isActive && st.progress < UNTIL);
    if (on !== shown) {
      shown = on;
      cue.classList.toggle('is-on', on);
    }
  });
}
