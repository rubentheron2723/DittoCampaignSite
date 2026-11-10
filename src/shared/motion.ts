import { gsap, ScrollTrigger, SplitText } from '../animations/gsap';

/** ScrollTrigger config for a one-shot entrance that reverses when scrolled back above. */
export const enter = (trigger: Element | string, start = 'top 78%') => ({
  trigger,
  start,
  toggleActions: 'play none none reverse',
});

/** Masked line/word reveal for a heading. Returns the SplitText so callers can reuse pieces. */
export function splitReveal(
  target: gsap.DOMTarget,
  opts: { trigger?: Element | string; start?: string; by?: 'words' | 'chars'; stagger?: number; delay?: number; scrollTrigger?: boolean } = {},
) {
  const by = opts.by ?? 'words';
  const split = SplitText.create(target, { type: `lines,${by}`, mask: 'lines', linesClass: 'split-line' });
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
  return gsap.from(targets, {
    y: 36,
    autoAlpha: 0,
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
