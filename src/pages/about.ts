import '../styles/base.css';
import '../styles/about.css';

import { builders, hero, team, thinking } from '../content/about';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc, MARK_L, MARK_R } from '../shared/mark';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { fadeUp, splitReveal, stickyPin } from '../shared/motion';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { glassLogoHtml, initGlassLogo } from '../shared/glass-logo';

function render() {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="ahero" data-theme="dark">
    <div class="ahero__bg" aria-hidden="true">
      <canvas class="ahero__sky"></canvas>
      <div class="ahero__glow"></div>
      <div class="ahero__haze"></div>
    </div>
    <div class="ahero__inner">
      <div class="ahero__row">
        <div class="ahero__text">
          <h1 class="ahero__title">${esc(hero.title)}</h1>
          <div class="ahero__copy">
            <p class="ahero__lead">${esc(hero.paragraphs[0])}</p>
            <div class="ahero__body">${hero.paragraphs.slice(1).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          </div>
        </div>
        <div class="ahero__logo">${glassLogoHtml()}</div>
      </div>
      <div class="ahero__actions">
        <a class="gbtn gbtn--lg" href="/contact" data-magnetic>Book a demo</a>
        <a class="gbtn gbtn--lg gbtn--clear" href="/product" data-magnetic>See the product</a>
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

  ${ctaAndFooter()}`;
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
    // The Pricing and sign-in sky: Figma's About hero uses the same Clouds and Moving blobs settings.
    initClouds(q('.ahero')!, q<HTMLCanvasElement>('.ahero__sky')!, 'ahero--sky', reduce, SKY_HERO, {
      bubbles: { params: HERO_BUBBLES, intensity: 0.6 },
    });
    initGlassLogo(q('.glogo')!, q('.ahero')!, !reduce);
    initPrinciples(!reduce);
    initTeam(!reduce);

    if (reduce) {
      initBuilders(false);
      return;
    }

    const { tween } = splitReveal('.ahero__title', { by: 'chars', scrollTrigger: false, stagger: 0.03 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.ahero__lead, .ahero__body p, .ahero__actions', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5)
      .from('.glogo', { autoAlpha: 0, scale: 0.85, rotateY: -40, duration: 1.6, ease: 'expo.out' }, 0.4);
    revealed.then(() => {
      heroTl.play();
      // The copy must never stay hidden: if frames are starved (a busy machine, a background tab), finish the
      // entrance outright once it should long be over. Timers still run when animation frames don't.
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
    });

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
