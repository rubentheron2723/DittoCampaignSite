import { acts, ai, assistant, hero, proof, system } from '../content/home';
import { demo } from '../content/ai-assistant';
import { ctaAndFooter } from '../shared/chrome';
import { esc, markSvg } from '../shared/mark';
import { pointCards } from '../shared/ai-points';
import { SCREENS } from '../shared/screens';

/*
 * Home (brief v2.2, 3.3 and 4.6): hero, intro, Source, Engage and Place as plain stacked sections each beside an
 * abstract Ditto screen, the AI assistant, the AI built into Ditto, proof, and the closing CTA. Nothing pins.
 */

/** The hero (Figma node 2354:85): the sky, the headline, one line under it, two buttons, all
 *  aligned to the left edge of the text. */
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
      <p class="hero__sub">${esc(hero.sub)}</p>
      <div class="hero__actions">
        <a class="bp bp--on-blue bp--lg" href="/contact" data-magnetic>${esc(hero.primary)}</a>
        <a class="gbtn gbtn--lg hero__secondary" href="/pricing" data-magnetic>${esc(hero.secondary)}</a>
      </div>
    </div>
  </section>`;
}

/** "Everything recruiters do.": the headline and one paragraph. */
function systemSection() {
  return `
  <section class="system" id="system" data-theme="light">
    <div class="system__head">
      <h2 class="system__title">
        <span class="system__line">${esc(system.lineOne)}</span>
        <span class="system__line">${esc(system.lineTwo)}</span>
      </h2>
      <p class="system__body">${esc(system.body)}</p>
    </div>
  </section>`;
}

/** Source, Engage and Place: the copy beside its Ditto screen, alternating sides. */
function actsSection() {
  return `
  <div class="acts">
    ${acts
      .map(
        (a, i) => `
    <section class="act${i % 2 ? ' act--flip' : ''}" id="${a.id}" data-theme="light" aria-labelledby="act-${a.id}">
      <div class="act__copy">
        <p class="eyebrow">${esc(a.label)}</p>
        <h2 class="act__title" id="act-${a.id}">${esc(a.headline)}</h2>
        <p class="act__lead">${esc(a.lead)}</p>
        <p class="act__body">${esc(a.body)}</p>
        <a class="textlink" href="${a.link.href}">${esc(a.link.label)}</a>
      </div>
      <div class="act__screen">${SCREENS[a.id]()}</div>
    </section>`,
      )
      .join('')}
  </div>`;
}

/** The AI assistant: the pitch beside a still chat of example requests, then the three points. */
function assistantSection() {
  const a = assistant;
  return `
  <section class="assist" id="assistant" data-theme="light">
    <canvas class="assist__fx" aria-hidden="true"></canvas>
    <div class="assist__wrap">
      <div class="assist__grid">
        <div class="assist__copy">
          <p class="eyebrow eyebrow--new">${esc(a.eyebrow)}</p>
          <h2 class="assist__title">${esc(a.title)}</h2>
          <p class="assist__sub">${esc(a.sub)}</p>
          <div class="assist__actions">
            <a class="gbtn gbtn--lg assist__link" href="${a.primary.href}">${esc(a.primary.label)}</a>
            <a class="bp bp--lg" href="/contact" data-magnetic>${esc(a.secondary)}</a>
          </div>
          <p class="assist__small">${esc(a.small)}</p>
        </div>
        <figure class="minichat" aria-label="Example requests to the AI assistant">
          <div class="minichat__bar" aria-hidden="true"><span class="minichat__dots"><i></i><i></i><i></i></span><span class="minichat__badge"><i></i>${esc(demo.badge)}</span></div>
          <ul class="minichat__list">
            ${a.asks
              .map(
                (q) => `<li class="minichat__item"><p class="minichat__me">${esc(q)}</p><p class="minichat__done" aria-hidden="true">${markSvg('minichat__mark')}Done in Ditto</p></li>`,
              )
              .join('')}
          </ul>
        </figure>
      </div>
      ${pointCards('assist__points')}
    </div>
  </section>`;
}

/** Card icons in place of numbers (brief 4.4, point 6). */
const AI_ICONS = [
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15 15l5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M10.5 7.5v6M7.5 10.5h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="4.5" y="3.5" width="15" height="17" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 7h9M5 12h14M5 17h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="17" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="14" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
];

/** "Practical AI that recruiters can trust": three flat cards in one row. */
function aiSection() {
  return `
  <section class="ai" id="ai" data-theme="light">
    <div class="ai__wrap">
      <div class="ai__head">
        <p class="eyebrow">${esc(ai.eyebrow)}</p>
        <h2 class="ai__title">${esc(ai.title)}</h2>
        <p class="ai__desc">${esc(ai.description)}</p>
      </div>
      <ul class="ai__cards">
        ${ai.cards
          .map(
            (c, i) => `<li class="aicard">
              <span class="aicard__icon">${AI_ICONS[i]}</span>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.copy)}</p>
            </li>`,
          )
          .join('')}
      </ul>
    </div>
  </section>`;
}

/** Proof: the three facts we can state, large. No logos or quotes. */
function proofSection() {
  return `
  <section class="proof" id="proof" data-theme="light">
    <div class="proof__wrap">
      <h2 class="proof__title">${esc(proof.title)}</h2>
      <ul class="proof__stats">
        ${proof.stats.map((s) => `<li><b>${esc(s.big)}</b>${s.small ? `<span>${esc(s.small)}</span>` : ''}</li>`).join('')}
      </ul>
      <p class="proof__body">${esc(proof.body)}</p>
      <a class="textlink" href="${proof.link.href}">${esc(proof.link.label)}</a>
    </div>
  </section>`;
}

export function renderHome() {
  const main = document.getElementById('main')!;
  main.innerHTML = [heroSection(), systemSection(), actsSection(), assistantSection(), aiSection(), proofSection(), ctaAndFooter()].join('');
}
