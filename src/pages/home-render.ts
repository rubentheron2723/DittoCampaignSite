import { acts, ai, hero, pricing, system, trust } from '../content/home';
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
        <a class="btn btn--glass btn--hero" href="#pricing" data-magnetic>${esc(hero.secondary)}</a>
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

/** Where each panel's slanted word is centred, as in Figma (x, y as % of the 1440x1024 frame). */
const WORD_AT: Record<string, [number, number]> = { source: [43.87, 28.3], engage: [52.92, 28.3], place: [48.59, 22.66] };

/**
 * Source → Engage → Place (Figma node 2370:194): three full-screen panels side by side on one long white-to-blue
 * background. The section pins and scrolling slides the panels sideways (animations/flow.ts). Each panel has its
 * step's name as a huge slanted marquee near the top, the copy bottom left and the isometric illustration drawn
 * straight on the background at the right.
 */
function flowSection() {
  const panels = acts
    .map((a) => {
      const half = Array.from({ length: 4 }, () => `<span>${esc(a.label)}.</span>`).join('');
      const [x, y] = WORD_AT[a.id];
      return `
      <article class="fpanel" data-act="${a.id}" style="--wx: ${x}%; --wy: ${y}%">
        <div class="fpanel__words" aria-hidden="true">
          <div class="fpanel__plane"><div class="fpanel__word"><div class="fpanel__track">${half}${half}</div></div></div>
        </div>
        <div class="fpanel__copy">
          <h3 class="fpanel__title"><span class="sr-only">${esc(a.label)}: </span>${esc(a.headline)}</h3>
          <p class="fpanel__lead">${esc(a.paragraphs[0])}</p>
          <div class="fpanel__text">${a.paragraphs.slice(1).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        </div>
        <div class="fpanel__art" aria-hidden="true">${FLOW_ART[a.id]()}</div>
      </article>`;
    })
    .join('');

  return `
  <section class="flow" id="flow" data-theme="light">
    <h2 class="sr-only">${acts.map((a) => `${esc(a.label)}.`).join(' ')}</h2>
    <div class="flow__pin">
      <div class="flow__strip">${panels}
      </div>
    </div>
  </section>`;
}

function trustSection() {
  const ticker = [...trust.ticker, ...trust.ticker].map((t) => `<span>${esc(t)}</span>`).join('');
  return `
  <section class="trust" id="trust" data-theme="light">
    <div class="trust__inner">
      <h2 class="trust__title">${esc(trust.headline)}</h2>
      <p class="trust__body">${esc(trust.body)}</p>
      <div class="stats">
        ${trust.stats
          .map(
            (s) => `<div class="stat">
              <span class="stat__value" data-count="${s.value}" data-format="${s.format ?? 'int'}">${s.format === 'year' ? '2000' : '0'}</span>${
                s.suffix ? `<span class="stat__suffix">${esc(s.suffix)}</span>` : ''
              }
              <span class="stat__label">${esc(s.label)}</span>
            </div>`,
          )
          .join('')}
      </div>
    </div>
    <div class="ticker" aria-hidden="true"><div class="ticker__row">${ticker}</div></div>
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
    <div class="ai__more">
      <div class="steps">
        <svg class="steps__line" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
          <path class="steps__ghost" d="M20,40 L980,40" />
          <path class="steps__path" d="M20,40 L980,40" />
        </svg>
        <ol class="steps__list">
          ${ai.flow
            .map(
              (f, i) => `<li class="step"><span class="step__dot"><b>${i + 1}</b></span><p>${esc(f)}</p></li>`,
            )
            .join('')}
        </ol>
      </div>
      <p class="ai__note">${esc(ai.note)}</p>
    </div>
  </section>`;
}

function pricingSection() {
  return `
  <section class="pricing" id="pricing" data-theme="light">
    <div class="pricing__inner">
      <div class="pricing__head">
        <h2 class="pricing__title">${esc(pricing.title)}</h2>
        <p class="pricing__copy">${esc(pricing.copy)}</p>
        <div class="toggle" role="tablist" aria-label="Billing period" id="billing-toggle">
          <span class="toggle__pill" aria-hidden="true"></span>
          <button type="button" role="tab" aria-selected="true" data-period="monthly">${esc(pricing.monthlyLabel)}</button>
          <button type="button" role="tab" aria-selected="false" data-period="annual">${esc(pricing.annualLabel)} <em>${esc(pricing.annualNote)}</em></button>
        </div>
      </div>
      <div class="tiers">
        ${pricing.tiers
          .map(
            (t, i) => `<article class="tier ${i === 1 ? 'tier--featured' : ''}" data-monthly="${t.monthly}" data-annual="${t.annual}">
              <p class="tier__users">${esc(t.users)} <span>active users</span></p>
              <p class="tier__price"><span class="tier__currency">R</span><span class="tier__amount">${t.monthly.toFixed(2)}</span></p>
              <p class="tier__per">${esc(pricing.perSeat)}</p>
              <a class="btn ${i === 1 ? 'btn--solid' : 'btn--outline-dark'}" href="#cta" data-magnetic>Get started</a>
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
    trustSection(),
    pricingSection(),
    ctaAndFooter(),
  ].join('');
}
