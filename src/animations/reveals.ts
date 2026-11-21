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
  // Still with reduced motion; otherwise it runs only while on screen.
  if (!animate) return;
  const loop = gsap.to(row, { xPercent: -50, duration: 36, ease: 'none', repeat: -1, paused: true });
  const speed = gsap.quickTo(loop, 'timeScale', { duration: 0.5 });
  // Its pause button (anything moving on its own for more than five seconds needs one).
  let held = false;
  let onScreen = false;
  const pause = q<HTMLButtonElement>('.ticker__pause', section);
  pause?.addEventListener('click', () => {
    held = !held;
    pause.setAttribute('aria-pressed', String(held));
    pause.setAttribute('aria-label', held ? 'Play the list' : 'Pause the list');
    if (held) loop.pause();
    else if (onScreen) loop.play();
  });
  ScrollTrigger.create({
    trigger: q('.ticker', section) ?? section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      onScreen = self.isActive;
      if (self.isActive && !held) loop.play();
      else loop.pause();
    },
    onUpdate: (self) => speed(Math.min(4, 1 + Math.abs(self.getVelocity()) / 900)),
  });
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
  gsap.from('.cta__copy, .cta__inner .bp', { y: 30, autoAlpha: 0, stagger: 0.12, scrollTrigger: enter(section, 'top 60%') });
}
