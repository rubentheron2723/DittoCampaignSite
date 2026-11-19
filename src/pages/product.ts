import '../styles/base.css';
import '../styles/think.css';
import '../styles/product.css';

import { dayInTheLife, featureActs, finalFeaturesCta, productHero, trust, type ActContent } from '../content/product';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { initThinkZoom } from '../animations/think-zoom';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { fadeUp, splitReveal } from '../shared/motion';
import { initTrust } from '../animations/reveals';

/* ---------- Render ---------- */
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
      <div class="phero__text">
        <h1 class="phero__title">${h.title.map((l) => `<span class="phero__line">${esc(l)}</span>`).join(' ')}</h1>
        <div class="phero__copy">
          <p class="phero__lead">${esc(h.lead)}</p>
          <p class="phero__support">${esc(h.support)}</p>
        </div>
      </div>
      <div class="phero__actions"><a class="gbtn gbtn--lg" href="#day" data-magnetic>${esc(h.cta)}</a></div>
    </div>
  </section>`;
}

/** A 16px icon from Figma's app mockup. */
const icon = (name: string, cls = '') => `<img class="app__icon${cls ? ` ${cls}` : ''}" src="/product/app/${name}.svg" alt="" width="16" height="16" />`;

/** The assistant window (Figma 2413:860): a 1024 x 768 desktop app, scaled to fit by think-zoom.ts. */
function appWindow() {
  const a = dayInTheLife.app;
  const row = (r: { label: string; dot?: string }) =>
    `<li class="app__row">${r.dot ? `<i class="app__dot app__dot--${r.dot}"></i>` : ''}<span>${esc(r.label)}</span></li>`;
  return `<div class="app" aria-hidden="true">
    <div class="app__bar"><i></i><i></i><i></i></div>
    <div class="app__body">
      <aside class="app__side">
        <div class="app__tools">
          <span class="app__tools-l">${icon('sidebar')}${icon('back')}${icon('forward', 'app__icon--flip')}</span>
          <span class="app__tools-r"><b class="app__chip is-on">${icon('chat')}</b><b class="app__chip">${icon('code')}</b></span>
        </div>
        <ul class="app__nav">
          ${a.nav.map((n, i) => `<li class="app__row${i === 0 ? ' is-on' : ''}">${icon(['new', 'search', 'projects', 'artifacts', 'scheduled', 'customize'][i])}<span>${esc(n)}</span></li>`).join('')}
        </ul>
        <div class="app__group">
          <p class="app__head">Pinned ${icon('chev', 'app__icon--sm')}</p>
          <ul>${a.pinned.map(row).join('')}</ul>
        </div>
        <div class="app__group">
          <p class="app__head"><span>Chats and tasks ${icon('chev', 'app__icon--sm')}</span>${icon('filter')}</p>
          <ul>${a.chats.map(row).join('')}</ul>
          <p class="app__more">View all</p>
        </div>
      </aside>
      <div class="app__main">
        <div class="app__top"></div>
        <div class="app__chat">
          <p class="app__hello">${esc(a.greeting)}</p>
          <div class="app__ask">
            <div class="app__box">
              <p class="app__prompt">${esc(a.prompt)}</p>
              <div class="app__controls">
                <span class="app__modes">${icon('new')}${a.modes.map((m, i) => `<b class="app__chip${i === 0 ? ' is-on' : ''}">${esc(m)}</b>`).join('')}</span>
                <span class="app__model"><b>${esc(a.model)}</b><em>${esc(a.size)}</em>${icon('mic')}${icon('send')}</span>
              </div>
            </div>
            <div class="app__actions">
              ${a.actions.map((t, i) => `<span class="app__btn">${icon(['write', 'learn', 'code', 'career'][i])}${esc(t)}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * "Day in the life" (Figma 2407:6): the About lens stage (think.css, think-zoom.ts) with a recruiter's day for its
 * statements: the time, then the stage of the work. The first one flies off through the lens into the app window.
 */
function day() {
  const d = dayInTheLife;
  return `
  <section class="think day" id="day" data-theme="light">
    <div class="think__stage">
      <canvas class="think__lens" aria-hidden="true"></canvas>
      <div class="day__tabs" role="list" aria-label="Stages of the day">
        ${d.stages.map((s, i) => `<span role="listitem" class="day__tab${i === 0 ? ' is-on' : ''}">${esc(s)}</span>`).join('')}
      </div>
      <ol class="think__list">
        ${d.moments
          .map((m, i) => `<li class="think__item"><${i ? 'h3' : 'h2'} class="think__title">${esc(m.time)}</${i ? 'h3' : 'h2'}><p class="think__body">${esc(m.stage)}</p></li>`)
          .join('')}
      </ol>
      ${appWindow()}
    </div>
  </section>`;
}

function act(a: ActContent, i: number) {
  const theme = i % 2 === 0 ? 'light' : 'dark';
  return `
  <section class="act act--${a.id} act--${theme}" id="${a.id}" data-theme="${theme}" data-act="${a.id}">
    <div class="wrap wrap--wide">
      <header class="act__intro">
        <h2 class="h-section act__title">${esc(a.headline)}</h2>
        <p class="lead act__lead">${esc(a.intro)}</p>
      </header>
    </div>

    <div class="deck">
      <div class="deck__pin">
        <div class="wrap wrap--wide deck__grid">
          <aside class="deck__index" aria-hidden="true">
            <p class="deck__count"><b>01</b> / ${String(a.features.length).padStart(2, '0')}</p>
            <ol class="deck__list">
              ${a.features.map((f, j) => `<li data-i="${j}"><i>${String(j + 1).padStart(2, '0')}</i><span>${esc(f.navLabel ?? f.title)}</span></li>`).join('')}
            </ol>
          </aside>
          <div class="deck__stack">
            ${a.features
              .map(
                (f, j) => `<article class="fcard" data-i="${j}">
                  <div class="fcard__top"><span class="fcard__index">${String(j + 1).padStart(2, '0')}</span><span class="fcard__act">${esc(a.label)}</span></div>
                  <h3 class="fcard__title">${esc(f.title)}</h3>
                  <p class="fcard__teaser">${esc(f.teaser)}</p>
                  <p class="fcard__body">${esc(f.body)}</p>
                  ${f.supportNote ? `<p class="fcard__note">${esc(f.supportNote)}</p>` : ''}
                  <ul class="fcard__chips">${f.chips.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
                </article>`,
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="wrap wrap--wide">
      <div class="act__cta">
        <div>
          <h3 class="act__cta-title">${esc(a.ctaTitle)}</h3>
          <p class="muted">${esc(a.ctaBody)}</p>
        </div>
        <a class="btn ${theme === 'light' ? 'btn--solid' : 'btn--light'} btn--lg" href="/contact" data-magnetic>Book a demo</a>
      </div>
    </div>
  </section>`;
}

/** "Trusted by leading recruitment teams since 2016.": headline, copy, counting stats and the client-type ticker. */
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

function render() {
  const main = document.getElementById('main')!;
  document.getElementById('chrome')!.insertAdjacentHTML(
    'beforeend',
    `<div class="act-bar" id="act-bar" aria-hidden="true">
      <div class="act-bar__inner">
        ${featureActs.map((a) => `<a href="#${a.id}" data-act="${a.id}"><em>${esc(a.actNumber)}</em>${esc(a.label)}</a>`).join('')}
        <span class="act-bar__line"></span>
      </div>
    </div>`,
  );
  main.innerHTML = [
    hero(),
    day(),
    ...featureActs.map(act),
    trustSection(),
    ctaAndFooter({ lineOne: finalFeaturesCta.title.replace(' recruitment business?', ''), lineTwo: 'recruitment business?', copy: finalFeaturesCta.body }),
  ].join('');
}

/* ---------- Animate ---------- */
function initDeck(section: HTMLElement, horizontal: boolean) {
  const pin = q('.deck__pin', section)!;
  const cards = qa<HTMLElement>('.fcard', section);
  const items = qa<HTMLElement>('.deck__list li', section);
  const count = q('.deck__count b', section)!;
  const n = cards.length;

  let current = -1;
  const setCurrent = (i: number) => {
    if (i === current) return;
    current = i;
    items.forEach((li, j) => li.classList.toggle('is-active', j === i));
    gsap.fromTo(count, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.35 });
    count.textContent = String(i + 1).padStart(2, '0');
  };

  if (!horizontal) {
    cards.forEach((c) => fadeUp(c, c, { y: 50 }));
    return;
  }

  // Queued cards wait below the stack; only the next one is allowed to peek.
  gsap.set(cards.slice(1), { yPercent: 115, rotate: 3, transformOrigin: 'bottom center', autoAlpha: 0 });
  gsap.set(cards[1], { autoAlpha: 1 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${n * 70}%`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => setCurrent(Math.min(n - 1, Math.round(self.progress * (n - 1)))),
    },
  });

  cards.forEach((card, i) => {
    if (i === 0) return;
    tl.to(cards[i - 1], { scale: 0.94, y: -28, autoAlpha: 0.35, duration: 1, ease: 'power2.inOut' }, i - 1)
      .to(card, { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 1, ease: 'power2.out' }, i - 1);
    if (i >= 2) tl.to(cards[i - 2], { autoAlpha: 0, duration: 0.4 }, i - 1);
    if (cards[i + 1]) tl.to(cards[i + 1], { autoAlpha: 1, duration: 0.3 }, i - 0.4);
  });
  tl.to({}, { duration: 0.4 }); // settle

  setCurrent(0);
}

function initActBar() {
  const bar = q('#act-bar')!;
  const links = qa<HTMLAnchorElement>('a', bar);
  const line = q('.act-bar__line', bar)!;
  const moveLine = (a: HTMLElement) => gsap.to(line, { x: a.offsetLeft, width: a.offsetWidth, duration: 0.5, ease: 'expo.out' });

  ScrollTrigger.create({ trigger: '.act--source', start: 'top 60%', endTrigger: '.cta', end: 'top 40%', toggleClass: { targets: bar, className: 'act-bar--visible' } });
  featureActs.forEach((a) => {
    ScrollTrigger.create({
      trigger: `#${a.id}`,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (!self.isActive) return;
        links.forEach((l) => l.classList.toggle('is-active', l.dataset.act === a.id));
        moveLine(links.find((l) => l.dataset.act === a.id)!);
      },
    });
  });
}

boot({
  page: 'product',
  render,
  init: ({ reduce, revealed }) => {
    // The same sky as the About and Contact heroes (Figma's Product hero uses identical Clouds and Moving blobs).
    initClouds(q('.phero')!, q<HTMLCanvasElement>('.phero__sky')!, 'phero--sky', reduce, SKY_HERO, {
      bubbles: { params: HERO_BUBBLES, intensity: 0.6 },
    });
    initThinkZoom(!reduce, { screen: q<HTMLElement>('.day .app')! });
    initActBar();
    const acts = qa<HTMLElement>('.act');

    if (reduce) {
      acts.forEach((s) => initDeck(s, false));
      initTrust(false);
      return;
    }

    // Hero entrance: the title by letter, then the copy and the button.
    const { tween } = splitReveal('.phero__title', { by: 'chars', scrollTrigger: false, stagger: 0.025 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.phero__lead, .phero__support, .phero__actions', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5);
    revealed.then(() => {
      heroTl.play();
      // Never leave the copy hidden if frames are starved.
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
    });

    acts.forEach((s) => {
      splitReveal(q('.act__title', s)!, { by: 'words' });
      fadeUp(q('.act__lead', s)!, undefined, { y: 24 });
      fadeUp(q('.act__cta', s)!, undefined, { y: 30 });
    });

    gsap.matchMedia().add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)' }, (ctx) => {
      const { desktop } = ctx.conditions as { desktop: boolean };
      acts.forEach((s) => initDeck(s, desktop));
    });
    // After the acts' pinned decks, so it's measured below them.
    initTrust(true);
  },
});
