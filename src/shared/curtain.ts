import { Flip, gsap, q, qa } from '../animations/gsap';

const COVERED = 'inset(0 0 0% 0)';
const LIFTED = 'inset(0 0 100% 0)';

/** Full intro for the home page: the mark assembles, then flies into the nav as the curtain lifts. */
export function playIntro(): Promise<void> {
  return new Promise((resolve) => {
    const curtain = q('#curtain')!;
    const panel = q('.curtain__panel', curtain)!;
    const mark = q('#curtain-mark')!;
    const navMark = q('.mark--nav')!;
    const words = qa('.curtain__words span', curtain);

    gsap.set(panel, { clipPath: COVERED });
    gsap.set(navMark, { autoAlpha: 0 });
    gsap.set([mark, words], { autoAlpha: 1 });
    gsap.set(words, { yPercent: 120, opacity: 0 });

    gsap
      .timeline({ defaults: { ease: 'expo.out' }, onComplete: () => (curtain.style.display = 'none') })
      .fromTo('.mark--curtain .mark__l', { x: -220, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 }, 0.15)
      .fromTo('.mark--curtain .mark__r', { x: 220, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 }, 0.15)
      .to(mark, { scale: 1.06, duration: 0.18, ease: 'power2.out' }, 0.95)
      .to(mark, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, 1.13)
      .to(words, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.09 }, 0.9)
      .add('lift', 1.95)
      .to(words, { yPercent: -120, opacity: 0, duration: 0.45, ease: 'power3.in', stagger: 0.04 }, 'lift')
      .add(() => Flip.fit(mark, navMark, { scale: true, duration: 0.95, ease: 'expo.inOut' }), 'lift+=0.1')
      .to(panel, { clipPath: LIFTED, duration: 1.05, ease: 'expo.inOut' }, 'lift+=0.15')
      .add(resolve, 'lift+=0.45')
      .to(navMark, { autoAlpha: 1, duration: 0.3 }, 'lift+=0.95')
      .to(mark, { autoAlpha: 0, duration: 0.2 }, 'lift+=1.0');
  });
}

/** Short reveal for inner pages: the mark pulses once, the curtain lifts. */
export function playReveal(): Promise<void> {
  return new Promise((resolve) => {
    const curtain = q('#curtain')!;
    const panel = q('.curtain__panel', curtain)!;
    const mark = q('#curtain-mark')!;
    gsap.set(panel, { clipPath: COVERED });
    gsap.set(mark, { autoAlpha: 1, scale: 0.7 });
    gsap.set('.curtain__words', { autoAlpha: 0 });
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
  gsap.set('.curtain__words', { autoAlpha: 0 });
  gsap
    .timeline({ onComplete: () => (window.location.href = href) })
    .to(panel, { clipPath: COVERED, duration: 0.7, ease: 'expo.inOut' }, 0)
    .fromTo(mark, { autoAlpha: 0, scale: 0.8, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0.35);
}
