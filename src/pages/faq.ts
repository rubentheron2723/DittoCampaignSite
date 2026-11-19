import '../styles/base.css';
import '../styles/faq.css';

import { faqCategories } from '../content/faq';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { splitReveal, stickyPin } from '../shared/motion';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import type { BlobParams } from '../shared/footer-blobs';

/*
 * FAQ (Figma 2421:1858 hero, 2421:2028 topics). The hero is the About / Pricing / Contact sky with the search pill;
 * below it, a column of topic tabs beside one topic's questions at a time. Searching shows the matching questions
 * from every topic instead, and picking a tab clears the search.
 */

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const total = faqCategories.reduce((n, c) => n + c.items.length, 0);
const summary = `${total} answers across ${faqCategories.length} topics. Search, or pick a topic.`;

/** The section's Moving blobs: the hero's, with Figma's higher threshold (27.5) for this frame. */
const TOPIC_BLOBS: BlobParams = { ...HERO_BUBBLES, threshold: 27.5 };

const SEARCH = `<svg class="fsearch__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const CHEV = `<svg class="fqa__chev" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function render() {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="fhero" data-theme="dark">
    <div class="fhero__bg" aria-hidden="true">
      <canvas class="fhero__sky"></canvas>
      <div class="fhero__glow"></div>
      <div class="fhero__haze"></div>
    </div>
    <div class="fhero__inner">
      <h1 class="fhero__title"><span class="fhero__line">Recruitment</span> <span class="fhero__line">software FAQs.</span></h1>
      <div class="fhero__copy">
        <p class="fhero__lead">Your questions, answered clearly.</p>
        <p class="fhero__support" id="faq-summary" aria-live="polite">${esc(summary)}</p>
      </div>
      <form class="fsearch" role="search" id="faq-search-form">
        <label class="fsearch__pill" for="faq-search">
          ${SEARCH}
          <span class="sr-only">Search questions</span>
          <input id="faq-search" type="search" placeholder="Search questions" autocomplete="off" enterkeyhint="search" />
        </label>
      </form>
    </div>
  </section>

  <section class="ftopics" id="faq" data-theme="light">
    <canvas class="ftopics__fx" aria-hidden="true"></canvas>
    <div class="ftopics__grid">
      <div class="ftopics__rail">
        <div class="ftabs" role="tablist" aria-label="FAQ topics" aria-orientation="vertical">
          ${faqCategories
            .map(
              (c, i) =>
                `<button type="button" class="ftab${i === 0 ? ' is-on' : ''}" role="tab" id="tab-${slug(c.title)}" aria-controls="${slug(c.title)}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-cat="${slug(c.title)}">${esc(c.title)}</button>`,
            )
            .join('')}
        </div>
      </div>

      <div class="ftopics__list">
        ${faqCategories
          .map(
            (c, ci) => `<section class="ftopic" id="${slug(c.title)}" data-cat="${slug(c.title)}" role="tabpanel" aria-labelledby="tab-${slug(c.title)}"${ci ? ' hidden' : ''}>
              <h2 class="ftopic__title">${esc(c.title)}</h2>
              <div class="ftopic__items">
                ${c.items
                  .map((it, i) => {
                    const id = `${slug(c.title)}-${i}`;
                    return `<article class="fqa" data-q="${esc(it.q.toLowerCase())}" data-a="${esc(it.a.toLowerCase())}">
                      <h3 class="fqa__head"><button type="button" class="fqa__trigger" id="${id}" aria-expanded="false" aria-controls="${id}-a"><span class="fqa__q">${esc(it.q)}</span>${CHEV}</button></h3>
                      <div class="fqa__panel" id="${id}-a" role="region" aria-labelledby="${id}"><p>${esc(it.a)}</p></div>
                    </article>`;
                  })
                  .join('')}
              </div>
            </section>`,
          )
          .join('')}
        <p class="ftopics__empty" id="faq-empty" hidden>No matches. Try a different word, or <a href="/contact">ask us directly</a>.</p>
      </div>
    </div>
  </section>

  ${ctaAndFooter()}`;
}

/* ---------- Accordion ---------- */
function initAccordion(animate: boolean) {
  qa<HTMLElement>('.fqa').forEach((item) => {
    const trigger = q<HTMLButtonElement>('.fqa__trigger', item)!;
    const panel = q<HTMLElement>('.fqa__panel', item)!;
    if (!item.classList.contains('is-open')) gsap.set(panel, { height: 0, autoAlpha: 0 });
    trigger.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      trigger.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
      gsap.to(panel, {
        height: open ? 0 : 'auto',
        autoAlpha: open ? 0 : 1,
        duration: animate ? 0.55 : 0,
        ease: open ? 'power3.inOut' : 'expo.out',
        overwrite: true,
        onComplete: () => ScrollTrigger.refresh(),
      });
      if (!open && animate) gsap.fromTo(panel.firstElementChild, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.08, ease: 'power3.out' });
    });
  });
}

/* ---------- Tabs + search ---------- */
function initTopics(animate: boolean, scrollToList: () => void) {
  const input = q<HTMLInputElement>('#faq-search')!;
  const form = q<HTMLFormElement>('#faq-search-form')!;
  const summaryEl = q('#faq-summary')!;
  const empty = q('#faq-empty')!;
  const list = q<HTMLElement>('.ftopics__list')!;
  const tabs = qa<HTMLButtonElement>('.ftab');
  const topics = qa<HTMLElement>('.ftopic');
  let active = tabs[0].dataset.cat!;
  let term = '';

  /** Shows the active topic, or every topic's matches while searching. */
  const show = () => {
    let matches = 0;
    topics.forEach((t) => {
      let shown = 0;
      qa<HTMLElement>('.fqa', t).forEach((it) => {
        const on = !term || it.dataset.q!.includes(term) || it.dataset.a!.includes(term);
        it.hidden = !on;
        if (on) shown++;
      });
      const on = term ? shown > 0 : t.dataset.cat === active;
      t.hidden = !on;
      if (on) matches += shown;
    });
    empty.hidden = !term || matches > 0;
    summaryEl.textContent = term ? `${matches} ${matches === 1 ? 'answer matches' : 'answers match'} “${input.value.trim()}”.` : summary;
    tabs.forEach((b) => {
      const on = !term && b.dataset.cat === active;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
    });
  };

  /** Swaps what the list shows: out, change, back in (the title rising, then the questions). */
  let swapping: gsap.core.Timeline | null = null;
  const swap = (change: () => void) => {
    swapping?.progress(1);
    if (!animate) {
      change();
      show();
      ScrollTrigger.refresh();
      return;
    }
    swapping = gsap
      .timeline({ onComplete: () => void ScrollTrigger.refresh() })
      .to(list, { autoAlpha: 0, y: -12, duration: 0.2, ease: 'power2.in' })
      .add(() => {
        change();
        show();
      })
      .fromTo(list, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  };

  const row = q<HTMLElement>('.ftabs')!;
  const pick = (tab: HTMLButtonElement) => {
    tabs.forEach((b) => (b.tabIndex = b === tab ? 0 : -1));
    // On phones the tabs are a sideways row: bring the picked one to its middle.
    if (row.scrollWidth > row.clientWidth) {
      const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
      row.scrollTo({ left: Math.max(0, left), behavior: animate ? 'smooth' : 'auto' });
    }
    if (tab.dataset.cat === active && !term) return;
    swap(() => {
      active = tab.dataset.cat!;
      term = '';
      input.value = '';
    });
    scrollToList();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => pick(tab));
    // Arrow keys move along the tabs (and pick, as tabs do); Home and End jump to the ends.
    tab.addEventListener('keydown', (e) => {
      const to =
        e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i + 1) % tabs.length
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length
        : e.key === 'Home' ? 0
        : e.key === 'End' ? tabs.length - 1
        : -1;
      if (to < 0) return;
      e.preventDefault();
      tabs[to].focus();
      pick(tabs[to]);
    });
  });

  let typing = 0;
  input.addEventListener('input', () => {
    window.clearTimeout(typing);
    // Results settle a moment after the last key, so the list doesn't flicker on every letter.
    typing = window.setTimeout(() => {
      const next = input.value.trim().toLowerCase();
      if (next !== term) swap(() => (term = next));
    }, animate ? 160 : 0);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    scrollToList();
  });

  // Deep-link to a topic: /faq#billing-contracts-licensing
  const hash = window.location.hash.slice(1);
  const match = tabs.find((t) => t.dataset.cat === hash);
  if (match) {
    active = hash;
    tabs.forEach((b) => (b.tabIndex = b === match ? 0 : -1));
    show();
  }
}

/** The topics backdrop: #FDFDFD, rippled by the Moving blobs. */
const PAPER: [number, number, number] = [253, 253, 253];

boot({
  page: 'faq',
  render,
  init: ({ reduce, revealed, smoother }) => {
    initClouds(q('.fhero')!, q<HTMLCanvasElement>('.fhero__sky')!, 'fhero--sky', reduce, SKY_HERO, {
      bubbles: { params: HERO_BUBBLES, intensity: 0.6 },
    });
    initBlobBackdrop(q('.ftopics')!, q<HTMLCanvasElement>('.ftopics__fx')!, 'ftopics--fx', TOPIC_BLOBS, PAPER, reduce, 0.6);
    initAccordion(!reduce);

    const section = q<HTMLElement>('#faq')!;
    // Brings the list into view only when its top has scrolled away (picking from the pinned tabs further down).
    const scrollToList = () => {
      const top = section.getBoundingClientRect().top;
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      if (top > nav && top < window.innerHeight * 0.5) return;
      if (smoother) smoother.scrollTo(section, true, `top ${nav}px`);
      else section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    };
    initTopics(!reduce, scrollToList);
    if (reduce) return;

    // The tabs stay beside the questions as a long topic scrolls by.
    stickyPin(q('.ftopics__rail')!, q('.ftopics__grid')!, 72);

    const { tween } = splitReveal('.fhero__title', { by: 'chars', scrollTrigger: false, stagger: 0.025 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.fhero__lead, .fhero__support, .fsearch', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5);
    revealed.then(() => {
      heroTl.play();
      // Never leave the copy hidden if frames are starved.
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
    });

    gsap.from('.ftab', {
      x: -24,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.04,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: section, start: 'top 70%' },
    });
    gsap.from('.ftopics__list', {
      y: 40,
      autoAlpha: 0,
      duration: 1,
      ease: 'expo.out',
      delay: 0.15,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: section, start: 'top 70%' },
    });
  },
});
