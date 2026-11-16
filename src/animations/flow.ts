import { gsap, q, qa, ScrollTrigger } from './gsap';

/** Marquee speed along the slant, in pixels per second. */
const SPEED = 85;

/**
 * Source → Engage → Place (Figma node 2370:194): a side scroller. The section pins and scrolling down slides
 * the three panels sideways, settling on each one. Each panel carries its own field of faint slanted word lines, all
 * looping as marquees, and its illustration assembles itself as the panel arrives.
 *
 * The section above's black "Source. Engage. Place." line is carried in by a shared marquee: as this section scrolls
 * up to its pin, the line rises with it, rolls out on its flat slant (it never warps), and the Source field fades in
 * behind it.
 *
 * With reduced motion (animate = false) there is no pin, marquee or entrance: the panels stack, still, and the section
 * above keeps its own still line.
 */
export function initFlow(animate: boolean) {
  const section = q('.flow')!;
  const pin = q('.flow__pin', section)!;
  const bg = q('.flow__bg', section)!;
  const strip = q('.flow__strip', section)!;
  const panels = qa<HTMLElement>('.fpanel', section);

  if (!animate) {
    section.classList.add('flow--stacked');
    return;
  }

  /* ---------- The side scroll ---------- */
  const distance = () => strip.scrollWidth - window.innerWidth;
  const slide = gsap.to([bg, strip], {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Measured before the AI section's pin below (priority 1) and everything else that depends on this length.
      refreshPriority: 2,
      // Settle on the nearest panel. Not directional and no inertia: stopping just inside the section (or a fast
      // scroll into it) must not jump past the first panel.
      snap: { snapTo: 1 / (panels.length - 1), directional: false, inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
    },
  });

  // Each illustration assembles as its panel arrives: the pieces rise in one after another, then the white
  // connecting lines draw themselves. The copy of the later panels rises in with it.
  panels.forEach((panel, i) => {
    const pieces = qa('.fart__piece', panel);
    const lines = qa('.fart__piece path[stroke="white"]:not([fill])', panel);
    const copy = qa('.fpanel__copy > *', panel);
    // The first panel arrives by scrolling down; the others slide in from the right.
    const arrive = i === 0
      ? { trigger: section, start: 'top 55%' }
      : { trigger: panel, containerAnimation: slide, start: 'left 55%' };
    const tl = gsap.timeline({ scrollTrigger: { ...arrive, toggleActions: 'play none none reverse' } });
    tl.from(pieces, { y: 24, autoAlpha: 0, duration: 0.7, stagger: { amount: 0.6 }, ease: 'power3.out' })
      .fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, stagger: 0.12, ease: 'power1.inOut' }, 0.5);
    if (i > 0) tl.from(copy, { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, 0);
  });

  /* ---------- The shared marquee ---------- */
  const above = q('.system');
  const band = above && q('.system__loop', above);
  const anchor = q('.flow__marquee', section)!;
  const move = q('.flow__mq-move', anchor)!;
  const tilt = q('.flow__mq-tilt', anchor)!;
  const intro = q('.flow__mq-word', anchor)!;
  const field = q('.fpanel__words', panels[0])!;

  gsap.set(intro, { x: 0, y: 0, xPercent: -25, yPercent: -50 });

  // How far the anchor is from the centre of the band above, measured from layout (neither is pinned at refresh time).
  const offset = (axis: 'x' | 'y') => {
    if (!band) return 0;
    const b = band.getBoundingClientRect();
    const s = section.getBoundingClientRect();
    const a = getComputedStyle(anchor);
    return axis === 'x' ? b.left + b.width / 2 - (s.left + parseFloat(a.left)) : b.top + b.height / 2 - (s.top + parseFloat(a.top));
  };
  // From the section above's type size to this section's (both fluid, so measured).
  const grow = () => {
    const here = q('.fpanel__plane', section);
    return here ? parseFloat(getComputedStyle(here).fontSize) / parseFloat(getComputedStyle(tilt).fontSize) : 1;
  };

  // The move wrapper's transform is CSS, driven by --k (1 = on the band above, 0 = home here); the distances and the
  // size change are measured into variables on every refresh, so the tween itself never holds stale numbers.
  const measure = () => {
    move.style.setProperty('--dx', `${offset('x')}px`);
    move.style.setProperty('--dy', `${offset('y')}px`);
    move.style.setProperty('--g', `${grow()}`);
  };
  measure();
  ScrollTrigger.addEventListener('refresh', measure);

  // While this section scrolls up to its pin: the black line rises with it and rolls out, and the Source field fades
  // in. Every tween starts at 0, so a refresh partway through never falls back to an unstarted tween's CSS.
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
    })
    .fromTo(move, { '--k': 1 }, { '--k': 0, duration: 1 }, 0)
    .fromTo(intro, { yPercent: -50, autoAlpha: 1 }, { yPercent: -130, autoAlpha: 0, duration: 0.62, ease: 'power4.in' }, 0)
    .fromTo(field, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'power3.in' }, 0);

  // Every line loops all the time while either section is on screen. Created after the pin so the measured end
  // includes the pinned scroll.
  const loops = qa('.flow__mq-track, .fpanel__track', section).map((track) => {
    const duration = () => track.offsetWidth / 2 / SPEED;
    return { loop: gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: duration(), paused: true }), duration };
  });
  ScrollTrigger.create({
    trigger: above ?? section,
    start: 'top bottom',
    endTrigger: section,
    end: 'bottom top',
    onToggle: (self) => loops.forEach(({ loop }) => (self.isActive ? loop.play() : loop.pause())),
    onRefresh: () => loops.forEach(({ loop, duration }) => loop.duration(duration())),
  });
}
