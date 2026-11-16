import { gsap, q, qa, ScrollTrigger } from './gsap';

/** Marquee speed along the slant, in pixels per second. */
const SPEED = 80;

/**
 * Source → Engage → Place (Figma node 2370:194): a side scroller. The section pins and scrolling down slides
 * the three panels sideways, settling on each one. Every panel's slanted word runs as a marquee along its own
 * angle, and its illustration draws itself as the panel arrives.
 *
 * With reduced motion (animate = false) there is no pin or marquee: the panels stack and stay still.
 */
export function initFlow(animate: boolean) {
  const section = q('.flow')!;
  const pin = q('.flow__pin', section)!;
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

  const distance = () => strip.scrollWidth - window.innerWidth;
  const slide = gsap.to(strip, {
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

  // Marquees: one per panel, running only while the section is on screen. Created after the pin so the
  // section's measured end includes the pinned scroll (otherwise they pause partway through).
  const loops = qa('.fpanel__track', section).map((track) => {
    const duration = () => track.offsetWidth / 2 / SPEED;
    return { loop: gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: duration(), paused: true }), duration };
  });
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => loops.forEach(({ loop }) => (self.isActive ? loop.play() : loop.pause())),
    onRefresh: () => loops.forEach(({ loop, duration }) => loop.duration(duration())),
  });
}
