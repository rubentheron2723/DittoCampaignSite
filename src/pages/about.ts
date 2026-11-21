import '../styles/base.css';
import '../styles/about.css';

import { builders, hero, team, thinking } from '../content/about';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { gsap, q, qa, ScrollTrigger, SplitText } from '../animations/gsap';
import { fadeUp, splitReveal } from '../shared/motion';
import { createTeamScene, teamLogoSvg } from '../animations/team-logo';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { glassLogoHtml, initGlassLogo } from '../shared/glass-logo';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import { FOOTER_BLOBS } from '../shared/footer-blobs';

/** The rows' title widths in Figma, which set where each title breaks onto its second line. */
const TITLE_W = [444, 524, 524, 362, 362];

/**
 * As each row scrolls into view its number, title and copy rise into place line by line, each line out of its own
 * mask: the number first, the title's lines a beat behind, then the copy's, quicker. Once in, the lines are joined back
 * into plain text, so a resize rewraps it as usual.
 */
function rowsReveal() {
  qa<HTMLElement>('.rrow').forEach((row) => {
    const splits = ['.rrow__num', '.rrow__title', '.rrow__body'].map((sel) =>
      SplitText.create(q(sel, row)!, { type: 'lines', mask: 'lines', linesClass: 'split-line' }),
    );
    const [num, title, body] = splits;
    const tl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1.1 }, onComplete: () => splits.forEach((sp) => sp.revert()) })
      .from(num.lines, { yPercent: 105 }, 0)
      .from(title.lines, { yPercent: 105, stagger: 0.08 }, 0.08)
      .from(body.lines, { yPercent: 105, autoAlpha: 0, duration: 1, stagger: 0.035 }, 0.2);
    ScrollTrigger.create({ trigger: row, start: 'top 85%', once: true, onEnter: () => tl.play() });
  });
}

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
            <p class="ahero__lead">${esc(hero.lead)}</p>
            <div class="ahero__body">${hero.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          </div>
          <p class="ahero__stat">${esc(hero.stat)}</p>
        </div>
        <div class="ahero__logo">${glassLogoHtml()}</div>
      </div>
      <div class="ahero__actions">
        <a class="bp bp--on-blue bp--lg" href="/contact" data-magnetic>${esc(hero.primary)}</a>
        <a class="gbtn gbtn--lg" href="/product" data-magnetic>${esc(hero.secondary)}</a>
      </div>
    </div>
  </section>

  <section class="rebuild" id="builders" data-theme="light">
    <!-- Moving blobs behind the rows, held on screen through the section (as on Pricing). -->
    <canvas class="rebuild__fx" aria-hidden="true"></canvas>
    <div class="rebuild__list">
      ${[{ title: builders.title, body: builders.intro }, ...builders.panels]
        .map(
          (r, i) => `<article class="rrow">
            <div class="rrow__bar" aria-hidden="true"><i></i></div>
            <p class="rrow__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
            <div class="rrow__text">
              <${i ? 'h3' : 'h2'} class="rrow__title" style="--w:${TITLE_W[i]}px">${esc(r.title)}</${i ? 'h3' : 'h2'}>
              <p class="rrow__body">${esc(r.body)}</p>
            </div>
          </article>`,
        )
        .join('')}
    </div>
  </section>

  <section class="think" id="thinking" data-theme="light">
    <canvas class="think__fx" aria-hidden="true"></canvas>
    <div class="think__inner">
      <header class="think__head">
        <h2 class="think__title">${esc(thinking.title)}</h2>
        <p class="think__intro">${esc(thinking.intro)}</p>
      </header>
      <ul class="think__list">
        ${thinking.principles
          .map(
            (p) => `<li class="think__item">
              <h3 class="think__name">${esc(p.title)}</h3>
              <p class="think__body">${esc(p.body)}</p>
            </li>`,
          )
          .join('')}
      </ul>
    </div>
  </section>

  <section class="team" id="team" data-theme="light">
    <div class="team__inner">
      <div class="team__visual">${teamLogoSvg()}</div>
      <div class="team__copy">
        <h2 class="team__title">${esc(`${team.titleOne} ${team.titleTwo}`)}</h2>
        ${team.paragraphs.map((p) => `<p class="team__p">${esc(p)}</p>`).join('')}
      </div>
    </div>
  </section>

  ${ctaAndFooter()}`;
}

/**
 * The five statements stay open as a plain list (brief 4.3, point 1: you can scroll back and re-read them). Each row's
 * line fills as it passes up the screen, a transform and nothing more; without motion the lines are simply full.
 */
function initRebuild(animate: boolean) {
  const rows = qa<HTMLElement>('.rrow');
  const fills = rows.map((r) => q<HTMLElement>('.rrow__bar i', r)!);
  if (!animate) return void fills.forEach((f) => (f.style.transform = 'scaleX(1)'));
  fills.forEach((fill, i) =>
    gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: rows[i], start: 'top 80%', end: 'top 35%', scrub: true } }),
  );
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
    initBlobBackdrop(q('.think')!, q<HTMLCanvasElement>('.think__fx')!, 'think--fx', FOOTER_BLOBS, [253, 253, 253], reduce, 0.55, 30);
    // The team's logo builds itself once as the section comes into view.
    if (!reduce) {
      const scene = createTeamScene(q('.team')!);
      ScrollTrigger.create({ trigger: '.team', start: 'top 70%', once: true, onEnter: () => scene.play() });
    }

    initBlobBackdrop(q('.rebuild')!, q<HTMLCanvasElement>('.rebuild__fx')!, 'rebuild--fx', FOOTER_BLOBS, [254, 254, 254], reduce, 0.55);
    // One screen-tall blob layer held on screen through the section (a pin: ScrollSmoother rules out sticky).
    ScrollTrigger.create({ trigger: '.rebuild', start: 'top top', end: 'bottom bottom', pin: '.rebuild__fx', pinSpacing: false });
    initRebuild(!reduce);
    if (reduce) return;

    const { tween } = splitReveal('.ahero__title', { by: 'chars', scrollTrigger: false, stagger: 0.03 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.ahero__lead, .ahero__body p, .ahero__stat, .ahero__actions', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5)
      .from('.glogo', { autoAlpha: 0, scale: 0.85, rotateY: -40, duration: 1.6, ease: 'expo.out' }, 0.4);
    revealed.then(() => {
      heroTl.play();
      // The copy must never stay hidden: if frames are starved (a busy machine, a background tab), finish the
      // entrance outright once it should long be over. Timers still run when animation frames don't.
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
    });

    rowsReveal();
    fadeUp('.think__head > *', '.think__head', { y: 24 });
    fadeUp('.think__item', '.think__list', { y: 30, stagger: 0.08 });

  },
});
