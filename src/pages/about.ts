import '../styles/base.css';
import '../styles/about.css';

import { builders, finalBanner, hero, team, thinking } from '../content/about';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc, MARK_L, MARK_R } from '../shared/mark';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { fadeUp, splitReveal, stickyPin } from '../shared/motion';

/* Messy routes (what committee-built software feels like) and the clean routes they resolve into. */
const MESSY = [
  'M40,120 C140,60 200,220 300,140 S460,40 560,160 S700,260 780,120',
  'M40,240 C120,320 220,160 320,260 S470,360 560,230 S700,120 780,250',
  'M40,360 C160,300 220,440 330,370 S480,280 570,400 S690,460 780,360',
  'M40,470 C150,540 240,400 340,480 S500,560 600,450 S700,380 780,480',
];
const CLEAN = [
  'M40,120 C140,120 200,120 300,120 S460,120 560,120 S700,120 780,120',
  'M40,240 C120,240 220,240 320,240 S470,240 560,240 S700,240 780,240',
  'M40,360 C160,360 220,360 330,360 S480,360 570,360 S690,360 780,360',
  'M40,480 C150,480 240,480 340,480 S500,480 600,480 S700,480 780,480',
];

function render() {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="page-hero about-hero" data-theme="dark">
    <div class="wrap wrap--wide about-hero__grid">
      <div class="page-hero__inner">
        <h1 class="h-display about-hero__title">${esc(hero.title)}</h1>
        <div class="about-hero__copy">${hero.paragraphs.map((p) => `<p class="lead">${esc(p)}</p>`).join('')}</div>
        <p class="about-hero__proof">${esc(hero.proof)}</p>
        <div class="page-hero__actions">
          <a class="btn btn--light btn--lg" href="/contact" data-magnetic>Book a demo</a>
          <a class="btn btn--outline btn--lg" href="/product" data-magnetic>See the product</a>
        </div>
      </div>
      <div class="routes" aria-hidden="true">
        <svg viewBox="0 0 820 600" class="routes__svg">
          <defs>
            <linearGradient id="routeGrad" x1="0" x2="1"><stop offset="0" stop-color="#00B0FF" /><stop offset="1" stop-color="#ffffff" /></linearGradient>
          </defs>
          ${MESSY.map((d, i) => `<path class="routes__path" data-i="${i}" d="${d}" />`).join('')}
          ${[0, 1, 2, 3].map((i) => `<g class="routes__nodes" data-row="${i}">${[40, 300, 560, 780].map((x) => `<circle cx="${x}" cy="${120 + i * 120}" r="6" />`).join('')}</g>`).join('')}
        </svg>
        <p class="routes__caption"><span class="routes__caption-a">Committee-built</span><span class="routes__caption-b">Rebuilt from first principles</span></p>
      </div>
    </div>
  </section>

  <section class="builders" id="builders" data-theme="dark">
    <div class="builders__pin">
      <div class="wrap wrap--wide builders__grid">
        <div class="builders__sticky">
          <h2 class="h-section builders__title">${esc(builders.title)}</h2>
          <p class="lead builders__intro">${esc(builders.intro)}</p>
          <div class="builders__progress" aria-hidden="true">${builders.panels.map(() => '<span><i></i></span>').join('')}</div>
        </div>
        <div class="builders__stage">
          ${builders.panels
            .map(
              (p, i) => `<article class="bpanel" data-i="${i}">
                <p class="bpanel__index">0${i + 1}</p>
                <h3 class="bpanel__title">${esc(p.title)}</h3>
                <p class="bpanel__body">${esc(p.body)}</p>
              </article>`,
            )
            .join('')}
        </div>
      </div>
    </div>
  </section>

  <section class="thinking" id="thinking" data-theme="light">
    <div class="wrap wrap--wide thinking__grid">
      <div class="thinking__sticky">
        <h2 class="h-section">${esc(thinking.title)}</h2>
        <p class="lead muted thinking__intro">${esc(thinking.intro)}</p>
      </div>
      <ol class="principles">
        <span class="principles__line"><span class="principles__fill"></span></span>
        ${thinking.principles
          .map(
            (p, i) => `<li class="principle" data-i="${i}">
              <span class="principle__dot"></span>
              <p class="principle__index">0${i + 1}</p>
              <h3 class="principle__title">${esc(p.title)}</h3>
              <p class="principle__body">${esc(p.body)}</p>
            </li>`,
          )
          .join('')}
      </ol>
    </div>
  </section>

  <section class="team" id="team" data-theme="dark">
    <div class="wrap wrap--wide team__grid">
      <div class="team__visual" aria-hidden="true">
        <svg viewBox="-120 -60 864 847" class="team__mark">
          <path class="mark__l team__half team__half--l" d="${MARK_L}" />
          <path class="mark__r team__half team__half--r" d="${MARK_R}" />
        </svg>
        <ul class="team__obsessions">
          <li>The performance of the system.</li>
          <li>The clarity of the interface.</li>
          <li>The elegance of the workflow.</li>
        </ul>
      </div>
      <div class="team__copy">
        <h2 class="h-section team__title"><span>${esc(team.titleOne)}</span><span>${esc(team.titleTwo)}</span></h2>
        ${team.paragraphs.map((p) => `<p class="lead team__p">${esc(p)}</p>`).join('')}
      </div>
    </div>
  </section>

  ${ctaAndFooter({ lineOne: finalBanner.lineOne, lineTwo: finalBanner.lineTwo, copy: finalBanner.copy, button: finalBanner.button })}`;
}

function initRoutes(animate: boolean, revealed: Promise<void>) {
  const paths = qa<SVGPathElement>('.routes__path');
  const nodes = qa<SVGGElement>('.routes__nodes');
  if (!animate) {
    paths.forEach((p, i) => p.setAttribute('d', CLEAN[i]));
    return;
  }
  gsap.set(nodes, { autoAlpha: 0, scale: 0, transformOrigin: 'center' });
  gsap.set('.routes__caption-b', { autoAlpha: 0, y: 10 });
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  tl.fromTo(paths, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, stagger: 0.12, ease: 'power2.inOut' }, 0)
    .add('resolve', 2.1);
  paths.forEach((p, i) => tl.to(p, { morphSVG: CLEAN[i], duration: 1.4, ease: 'power3.inOut' }, `resolve+=${i * 0.1}`));
  tl
    .to(paths, { stroke: '#00B0FF', duration: 1, stagger: 0.1 }, 'resolve+=0.3')
    .to(nodes, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' }, 'resolve+=0.7')
    .to('.routes__caption-a', { autoAlpha: 0, y: -10, duration: 0.5 }, 'resolve')
    .to('.routes__caption-b', { autoAlpha: 1, y: 0, duration: 0.7 }, 'resolve+=0.3');
  revealed.then(() => tl.play());
  gsap.to('.routes', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.about-hero', start: 'top top', end: 'bottom top', scrub: true } });
}

function initBuilders(pinned: boolean) {
  const panels = qa<HTMLElement>('.bpanel');
  const segs = qa<HTMLElement>('.builders__progress span');
  const n = panels.length;
  if (!pinned) {
    panels.forEach((p) => fadeUp(p, p, { y: 40 }));
    return;
  }
  gsap.set(panels.slice(1), { autoAlpha: 0, y: 60 });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.builders__pin',
      start: 'top top',
      end: () => `+=${n * 80}%`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const i = Math.min(n - 1, Math.floor(self.progress * n));
        segs.forEach((s, j) => s.classList.toggle('is-active', j <= i));
      },
    },
  });
  panels.forEach((p, i) => {
    if (i === 0) return;
    // Out, then in: the two panels never share the stage.
    tl.to(panels[i - 1], { autoAlpha: 0, y: -50, duration: 0.45, ease: 'power2.in' }, i - 1)
      .to(p, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, i - 0.55);
  });
  tl.to({}, { duration: 0.5 });
}

function initPrinciples(animate: boolean) {
  if (!animate) return;
  gsap.fromTo('.principles__fill', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: '.principles', start: 'top 70%', end: 'bottom 70%', scrub: 0.4 } });
  qa<HTMLElement>('.principle').forEach((p) => {
    gsap.from(p.querySelector('.principle__dot'), { scale: 0, duration: 0.5, ease: 'back.out(2.5)', scrollTrigger: { trigger: p, start: 'top 70%', toggleActions: 'play none none reverse' } });
    splitReveal(p.querySelector('.principle__title')!, { trigger: p, start: 'top 72%' });
    fadeUp(p.querySelectorAll('.principle__index, .principle__body'), p, { y: 20, start: 'top 72%' });
    ScrollTrigger.create({ trigger: p, start: 'top 55%', end: 'bottom 45%', toggleClass: { targets: p, className: 'is-active' } });
  });
}

function initTeam(animate: boolean) {
  if (!animate) return;
  // The two halves start apart and lock together as the section scrolls into place.
  gsap.fromTo('.team__half--l', { x: -140, y: 40, rotate: -6 }, { x: 0, y: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.team', start: 'top 85%', end: 'top 20%', scrub: 0.5 } });
  gsap.fromTo('.team__half--r', { x: 140, y: -40, rotate: 6 }, { x: 0, y: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.team', start: 'top 85%', end: 'top 20%', scrub: 0.5 } });
  fadeUp('.team__obsessions li', '.team__obsessions', { y: 20, start: 'top 80%' });
  splitReveal('.team__title span');
  fadeUp('.team__p', '.team__copy', { y: 24, start: 'top 70%' });
}

boot({
  page: 'about',
  render,
  init: ({ reduce, revealed }) => {
    initRoutes(!reduce, revealed);
    initPrinciples(!reduce);
    initTeam(!reduce);

    if (reduce) {
      initBuilders(false);
      return;
    }

    const { tween } = splitReveal('.about-hero__title', { by: 'chars', scrollTrigger: false, stagger: 0.03 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.about-hero__copy p, .about-hero__proof, .about-hero .page-hero__actions', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5);
    revealed.then(() => heroTl.play());

    splitReveal('.builders__title');
    fadeUp('.builders__intro, .builders__progress', '.builders__sticky', { y: 24 });
    stickyPin(q('.thinking__sticky')!, q('.thinking__grid')!, 112);
    splitReveal('.thinking__sticky .h-section');
    fadeUp('.thinking__intro', '.thinking__sticky', { y: 24 });

    gsap.matchMedia().add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)' }, (ctx) => {
      initBuilders((ctx.conditions as { desktop: boolean }).desktop);
    });
  },
});
