import '../styles/base.css';
import '../styles/think.css';
import '../styles/product.css';

import { dayInTheLife, featureActs, finalFeaturesCta, productHero, trust, type ActContent } from '../content/product';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { initThinkZoom, type StageScene } from '../animations/think-zoom';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { gsap, q, qa, ScrollSmoother, ScrollTrigger } from '../animations/gsap';
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

/** Two overlapping sheets: copy. */
const COPY = `<svg class="app__copy-icon" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
const TICK = `<svg class="app__tick" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#1e6ef3"/><path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * The conversation the chat zooms in on (played by chatScene): the request as a bubble, Ditto's steps as it works,
 * then the people it found. All of it waits hidden until played.
 */
type Person = (typeof dayInTheLife.chat.people)[number];
const initials = (n: string) => n.split(' ').map((w) => w[0]).join('');
const person = (p: Person, cls = '') => `<li class="app__person${cls}">
    <span class="app__avatar" style="--hue: ${p.hue}">${esc(initials(p.name))}</span>
    <span class="app__who"><b>${esc(p.name)}</b><span>${esc(p.role)} · ${esc(p.company)}</span><em>${esc(p.link)}</em></span>
    <span class="app__match"><b>${p.match}%</b>match</span>
  </li>`;

function thread() {
  const c = dayInTheLife.chat;
  return `<div class="app__thread"><div class="app__scroll">
    <div class="app__me"><p>${esc(c.request)}</p></div>
    <div class="app__reply">
      <p class="app__by"><i class="app__orb"></i>${esc(c.by)}</p>
      ${stepList(c.steps)}
      <p class="app__answer">${esc(c.answer)}</p>
      <ul class="app__people">
        ${c.people.map((p) => person(p)).join('')}
      </ul>
      <p class="app__answer">${esc(c.followUp)}</p>
    </div>
  </div></div>`;
}

/** Ditto's steps as it works: a spinner each, then a tick (played by the scenes). */
const stepList = (steps: string[]) => `<ol class="app__steps">
    ${steps
      .map(
        (t) => `<li class="app__step">
          <span class="app__state"><i class="app__spin"></i>${TICK}</span>
          <span class="app__step-text"><span class="app__step-live">${esc(t)}</span><span class="app__step-done">${esc(t)}</span></span>
        </li>`,
      )
      .join('')}
  </ol>`;

/** The message Ditto drafted for Amara (Engage). Its text streams in over a hidden copy that holds its size; `past`
 *  shows it done (Place, where it's part of the conversation so far). */
function draftCard(past = false) {
  const d = dayInTheLife.engage.draft;
  return `<div class="app__draft${past ? ' is-past' : ''}">
    <p class="app__draft-head"><span>To <b>${esc(d.to)}</b></span></p>
    <p class="app__draft-body"><span class="app__draft-ghost">${esc(d.body)}</span><span class="app__draft-text">${past ? esc(d.body) : ''}</span></p>
    <div class="app__draft-foot">
      <span class="app__slot">${icon('scheduled')}${esc(d.slot)}</span>
      <b class="app__copy-btn"><span class="app__copy-label">${COPY}${esc(d.copy)}</span><span class="app__copied-label">${TICK}${esc(d.copied)}</span></b>
    </div>
  </div>`;
}

/**
 * Engage and Place (Figma 2415:2, 2415:177): just the chat, at the size the first one zoomed to, with the
 * conversation so far above (`past`, ending in its .app__offer). The recruiter's next request is typed and sent, and
 * Ditto's reply (`reply`: its steps and what it made) comes in (laterScene). Laid out by laterScene to fill the stage.
 */
function laterChat(stage: string, past: string, request: string, reply: string) {
  const a = dayInTheLife.app;
  return `<div class="day__screen day__screen--chat" data-chat="${esc(stage)}" aria-hidden="true"><div class="app app--bare">
    <div class="app__chat">
      <div class="app__thread"><div class="app__scroll">
        ${past}
        <div class="app__me"><p>${esc(request)}</p></div>
        <div class="app__reply">
          <p class="app__by"><i class="app__orb"></i>${esc(dayInTheLife.chat.by)}</p>
          ${reply}
        </div>
      </div></div>
      <div class="app__ask">
        <div class="app__box app__box--compact">
          <span class="app__line">${icon('new')}<span class="app__field app__field--line"><span class="app__prompt">${esc(a.prompt)}</span><span class="app__typed"><span class="app__text"></span><i class="app__caret"></i></span></span>${icon('mic')}</span>
          <p class="app__under"><b>${esc(a.model)}</b><em>${esc(a.size)}</em></p>
        </div>
      </div>
    </div>
  </div></div>`;
}

/** Engage: the sourcing conversation above (its request, the top match and Ditto's offer); the reply drafts a message. */
function engageChat() {
  const c = dayInTheLife.chat;
  const e = dayInTheLife.engage;
  return laterChat(
    'Engage',
    `<div class="app__me is-past"><p>${esc(c.request)}</p></div>
    <div class="app__reply">
      <p class="app__by is-past"><i class="app__orb"></i>${esc(c.by)}</p>
      <p class="app__answer is-past">${esc(c.answer)}</p>
      <ul class="app__people">${person(c.people[0], ' is-past')}</ul>
      <p class="app__answer is-past app__offer">${esc(c.followUp)}</p>
    </div>`,
    e.request,
    `${stepList(e.steps)}
    <p class="app__answer">${esc(e.answer)}</p>
    ${draftCard()}
    <p class="app__answer">${esc(e.followUp)}</p>`,
  );
}

/** Place: the Engage conversation above (the reply, the copied message); the next request logs the placement. */
function placeChat() {
  const c = dayInTheLife.chat;
  const e = dayInTheLife.engage;
  const p = dayInTheLife.place;
  const amara = c.people[0];
  return laterChat(
    'Place',
    `<div class="app__me is-past"><p>${esc(e.request)}</p></div>
    <div class="app__reply">
      <p class="app__by is-past"><i class="app__orb"></i>${esc(c.by)}</p>
      <p class="app__answer is-past">${esc(e.answer)}</p>
      ${draftCard(true)}
      <p class="app__answer is-past app__offer">${esc(e.followUp)}</p>
    </div>`,
    p.request,
    `${stepList(p.steps)}
    <p class="app__answer">${esc(p.answer)}</p>
    <div class="app__placed">
      <div class="app__placed-head">
        <span class="app__avatar" style="--hue: ${amara.hue}">${esc(initials(amara.name))}</span>
        <span class="app__who"><b>${esc(amara.name)}</b><span>${esc(amara.role)} · ${esc(p.client)}</span></span>
        <span class="app__badge">${TICK}${esc(p.status)}</span>
      </div>
      <ul class="app__facts">${p.facts.map((f) => `<li><span>${esc(f.label)}</span><b>${esc(f.value)}</b></li>`).join('')}</ul>
    </div>
    <p class="app__answer">${esc(p.followUp)}</p>`,
  );
}

/** The assistant window (Figma 2413:860): a 1024 x 768 desktop app, scaled to fit by think-zoom.ts. */
function appWindow() {
  const a = dayInTheLife.app;
  const row = (r: { label: string; dot?: string }) =>
    `<li class="app__row">${r.dot ? `<i class="app__dot app__dot--${r.dot}"></i>` : ''}<span>${esc(r.label)}</span></li>`;
  return `<div class="day__screen" aria-hidden="true"><div class="app">
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
              <p class="app__field"><span class="app__prompt">${esc(a.prompt)}</span><span class="app__typed"><span class="app__text"></span><i class="app__caret"></i></span></p>
              <div class="app__controls">
                <span class="app__modes">${icon('new')}${a.modes.map((m, i) => `<b class="app__chip${i === 0 ? ' is-on' : ''}">${esc(m)}</b>`).join('')}</span>
                <span class="app__model"><b>${esc(a.model)}</b><em>${esc(a.size)}</em>${icon('mic')}${icon('send', 'app__send')}</span>
              </div>
              <span class="app__line">${icon('new')}<span>${esc(a.prompt)}</span>${icon('mic')}</span>
              <p class="app__under"><b>${esc(a.model)}</b><em>${esc(a.size)}</em></p>
            </div>
            <div class="app__actions">
              ${a.actions.map((t, i) => `<span class="app__btn">${icon(['write', 'learn', 'code', 'career'][i])}${esc(t)}</span>`).join('')}
            </div>
          </div>
          ${thread()}
        </div>
      </div>
    </div>
  </div></div>`;
}

/**
 * "Day in the life" (Figma 2407:6, 2420:2, 2415:2): the About lens stage (think.css, think-zoom.ts) with a recruiter's
 * day for its statements: the time, then the stage of the work. 08:30 flies off through the lens into the app window;
 * the next swipe zooms in on its chat, which takes a request and answers it (chatScene); the one after fades the
 * window as 11:50 arrives through the lens, and the toggle moves on to Engage.
 */
function day() {
  const d = dayInTheLife;
  return `
  <section class="think day" id="day" data-theme="light">
    <div class="think__stage">
      <canvas class="think__lens" aria-hidden="true"></canvas>
      <nav class="day__tabs" aria-label="Stages of the day" data-peek-stop>
        <i class="day__pill" aria-hidden="true"></i>
        ${d.stages
          .map((s, i) => {
            const live = d.moments.some((m) => m.stage === s);
            return `<button type="button" class="day__tab${i === 0 ? ' is-on' : ''}" data-stage="${esc(s)}"${i === 0 ? ' aria-current="step"' : ''}${live ? '' : ' aria-disabled="true"'}>${esc(s)}</button>`;
          })
          .join('')}
      </nav>
      <ol class="think__list">
        ${d.moments
          .map(
            (m, i) =>
              `<li class="think__item" data-stage="${esc(m.stage)}"${m.group ? ` data-group="${m.group}"` : ''}><${i ? 'h3' : 'h2'} class="think__title">${esc(m.time)}</${i ? 'h3' : 'h2'}><p class="think__body">${esc(m.stage)}</p></li>`,
          )
          .join('')}
      </ol>
      ${appWindow()}
      ${engageChat()}
      ${placeChat()}
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
/**
 * The Source / Engage / Place toggle: its glass pill slides to the stage of the statement on screen, and each is a
 * button to that stage's first statement (one with none yet is disabled).
 */
function initDayTabs(animate: boolean) {
  const tabs = qa<HTMLElement>('.day__tab');
  const pill = q<HTMLElement>('.day__pill');
  if (!pill || !tabs.length) return () => {};
  let on = tabs.find((t) => t.classList.contains('is-on')) ?? tabs[0];
  const place = (t: HTMLElement, d: number) => gsap.to(pill, { x: t.offsetLeft, width: t.offsetWidth, duration: d, ease: 'expo.inOut', overwrite: true });
  place(on, 0);
  // Fonts settling can shift the tabs.
  document.fonts.ready.then(() => place(on, 0));

  tabs.forEach((t) =>
    t.addEventListener('click', () => {
      const day = q<HTMLElement>('.day');
      const target = qa<HTMLElement>('.day .think__item').find((el) => el.dataset.stage === t.dataset.stage);
      if (!day || !target || t.getAttribute('aria-disabled') === 'true') return;
      if (day.classList.contains('think--gl')) day.dispatchEvent(new CustomEvent('think:go', { detail: target }));
      else {
        // Without the lens the statements are plain rows: scroll to it.
        const sm = ScrollSmoother.get();
        if (sm) sm.scrollTo(target, true, 'center center');
        else target.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'center' });
      }
    }),
  );

  return (stage: string) => {
    const t = tabs.find((x) => x.dataset.stage === stage);
    if (!t || t === on) return;
    on.classList.remove('is-on');
    on.removeAttribute('aria-current');
    t.classList.add('is-on');
    t.setAttribute('aria-current', 'step');
    on = t;
    place(t, animate ? 0.8 : 0);
  };
}

/** The chat's size on screen (times its design size): by the stage's width alone, up to 1.5x, so it reads anywhere. */
const chatScale = (W: number) => Math.max(0.3, Math.min(1.5, (W - 64) / 560));
/** The band the chat is framed in: below the toggle, and 24 above the stage's foot. */
const BAND_TOP = 150;
const BAND_FOOT = 24;

/**
 * A scene's timeline as a stop of the lens stage. Scrolling on while it plays speeds it up, but gently: easing up to
 * twice its pace (a jump to 5x made fast scrolling flash through it). Back up, it rewinds at twice its pace.
 *
 * With `keep` (the conversation's scroller), once it has played it isn't rewound: back up, the conversation scrolls
 * to its start (`start`, where it sat before playing; 0 by default) and the stage goes on from the played scene, as
 * it stands; on again, it scrolls back to its end. A new visit to the section (a reset) plays it afresh.
 */
const HURRY = 2;
const SCROLL_BACK = 0.9;
function sceneControls(tl: gsap.core.Timeline, keep?: HTMLElement, start: () => number = () => 0): StageScene {
  /** Played, and scrolled back up: the conversation's end, to scroll back to. */
  let end: number | null = null;
  /** (Its own tween, replaced each time: overwriting by target would also cut the timeline's own scrolling.) */
  let scrolling: gsap.core.Tween | null = null;
  const scrollTo = (y: number) => {
    scrolling?.kill();
    scrolling = gsap.to(keep!, { y, duration: SCROLL_BACK, ease: 'power2.inOut' });
  };
  const pace = (to: number, d = 0) => {
    gsap.killTweensOf(tl, 'timeScale');
    if (d) gsap.to(tl, { timeScale: to, duration: d, ease: 'power1.inOut' });
    else tl.timeScale(to);
  };
  return {
    play: () => {
      if (keep && end !== null) {
        scrollTo(end);
        end = null;
        return SCROLL_BACK;
      }
      pace(1);
      tl.play(0);
      return tl.duration();
    },
    back: () => {
      if (keep && tl.progress() === 1) {
        if (end === null) end = Number(gsap.getProperty(keep, 'y'));
        scrollTo(start());
        return SCROLL_BACK;
      }
      pace(HURRY);
      tl.reverse();
      return tl.time() / HURRY;
    },
    hurry: () => {
      if (!tl.isActive() || tl.reversed()) return 0;
      if (tl.timeScale() < HURRY) pace(HURRY, 0.6);
      // (A little over, for the ease up to pace.)
      return (tl.duration() - tl.time()) / HURRY + 0.3;
    },
    finish: () => {
      end = null;
      scrolling?.kill();
      pace(1);
      tl.pause().progress(1);
    },
    reset: () => {
      end = null;
      scrolling?.kill();
      pace(1);
      tl.pause().progress(0);
    },
  };
}

type LaterResult = {
  tl: gsap.core.Timeline;
  /** When Ditto's steps are done. */
  at: number;
  reply: HTMLElement;
  follow: (el: HTMLElement, at: number) => void;
};

/**
 * A later chat (laterChat): it arrives as its moment flies, the conversation so far above; then the recruiter's
 * request is typed into the composer and sent, Ditto works through its steps, and `result` plays what it made. Like
 * chatScene, a stop of the lens stage of its own; once played, back up scrolls to where it arrived.
 */
function laterScene(screen: HTMLElement, request: string, result: (r: LaterResult) => void): StageScene {
  const stage = screen.closest<HTMLElement>('.think__stage')!;
  const convo = q<HTMLElement>('.app--bare', screen)!;
  const thread = q<HTMLElement>('.app__thread', convo)!;
  const scroller = q<HTMLElement>('.app__scroll', convo)!;
  const box = q<HTMLElement>('.app__box', convo)!;
  const field = q<HTMLElement>('.app__field', box)!;
  const text = q<HTMLElement>('.app__text', box)!;

  /** At the first chat's size, from the band's top to its foot. */
  const layout = () => {
    const k = chatScale(stage.clientWidth);
    convo.style.height = `${(stage.clientHeight - BAND_TOP - BAND_FOOT) / k}px`;
    convo.style.transform = `translateX(-50%) scale(${k})`;
  };
  /** The conversation's offset that brings `el` into view above the box. */
  const reach = (el: HTMLElement) => -Math.max(0, el.offsetTop + el.offsetHeight + 16 - thread.clientHeight);
  const offer = q<HTMLElement>('.app__offer', scroller)!;
  /** Laid out, and scrolled to the end of the conversation so far. */
  const settle = () => {
    layout();
    gsap.set(scroller, { y: reach(offer) });
  };
  settle();

  const tl = gsap.timeline({ paused: true });
  const follow = (el: HTMLElement, at: number) => void tl.to(scroller, { y: () => reach(el), duration: 0.6, ease: 'power2.out' }, at);

  // 1. The request, typed into the composer (its end kept in view).
  const typing = { n: 0 };
  const typeTime = request.length / 32;
  tl.to(box, { borderColor: 'rgba(81, 142, 243, 1)', duration: 0.3 }, 0)
    .to(q('.app__prompt', box), { autoAlpha: 0, duration: 0.15 }, 0.2)
    .fromTo(q('.app__caret', box), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.2)
    .fromTo(
      typing,
      { n: 0 },
      {
        n: request.length,
        duration: typeTime,
        ease: 'none',
        onUpdate: () => {
          text.textContent = request.slice(0, Math.round(typing.n));
          field.scrollLeft = field.scrollWidth;
        },
      },
      0.3,
    );

  // 2. Sent: the composer empties and the request pops up as a bubble.
  const sent = 0.3 + typeTime + 0.35;
  const me = qa<HTMLElement>('.app__me:not(.is-past)', scroller)[0];
  const reply = me.nextElementSibling as HTMLElement;
  tl.to(q('.app__typed', box), { autoAlpha: 0, duration: 0.2 }, sent)
    // (Scrolled back to its start, or the placeholder shows only its end.)
    .to(field, { scrollLeft: 0, duration: 0.01 }, sent + 0.25)
    .to(q('.app__prompt', box), { autoAlpha: 1, duration: 0.3 }, sent + 0.3)
    .to(box, { borderColor: 'rgba(81, 142, 243, 0.35)', duration: 0.6 }, sent + 0.3)
    .fromTo(me, { autoAlpha: 0, scale: 0.5, y: 24 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' }, sent + 0.3);
  follow(me, sent + 0.2);

  // 3. Ditto at work.
  const workAt = sent + 1.1;
  const STEP = 0.95;
  const by = q<HTMLElement>('.app__by', reply)!;
  follow(by, workAt);
  tl.fromTo(by, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, workAt);
  const steps = qa<HTMLElement>('.app__step', reply);
  steps.forEach((s, i) => {
    const at = workAt + 0.3 + i * STEP;
    follow(s, at);
    tl.fromTo(s, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, at)
      .to(q('.app__spin', s), { autoAlpha: 0, duration: 0.15 }, at + STEP - 0.1)
      .fromTo(q('.app__tick', s), { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }, at + STEP - 0.1)
      .to(q('.app__step-live', s), { autoAlpha: 0, duration: 0.25 }, at + STEP - 0.1)
      .fromTo(q('.app__step-done', s), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, at + STEP - 0.1);
  });

  // 4. What it made.
  result({ tl, at: workAt + 0.3 + steps.length * STEP + 0.2, reply, follow });

  // A new stage size re-lays it out, wherever the scene is.
  ScrollTrigger.addEventListener('refresh', () => {
    const t = tl.time();
    tl.progress(0, true);
    settle();
    tl.invalidate().time(t, true);
  });

  return sceneControls(tl, scroller, () => reach(offer));
}

/** Engage's result: the message drafted for Amara streams into its card (already its full size), and is copied. */
function engageScene(screen: HTMLElement): StageScene {
  const e = dayInTheLife.engage;
  return laterScene(screen, e.request, ({ tl, at, reply, follow }) => {
    const [lead, last] = qa<HTMLElement>('.app__answer', reply);
    const draft = q<HTMLElement>('.app__draft', reply)!;
    const draftText = q<HTMLElement>('.app__draft-text', draft)!;
    const stream = { n: 0 };
    const streamAt = at + 0.6;
    const streamTime = e.draft.body.length / 110;
    follow(lead, at);
    follow(draft, at + 0.3);
    tl.fromTo(lead, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, at)
      .fromTo(draft, { autoAlpha: 0, y: 18, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, at + 0.3)
      .fromTo(
        stream,
        { n: 0 },
        {
          n: e.draft.body.length,
          duration: streamTime,
          ease: 'none',
          onUpdate: () => void (draftText.textContent = e.draft.body.slice(0, Math.round(stream.n))),
        },
        streamAt,
      );
    const copyAt = streamAt + streamTime + 0.6;
    const btn = q<HTMLElement>('.app__copy-btn', draft)!;
    tl.to(btn, { scale: 0.92, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }, copyAt)
      .to(q('.app__copy-label', btn), { autoAlpha: 0, duration: 0.2 }, copyAt + 0.1)
      .fromTo(q('.app__copied-label', btn), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, copyAt + 0.2)
      .fromTo(last, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, copyAt + 0.6);
    follow(last, copyAt + 0.6);
  });
}

/** Place's result: the placement card comes in, its Placed badge pops, and its facts follow one by one. */
function placeScene(screen: HTMLElement): StageScene {
  return laterScene(screen, dayInTheLife.place.request, ({ tl, at, reply, follow }) => {
    const [lead, last] = qa<HTMLElement>('.app__answer', reply);
    const card = q<HTMLElement>('.app__placed', reply)!;
    const facts = qa<HTMLElement>('.app__facts li', card);
    follow(lead, at);
    follow(card, at + 0.3);
    tl.fromTo(lead, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, at)
      .fromTo(card, { autoAlpha: 0, y: 18, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, at + 0.3)
      .fromTo(q('.app__badge', card), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2.2)' }, at + 0.9)
      .fromTo(facts, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.25 }, at + 1.2);
    const lastAt = at + 1.2 + facts.length * 0.25 + 0.6;
    tl.fromTo(last, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, lastAt);
    follow(last, lastAt);
  });
}

/**
 * Figma 2420:2 and on: the window zooms in on its chat (its frame and sidebar falling away), the request is typed and
 * sent, the box drops to the foot of the chat as the request pops up as a bubble, Ditto works through its steps (a
 * spinner each, then a tick), and the people it found come in. A stop of the lens stage of its own (see StageScene).
 */
function chatScene(screen: HTMLElement): StageScene {
  const app = q<HTMLElement>('.app', screen)!;
  const stage = screen.closest<HTMLElement>('.think__stage')!;
  const chat = q<HTMLElement>('.app__chat', app)!;
  const ask = q<HTMLElement>('.app__ask', chat)!;
  const box = q<HTMLElement>('.app__box', chat)!;
  const text = q<HTMLElement>('.app__text', chat)!;
  const thread = q<HTMLElement>('.app__thread', chat)!;
  const scroller = q<HTMLElement>('.app__scroll', chat)!;
  const request = dayInTheLife.chat.request;

  /*
   * The camera. The chat is shown at `k` times its design size, set by the stage's width alone (up to 1.5x), so it
   * reads at any height. It is framed in the band between the toggle and the stage's foot: first centred there (the
   * greeting and the box), then, as the box drops on sending, lowered with it until the chat's foot meets the band's
   * (`low`) when the whole chat is taller than the band. The conversation then scrolls up as it grows, like a chat.
   */
  const fit = () => parseFloat(screen.dataset.fit || '1') || 1;
  const cam = () => {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const k = chatScale(W);
    const foot = H - BAND_FOOT;
    const mid = (BAND_TOP + foot) / 2;
    const low = Math.min(mid, foot - (k * chat.offsetHeight) / 2);
    return { k, z: k / fit(), f: fit(), H, mid, low };
  };
  const dx = () => chat.offsetLeft + chat.offsetWidth / 2 - app.offsetWidth / 2;
  const dy = () => chat.offsetTop + chat.offsetHeight / 2 - app.offsetHeight / 2;
  /** The window's own offset (before its fit) that puts the chat's middle at `y` on the stage. */
  const yFor = (y: number) => {
    const c = cam();
    return -dy() * c.z + (y - c.H / 2) / c.f;
  };
  /**
   * Once the conversation starts the box becomes Figma's composer (2425:61): one 48-tall row (+, the prompt, the mic)
   * with the model named under it (8 below, 16 tall). Keep in step with the thread's foot in product.css.
   */
  const COMPACT = 48;
  const UNDER = 24;
  /**
   * How far the box drops, so the model line under it ends 24 above the chat's foot. (Measured at its full height: as
   * it shrinks, the centred column it sits in moves down by half the difference.)
   */
  const drop = () => chat.clientHeight - 24 - UNDER - COMPACT - (ask.offsetTop + (box.offsetHeight - COMPACT) / 2);
  /** The conversation starts just below the band's top as the camera ends up. */
  const place = () => {
    const c = cam();
    const chatTop = c.low - (c.k * chat.offsetHeight) / 2;
    thread.style.top = `${Math.max(0, (BAND_TOP - chatTop) / c.k) + 4}px`;
  };
  place();

  const typing = { n: 0 };
  const TYPE_RATE = 32; // characters a second
  const tl = gsap.timeline({ paused: true });
  /** Scrolls the conversation so `el` (just shown) is in view above the box. */
  const follow = (el: HTMLElement, at: number) =>
    tl.to(scroller, { y: () => -Math.max(0, el.offsetTop + el.offsetHeight + 16 - thread.clientHeight), duration: 0.6, ease: 'power2.out' }, at);
  const zoomTw = gsap.fromTo(
    app,
    { x: 0, y: 0, scale: 1 },
    { x: () => -dx() * cam().z, y: () => yFor(cam().mid), scale: () => cam().z, duration: 1.5, ease: 'power3.inOut' },
  );

  // 1. The zoom, the window falling away around the chat.
  tl.add(zoomTw, 0)
    .to(qa('.app__bar, .app__side, .app__top', app), { autoAlpha: 0, duration: 0.8, ease: 'power1.out' }, 0.15)
    .to(app, { backgroundColor: 'rgba(253, 253, 253, 0)', borderColor: 'rgba(151, 151, 151, 0)', duration: 0.8, ease: 'power1.out' }, 0.15)
    .to(q('.app__main', app), { backgroundColor: 'rgba(30, 110, 243, 0)', duration: 0.8, ease: 'power1.out' }, 0.15)
    // Its frame gone, the window no longer clips (the box's soft shadow ran into its edge).
    .set(app, { overflow: 'visible' }, 0.95)
    .to(box, { borderColor: 'rgba(81, 142, 243, 1)', duration: 0.4, ease: 'power1.out' }, 1.2);

  // 2. Typing.
  const typeAt = 1.6;
  const typeTime = request.length / TYPE_RATE;
  tl.to(q('.app__prompt', box), { autoAlpha: 0, duration: 0.15 }, typeAt - 0.1)
    .fromTo(q('.app__caret', box), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, typeAt - 0.1)
    .fromTo(
      typing,
      { n: 0 },
      {
        n: request.length,
        duration: typeTime,
        ease: 'none',
        onUpdate: () => void (text.textContent = request.slice(0, Math.round(typing.n))),
      },
      typeAt,
    );

  // 3. Sent: the box empties and drops, the greeting and the buttons go, the request pops up as a bubble.
  const sent = typeAt + typeTime + 0.35;
  tl.to(q('.app__send', box), { scale: 0.78, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 }, sent)
    // The prompt's contents give way to the composer's single row as the box closes up around it.
    .to(qa('.app__field, .app__controls', box), { autoAlpha: 0, duration: 0.2 }, sent + 0.15)
    .fromTo(qa('.app__line, .app__under', box), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power1.out', stagger: 0.1 }, sent + 0.75)
    .to(q('.app__hello', chat), { autoAlpha: 0, y: -24, duration: 0.45, ease: 'power2.in' }, sent + 0.1)
    .to(q('.app__actions', chat), { autoAlpha: 0, y: 12, duration: 0.35, ease: 'power2.in' }, sent + 0.1)
    .to(ask, { y: drop, duration: 0.9, ease: 'expo.inOut' }, sent + 0.2)
    .to(box, { height: COMPACT, duration: 0.9, ease: 'expo.inOut' }, sent + 0.2)
    .to(app, { y: () => yFor(cam().low), duration: 0.9, ease: 'expo.inOut' }, sent + 0.2)
    .to(box, { borderColor: 'rgba(81, 142, 243, 0.35)', duration: 0.6 }, sent + 0.6)
    .fromTo(q('.app__me', chat), { autoAlpha: 0, scale: 0.5, y: 24 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' }, sent + 0.6);

  // 4. Ditto at work: a step at a time, each spinning until it's done.
  const workAt = sent + 1.3;
  const STEP = 0.95;
  tl.fromTo(q('.app__by', chat), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, workAt);
  qa<HTMLElement>('.app__step', chat).forEach((s, i) => {
    const at = workAt + 0.3 + i * STEP;
    follow(s, at);
    tl.fromTo(s, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, at)
      .to(q('.app__spin', s), { autoAlpha: 0, duration: 0.15 }, at + STEP - 0.1)
      .fromTo(q('.app__tick', s), { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }, at + STEP - 0.1)
      .to(q('.app__step-live', s), { autoAlpha: 0, duration: 0.25 }, at + STEP - 0.1)
      .fromTo(q('.app__step-done', s), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, at + STEP - 0.1);
  });
  const steps = qa('.app__step', chat).length;

  // 5. The answer, and the people it found.
  const doneAt = workAt + 0.3 + steps * STEP + 0.2;
  const [lead, followUp] = qa<HTMLElement>('.app__answer', chat);
  const people = qa<HTMLElement>('.app__person', chat);
  const followAt = doneAt + 0.35 + 0.16 * people.length + 0.4;
  follow(lead, doneAt);
  people.forEach((p, i) => follow(p, doneAt + 0.35 + 0.16 * i));
  follow(followUp, followAt);
  tl.fromTo(lead, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, doneAt)
    .fromTo(
      people,
      { autoAlpha: 0, y: 18, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out', stagger: 0.16 },
      doneAt + 0.35,
    )
    .fromTo(followUp, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, followAt);

  // A new stage size re-frames it, wherever the scene is: back to the start (its recorded values), then on again
  // with everything measured afresh.
  ScrollTrigger.addEventListener('refresh', () => {
    const t = tl.time();
    tl.progress(0, true).invalidate();
    place();
    tl.time(t, true);
  });

  return sceneControls(tl, scroller);
}

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
    const tab = initDayTabs(!reduce);
    const screen = q<HTMLElement>('.day__screen:not(.day__screen--chat)')!;
    const engage = q<HTMLElement>('[data-chat="Engage"]')!;
    const place = q<HTMLElement>('[data-chat="Place"]')!;
    initThinkZoom(!reduce, {
      screens: [
        { el: screen, scenes: [chatScene(screen)] },
        { el: engage, scenes: [engageScene(engage)], fill: true },
        { el: place, scenes: [placeScene(place)], fill: true },
      ],
      onStop: (el) => tab(el.dataset.stage ?? ''),
    });
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
