import { Flip, gsap, q, qa, ScrollTrigger, SplitText } from './gsap';

const enter = (trigger: Element, start = 'top 75%') => ({
  trigger,
  start,
  toggleActions: 'play none none reverse',
});

/* ---------- Trust ---------- */
export function initTrust(animate: boolean) {
  const section = q('.trust')!;
  const title = q('.trust__title', section)!;
  const split = SplitText.create(title, { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });

  if (animate) {
    gsap.from(split.words, {
      yPercent: 110,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.035,
      scrollTrigger: enter(title),
    });
    gsap.from('.trust__body', { y: 30, autoAlpha: 0, duration: 1, scrollTrigger: enter(q('.trust__body')!, 'top 85%') });
    gsap.from('.stat', {
      y: 40,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.08,
      scrollTrigger: enter(q('.stats')!, 'top 80%'),
    });
  }

  // Counters.
  qa<HTMLElement>('.stat__value').forEach((el) => {
    const target = Number(el.dataset.count);
    const isYear = el.dataset.format === 'year';
    const obj = { v: isYear ? 2000 : 0 };
    const render = () => (el.textContent = isYear ? String(Math.round(obj.v)) : String(Math.round(obj.v)));
    if (!animate) {
      obj.v = target;
      render();
      return;
    }
    gsap.to(obj, {
      v: target,
      duration: isYear ? 1.8 : 1.4,
      ease: 'power3.out',
      onUpdate: render,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Ticker: endless, speeds up with scroll velocity.
  const row = q('.ticker__row', section)!;
  const loop = gsap.to(row, { xPercent: -50, duration: 36, ease: 'none', repeat: -1 });
  if (animate) {
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.min(4, 1 + Math.abs(self.getVelocity()) / 900);
        gsap.to(loop, { timeScale: v, duration: 0.5, overwrite: true });
      },
    });
  }
}

/* ---------- AI ---------- */
export function initAI(animate: boolean) {
  const section = q('.ai')!;
  const stepsPath = q<SVGPathElement>('.steps__path', section)!;
  if (!animate) return;

  const split = SplitText.create('.ai__title', { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });
  gsap.from(split.words, { yPercent: 110, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.04, scrollTrigger: enter(section) });
  gsap.from('.ai__desc', { y: 24, autoAlpha: 0, scrollTrigger: enter(section, 'top 70%') });

  gsap.from('.aicard', {
    y: 70,
    autoAlpha: 0,
    rotateX: 8,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.1,
    scrollTrigger: enter(q('.ai__cards')!, 'top 78%'),
  });

  const steps = q('.steps', section)!;
  gsap
    .timeline({ scrollTrigger: { trigger: steps, start: 'top 80%', end: 'bottom 55%', scrub: 0.5 } })
    .fromTo(stepsPath, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none' }, 0)
    .from('.step__dot', { scale: 0, autoAlpha: 0, stagger: 0.3, ease: 'back.out(2)', duration: 0.3 }, 0)
    .from('.step p', { y: 20, autoAlpha: 0, stagger: 0.3, duration: 0.3 }, 0.05);

  gsap.from('.ai__note', { x: -20, autoAlpha: 0, scrollTrigger: enter(q('.ai__note')!, 'top 90%') });
}

/* ---------- Pricing ---------- */
export function initPricing(animate: boolean) {
  const section = q('.pricing')!;
  const toggle = q('#billing-toggle', section)!;
  const pill = q('.toggle__pill', toggle)!;
  const buttons = qa<HTMLButtonElement>('button', toggle);
  const tiers = qa<HTMLElement>('.tier', section);

  if (animate) {
    const split = SplitText.create('.pricing__title', { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.words, { yPercent: 110, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.04, scrollTrigger: enter(section) });
    gsap.from('.pricing__copy, .toggle', { y: 24, autoAlpha: 0, stagger: 0.1, scrollTrigger: enter(section, 'top 70%') });
    gsap.from(tiers, {
      y: 80,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: enter(q('.tiers')!, 'top 80%'),
    });
  }

  let period: 'monthly' | 'annual' = 'monthly';
  const fmt = (n: number) => n.toFixed(2);

  function setPeriod(next: 'monthly' | 'annual', btn: HTMLButtonElement) {
    if (next === period) return;
    period = next;
    buttons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));

    // Slide the pill under the chosen label with Flip.
    const state = Flip.getState(pill);
    pill.style.left = `${btn.offsetLeft}px`;
    pill.style.width = `${btn.offsetWidth}px`;
    Flip.from(state, { duration: animate ? 0.55 : 0, ease: 'power3.inOut' });

    // Roll each price to its new value.
    tiers.forEach((tier, i) => {
      const amount = tier.querySelector<HTMLElement>('.tier__amount')!;
      const from = Number(amount.textContent);
      const to = Number(next === 'annual' ? tier.dataset.annual : tier.dataset.monthly);
      const obj = { v: from };
      gsap.to(obj, {
        v: to,
        duration: animate ? 0.8 : 0,
        delay: i * 0.05,
        ease: 'power3.out',
        onUpdate: () => (amount.textContent = fmt(obj.v)),
      });
      if (animate) {
        gsap.fromTo(tier, { scale: 0.985 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.6)', delay: i * 0.05 });
      }
    });
  }

  buttons.forEach((btn) => btn.addEventListener('click', () => setPeriod(btn.dataset.period as 'monthly' | 'annual', btn)));
}

/* ---------- CTA ---------- */
export function initCTA(animate: boolean) {
  const section = q('.cta')!;
  if (!animate) return;

  const split = SplitText.create('.cta__line', { type: 'lines,words,chars', mask: 'lines', linesClass: 'split-line' });
  gsap.from(split.chars, {
    yPercent: 110,
    autoAlpha: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: { each: 0.018, from: 'random' },
    scrollTrigger: enter(section, 'top 70%'),
  });
  gsap.from('.cta__copy, .cta__inner .btn', { y: 30, autoAlpha: 0, stagger: 0.12, scrollTrigger: enter(section, 'top 60%') });
}
