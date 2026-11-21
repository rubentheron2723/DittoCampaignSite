import '../styles/base.css';
import '../styles/screens.css';
import '../styles/product.css';

import { aiBand, features, productHero, trust, type Icon } from '../content/product';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { SCREENS } from '../shared/screens';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { fadeUp, splitReveal } from '../shared/motion';
import { initTrust } from '../animations/reveals';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import { FOOTER_BLOBS } from '../shared/footer-blobs';

/*
 * Product (brief v2.2, 3.5): hero, the features by stage (one switch, each stage with its Ditto screen and cards),
 * the AI assistant band, proof with its three stats, the closing CTA. /product#source, #engage and #place open their tab.
 */

function hero() {
  const h = productHero;
  return `
  <section class="phero" data-theme="dark">
    <div class="phero__bg" aria-hidden="true">
      <canvas class="phero__sky"></canvas>
      <div class="phero__glow"></div>
      <div class="phero__haze"></div>
    </div>
    <div class="phero__inner">
      <h1 class="phero__title">${h.title.map((l) => `<span class="phero__line">${esc(l)}</span>`).join(' ')}</h1>
      <div class="phero__copy">
        <p class="phero__lead">${esc(h.lead)}</p>
        <p class="phero__support">${esc(h.support)}</p>
      </div>
      <div class="phero__actions">
        <a class="bp bp--on-blue" href="/contact" data-magnetic>${esc(h.primary)}</a>
        <a class="gbtn gbtn--lg phero__secondary" href="${h.secondary.href}">${esc(h.secondary.label)}</a>
      </div>
    </div>
  </section>`;
}

/** 24px line icons, one per feature. */
const P = (d: string) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
const ICONS: Record<Icon, string> = {
  search: `<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="1.7"/>${P('M15 15l5 5M10.5 7.5v6M7.5 10.5h6')}`,
  ad: P('M5.5 3.5h9l4 4v13h-13zM14.5 3.5v4h4M8.5 12h7M8.5 15.5h7'),
  broadcast: `<circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/>${P('M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14')}`,
  sliders: `${P('M5 7h14M5 12h14M5 17h14')}<circle cx="9" cy="7" r="1.8" fill="#fff" stroke="currentColor" stroke-width="1.7"/><circle cx="15" cy="12" r="1.8" fill="#fff" stroke="currentColor" stroke-width="1.7"/><circle cx="11" cy="17" r="1.8" fill="#fff" stroke="currentColor" stroke-width="1.7"/>`,
  filter: P('M4 5h16l-6 7.5V19l-4-2v-4.5z'),
  summary: P('M4.5 6h15M4.5 10.5h15M4.5 15h9M17 15l1.2 2.4L20.5 18l-2.3 1.1L17 21.5l-1.2-2.4-2.3-1.1 2.3-.6z'),
  pipeline: P('M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v5h-4z'),
  record: P('M6 3.5h12v17H6zM9 8h6M9 12h6M9 16h3'),
  mail: P('M3.5 6h17v12h-17zM3.5 6.5l8.5 6.5 8.5-6.5'),
  bell: P('M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0'),
  team: `<circle cx="9" cy="8.5" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16.5" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/>${P('M3.5 19c.8-3 3-4.8 5.5-4.8s4.7 1.8 5.5 4.8M15 14.3c2.3 0 4.3 1.6 5 4.2')}`,
  pool: `<circle cx="8" cy="9" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16" cy="9" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="15.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-dasharray="2 3"/>`,
  cv: `${P('M5.5 3.5h13v17h-13z')}<circle cx="12" cy="9" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"/>${P('M8.5 16c.6-1.8 1.9-2.8 3.5-2.8s2.9 1 3.5 2.8')}`,
  crm: P('M4 19V9M10 19V5M16 19v-7M3 19.5h18M14 8l3-3 3 3M17 5v6'),
  rocket: P('M12 3.5c3 2 4.5 5.5 4 10l-2 2.5h-4l-2-2.5c-.5-4.5 1-8 4-10zM8 13.5l-3 2.5 1 3.5 3-1.5M16 13.5l3 2.5-1 3.5-3-1.5M12 9v2'),
  eye: `${P('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z')}<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/>`,
  chart: P('M4 4v16h16M8 16v-4M12 16V8M16 16v-6'),
  target: `<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="1" fill="currentColor"/>`,
  coins: `<ellipse cx="9" cy="7" rx="5" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/>${P('M4 7v4c0 1.4 2.2 2.5 5 2.5M4 11v4c0 1.4 2.2 2.5 5 2.5')}<ellipse cx="15" cy="13" rx="5" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/>${P('M10 13v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4')}`,
  heart: P('M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z'),
};
const icon = (name: Icon) => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

/** "Everything in one system": the switch, then the chosen stage's Ditto screen above its feature cards. */
function featuresSection() {
  const f = features;
  return `
  <section class="feats" id="features" data-theme="light">
    ${f.acts.map((a) => `<span class="feats__anchor" id="${a.id}" aria-hidden="true"></span>`).join('')}
    <div class="feats__inner">
      <header class="feats__head">
        <h2 class="feats__title">${esc(f.title)}</h2>
        <p class="feats__lead">${esc(f.lead)}</p>
      </header>
      <div class="feats__tabs" role="tablist" aria-label="Stages">
        <i class="feats__pill" aria-hidden="true"></i>
        ${f.acts
          .map(
            (a, i) =>
              `<button type="button" class="feats__tab${i === 0 ? ' is-on' : ''}" role="tab" id="feats-tab-${a.id}" aria-controls="feats-${a.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-act="${a.id}">${esc(a.label)}</button>`,
          )
          .join('')}
      </div>
      ${f.acts
        .map(
          (a, i) => `<div class="feats__act" id="feats-${a.id}" role="tabpanel" aria-labelledby="feats-tab-${a.id}" data-act="${a.id}"${i ? ' hidden' : ''}>
            <div class="feats__screen">${SCREENS[a.id]()}</div>
            <ul class="fcards">
              ${a.features
                .map(
                  (ft) => `<li class="fcard${ft.lead ? ' fcard--lead' : ''}">
                    <span class="fcard__icon">${icon(ft.icon)}</span>
                    <h3>${esc(ft.title)}</h3>
                    <p>${esc(ft.body)}</p>
                    ${ft.note ? `<p class="fcard__note">${esc(ft.note)}</p>` : ''}
                  </li>`,
                )
                .join('')}
            </ul>
          </div>`,
        )
        .join('')}
    </div>
  </section>`;
}

/** "Now inside Claude, ChatGPT and Copilot.": a blue band pointing to /ai-assistant. */
function aiBandSection() {
  return `
  <section class="aiband" data-theme="dark">
    <div class="aiband__inner">
      <div>
        <p class="aiband__eyebrow">New</p>
        <h2 class="aiband__title">${esc(aiBand.title)}</h2>
      </div>
      <div class="aiband__right">
        <p class="aiband__body">${esc(aiBand.body)}</p>
        <a class="bp bp--on-blue" href="${aiBand.button.href}">${esc(aiBand.button.label)}</a>
      </div>
    </div>
  </section>`;
}

/** Proof: the headline and body beside the three stats, then the "Built for" ticker. */
function trustSection() {
  const ticker = [...trust.ticker, ...trust.ticker].map((t) => `<span>${esc(t)}</span>`).join('');
  return `
  <section class="trust" id="trust" data-theme="light">
    <div class="trust__inner">
      <div class="trust__text">
        <h2 class="trust__title">${esc(trust.headline)}</h2>
        <p class="trust__body">${esc(trust.body)}</p>
      </div>
      <ul class="trust__stats">
        ${trust.stats.map((s) => `<li><b>${esc(s.big)}</b>${s.small ? `<span>${esc(s.small)}</span>` : ''}</li>`).join('')}
      </ul>
    </div>
    <div class="ticker">
      <p class="ticker__label">${esc(trust.tickerLabel)}</p>
      <button type="button" class="ticker__pause" aria-pressed="false" aria-label="Pause the list"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect class="ticker__bar" x="6.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/><rect class="ticker__bar" x="13.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/><path class="ticker__play" d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></button>
      <p class="sr-only">${trust.ticker.map(esc).join(', ')}</p>
      <div class="ticker__clip" aria-hidden="true"><div class="ticker__row">${ticker}</div></div>
    </div>
  </section>`;
}

function render() {
  document.getElementById('main')!.innerHTML = [
    hero(),
    // Features and trust share one Moving blobs layer (two canvases showed a seam where their patterns met).
    `<div class="pfield"><canvas class="pfield__fx" aria-hidden="true"></canvas><i class="pfield__fade" aria-hidden="true"></i>${featuresSection()}</div>`,
    aiBandSection(),
    trustSection(),
    ctaAndFooter(),
  ].join('');
}

/** The stage switch: the glass pill slides to the chosen stage; its screen and cards rise in (arrow keys move along). */
function initFeatures(animate: boolean) {
  const tabs = qa<HTMLButtonElement>('.feats__tab');
  const pill = q<HTMLElement>('.feats__pill')!;
  const acts = qa<HTMLElement>('.feats__act');
  let on = tabs[0];
  const place = (t: HTMLElement, d: number) => gsap.to(pill, { x: t.offsetLeft, width: t.offsetWidth, duration: d, ease: 'expo.inOut', overwrite: true });
  place(on, 0);
  document.fonts.ready.then(() => place(on, 0));
  window.addEventListener('resize', () => place(on, 0));

  const pick = (t: HTMLButtonElement, show = animate) => {
    if (t === on) return;
    const from = acts.find((a) => a.dataset.act === on.dataset.act)!;
    const to = acts.find((a) => a.dataset.act === t.dataset.act)!;
    tabs.forEach((b) => {
      const sel = b === t;
      b.classList.toggle('is-on', sel);
      b.setAttribute('aria-selected', String(sel));
      b.tabIndex = sel ? 0 : -1;
    });
    on = t;
    place(t, show ? 0.6 : 0);
    from.hidden = true;
    to.hidden = false;
    ScrollTrigger.refresh();
    if (show) gsap.fromTo(to.querySelectorAll('.feats__screen, .fcard'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.04, overwrite: true, clearProps: 'transform,opacity' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.focus();
      pick(next);
    });
  });

  // /product#engage and the like open that stage (boot then scrolls to the features).
  const fromHash = () => {
    const t = tabs.find((b) => `#${b.dataset.act}` === window.location.hash);
    if (t) pick(t, false);
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);
}

boot({
  page: 'product',
  render,
  init: ({ reduce, revealed }) => {
    initClouds(q('.phero')!, q<HTMLCanvasElement>('.phero__sky')!, 'phero--sky', reduce, SKY_HERO, {
      bubbles: { params: HERO_BUBBLES, intensity: 0.6 },
    });
    // The features on #FDFDFD under the Moving blobs (30 fps: a reading section). A screen tall, held on screen through
    // the features on wider screens; on phones it stays put behind their start and fades out.
    initBlobBackdrop(q('.pfield')!, q<HTMLCanvasElement>('.pfield__fx')!, 'pfield--fx', FOOTER_BLOBS, [253, 253, 253], reduce, 0.55, 30);
    gsap.matchMedia().add('(min-width: 901px)', () => {
      ScrollTrigger.create({ trigger: '.pfield', start: 'top top', end: 'bottom bottom', pin: '.pfield__fx', pinSpacing: false });
    });
    initFeatures(!reduce);
    if (reduce) {
      initTrust(false);
      return;
    }

    splitReveal('.feats__title', { by: 'words' });
    fadeUp('.feats__lead, .feats__tabs', '.feats__head', { y: 24, stagger: 0.08 });
    fadeUp('.feats__act:not([hidden]) .feats__screen, .feats__act:not([hidden]) .fcard', '.feats__act:not([hidden])', { y: 32, stagger: 0.05 });
    fadeUp('.aiband__inner > div > *', '.aiband');
    fadeUp('.trust__stats li', '.trust__stats');

    const { tween } = splitReveal('.phero__title', { by: 'chars', scrollTrigger: false, stagger: 0.025 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.phero__lead, .phero__support, .phero__actions', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5);
    revealed.then(() => {
      heroTl.play();
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
    });

    initTrust(true);
  },
});
