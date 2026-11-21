import '../styles/base.css';
import '../styles/faq.css';
import '../styles/legal.css';

import type { LegalDoc } from '../content/legal';
import type { PageId } from '../content/shared';
import { boot } from './boot';
import { ctaAndFooter } from './chrome';
import { esc } from './mark';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { splitReveal, stickyPin } from './motion';
import { HERO_BUBBLES, initClouds, SKY_HERO } from './cta-clouds';
import { initBlobBackdrop } from './blob-backdrop';
import type { BlobParams } from './footer-blobs';

/*
 * Privacy and Terms: the FAQ's layout without its search. The FAQ hero's sky with the title, lead and the date of
 * the last revision; below it, a column of the clauses beside the whole document. The column jumps to a clause and
 * lights the one being read; with more clauses than fit a screen, it scrolls itself to keep that one in view.
 */

const slug = (num: string) => `clause-${num}`;
/** The FAQ topics' Moving blobs (Figma's higher threshold, 27.5). */
const BLOBS: BlobParams = { ...HERO_BUBBLES, threshold: 27.5 };
const PAPER: [number, number, number] = [253, 253, 253];

function render(doc: LegalDoc) {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="fhero lhero" data-theme="dark">
    <div class="fhero__bg" aria-hidden="true">
      <canvas class="fhero__sky"></canvas>
      <div class="fhero__glow"></div>
      <div class="fhero__haze"></div>
    </div>
    <div class="fhero__inner">
      <h1 class="fhero__title"><span class="fhero__line">${esc(doc.titleOne)}</span>${doc.titleTwo ? ` <span class="fhero__line">${esc(doc.titleTwo)}</span>` : ''}</h1>
      <div class="fhero__copy">
        <p class="fhero__lead">${esc(doc.lead)}</p>
        <p class="fhero__support">Last updated ${esc(doc.updated)}</p>
      </div>
    </div>
  </section>

  <section class="ftopics ldoc" id="document" data-theme="light">
    <canvas class="ftopics__fx" aria-hidden="true"></canvas>
    <div class="ftopics__grid">
      <div class="ftopics__rail">
        <nav class="ftabs ltabs" aria-label="Sections">
          ${doc.sections
            .map(
              (s, i) =>
                `<a class="ftab ltab${i === 0 ? ' is-on' : ''}" href="#${slug(s.num)}" data-cat="${slug(s.num)}"${i === 0 ? ' aria-current="true"' : ''}><span class="ltab__num">${esc(s.num)}</span>${esc(s.title)}</a>`,
            )
            .join('')}
        </nav>
      </div>

      <div class="ftopics__list ldoc__list">
        ${doc.sections
          .map(
            (s) => `<section class="ftopic lclause" id="${slug(s.num)}" data-cat="${slug(s.num)}" aria-labelledby="${slug(s.num)}-title">
              <h2 class="lclause__title" id="${slug(s.num)}-title"><span class="lclause__num">${esc(s.num)}.</span> ${esc(s.title)}</h2>
              <div class="lclause__body" data-num="${esc(s.num)}">${s.html}</div>
            </section>`,
          )
          .join('')}
      </div>
    </div>
  </section>

  ${ctaAndFooter()}`;

  // Numbering: each top-level item carries its clause's number for its "9.1" marker; an item that only wraps a
  // nested list (a "such as:" list) is marked so it takes no number of its own.
  qa<HTMLElement>('.lclause__body').forEach((body) => {
    qa<HTMLElement>(':scope > ol > li', body).forEach((li) => {
      li.dataset.num = body.dataset.num;
      const own = [...li.childNodes].filter((n) => !(n instanceof HTMLElement && (n.tagName === 'OL' || n.tagName === 'UL')));
      if (!own.some((n) => n.textContent!.trim())) li.classList.add('is-group');
    });
  });
}

/** Lights the clause being read; the tabs jump to a clause. Returns the deep-link handler (/privacy#clause-9). */
function initClauses(animate: boolean, goTo: (clause: HTMLElement, smooth: boolean) => void) {
  const row = q<HTMLElement>('.ftabs')!;
  const tabs = qa<HTMLAnchorElement>('.ftab');
  const clauses = qa<HTMLElement>('.ftopic');
  const clauseOf = (tab: HTMLElement) => clauses.find((c) => c.dataset.cat === tab.dataset.cat)!;

  // While someone is swiping the row of tabs, the lit tab doesn't pull it back to centre.
  let rowTouched = -Infinity;
  ['pointerdown', 'wheel', 'touchmove'].forEach((t) => row.addEventListener(t, () => (rowTouched = performance.now()), { passive: true }));
  // Phones: the row of tabs only scrolls itself when a tab is picked. Re-centring it as each topic scrolled by kept it
  // moving under the reader.
  const narrowRow = window.matchMedia('(max-width: 900px)');
  let active = '';
  /** `centre`: bring the tab to the middle of its row (on a tap or deep link; on phones, never just from scrolling). */
  const light = (cat: string, centre = !narrowRow.matches) => {
    if (cat === active) return;
    active = cat;
    tabs.forEach((b) => {
      const on = b.dataset.cat === cat;
      b.classList.toggle('is-on', on);
      if (on) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
      if (!on) return;
      // Keep the lit tab in view inside its own scrolling column (sideways on phones, up and down beside the text).
      if (!centre || performance.now() - rowTouched < 1200) return;
      if (row.scrollWidth > row.clientWidth) {
        row.scrollTo({ left: Math.max(0, b.offsetLeft - (row.clientWidth - b.offsetWidth) / 2), behavior: animate ? 'smooth' : 'auto' });
      } else if (row.scrollHeight > row.clientHeight) {
        row.scrollTo({ top: Math.max(0, b.offsetTop - (row.clientHeight - b.offsetHeight) / 2), behavior: animate ? 'smooth' : 'auto' });
      }
    });
  };
  light(tabs[0].dataset.cat!);

  clauses.forEach((c) =>
    ScrollTrigger.create({
      trigger: c,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => self.isActive && light(c.dataset.cat!),
    }),
  );

  tabs.forEach((tab) =>
    tab.addEventListener('click', (e) => {
      // Ours, not boot's same-page link handler (which would put the title under the nav).
      e.preventDefault();
      e.stopPropagation();
      light(tab.dataset.cat!, true);
      goTo(clauseOf(tab), animate);
      history.replaceState(null, '', `#${tab.dataset.cat}`);
    }),
  );

  return () => {
    const match = tabs.find((t) => t.dataset.cat === window.location.hash.slice(1));
    if (match) {
      light(match.dataset.cat!, true);
      goTo(clauseOf(match), false);
    }
  };
}

export function legalPage(page: PageId, doc: LegalDoc) {
  boot({
    hashScroll: false,
    page,
    render: () => render(doc),
    init: ({ reduce, revealed, smoother }) => {
      initClouds(q('.fhero')!, q<HTMLCanvasElement>('.fhero__sky')!, 'fhero--sky', reduce, SKY_HERO, {
        bubbles: { params: HERO_BUBBLES, intensity: 0.6 },
      });
      initBlobBackdrop(q('.ftopics')!, q<HTMLCanvasElement>('.ftopics__fx')!, 'ftopics--fx', BLOBS, PAPER, reduce, 0.6, 30);
      // The blobs' canvas is one screen tall, carried down the (very long) document so it always fills the view.
      const fx = q<HTMLElement>('.ftopics__fx')!;
      // Phones: it stays put behind the topics' start and fades out (faq.css): moving it with every scroll frame cost
      // smoothness there.
      gsap.matchMedia().add('(min-width: 901px)', () => {
        ScrollTrigger.create({
          trigger: '.ftopics',
          start: 'top top',
          end: 'bottom bottom',
          onRefresh: (self) => gsap.set(fx, { y: self.progress * (self.end - self.start) }),
          onUpdate: (self) => gsap.set(fx, { y: self.progress * (self.end - self.start) }),
        });
        return () => gsap.set(fx, { y: 0 });
      });

      const section = q<HTMLElement>('#document')!;
      const rail = q<HTMLElement>('.ftopics__rail')!;
      const grid = q<HTMLElement>('.ftopics__grid')!;
      const phone = window.matchMedia('(max-width: 900px)');
      let entrance: gsap.core.Tween | undefined;
      /** Scrolls a clause's title to the top of the column (on phones, just under the pinned row). */
      const goTo = (clause: HTMLElement, smooth: boolean) => {
        entrance?.progress(1);
        const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const gap = phone.matches ? 24 : parseFloat(getComputedStyle(rail).paddingTop) || 0;
        const at = nav + gap;
        if (smoother) smoother.scrollTo(smoother.offset(clause, `top ${at}px`), smooth);
        else window.scrollTo({ top: clause.getBoundingClientRect().top + window.scrollY - at, behavior: smooth ? 'smooth' : 'auto' });
      };
      const deepLink = initClauses(!reduce, goTo);
      revealed.then(() => requestAnimationFrame(deepLink));

      stickyPin(rail, grid, 72);
      if (reduce) return;

      const { tween } = splitReveal('.fhero__title', { by: 'chars', scrollTrigger: false, stagger: 0.025 });
      tween.pause();
      const heroTl = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .add(tween.play(), 0.05)
        .from('.fhero__lead, .fhero__support', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5);
      revealed.then(() => {
        heroTl.play();
        window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
      });

      gsap.from('.ftab', {
        x: -24,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.02,
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: section, start: 'top 70%' },
      });
      entrance = gsap.from('.ftopics__list', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        delay: 0.15,
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: section, start: 'top 70%' },
      });
    },
  });
}
