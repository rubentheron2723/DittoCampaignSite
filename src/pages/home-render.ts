import { acts, ai, hero, pricing, system, trust } from '../content/home';
import { ctaAndFooter } from '../shared/chrome';
import { esc, MARK_L, MARK_R, markSvg } from '../shared/mark';
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

function systemSection() {
  return `
  <section class="system" id="system" data-theme="dark">
    <div class="system__stage">
      <div class="system__glow" aria-hidden="true"></div>
      <svg class="system__waves" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-40 260 C 240 180, 520 330, 820 250 S 1300 170, 1480 230" />
        <path d="M-40 420 C 300 520, 600 330, 900 420 S 1260 520, 1480 380" />
        <path d="M-40 560 C 260 470, 560 640, 860 560 S 1240 440, 1480 600" />
        <path d="M-40 700 C 320 800, 640 620, 960 720 S 1300 820, 1480 690" />
        <path d="M-40 830 C 280 760, 600 900, 900 820 S 1280 740, 1480 860" />
      </svg>
      <svg class="system__defs" width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="fly-front" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stop-color="#1e6ef3" />
            <stop offset="0.55" stop-color="#108ff9" />
            <stop offset="1" stop-color="#01b0ff" />
          </linearGradient>
        </defs>
      </svg>
      <div class="system__scene" aria-hidden="true">
        ${Array.from({ length: 7 }, (_, i) => `<div class="fly" data-i="${i}">
          <div class="fly__face fly__face--front">${flyMark()}</div>
          <div class="fly__face fly__face--back">${flyMark()}</div>
        </div>`).join('')}
      </div>
      <div class="system__copy">
        <h2 class="system__title">
          <span class="system__line">${esc(system.lineOne)}</span>
          <span class="system__line">${esc(system.lineTwo)}</span>
        </h2>
        <p class="system__lead">${esc(system.lead)}</p>
        <ul class="system__tags">${system.orbit.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
      </div>
    </div>
  </section>`;
}

/** One flying Ditto mark: both halves of the logomark, coloured per face in CSS. */
function flyMark() {
  return `<svg viewBox="0 0 624 727" focusable="false"><path class="fly__l" d="${MARK_L}" /><path class="fly__r" d="${MARK_R}" /></svg>`;
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

function aiSection() {
  return `
  <section class="ai" id="ai" data-theme="light">
    <div class="ai__inner">
      <div class="ai__head">
        <p class="eyebrow">Practical AI</p>
        <h2 class="ai__title">${esc(ai.title)}</h2>
        <p class="ai__desc">${esc(ai.description)}</p>
      </div>
      <div class="ai__cards">
        ${ai.cards
          .map(
            (c, i) => `<article class="aicard" data-tilt>
              <span class="aicard__index">0${i + 1}</span>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.copy)}</p>
              <span class="aicard__shine" aria-hidden="true"></span>
            </article>`,
          )
          .join('')}
      </div>
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
    systemSection(),
    flowSection(),
    trustSection(),
    aiSection(),
    pricingSection(),
    ctaAndFooter(),
  ].join('');
}
