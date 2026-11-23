import { gsap, ScrollTrigger, SplitText } from '../animations/gsap';

/**
 * ScrollTrigger config for an entrance that plays as its element scrolls up to `start`, and runs again on a later visit.
 *
 * Desktop: scrolled back above `start`, it reverses. On touch screens it waits instead until the element is below the
 * screen, then resets out of sight. `start` sits well up the screen, so reversing there hid text still in view: on a
 * phone, the slightest scroll back up (which also brings Safari's toolbar back) took a heading out and the next
 * scroll down brought it in again, as if every section played twice.
 */
export const enter = (trigger: Element | string, start = 'top 78%'): ScrollTrigger.Vars =>
  ScrollTrigger.isTouch === 1
    ? { trigger, start, toggleActions: 'play none none none', onEnter: resetBelowScreen }
    : { trigger, start, toggleActions: 'play none none reverse' };

/** The entrances already watched for leaving below the screen. */
const watched = new WeakSet<ScrollTrigger>();
/** An entrance (touch) resets, out of sight, once its element has gone below the screen, so it can play again. */
function resetBelowScreen(self: ScrollTrigger) {
  if (watched.has(self)) return;
  watched.add(self);
  ScrollTrigger.create({ trigger: self.trigger, start: 'top bottom', onLeaveBack: () => self.animation?.pause(0) });
}

/** Masked line/word reveal for a heading. Returns the SplitText so callers can reuse pieces. */
export function splitReveal(
  target: gsap.DOMTarget,
  opts: { trigger?: Element | string; start?: string; by?: 'words' | 'chars'; stagger?: number; delay?: number; scrollTrigger?: boolean } = {},
) {
  const by = opts.by ?? 'words';
  // By letter, the letters are grouped into words as well: on their own they let a line break mid-word (on a phone,
  // "Recruitme / nt").
  const split = SplitText.create(target, { type: by === 'chars' ? 'lines,words,chars' : 'lines,words', mask: 'lines', linesClass: 'split-line' });
  const pieces = by === 'chars' ? split.chars : split.words;
  const vars: gsap.TweenVars = {
    yPercent: 110,
    autoAlpha: 0,
    duration: 1.05,
    ease: 'expo.out',
    stagger: opts.stagger ?? (by === 'chars' ? 0.02 : 0.04),
    delay: opts.delay ?? 0,
  };
  if (opts.scrollTrigger !== false) {
    const el = typeof target === 'string' ? document.querySelector(target)! : (target as Element);
    vars.scrollTrigger = enter(opts.trigger ?? el, opts.start);
  }
  return { split, tween: gsap.from(pieces, vars) };
}

/** Simple fade-up for a set of elements on scroll. */
export function fadeUp(targets: gsap.DOMTarget, trigger?: Element | string, vars: gsap.TweenVars & { start?: string } = {}) {
  const first = gsap.utils.toArray<Element>(targets)[0];
  if (!first) return null;
  const { start, ...rest } = vars;
  // Opacity, not autoAlpha: content waiting to fade in (a form's fields, say) can still be reached with Tab, and boot.ts
  // scrolls to it when it takes focus.
  return gsap.from(targets, {
    y: 36,
    opacity: 0,
    duration: 1,
    ease: 'expo.out',
    stagger: 0.08,
    scrollTrigger: enter(trigger ?? first, start ?? 'top 82%'),
    ...rest,
  });
}

/** Animate a number in an element from its current value to `to`. */
export function rollNumber(el: HTMLElement, to: number, format: (n: number) => string, duration = 0.8) {
  const from = Number((el.dataset.value ?? el.textContent ?? '0').replace(/[^\d.-]/g, '')) || 0;
  const obj = { v: from };
  el.dataset.value = String(to);
  return gsap.to(obj, { v: to, duration, ease: 'power3.out', onUpdate: () => (el.textContent = format(obj.v)) });
}

/**
 * CSS `position: sticky` does not work inside ScrollSmoother's fixed wrapper, so
 * sidebars pin with ScrollTrigger instead. `container` is the grid the sidebar
 * should stay within. Only applies above 900px; smaller screens stack.
 */
export function stickyPin(el: Element, container: Element, offset = 96) {
  return gsap.matchMedia().add('(min-width: 901px)', () => {
    ScrollTrigger.create({
      trigger: el,
      start: `top ${offset}px`,
      endTrigger: container,
      end: () => `bottom ${(el as HTMLElement).offsetHeight + offset}px`,
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
  });
}
