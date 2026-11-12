import { gsap, q, qa, ScrollTrigger } from './gsap';
import { initClouds } from '../shared/cta-clouds';

/**
 * Source → Engage → Place.
 *
 * Pinned (desktop): the section holds while it plays as one scrubbed timeline.
 *   0 → 1    The cloud sky with "Source. Engage. Place." The clouds part to the sides and
 *            the sky flattens to brand blue (#00B0FF), and the words lift off.
 *   1 → 4    A dotted axis with a square marker sits in the centre. Each step's card and
 *            copy rise in on alternating sides, hold, then rise away for the next.
 * Stacked (phones, reduced motion): the sky opens the section and the steps
 * follow in normal flow, each revealed as it scrolls in.
 *
 * Returns a cleanup for gsap.matchMedia.
 */
export function initFlow(pinned: boolean, animate = true) {
  const section = q('.flow')!;
  const pin = q('.flow__pin', section)!;
  const intro = q('.flow__intro', section)!;
  const sky = q<HTMLCanvasElement>('.flow__sky', section)!;
  const introCopy = q('.flow__intro-copy', section)!;
  const words = qa('.flow__title span', section);
  const axis = q('.flow__axis', section)!;
  const marker = q('.flow__marker', section)!;
  const steps = qa<HTMLElement>('.fstep', section);
  const rail = q('#rail')!;
  const railFill = q('.rail__fill', rail)!;
  const railItems = qa('.rail__items li', rail);

  const clouds = initClouds(section, sky, 'flow--sky', !animate);

  // Fit each illustration's viewBox to its drawing, so every card frames its art the same way.
  qa<SVGSVGElement>('.fstep__art', section).forEach((svg) => {
    const b = svg.getBBox();
    if (!b.width) return;
    const pad = 18;
    svg.setAttribute('viewBox', `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
  });
  section.classList.toggle('flow--pinned', pinned);

  let current = -1;
  const setCurrent = (i: number) => {
    if (i === current) return;
    current = i;
    railItems.forEach((li, j) => li.classList.toggle('is-active', j === i));
    if (pinned && i >= 0) gsap.fromTo(marker, { scale: 1.8 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  };

  const parts = (step: HTMLElement) => ({
    card: q('.fstep__card', step)!,
    copy: qa('.fstep__copy > *', step),
    // Dashed guides keep their dashes: drawSVG would replace the dash pattern.
    lines: qa('.fstep__art path:not(.art-faint), .fstep__art circle', step),
  });

  if (!pinned) {
    if (animate) {
      gsap.from(words, { yPercent: 60, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 70%' } });
      steps.forEach((step) => {
        const { card, copy } = parts(step);
        gsap.from(card, { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 80%' } });
        gsap.from(copy, { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 70%' } });
      });
    }
    steps.forEach((step, i) =>
      ScrollTrigger.create({ trigger: step, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setCurrent(i) }),
    );
    return () => section.classList.remove('flow--pinned');
  }

  const STEP = 1; // timeline units per step
  const INTRO = 1;
  const total = INTRO + steps.length * STEP + 0.2;

  gsap.set(steps, { autoAlpha: 0 });
  gsap.set(axis, { autoAlpha: 0, scaleY: 0.4 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${window.innerHeight * total}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onToggle: (self) => rail.classList.toggle('rail--visible', self.isActive && self.progress > INTRO / total),
      onUpdate: (self) => {
        const t = self.progress * total - INTRO;
        rail.classList.toggle('rail--visible', self.isActive && t > 0);
        gsap.set(railFill, { height: `${Math.min(1, Math.max(0, t / (steps.length * STEP))) * 100}%` });
        setCurrent(t < 0 ? -1 : Math.min(steps.length - 1, Math.floor(t / STEP)));
      },
    },
  });

  // Intro: the clouds part to the sides and the sky flattens to brand blue.
  const parting = { amount: 0 };
  tl.fromTo(
    parting,
    { amount: 0 },
    { amount: 1.3, duration: INTRO, ease: 'sine.inOut', onUpdate: () => clouds?.setPart(parting.amount) },
    0,
  )
    .to(words, { yPercent: -40, autoAlpha: 0, duration: 0.3, stagger: 0.05, ease: 'power2.in' }, INTRO * 0.6)
    .to(introCopy.querySelector('.eyebrow'), { autoAlpha: 0, duration: 0.2 }, INTRO * 0.6)
    // Flat blue now: hide the intro (its fallback gradient too) and stop the shader drawing.
    .set(intro, { autoAlpha: 0 }, INTRO + 0.02)
    .set(sky, { display: 'none' }, INTRO + 0.02)
    .to(axis, { autoAlpha: 1, scaleY: 1, duration: 0.25, ease: 'power2.out' }, INTRO - 0.1);

  steps.forEach((step, i) => {
    const at = INTRO + i * STEP;
    const { card, copy, lines } = parts(step);
    const fromSide = step.classList.contains('fstep--left') ? -1 : 1;
    tl.set(step, { autoAlpha: 1 }, at)
      .fromTo(card, { y: '45vh', autoAlpha: 0, rotate: fromSide * 2 }, { y: 0, autoAlpha: 1, rotate: 0, duration: 0.35, ease: 'power3.out' }, at)
      .fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.4, stagger: 0.004, ease: 'power1.inOut' }, at + 0.12)
      .fromTo(copy, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, stagger: 0.04, ease: 'power3.out' }, at + 0.08);
    if (i < steps.length - 1) {
      tl.to(card, { y: '-45vh', autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, at + STEP - 0.3)
        .to(copy, { y: -60, autoAlpha: 0, duration: 0.25, stagger: 0.02, ease: 'power2.in' }, at + STEP - 0.3)
        .set(step, { autoAlpha: 0 }, at + STEP);
    }
  });
  tl.to({}, { duration: 0.2 }, total - 0.2);

  return () => {
    section.classList.remove('flow--pinned');
    rail.classList.remove('rail--visible');
  };
}
