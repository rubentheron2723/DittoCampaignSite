import '../styles/base.css';
import '../styles/product.css';

import { featureActs, featuresHeroContent, finalFeaturesCta, type ActContent } from '../content/product';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc, markSvg } from '../shared/mark';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { fadeUp, splitReveal } from '../shared/motion';

/* ---------- Render ---------- */
function hero() {
  const h = featuresHeroContent;
  return `
  <section class="page-hero product-hero" data-theme="dark">
    <div class="product-hero__ghosts" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
    <div class="page-hero__mark">${markSvg()}</div>
    <div class="wrap wrap--wide">
      <div class="page-hero__inner">
        <h1 class="h-display product-hero__title"><span>${esc(h.headlineLineOne)}</span><span>${esc(h.headlineLineOneTwo)}</span></h1>
        <p class="h-sub">${esc(h.headlineLineTwo)}</p>
        <p class="lead">${esc(h.subhead)}</p>
        <div class="act-jump" role="list">
          ${featureActs
            .map((a) => `<a role="listitem" href="#${a.id}" class="act-jump__item"><em>${esc(a.actNumber)}</em><b>${esc(a.label)}</b><span>${a.features.length} capabilities</span></a>`)
            .join('')}
        </div>
      </div>
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
    ...featureActs.map(act),
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
  // Hero ghosts drift.
  gsap.to('.product-hero__ghosts span', { yPercent: -30, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.product-hero', start: 'top top', end: 'bottom top', scrub: true } });
}

boot({
  page: 'product',
  render,
  init: ({ reduce, revealed }) => {
    initActBar();
    const acts = qa<HTMLElement>('.act');

    if (reduce) {
      acts.forEach((s) => initDeck(s, false));
      return;
    }

    // Hero entrance.
    const { tween } = splitReveal('.product-hero__title span', { by: 'chars', scrollTrigger: false, stagger: 0.015 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.product-hero .h-sub, .product-hero .lead', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5)
      .from('.act-jump__item', { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.8)
      .from('.product-hero__ghosts span', { autoAlpha: 0, y: 60, duration: 1.6, stagger: 0.12, ease: 'power3.out' }, 0.2)
      .from('.page-hero__mark', { autoAlpha: 0, scale: 0.9, duration: 1.6 }, 0.2);
    revealed.then(() => heroTl.play());

    acts.forEach((s) => {
      splitReveal(q('.act__title', s)!, { by: 'words' });
      fadeUp(q('.act__lead', s)!, undefined, { y: 24 });
      fadeUp(q('.act__cta', s)!, undefined, { y: 30 });
    });

    gsap.matchMedia().add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)' }, (ctx) => {
      const { desktop } = ctx.conditions as { desktop: boolean };
      acts.forEach((s) => initDeck(s, desktop));
    });
  },
});
