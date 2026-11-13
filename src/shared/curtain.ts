import { gsap, q } from '../animations/gsap';

const COVERED = 'inset(0 0 0% 0)';
const LIFTED = 'inset(0 0 100% 0)';

/** Short reveal for inner pages: the mark pulses once, the curtain lifts. */
export function playReveal(): Promise<void> {
  return new Promise((resolve) => {
    const curtain = q('#curtain')!;
    const panel = q('.curtain__panel', curtain)!;
    const mark = q('#curtain-mark')!;
    gsap.set(panel, { clipPath: COVERED });
    gsap.set(mark, { autoAlpha: 1, scale: 0.7 });
    gsap
      .timeline({ onComplete: () => (curtain.style.display = 'none') })
      .to(mark, { scale: 1, duration: 0.6, ease: 'expo.out' }, 0)
      .to(mark, { autoAlpha: 0, y: -30, duration: 0.4, ease: 'power3.in' }, 0.45)
      .to(panel, { clipPath: LIFTED, duration: 0.9, ease: 'expo.inOut' }, 0.5)
      .add(resolve, 0.75);
  });
}

export function hideCurtain() {
  const curtain = q('#curtain');
  if (curtain) curtain.style.display = 'none';
  gsap.set('.mark--nav', { autoAlpha: 1 });
}

/** Cover the page from the bottom, then navigate. */
export function coverAndGo(href: string) {
  const curtain = q('#curtain')!;
  const panel = q('.curtain__panel', curtain)!;
  const mark = q('#curtain-mark')!;
  curtain.style.display = '';
  gsap.set(panel, { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(mark, { autoAlpha: 0, scale: 0.8, y: 20, clearProps: 'transform', x: 0 });
  gsap
    .timeline({ onComplete: () => (window.location.href = href) })
    .to(panel, { clipPath: COVERED, duration: 0.7, ease: 'expo.inOut' }, 0)
    .fromTo(mark, { autoAlpha: 0, scale: 0.8, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0.35);
}
