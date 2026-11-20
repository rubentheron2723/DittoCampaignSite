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
 * below it, a column of topic tabs beside every topic's questions in one list. The tabs jump to a topic and light
 * up the one being read; searching narrows the list to the matching questions (picking a tab clears the search).
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
        <nav class="ftabs" aria-label="FAQ topics">
          ${faqCategories
            .map(
              (c, i) =>
                `<a class="ftab${i === 0 ? ' is-on' : ''}" href="#${slug(c.title)}" data-cat="${slug(c.title)}"${i === 0 ? ' aria-current="true"' : ''}>${esc(c.title)}</a>`,
            )
            .join('')}
        </nav>
      </div>

      <div class="ftopics__list">
        ${faqCategories
          .map(
            (c) => `<section class="ftopic" id="${slug(c.title)}" data-cat="${slug(c.title)}" aria-labelledby="${slug(c.title)}-title">
              <h2 class="ftopic__title" id="${slug(c.title)}-title">${esc(c.title)}</h2>
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
function initTopics(animate: boolean, goTo: (topic: HTMLElement, smooth: boolean) => void) {
  const input = q<HTMLInputElement>('#faq-search')!;
  const form = q<HTMLFormElement>('#faq-search-form')!;
  const summaryEl = q('#faq-summary')!;
  const empty = q('#faq-empty')!;
  const list = q<HTMLElement>('.ftopics__list')!;
  const row = q<HTMLElement>('.ftabs')!;
  const tabs = qa<HTMLAnchorElement>('.ftab');
  const topics = qa<HTMLElement>('.ftopic');
  const topicOf = (tab: HTMLElement) => topics.find((t) => t.dataset.cat === tab.dataset.cat)!;
  let term = '';

  /** Lights a topic's tab (and, on phones, brings it to the middle of the sideways row). */
  let active = '';
  const light = (cat: string) => {
    if (cat === active) return;
    active = cat;
    tabs.forEach((b) => {
      const on = b.dataset.cat === cat;
      b.classList.toggle('is-on', on);
      if (on) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
      if (on && row.scrollWidth > row.clientWidth) {
        const left = b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2;
        row.scrollTo({ left: Math.max(0, left), behavior: animate ? 'smooth' : 'auto' });
      }
    });
  };
  light(tabs[0].dataset.cat!);

  // The topic crossing the upper part of the screen is the one being read.
  topics.forEach((t) =>
    ScrollTrigger.create({
      trigger: t,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => self.isActive && light(t.dataset.cat!),
    }),
  );

  /** Narrows every topic to the questions matching the search (a topic with none drops out). */
  const show = () => {
    let matches = 0;
    topics.forEach((t) => {
      let shown = 0;
      qa<HTMLElement>('.fqa', t).forEach((it) => {
        const on = !term || it.dataset.q!.includes(term) || it.dataset.a!.includes(term);
        it.hidden = !on;
        if (on) shown++;
      });
      t.hidden = shown === 0;
      matches += shown;
    });
    empty.hidden = !term || matches > 0;
    summaryEl.textContent = term ? `${matches} ${matches === 1 ? 'answer matches' : 'answers match'} “${input.value.trim()}”.` : summary;
    tabs.forEach((b) => b.classList.toggle('is-empty', !!term && topicOf(b).hidden));
  };

  /** Swaps what the list shows: out, change, back in. */
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
        ScrollTrigger.refresh();
      })
      .fromTo(list, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  };

  tabs.forEach((tab) =>
    tab.addEventListener('click', (e) => {
      // Ours, not boot's same-page link handler (which would put the title under the nav).
      e.preventDefault();
      e.stopPropagation();
      // A topic the search has hidden comes back with the rest: picking a tab clears the search.
      if (term) {
        swapping?.progress(1);
        term = '';
        input.value = '';
        show();
        ScrollTrigger.refresh();
      }
      light(tab.dataset.cat!);
      goTo(topicOf(tab), animate);
      history.replaceState(null, '', `#${tab.dataset.cat}`);
    }),
  );

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
    const first = topics.find((t) => !t.hidden);
    if (first) goTo(first, animate);
  });

  // Deep-link to a topic: /faq#billing-contracts-licensing
  return () => {
    const match = tabs.find((t) => t.dataset.cat === window.location.hash.slice(1));
    if (match) {
      light(match.dataset.cat!);
      goTo(topicOf(match), false);
    }
  };
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
    // The blobs' canvas is one screen tall (the whole list would be ~10,000px of shader every frame), carried down
    // the section so it always fills the view: at the section's top as it enters, at its foot as it leaves.
    const fx = q<HTMLElement>('.ftopics__fx')!;
    ScrollTrigger.create({
      trigger: '.ftopics',
      start: 'top top',
      end: 'bottom bottom',
      onRefresh: (self) => gsap.set(fx, { y: self.progress * (self.end - self.start) }),
      onUpdate: (self) => gsap.set(fx, { y: self.progress * (self.end - self.start) }),
    });
    initAccordion(!reduce);

    const section = q<HTMLElement>('#faq')!;
    const rail = q<HTMLElement>('.ftopics__rail')!;
    const grid = q<HTMLElement>('.ftopics__grid')!;
    const phone = window.matchMedia('(max-width: 900px)');
    let entrance: gsap.core.Tween | undefined;
    /** Scrolls a topic's title to the top of the tabs (on phones, just under the pinned row of tabs). */
    const goTo = (topic: HTMLElement, smooth: boolean) => {
      // The list's rise-in would otherwise be measured mid-way (its 40px off still applied) and the scroll fall short.
      entrance?.progress(1);
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const gap = phone.matches ? rail.offsetHeight + 24 : parseFloat(getComputedStyle(rail).paddingTop) || 0;
      const at = nav + gap;
      // As a number: a smooth scrollTo given the element and a position drops the position's offset.
      if (smoother) smoother.scrollTo(smoother.offset(topic, `top ${at}px`), smooth);
      else window.scrollTo({ top: topic.getBoundingClientRect().top + window.scrollY - at, behavior: smooth ? 'smooth' : 'auto' });
    };
    const deepLink = initTopics(!reduce, goTo);
    revealed.then(() => requestAnimationFrame(deepLink));

    // The tabs stay beside the questions (on phones, above them) as the topics scroll by.
    stickyPin(rail, grid, 72);
    gsap.matchMedia().add('(max-width: 900px)', () => {
      ScrollTrigger.create({
        trigger: rail,
        start: 'top 72px',
        endTrigger: grid,
        end: () => `bottom ${rail.offsetHeight + 72}px`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
        toggleClass: { targets: rail, className: 'is-pinned' },
      });
    });
    if (reduce) return;

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
    entrance = gsap.from('.ftopics__list', {
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
