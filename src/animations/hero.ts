import { finePointer, gsap, prefersReducedMotion, q, qa, SplitText } from './gsap';

/** Builds the hero entrance timeline (paused) and wires up ambient + scroll motion. */
export function initHero() {
  const reduce = prefersReducedMotion();
  const hero = q('.hero')!;
  const path = q<SVGPathElement>('#hero-path')!;
  const dots = qa<SVGCircleElement>('.hero__flow-dot');
  const cards = qa<HTMLElement>('.hcard');
  const rotator = qa('.hero__rotator span');

  // Headline: split into chars inside masked lines.
  const split = SplitText.create('.hero__title .hero__line', {
    type: 'lines,chars',
    mask: 'lines',
    linesClass: 'split-line',
  });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });

  tl.from('.hero__eyebrow', { y: 20, autoAlpha: 0, duration: 0.8 }, 0)
    .from(
      split.chars,
      { yPercent: 110, rotateX: -40, autoAlpha: 0, duration: 1.1, stagger: { each: 0.022, from: 'start' } },
      0.05,
    )
    .from('.hero__subhead', { y: 40, autoAlpha: 0, duration: 1 }, 0.55)
    .from('.hero__support', { y: 30, autoAlpha: 0, duration: 1 }, 0.7)
    .from('.hero__actions .btn', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.85)
    .from('.hero__cue', { autoAlpha: 0, duration: 0.8 }, 1.3)
    .from('.hero__mark', { scale: 0.85, autoAlpha: 0, rotate: -6, duration: 1.8, ease: 'power3.out' }, 0.2)
    .fromTo(path, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 2.2, ease: 'power2.inOut' }, 0.3)
    .from(cards, { y: 80, autoAlpha: 0, scale: 0.9, duration: 1.2, stagger: 0.12 }, 0.9)
    .add(() => startDots(), 1.4)
    .add(() => startRotator(), 1.5);

  // Scroll cue: a line that keeps drawing down.
  gsap.to('.hero__cue span', { scaleY: 0, transformOrigin: 'bottom', duration: 1.2, repeat: -1, yoyo: true, ease: 'power2.inOut' });

  // Candidate dots travel along the flow.
  function startDots() {
    if (reduce) return;
    dots.forEach((dot, i) => {
      gsap.set(dot, { autoAlpha: 1 });
      gsap.to(dot, {
        motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: 0, end: 1 },
        duration: 7 + i * 2.5,
        repeat: -1,
        ease: 'none',
        delay: i * 1.8,
      });
    });
  }

  // Rotating positioning lines.
  function startRotator() {
    if (reduce) {
      gsap.set(rotator[0], { autoAlpha: 1 });
      return;
    }
    gsap.set(rotator, { yPercent: 110, autoAlpha: 0 });
    const r = gsap.timeline({ repeat: -1 });
    rotator.forEach((el) => {
      r.to(el, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' })
        .to(el, { yPercent: -110, autoAlpha: 0, duration: 0.6, ease: 'expo.in' }, '+=2.6');
    });
  }

  // Pointer parallax on the cards.
  if (finePointer()) {
    const movers = cards.map((c) => ({
      depth: Number(c.dataset.depth ?? 1),
      x: gsap.quickTo(c, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(c, 'y', { duration: 1.2, ease: 'power3.out' }),
    }));
    const markX = gsap.quickTo('.hero__mark', 'x', { duration: 2, ease: 'power3.out' });
    const markY = gsap.quickTo('.hero__mark', 'y', { duration: 2, ease: 'power3.out' });
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => {
        m.x(nx * 40 * m.depth);
        m.y(ny * 30 * m.depth);
      });
      markX(nx * -30);
      markY(ny * -20);
    });
  }

  // Scroll: hero copy sinks and fades as the next section arrives.
  gsap.to('.hero__inner', {
    yPercent: 18,
    autoAlpha: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__bg', {
    yPercent: 10,
    scale: 1.06,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });

  return tl;
}
