import { acts, ai, hero, pricing, trust } from '../content/home';
import { ctaAndFooter } from '../shared/chrome';
import { esc, markSvg } from '../shared/mark';
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
 * Source → Engage → Place. Opens on the cloud sky with the three words; the clouds
 * clear from the bottom-left corner to the top-right onto flat brand blue, then the steps come in one
 * at a time on alternating sides of a fixed centre line (see animations/flow.ts).
 */
function flowSection() {
  const steps = acts
    .map(
      (a, i) => `
      <article class="fstep fstep--${i % 2 ? 'left' : 'right'}" data-act="${a.id}">
        <div class="fstep__card">
          <header class="fstep__head"><span class="fstep__num">${a.number}</span><span class="fstep__label">${esc(a.label)}</span></header>
          <div class="fstep__visual">${FLOW_ART[a.id]()}</div>
          <footer class="fstep__foot"><span class="fstep__icon">${markSvg('mark--step')}</span><span>${esc(a.chips[0])}</span></footer>
        </div>
        <div class="fstep__copy">
          <p class="eyebrow fstep__eyebrow">${a.number} · ${esc(a.label)}</p>
          <h3 class="fstep__title">${esc(a.headline)}</h3>
          <div class="fstep__text">${a.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          <ul class="fstep__chips">${a.chips.slice(1).map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        </div>
      </article>`,
    )
    .join('');

  return `
  <section class="flow" id="flow" data-theme="light">
    <div class="flow__pin">
      <div class="flow__intro">
        <canvas class="flow__sky" aria-hidden="true"></canvas>
        <div class="flow__veil" aria-hidden="true"></div>
        <div class="flow__intro-copy">
          <p class="eyebrow">Product</p>
          <h2 class="flow__title">${acts.map((a) => `<span>${esc(a.label)}.</span>`).join(' ')}</h2>
        </div>
      </div>
      <div class="flow__stage">
        <div class="flow__axis" aria-hidden="true"><i class="flow__marker"></i></div>
        ${steps}
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
        <p class="eyebrow">Pricing</p>
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
    aiSection(),
    flowSection(),
    trustSection(),
    pricingSection(),
    ctaAndFooter(),
  ].join('');
}
