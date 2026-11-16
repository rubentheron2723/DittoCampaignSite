import { gsap, q, qa, ScrollTrigger } from './gsap';

/** Marquee speed along the slant, in pixels per second (before the marquee is scaled up into this section). */
const SPEED = 85;

/**
 * Source → Engage → Place (Figma node 2370:194): a side scroller. The section pins and scrolling down slides
 * the three panels sideways, settling on each one; each illustration draws itself as its panel arrives.
 *
 * The big slanted marquee is one element shared with the section above ("Everything recruiters do."):
 *   1. While that section is on screen it is that section's black "Source. Engage. Place." line, at its flat slant.
 *   2. As this section scrolls up to pin, it glides up to the top of this section, tilts into Figma's 3D slant,
 *      grows, turns white and rolls over to "Source.".
 *   3. As the panels slide it rolls over to "Engage." and then "Place.".
 * It loops the whole time, along whatever slant it has.
 *
 * With reduced motion (animate = false) there is no pin and no shared marquee: the panels stack, each with its own
 * still word, and the section above keeps its own still line.
 */
export function initFlow(animate: boolean) {
  const section = q('.flow')!;
  const pin = q('.flow__pin', section)!;
  const bg = q('.flow__bg', section)!;
  const strip = q('.flow__strip', section)!;
  const panels = qa<HTMLElement>('.fpanel', section);

  // Fit each illustration's viewBox to its drawing, so every panel frames its art the same way.
  qa<SVGSVGElement>('.fstep__art', section).forEach((svg) => {
    const b = svg.getBBox();
    if (!b.width) return;
    const pad = 18;
    svg.setAttribute('viewBox', `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
  });

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

  panels.forEach((panel, i) => {
    // Dashed guides keep their dashes: drawSVG would replace the dash pattern.
    const lines = qa('.fstep__art path:not(.art-faint), .fstep__art circle', panel);
    const copy = qa('.fpanel__copy > *', panel);
    // The first panel arrives by scrolling down; the others slide in from the right.
    const arrive = i === 0
      ? { trigger: section, start: 'top 55%' }
      : { trigger: panel, containerAnimation: slide, start: 'left 55%' };
    const tl = gsap.timeline({ scrollTrigger: { ...arrive, toggleActions: 'play none none reverse' } });
    tl.fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2, stagger: { amount: 0.4 }, ease: 'power1.inOut' });
    if (i > 0) tl.from(copy, { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, 0);
  });

  /* ---------- The shared marquee ---------- */
  const above = q('.system');
  const band = above && q('.system__loop', above);
  const anchor = q('.flow__marquee', section)!;
  const move = q('.flow__mq-move', anchor)!;
  const tilt = q('.flow__mq-tilt', anchor)!;
  const words = Object.fromEntries(qa<HTMLElement>('.flow__mq-word', anchor).map((w) => [w.dataset.word!, w]));
  const steps = panels.map((p) => words[p.dataset.act!]);

  gsap.set(Object.values(words), { x: 0, y: 0, xPercent: -25, yPercent: -50, autoAlpha: (_: number, w: HTMLElement) => (w === words.intro ? 1 : 0) });

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

  // 1 → 2: from the band above to the top of this section, while this section scrolls up to its pin.
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
    })
    .fromTo(move, { '--k': 1 }, { '--k': 0, duration: 1 }, 0)
    .fromTo(tilt, { '--t': 0 }, { '--t': 1, duration: 0.7, ease: 'power1.inOut' }, 0.15)
    .fromTo(tilt, { color: '#171717' }, { color: '#ffffff', duration: 0.4 }, 0.45)
    .to(words.intro, { yPercent: -130, autoAlpha: 0, duration: 0.18, ease: 'power2.in' }, 0.5)
    .fromTo(steps[0], { yPercent: 30, autoAlpha: 0 }, { yPercent: -50, autoAlpha: 1, duration: 0.24, ease: 'power2.out' }, 0.64);

  // 2 → 3: one roll-over per panel change, halfway through each slide. Words leave on their inner wrapper and
  // arrive on the outer one, so this timeline never animates what the one above does ("Source." arriving).
  const roll = (word: HTMLElement) => q('.flow__mq-roll', word)!;
  const swaps = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${distance()}`, scrub: 0.8, invalidateOnRefresh: true },
  });
  steps.slice(1).forEach((word, i) => {
    const at = (i + 0.5) / (steps.length - 1) - 0.08;
    swaps
      .to(roll(steps[i]), { yPercent: -80, autoAlpha: 0, duration: 0.07, ease: 'power2.in' }, at)
      .fromTo(word, { yPercent: 30, autoAlpha: 0 }, { yPercent: -50, autoAlpha: 1, duration: 0.09, ease: 'power2.out' }, at + 0.06);
  });
  swaps.set({}, {}, 1);

  // Every word loops all the time; they run while either section is on screen. Created after the pin so the
  // measured end includes the pinned scroll.
  const loops = qa('.flow__mq-track', anchor).map((track) => {
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
