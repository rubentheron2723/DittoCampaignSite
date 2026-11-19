import '../styles/base.css';
import '../styles/think.css';
import '../styles/product.css';

import { dayInTheLife, featureActs, finalFeaturesCta, productHero, trust, type ActContent } from '../content/product';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { initThinkZoom, type StageScene } from '../animations/think-zoom';
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

const TICK = `<svg class="app__tick" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#1e6ef3"/><path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * The conversation the chat zooms in on (played by chatScene): the request as a bubble, Ditto's steps as it works,
 * then the people it found. All of it waits hidden until played.
 */
function thread() {
  const c = dayInTheLife.chat;
  const initials = (n: string) => n.split(' ').map((w) => w[0]).join('');
  return `<div class="app__thread"><div class="app__scroll">
    <div class="app__me"><p>${esc(c.request)}</p></div>
    <div class="app__reply">
      <p class="app__by"><i class="app__orb"></i>${esc(c.by)}</p>
      <ol class="app__steps">
        ${c.steps
          .map(
            (t) => `<li class="app__step">
              <span class="app__state"><i class="app__spin"></i>${TICK}</span>
              <span class="app__step-text"><span class="app__step-live">${esc(t)}</span><span class="app__step-done">${esc(t)}</span></span>
            </li>`,
          )
          .join('')}
      </ol>
      <p class="app__answer">${esc(c.answer)}</p>
      <ul class="app__people">
        ${c.people
          .map(
            (p) => `<li class="app__person">
              <span class="app__avatar" style="--hue: ${p.hue}">${esc(initials(p.name))}</span>
              <span class="app__who"><b>${esc(p.name)}</b><span>${esc(p.role)} · ${esc(p.company)}</span><em>${esc(p.link)}</em></span>
              <span class="app__match"><b>${p.match}%</b>match</span>
            </li>`,
          )
          .join('')}
      </ul>
      <p class="app__answer">${esc(c.followUp)}</p>
    </div>
  </div></div>`;
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
      <div class="day__tabs" role="list" aria-label="Stages of the day">
        <i class="day__pill" aria-hidden="true"></i>
        ${d.stages.map((s, i) => `<span role="listitem" class="day__tab${i === 0 ? ' is-on' : ''}" data-stage="${esc(s)}">${esc(s)}</span>`).join('')}
      </div>
      <ol class="think__list">
        ${d.moments
          .map(
            (m, i) =>
              `<li class="think__item" data-stage="${esc(m.stage)}"${m.after ? ' data-after' : ''}><${i ? 'h3' : 'h2'} class="think__title">${esc(m.time)}</${i ? 'h3' : 'h2'}><p class="think__body">${esc(m.stage)}</p></li>`,
          )
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
/** The Source / Engage / Place toggle: its glass pill slides to the stage of the statement on screen. */
function initDayTabs(animate: boolean) {
  const tabs = qa<HTMLElement>('.day__tab');
  const pill = q<HTMLElement>('.day__pill');
  if (!pill || !tabs.length) return () => {};
  let on = tabs.find((t) => t.classList.contains('is-on')) ?? tabs[0];
  const place = (t: HTMLElement, d: number) => gsap.to(pill, { x: t.offsetLeft, width: t.offsetWidth, duration: d, ease: 'expo.inOut', overwrite: true });
  place(on, 0);
  // Fonts settling can shift the tabs.
  document.fonts.ready.then(() => place(on, 0));
  return (stage: string) => {
    const t = tabs.find((x) => x.dataset.stage === stage);
    if (!t || t === on) return;
    on.classList.remove('is-on');
    t.classList.add('is-on');
    on = t;
    place(t, animate ? 0.8 : 0);
  };
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
  const BAND_TOP = 150;
  const BAND_FOOT = 24;
  const fit = () => parseFloat(screen.dataset.fit || '1') || 1;
  const cam = () => {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const k = Math.max(0.3, Math.min(1.5, (W - 64) / 560));
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

  return {
    play: () => {
      tl.timeScale(1).play(0);
      return tl.duration();
    },
    back: () => {
      tl.timeScale(3).reverse();
      return tl.time() / 3;
    },
    hurry: () => {
      if (!tl.isActive() || tl.reversed()) return 0;
      tl.timeScale(5);
      return (tl.duration() - tl.time()) / 5;
    },
    finish: () => void tl.pause().progress(1),
    reset: () => void tl.pause().progress(0),
  };
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
    const screen = q<HTMLElement>('.day__screen')!;
    initThinkZoom(!reduce, { screen, scenes: [chatScene(screen)], onStop: (el) => tab(el.dataset.stage ?? '') });
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
