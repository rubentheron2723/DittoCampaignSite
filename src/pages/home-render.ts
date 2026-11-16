import { acts, ai, hero, system } from '../content/home';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { FLOW_ART } from '../shared/flow-art';

/**
 * The hero from the reworked Figma frame (node 2354:85): a stretched cloud sky
 * (with subtle "bubbles" and a pull toward the pointer, see initHeroSky), a
 * soft-light glow from the top, a white haze along the bottom, and the copy.
 */
function heroSection() {
  return `
  <section class="hero" id="top" data-theme="dark">
    <div class="hero__bg" aria-hidden="true">
      <canvas class="hero__sky"></canvas>
      <div class="hero__glow"></div>
      <div class="hero__haze"></div>
    </div>
    <div class="hero__inner">
      <h1 class="hero__title">
        <span class="hero__line">${esc(hero.lineOne)}</span>
        <span class="hero__line">${esc(hero.lineTwo)}</span>
      </h1>
      <div class="hero__lower">
        <p class="hero__subhead">${esc(hero.subhead)}</p>
        <p class="hero__support">${hero.support.map(esc).join('<br />')}</p>
      </div>
      <div class="hero__actions">
        <a class="btn btn--light btn--hero" href="#cta" data-magnetic>${esc(hero.primary)}</a>
        <a class="btn btn--glass btn--hero" href="/pricing" data-magnetic>${esc(hero.secondary)}</a>
      </div>
    </div>
  </section>`;
}

/**
 * "Everything recruiters do." (Figma node 2364:777): the headline and, below it, the angled
 * "Source. Engage. Place." line as an endless marquee along its own slant (animations/system.ts).
 * The track holds two identical halves so it can loop by sliding exactly one half.
 */
function systemSection() {
  const half = Array.from({ length: 2 }, () => `<span class="system__phrase">${esc(system.loop)}</span>`).join('');
  return `
  <section class="system" id="system" data-theme="light">
    <div class="system__head">
      <h2 class="system__title">
        <span class="system__line">${esc(system.lineOne)}</span>
        <span class="system__line">${esc(system.lineTwo)}</span>
      </h2>
      <p class="system__body">${esc(system.body)}</p>
    </div>
    <div class="system__loop" aria-hidden="true">
      <div class="system__tilt"><div class="system__track">${half}${half}</div></div>
    </div>
  </section>`;
}

/** Where each panel's eight word lines are centred, as % down the 1440x1024 frame (Figma: 164px lines ~165px apart). */
const WORD_LINES = [0.98, 17.29, 33.01, 50.29, 64.75, 80.57, 96.78, 113.28];

/**
 * Source → Engage → Place (Figma node 2370:194): three full-screen panels side by side on one long background, white
 * at the top and bottom with a soft blue band through the middle (so it meets the sections around it in white). The
 * section pins and scrolling slides the panels sideways (animations/flow.ts). Each panel: a field of eight faint
 * slanted lines of its word, the copy on the left and its glass illustration on the right, both centred vertically.
 *
 * The section above's black "Source. Engage. Place." line is carried in by a shared marquee ("intro"): it rises with
 * this section and rolls out as the Source field fades in.
 */
function flowSection() {
  const panels = acts
    .map((a) => {
      const half = Array.from({ length: 4 }, () => `<span>${esc(a.label)}.</span>`).join('');
      const lines = WORD_LINES.map(
        (y) => `<div class="fpanel__plane" style="--wy: ${y}%"><div class="fpanel__word"><div class="fpanel__track">${half}${half}</div></div></div>`,
      ).join('');
      return `
      <article class="fpanel" data-act="${a.id}">
        <div class="fpanel__words" aria-hidden="true">${lines}</div>
        <div class="fpanel__copy">
          <h3 class="fpanel__title"><span class="sr-only">${esc(a.label)}: </span>${esc(a.headline)}</h3>
          <p class="fpanel__lead">${esc(a.paragraphs[0])}</p>
          <div class="fpanel__text">${a.paragraphs.slice(1).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        </div>
        <div class="fpanel__art" aria-hidden="true">${FLOW_ART[a.id]()}</div>
      </article>`;
    })
    .join('');

  // The shared marquee: the section above's line. The track holds two identical halves so it loops by sliding one.
  const half = Array.from({ length: 2 }, () => `<span>${esc(system.loop)}</span>`).join('');
  const marquee = `<div class="flow__mq-word"><div class="flow__mq-track">${half}${half}</div></div>`;

  return `
  <section class="flow" id="flow" data-theme="light">
    <h2 class="sr-only">${acts.map((a) => `${esc(a.label)}.`).join(' ')}</h2>
    <div class="flow__pin">
      <div class="flow__bg" aria-hidden="true"></div>
      <div class="flow__marquee" aria-hidden="true"><div class="flow__mq-move"><div class="flow__mq-tilt">${marquee}</div></div></div>
      <div class="flow__strip">${panels}
      </div>
    </div>
  </section>`;
}

/**
 * "Practical AI that recruiters can trust": the capability cards are paper
 * sheets in WebGL (animations/ai.ts) on a pinned stage; the HTML cards below
 * are the fallback and stay for screen readers.
 */
function aiSection() {
  return `
  <section class="ai" id="ai" data-theme="light">
    <div class="ai__stage">
      <div class="ai__glow" aria-hidden="true"></div>
      <div class="ai__head">
        <h2 class="ai__title">${esc(ai.title)}</h2>
        <p class="ai__desc">${esc(ai.description)}</p>
      </div>
      <canvas class="ai__canvas" aria-hidden="true"></canvas>
      <div class="ai__cards">
        ${ai.cards
          .map(
            (c, i) => `<article class="aicard">
              <span class="aicard__index">0${i + 1}</span>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.copy)}</p>
            </article>`,
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

export function renderHome() {
  const main = document.getElementById('main')!;
  main.innerHTML = [
    heroSection(),
    systemSection(),
    flowSection(),
    aiSection(),
    ctaAndFooter(),
  ].join('');
}
