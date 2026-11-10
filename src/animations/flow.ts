import { gsap, q, qa, ScrollTrigger, SplitText } from './gsap';

/**
 * Source → Engage → Place as one continuous line. On desktop the section pins
 * and scrolls horizontally; a blue line draws across all three panels while a
 * "candidate" travels along it. On small screens the panels stack.
 */
export function initFlow(horizontal: boolean) {
  const section = q('.flow')!;
  const pin = q('.flow__pin', section)!;
  const track = q('.flow__track', section)!;
  const panels = qa<HTMLElement>('.panel', section);
  const path = q<SVGPathElement>('#flow-path')!;
  const nodes = qa<SVGGElement>('.flow__node', section);
  const traveller = q<SVGCircleElement>('.flow__traveller', section)!;
  const countEl = q('.flow__count b', section)!;
  const rail = q('#rail')!;
  const railFill = q('.rail__fill', rail)!;
  const railItems = qa('.rail__items li', rail);

  const splitTitles = panels.map(
    (p) => SplitText.create(p.querySelector('.panel__title')!, { type: 'lines,words', mask: 'lines', linesClass: 'split-line' }),
  );

  const panelReveal = (i: number) => {
    const p = panels[i];
    return gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .from(p.querySelector('.panel__label'), { y: 16, autoAlpha: 0, duration: 0.7 }, 0)
      .from(splitTitles[i].words, { yPercent: 110, autoAlpha: 0, duration: 1, stagger: 0.04 }, 0.05)
      .from(p.querySelectorAll('.panel__text p'), { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.3)
      .from(p.querySelectorAll('.panel__chips li'), { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.05 }, 0.55)
      .from(p.querySelector('.panel__num'), { xPercent: 20, autoAlpha: 0, duration: 1.4, ease: 'power3.out' }, 0);
  };

  let current = -1;
  function setCurrent(i: number) {
    if (i === current) return;
    current = i;
    gsap.fromTo(countEl, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
    countEl.textContent = String(i + 1).padStart(2, '0');
    railItems.forEach((li, j) => li.classList.toggle('is-active', j === i));
  }

  if (!horizontal) {
    // Stacked fallback: plain reveals per panel.
    panels.forEach((p, i) => {
      const tl = panelReveal(i).pause();
      ScrollTrigger.create({ trigger: p, start: 'top 70%', onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
      ScrollTrigger.create({ trigger: p, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => s.isActive && setCurrent(i) });
    });
    setCurrent(0);
    return;
  }

  // Position the three nodes where the line crosses each panel's centre.
  const total = path.getTotalLength();
  const pointAtX = (targetX: number) => {
    let lo = 0;
    let hi = total;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (path.getPointAtLength(mid).x < targetX) lo = mid;
      else hi = mid;
    }
    return path.getPointAtLength((lo + hi) / 2);
  };
  nodes.forEach((node, i) => {
    const pt = pointAtX(500 + i * 1000);
    gsap.set(node, { x: pt.x, y: pt.y, scale: 0, transformOrigin: 'center' });
  });

  const distance = () => track.scrollWidth - window.innerWidth;

  // Master horizontal scrub.
  const scrub = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${distance() * 1.15}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onToggle: (self) => {
        rail.classList.toggle('rail--visible', self.isActive);
        gsap.to(traveller, { autoAlpha: self.isActive ? 1 : 0, duration: 0.3 });
      },
      onUpdate: (self) => {
        gsap.set(railFill, { height: `${self.progress * 100}%` });
        setCurrent(Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1))));
      },
    },
  });

  // The line draws and the traveller rides it, in lockstep with the scroll.
  gsap
    .timeline({
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance() * 1.15}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(path, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', ease: 'none', duration: 1 }, 0)
    .to(
      traveller,
      { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: 0, end: 1 }, ease: 'none', duration: 1 },
      0,
    )
    .to(nodes[0], { scale: 1, duration: 0.06, ease: 'back.out(2)' }, 0.12)
    .to(nodes[1], { scale: 1, duration: 0.06, ease: 'back.out(2)' }, 0.47)
    .to(nodes[2], { scale: 1, duration: 0.06, ease: 'back.out(2)' }, 0.82);

  // Panel 0 reveals as the section pins; later panels reveal as they scroll into view horizontally.
  const first = panelReveal(0).pause();
  ScrollTrigger.create({ trigger: pin, start: 'top 55%', onEnter: () => first.play(), onLeaveBack: () => first.reverse() });

  panels.slice(1).forEach((p, idx) => {
    const tl = panelReveal(idx + 1).pause();
    ScrollTrigger.create({
      trigger: p,
      containerAnimation: scrub,
      start: 'left 65%',
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
    });
  });

  setCurrent(0);
}
