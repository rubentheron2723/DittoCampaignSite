import '../styles/base.css';
import '../styles/faq.css';

import { faqCategories } from '../content/faq';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc, markSvg } from '../shared/mark';
import { Flip, gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { fadeUp, splitReveal, stickyPin } from '../shared/motion';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const total = faqCategories.reduce((n, c) => n + c.items.length, 0);

function render() {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="page-hero faq-hero" data-theme="dark">
    <div class="page-hero__mark">${markSvg()}</div>
    <div class="faq-hero__marks" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<span class="qmark qmark--${i + 1}">?</span>`).join('')}</div>
    <div class="wrap wrap--wide">
      <div class="page-hero__inner">
        <p class="eyebrow">FAQ</p>
        <h1 class="h-display faq-hero__title">Recruitment software FAQs.</h1>
        <p class="h-sub">Your questions, answered clearly.</p>
        <p class="lead">${total} answers across ${faqCategories.length} topics. Search, or pick a topic.</p>
        <label class="search" for="faq-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input id="faq-search" type="search" placeholder="Search questions, e.g. migration, Boolean, pricing" autocomplete="off" />
          <span class="search__count" id="search-count">${total}</span>
        </label>
      </div>
    </div>
  </section>

  <section class="faq" id="faq" data-theme="light">
    <div class="wrap wrap--wide faq__grid">
      <aside class="faq__rail">
        <p class="eyebrow eyebrow--blue">Topics</p>
        <nav class="topics" id="topics" aria-label="FAQ topics">
          <a href="#all" data-cat="all" class="is-active"><span>All questions</span><em>${total}</em></a>
          ${faqCategories.map((c) => `<a href="#${slug(c.title)}" data-cat="${slug(c.title)}"><span>${esc(c.title)}</span><em>${c.items.length}</em></a>`).join('')}
        </nav>
      </aside>

      <div class="faq__list" id="faq-list">
        ${faqCategories
          .map(
            (c) => `<section class="cat" id="${slug(c.title)}" data-cat="${slug(c.title)}">
              <h2 class="cat__title">${esc(c.title)}</h2>
              <div class="cat__items">
                ${c.items
                  .map(
                    (it, i) => `<article class="qa" data-q="${esc(it.q.toLowerCase())}" data-a="${esc(it.a.toLowerCase())}">
                      <button type="button" class="qa__trigger" aria-expanded="false" id="${slug(c.title)}-${i}">
                        <span class="qa__q">${esc(it.q)}</span>
                        <span class="qa__icon" aria-hidden="true"><i></i><i></i></span>
                      </button>
                      <div class="qa__panel" role="region" aria-labelledby="${slug(c.title)}-${i}"><p>${esc(it.a)}</p></div>
                    </article>`,
                  )
                  .join('')}
              </div>
            </section>`,
          )
          .join('')}
        <p class="faq__empty" id="faq-empty" hidden>No matches. Try a different word, or <a href="/contact">ask us directly</a>.</p>
      </div>
    </div>
  </section>

  ${ctaAndFooter()}`;
}

/* ---------- Accordion ---------- */
function initAccordion(animate: boolean) {
  qa<HTMLElement>('.qa').forEach((qa_) => {
    const trigger = q<HTMLButtonElement>('.qa__trigger', qa_)!;
    const panel = q('.qa__panel', qa_)!;
    gsap.set(panel, { height: 0, autoAlpha: 0 });
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!open));
      qa_.classList.toggle('is-open', !open);
      gsap.to(panel, {
        height: open ? 0 : 'auto',
        autoAlpha: open ? 0 : 1,
        duration: animate ? 0.55 : 0,
        ease: open ? 'power3.in' : 'expo.out',
        onUpdate: () => ScrollTrigger.update(),
        onComplete: () => ScrollTrigger.refresh(),
      });
      if (!open && animate) gsap.from(panel.querySelector('p'), { y: 12, autoAlpha: 0, duration: 0.5, delay: 0.1, ease: 'power3.out' });
    });
  });
}

/* ---------- Topics + search, reflowed with Flip ---------- */
function initFilter(animate: boolean, scrollTo: (el: Element) => void) {
  const input = q<HTMLInputElement>('#faq-search')!;
  const count = q('#search-count')!;
  const empty = q('#faq-empty')!;
  const topics = qa<HTMLAnchorElement>('#topics a');
  const cats = qa<HTMLElement>('.cat');
  const items = qa<HTMLElement>('.qa');
  let activeCat = 'all';

  function apply() {
    const term = input.value.trim().toLowerCase();
    const state = Flip.getState([...cats, ...items]);
    let visible = 0;
    cats.forEach((cat) => {
      const catOn = activeCat === 'all' || cat.dataset.cat === activeCat;
      let catVisible = 0;
      qa<HTMLElement>('.qa', cat).forEach((it) => {
        const hit = !term || it.dataset.q!.includes(term) || it.dataset.a!.includes(term);
        const on = catOn && hit;
        it.style.display = on ? '' : 'none';
        if (on) catVisible++;
      });
      cat.style.display = catVisible ? '' : 'none';
      visible += catVisible;
    });
    empty.hidden = visible > 0;
    count.textContent = String(visible);
    Flip.from(state, {
      duration: animate ? 0.6 : 0,
      ease: 'power3.inOut',
      stagger: 0.015,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.02 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, duration: 0.25 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
    gsap.fromTo(count, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
  }

  input.addEventListener('input', apply);
  topics.forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      activeCat = a.dataset.cat!;
      topics.forEach((t) => t.classList.toggle('is-active', t === a));
      apply();
      scrollTo(q('#faq')!);
    }),
  );
  // Deep-link to a category: /faq#billing-contracts-licensing
  const hash = window.location.hash.slice(1);
  const match = topics.find((t) => t.dataset.cat === hash);
  if (match) match.click();
}

boot({
  page: 'faq',
  render,
  init: ({ reduce, revealed, smoother }) => {
    initAccordion(!reduce);
    initFilter(!reduce, (el) => (smoother ? smoother.scrollTo(el, true, 'top 72px') : el.scrollIntoView({ behavior: 'smooth' })));
    if (reduce) return;
    stickyPin(q('.faq__rail')!, q('.faq__grid')!);

    const { tween } = splitReveal('.faq-hero__title', { by: 'chars', scrollTrigger: false, stagger: 0.02 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .from('.faq-hero .eyebrow', { y: 20, autoAlpha: 0, duration: 0.8 }, 0)
      .add(tween.play(), 0.05)
      .from('.faq-hero .h-sub, .faq-hero .lead, .search', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5)
      .from('.qmark', { scale: 0, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease: 'back.out(1.6)' }, 0.4)
      .from('.page-hero__mark', { autoAlpha: 0, scale: 0.9, duration: 1.6 }, 0.2);
    revealed.then(() => heroTl.play());
    qa('.qmark').forEach((m, i) => gsap.to(m, { y: `+=${12 + (i % 3) * 8}`, rotate: i % 2 ? 6 : -6, duration: 3 + (i % 4), yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    gsap.to('.faq-hero__marks', { yPercent: 20, ease: 'none', scrollTrigger: { trigger: '.faq-hero', start: 'top top', end: 'bottom top', scrub: true } });

    fadeUp('#topics a', '.faq__rail', { y: 14, stagger: 0.04 });
    qa('.cat').forEach((cat) => {
      splitReveal(cat.querySelector('.cat__title')!, { trigger: cat, start: 'top 85%' });
      fadeUp(cat.querySelectorAll('.qa'), cat, { y: 20, stagger: 0.05, start: 'top 85%' });
      // Keep the rail in sync with the category under the viewport centre.
      ScrollTrigger.create({
        trigger: cat,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (!self.isActive) return;
          const active = qa('#topics a').find((a) => a.classList.contains('is-active'));
          if (active?.dataset.cat !== 'all') return; // user filtered to one topic; leave their choice
          qa('#topics a').forEach((a) => a.classList.toggle('is-current', a.dataset.cat === cat.dataset.cat));
        },
      });
    });
  },
});
