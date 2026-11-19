import { gsap, q, qa, ScrollTrigger, SplitText } from './gsap';

const enter = (trigger: Element, start = 'top 75%') => ({
  trigger,
  start,
  toggleActions: 'play none none reverse',
});

/* ---------- Trust ---------- */
export function initTrust(animate: boolean) {
  const section = q('.trust')!;
  const title = q('.trust__title', section)!;
  const split = SplitText.create(title, { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });

  if (animate) {
    gsap.from(split.words, {
      yPercent: 110,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.035,
      scrollTrigger: enter(title),
    });
    gsap.from('.trust__body', { y: 30, autoAlpha: 0, duration: 1, scrollTrigger: enter(q('.trust__body')!, 'top 85%') });
  }

  // Ticker: endless, speeds up with scroll velocity.
  const row = q('.ticker__row', section)!;
  const loop = gsap.to(row, { xPercent: -50, duration: 36, ease: 'none', repeat: -1 });
  if (animate) {
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.min(4, 1 + Math.abs(self.getVelocity()) / 900);
        gsap.to(loop, { timeScale: v, duration: 0.5, overwrite: true });
      },
    });
  }
}

/* ---------- CTA ---------- */
export function initCTA(animate: boolean) {
  const section = q('.cta')!;
  if (!animate) return;

  // Headline rises word by word, in reading order.
  const split = SplitText.create('.cta__line', { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });
  gsap.from(split.words, {
    yPercent: 110,
    autoAlpha: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.07,
    scrollTrigger: enter(section, 'top 70%'),
  });
  gsap.from('.cta__copy, .cta__inner .btn', { y: 30, autoAlpha: 0, stagger: 0.12, scrollTrigger: enter(section, 'top 60%') });
}
