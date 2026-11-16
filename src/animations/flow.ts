import { gsap, q, qa, ScrollTrigger } from './gsap';

/** Marquee speed along the slant, in pixels per second. */
const SPEED = 80;

/**
 * Source → Engage → Place (Figma node 2370:194).
 *
 * The big slanted word at the top is the current step's name, repeated. It always runs as a marquee along
 * its own angle (unless motion is reduced) and swaps to the next word as the steps change.
 *
 * Pinned (desktop): the section holds for one screen per step while a scrubbed timeline swaps the step's
 *   copy (bottom left), its illustrated card (right) and the word; the blue wash from the right deepens.
 * Stacked (phones, reduced motion): the word band pins to the top of the screen while the steps scroll
 *   past underneath, and switches word as each step reaches the middle of the screen.
 *
 * Returns a cleanup for gsap.matchMedia.
 */
export function initFlow(pinned: boolean, animate = true) {
  const section = q('.flow')!;
  const pin = q('.flow__pin', section)!;
  const band = q('.flow__words', section)!;
  const wash = q('.flow__wash', section)!;
  const words = qa<HTMLElement>('.flow__word', section);
  const steps = qa<HTMLElement>('.fstep', section);
  const cleanups: (() => void)[] = [];

  // Fit each illustration's viewBox to its drawing, so every card frames its art the same way.
  qa<SVGSVGElement>('.fstep__art', section).forEach((svg) => {
    const b = svg.getBBox();
    if (!b.width) return;
    const pad = 18;
    svg.setAttribute('viewBox', `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
  });
  section.classList.toggle('flow--pinned', pinned);
  cleanups.push(() => section.classList.remove('flow--pinned'));

  // Marquees: one per word, running only while the section is on screen.
  const loops = words.map((word) => {
    const track = q('.flow__track', word)!;
    const duration = () => track.offsetWidth / 2 / SPEED;
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: duration(), paused: true });
    return { loop, track, duration };
  });
  if (animate) {
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => loops.forEach(({ loop }) => (self.isActive ? loop.play() : loop.pause())),
      onRefresh: () => loops.forEach(({ loop, duration }) => loop.duration(duration())),
    });
    cleanups.push(() => st.kill());
  }
  cleanups.push(() => loops.forEach(({ loop, track }) => (loop.kill(), gsap.set(track, { clearProps: 'transform' }))));

  const parts = (step: HTMLElement) => ({
    card: q('.fstep__card', step)!,
    copy: qa('.fstep__copy > *', step),
    // Dashed guides keep their dashes: drawSVG would replace the dash pattern.
    lines: qa('.fstep__art path:not(.art-faint), .fstep__art circle', step),
  });

  if (!pinned) {
    // The word band holds at the top of the screen for the whole section; the steps scroll under it.
    const hold = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `bottom ${band.offsetHeight}px`,
      pin: band,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
    cleanups.push(() => hold.kill());

    let current = 0;
    const show = (i: number) => {
      if (i === current) return;
      const prev = words[current];
      const next = words[i];
      const dir = i > current ? 1 : -1;
      current = i;
      gsap.killTweensOf([prev, next]);
      if (!animate) {
        gsap.set(prev, { autoAlpha: 0 });
        gsap.set(next, { autoAlpha: 1 });
        return;
      }
      gsap.to(prev, { yPercent: -50 - 60 * dir, autoAlpha: 0, duration: 0.45, ease: 'power2.in' });
      gsap.fromTo(next, { yPercent: -50 + 60 * dir, autoAlpha: 0 }, { yPercent: -50, autoAlpha: 1, duration: 0.6, delay: 0.2, ease: 'expo.out' });
    };
    gsap.set(words, { x: 0, y: 0, xPercent: -25, yPercent: -50, autoAlpha: (i: number) => (i ? 0 : 1) });
    steps.forEach((step, i) => {
      const st = ScrollTrigger.create({
        trigger: step,
        start: 'top 60%',
        end: 'bottom 60%',
        onToggle: (self) => self.isActive && show(i),
      });
      cleanups.push(() => st.kill());
      if (animate) {
        const { card, copy, lines } = parts(step);
        const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 75%' } });
        tl.from(copy, { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' })
          .from(card, { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.1)
          .fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2, stagger: 0.01, ease: 'power1.inOut' }, 0.3);
        cleanups.push(() => (tl.scrollTrigger?.kill(), tl.kill()));
      }
    });
    cleanups.push(() => gsap.set([...words, band], { clearProps: 'all' }));
    return () => cleanups.forEach((c) => c());
  }

  // Pinned: one timeline unit per step. Step 1 is already showing when the pin starts; the swaps happen
  // around each unit boundary, and the last step holds before the pin lets go.
  const SWAP = 0.4;
  const WASH = [0, 0.18, 0.65]; // the blue from the right, per step (Figma's right-hand radial)

  gsap.set(steps, { autoAlpha: (i: number) => (i ? 0 : 1) });
  gsap.set(words, { x: 0, y: 0, xPercent: -25, yPercent: -50, autoAlpha: (i: number) => (i ? 0 : 1) });
  gsap.set(wash, { opacity: WASH[0] });

  // The first card draws itself as the section arrives.
  const first = parts(steps[0]);
  const intro = gsap.fromTo(first.lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, stagger: 0.01, ease: 'power1.inOut', scrollTrigger: { trigger: section, start: 'top 60%' } });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${window.innerHeight * steps.length}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  steps.forEach((step, i) => {
    if (i === 0) return;
    const at = i - SWAP / 2;
    const prev = parts(steps[i - 1]);
    const next = parts(step);
    // Out: the old step lifts away in the first half of the swap…
    tl.to(prev.copy, { y: -40, autoAlpha: 0, duration: SWAP * 0.45, stagger: 0.02, ease: 'power2.in' }, at)
      .to(prev.card, { y: '-24vh', autoAlpha: 0, duration: SWAP * 0.5, ease: 'power2.in' }, at)
      .to(words[i - 1], { yPercent: -110, autoAlpha: 0, duration: SWAP * 0.5, ease: 'power2.in' }, at)
      .set(steps[i - 1], { autoAlpha: 0 }, at + SWAP * 0.5)
      // …and the new one rises in through the second half, its card drawing itself as it lands.
      .set(step, { autoAlpha: 1 }, at + SWAP * 0.45)
      .fromTo(words[i], { yPercent: 10, autoAlpha: 0 }, { yPercent: -50, autoAlpha: 1, duration: SWAP * 0.55, ease: 'power3.out' }, at + SWAP * 0.4)
      .fromTo(next.card, { y: '30vh', autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: SWAP * 0.55, ease: 'power3.out' }, at + SWAP * 0.45)
      .fromTo(next.copy, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: SWAP * 0.5, stagger: 0.03, ease: 'power3.out' }, at + SWAP * 0.5)
      .fromTo(next.lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: SWAP * 0.6, stagger: { amount: SWAP * 0.25 }, ease: 'power1.inOut' }, at + SWAP * 0.6)
      .to(wash, { opacity: WASH[i], duration: SWAP, ease: 'power1.inOut' }, at);
  });
  // Hold on the last step.
  tl.to({}, { duration: 0.5 }, steps.length - 0.5);

  cleanups.push(() => {
    intro.scrollTrigger?.kill();
    intro.kill();
    tl.scrollTrigger?.kill();
    tl.kill();
    const all = steps.flatMap((s) => { const p = parts(s); return [s, p.card, ...p.copy, ...p.lines]; });
    gsap.set([...all, ...words, wash], { clearProps: 'all' });
  });
  return () => cleanups.forEach((c) => c());
}
