import { gsap, q, qa, SplitText } from './gsap';

/**
 * Six capability chips orbit the Ditto mark. As the section pins and the user
 * scrolls, the orbit collapses: the chips converge into the mark, the mark
 * grows, and the headline settles in. "Everything... running inside one system."
 */
export function initSystem(animate = true) {
  const section = q('.system')!;
  const stage = q('.system__stage', section)!;
  const hub = q('.system__hub', section)!;
  const core = q('.system__core', section)!;
  const chips = qa<HTMLElement>('.orbit__chip', section);
  const rings = qa<HTMLElement>('.orbit__ring', section);

  const state = { angle: 0, converge: 0 };
  const n = chips.length;

  const radius = () => Math.min(window.innerWidth * 0.36, 300);

  function place() {
    const r = radius() * (1 - state.converge);
    const c = state.converge;
    chips.forEach((chip, i) => {
      const a = ((i / n) * Math.PI * 2 + state.angle) % (Math.PI * 2);
      gsap.set(chip, {
        x: Math.cos(a) * r,
        y: Math.sin(a) * r * 0.6, // ellipse so the orbit clears the headline below
        xPercent: -50,
        yPercent: -50,
        scale: 1 - c * 0.7,
        autoAlpha: 1 - Math.pow(c, 1.6),
      });
    });
    gsap.set(rings, { scale: 1 - c * 0.85, autoAlpha: 1 - c });
    gsap.set(core, { scale: 1 + c * 1.1 });
    gsap.set(hub, { y: c * -10 });
  }

  if (!animate) {
    state.converge = 0.15;
    place();
    window.addEventListener('resize', place);
    return;
  }

  // Idle rotation of the orbit.
  gsap.to(state, { angle: Math.PI * 2, duration: 70, repeat: -1, ease: 'none', onUpdate: place });

  // Scroll-scrubbed convergence while the stage is pinned.
  gsap.to(state, {
    converge: 1,
    ease: 'none',
    onUpdate: place,
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: '+=120%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Headline + lead reveal when the stage arrives.
  const split = SplitText.create('.system__line', { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });
  gsap.from(split.words, {
    yPercent: 110,
    autoAlpha: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.05,
    scrollTrigger: { trigger: stage, start: 'top 60%', toggleActions: 'play none none reverse' },
  });
  gsap.from('.system__lead', {
    y: 30,
    autoAlpha: 0,
    duration: 1,
    scrollTrigger: { trigger: stage, start: 'top 55%', toggleActions: 'play none none reverse' },
  });

  // The mark glows brighter as everything converges into it.
  gsap.to(core, {
    filter: 'drop-shadow(0 30px 90px rgba(0, 176, 255, 0.75))',
    ease: 'none',
    scrollTrigger: { trigger: stage, start: 'top top', end: '+=120%', scrub: true },
  });

  place();
  window.addEventListener('resize', place);
}
