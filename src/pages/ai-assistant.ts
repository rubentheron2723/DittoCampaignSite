import '../styles/base.css';
import '../styles/faq.css';
import '../styles/ai-assistant.css';

import {
  aiCta,
  aiHero,
  asks,
  assistantPoints,
  builtIn,
  chapters,
  control,
  demo,
  howItWorks,
  month,
  naledi,
  people,
  placement,
  questions,
  whatItIs,
  type Chapter,
  type Turn,
} from '../content/ai-assistant';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc, markSvg } from '../shared/mark';
import { gsap, q, qa } from '../animations/gsap';
import { fadeUp, splitReveal } from '../shared/motion';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import { FOOTER_BLOBS } from '../shared/footer-blobs';

/*
 * Ditto for Claude, ChatGPT and Copilot (brief v2.2, 3.4 and 4.5). The demo plays a recruiter's day as a chat on the
 * left while an abstract Ditto screen on the right changes in step. It plays by itself once half of it is in view,
 * pauses out of view, and never holds the page. Every line of it is in the page from the start; playing only reveals.
 */

const initials = (n: string) => n.split(' ').map((w) => w[0]).join('');
const avatar = (name: string, hue: number, cls = '') => `<span class="av${cls}" style="--hue:${hue}" aria-hidden="true">${esc(initials(name))}</span>`;
const TICK = `<svg class="tick" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#1e6ef3"/><path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const FILE = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 1.5h5L12.5 5v9a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z M9 1.5V5h3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
const COPY = `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
const ICONS = {
  play: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/><rect x="13.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/></svg>`,
  replay: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.05-4.95M5 4.5v3.5h3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  send: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
/** Small line icons for the point cards (no numbers on cards: brief 4.4, point 6). */
const POINT_ICONS = [
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 12.2l2.4 2.4 4.6-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 19.5c1.2-3.3 3.9-5 7-5s5.8 1.7 7 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
];

/* ---------- Hero and "What it is" ---------- */
function hero() {
  const h = aiHero;
  return `
  <section class="fhero aihero" data-theme="dark">
    <div class="fhero__bg" aria-hidden="true">
      <canvas class="fhero__sky"></canvas>
      <div class="fhero__glow"></div>
      <div class="fhero__haze"></div>
    </div>
    <div class="fhero__inner">
      <p class="aihero__eyebrow">${esc(h.eyebrow)}</p>
      <h1 class="fhero__title aihero__title">${h.title.map((l) => `<span class="fhero__line">${esc(l)}</span>`).join(' ')}</h1>
      <p class="aihero__sub">${esc(h.sub)}</p>
      <div class="aihero__actions">
        <a class="bp bp--on-blue" href="/contact" data-magnetic>${esc(h.primary)}</a>
        <a class="gbtn gbtn--lg aihero__secondary" href="#day">${esc(h.secondary)}</a>
      </div>
    </div>
  </section>`;
}

export function pointCards(cls = '') {
  return `<ul class="aipoints${cls ? ` ${cls}` : ''}">
    ${assistantPoints
      .map(
        (p, i) => `<li class="aipoint">
          <span class="aipoint__icon">${POINT_ICONS[i]}</span>
          <h3 class="aipoint__title">${esc(p.title)}</h3>
          <p class="aipoint__body">${esc(p.body)}</p>
        </li>`,
      )
      .join('')}
  </ul>`;
}

function whatSection() {
  return `
  <section class="aisec aiwhat" id="what" data-theme="light">
    <div class="aisec__wrap">
      <div class="aiwhat__head">
        <h2 class="aisec__title">${esc(whatItIs.title)}</h2>
        <p class="aisec__body">${esc(whatItIs.body)}</p>
      </div>
      ${pointCards()}
    </div>
  </section>`;
}

/* ---------- The demo: the chat ---------- */
function turnHtml(t: Turn) {
  switch (t.kind) {
    case 'me':
      return `<div class="c-me"><p>${esc(t.text)}</p>${t.file ? `<span class="c-file">${FILE}${esc(t.file)}</span>` : ''}</div>`;
    case 'steps':
      return `<div class="c-steps">
        <p class="c-steps__by">${markSvg('c-steps__mark')}Ditto</p>
        <ol>${t.steps
          .map(
            (s) =>
              `<li class="c-step"><span class="c-step__state"><i class="c-spin"></i>${TICK}</span><span class="c-step__text">${esc(s)}</span></li>`,
          )
          .join('')}</ol>
      </div>`;
    case 'reply':
      return `<p class="c-reply">${esc(t.text)}</p>`;
    case 'people':
      return `<ul class="c-people">${t.people
        .map(
          (p) => `<li class="c-person">${avatar(p.name, p.hue)}
            <span class="c-person__who"><b>${esc(p.name)}</b><span>${esc(p.role)}</span><em>${esc(p.note)}</em></span>
            <span class="c-person__match"><b>${p.match}%</b>match</span></li>`,
        )
        .join('')}</ul>`;
    case 'draft':
      return `<div class="c-card c-draft">
        <p class="c-draft__head">Client submission · Thabo Mokoena</p>
        <p class="c-draft__body">${esc(t.text)}</p>
        <span class="c-copy">${COPY}Copy</span>
      </div>`;
    case 'placement':
      return `<div class="c-card c-placed">
        <div class="c-placed__head">${avatar(placement.name, 18)}
          <span class="c-person__who"><b>${esc(placement.name)}</b><span>${esc(placement.role)} · ${esc(placement.client)}</span></span>
          <span class="c-badge">${TICK}${esc(placement.status)}</span></div>
        <dl class="c-facts">${placement.facts
          .filter((f) => f.label !== 'Package')
          .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
          .join('')}</dl>
      </div>`;
    case 'month':
      return `<div class="c-card c-month"><table>
        <thead><tr><th scope="col">Recruiter</th><th scope="col">Placements</th><th scope="col">Approved fees</th></tr></thead>
        <tbody>${month.rows.map((r) => `<tr><th scope="row">${esc(r.who)}</th><td>${r.placements}</td><td>${esc(r.fees)}</td></tr>`).join('')}</tbody>
      </table></div>`;
  }
}

function chatThread(ch: Chapter, i: number) {
  return `<div class="chat__thread" data-ch="${i}" ${i ? 'hidden' : ''}>
    <h3 class="sr-only">${esc(`${ch.time} ${ch.stage}`)}</h3>
    ${i === 0 ? `<div class="chat__hello"><p class="chat__greet">${esc(demo.greeting)}</p><ul class="chat__chips">${demo.chips.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>` : `<p class="chat__time" aria-hidden="true">${esc(ch.time)}</p>`}
    ${ch.turns.map((t, j) => `<div class="c-turn c-turn--${t.kind}" data-turn="${j}">${turnHtml(t)}</div>`).join('')}
  </div>`;
}

function chatWindow() {
  return `<div class="chat" aria-label="Chat">
    <div class="chat__bar">
      <span class="chat__dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="chat__badge"><i class="chat__live" aria-hidden="true"></i>${esc(demo.badge)}</span>
    </div>
    <div class="chat__body">${chapters.map(chatThread).join('')}</div>
    <div class="chat__composer" aria-hidden="true">
      <span class="chat__field"><span class="chat__placeholder">${esc(demo.placeholder)}</span><span class="chat__typed"></span><i class="chat__caret"></i></span>
      <span class="chat__send">${ICONS.send}</span>
    </div>
    <div class="chat__end" hidden>
      <button type="button" class="gbtn gbtn--md chat__replay">${ICONS.replay}${esc(demo.replay)}</button>
      <a class="bp bp--sm" href="/contact">${esc(demo.book)}</a>
    </div>
  </div>`;
}

/* ---------- The demo: the "In Ditto" screens (abstract, brief 4.3 point 2) ---------- */
const NAV = ['Candidates', 'Jobs', 'Clients', 'Placements', 'Reports'];
const bar = (w: number) => `<i class="sk" style="width:${w}%"></i>`;
const skelRow = (w1: number, w2: number) => `<li class="d-row d-row--skel"><span class="av av--skel"></span><span class="d-row__who">${bar(w1)}${bar(w2)}</span></li>`;
const skelCard = (w: number) => `<li class="d-card d-card--skel">${bar(w)}${bar(w - 22)}</li>`;
const cand = (p: { name: string; hue: number }, sub: string, extra = '', cls = '') =>
  `<li class="d-row${cls}">${avatar(p.name, p.hue)}<span class="d-row__who"><b>${esc(p.name)}</b><span>${esc(sub)}</span></span>${extra}</li>`;

function sourceScreen() {
  return `<div class="d-screen" data-ch="0">
    <div class="d-view d-view--search">
      <div class="d-head"><p class="d-title">Candidates</p><p class="d-meta d-count"><span class="d-count__all">48,200 candidates</span><span class="d-count__hit">14 match this brief</span></p></div>
      <div class="d-search"><span class="d-search__empty">Search your database</span><span class="d-search__query"><b>Financial Manager</b><b>Cape Town</b><b>CA(SA)</b><b>5+ years retail</b></span></div>
      <ul class="d-list d-list--idle">${skelRow(46, 64)}${skelRow(38, 58)}${skelRow(50, 70)}${skelRow(42, 52)}</ul>
      <ul class="d-list d-list--hits">${people
        .map((p) => cand(p, p.role, `<span class="d-match"><i style="--w:${p.match}%"></i><b>${p.match}%</b></span>`))
        .join('')}${skelRow(40, 60)}</ul>
    </div>
    <div class="d-view d-view--job">
      <div class="d-head"><p class="d-title">Financial Manager</p><p class="d-meta">Harbour Retail · Cape Town · <span class="d-pill">Open</span></p></div>
      <ol class="d-stages"><li class="is-on">Shortlist <b class="d-n"><span class="d-n3">3</span><span class="d-n4">4</span></b></li><li>Submitted <b>0</b></li><li>Interview <b>0</b></li><li>Offer <b>0</b></li><li>Placed <b>0</b></li></ol>
      <ul class="d-list">${people.map((p) => cand(p, p.role, `<span class="d-match d-match--sm"><b>${p.match}%</b></span>`)).join('')}${cand(
        naledi,
        naledi.role,
        '<span class="d-tag">New</span>',
        ' d-row--naledi',
      )}</ul>
    </div>
  </div>`;
}

function engageScreen() {
  const thabo = `<li class="d-card d-card--thabo">${avatar('Thabo Mokoena', 28)}<span><b>Thabo Mokoena</b><span>Operations</span></span></li>`;
  return `<div class="d-screen" data-ch="1" hidden>
    <div class="d-view d-view--board">
      <div class="d-head"><p class="d-title">Pipeline</p><p class="d-meta">Kestrel Logistics</p></div>
      <div class="d-board">
        <div class="d-col"><p>Applied</p><ul>${skelCard(70)}${skelCard(62)}</ul></div>
        <div class="d-col d-col--from"><p>First interview</p><ul>${thabo}${skelCard(66)}</ul></div>
        <div class="d-col d-col--to"><p>Second interview</p><ul>${thabo}</ul></div>
        <div class="d-col"><p>Offer</p><ul>${skelCard(58)}</ul></div>
      </div>
      <ul class="d-activity">
        <li class="d-act d-act--call"><span class="d-act__dot"></span><span><b>Call logged</b> · Thabo Mokoena · 11:30</span></li>
        <li class="d-act d-act--task"><span class="d-act__dot"></span><span><b>Task · Friday</b> · Chase Kestrel Logistics for feedback</span></li>
      </ul>
    </div>
  </div>`;
}

function placeScreen() {
  const p = placement;
  const max = Math.max(...month.rows.map((r) => r.share));
  return `<div class="d-screen" data-ch="2" hidden>
    <div class="d-view d-view--placements">
      <div class="d-head"><p class="d-title">Placements</p><p class="d-meta">This month</p></div>
      <ul class="d-list">${skelRow(44, 62)}${skelRow(36, 56)}${skelRow(48, 66)}</ul>
    </div>
    <div class="d-view d-view--placed">
      <div class="d-head"><p class="d-title">${esc(p.name)}</p><p class="d-meta">${esc(p.role)} · ${esc(p.client)} · <span class="d-pill">${esc(p.status)}</span></p></div>
      <dl class="d-facts">${p.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}
        <div><dt>Commission</dt><dd><span class="d-pill d-pill--wait">${esc(p.commission.replace('Commission ', ''))}</span></dd></div></dl>
    </div>
    <div class="d-view d-view--report">
      <div class="d-head"><p class="d-title">Placements report</p><p class="d-meta">This month · team</p></div>
      <div class="d-kpis"><div><p>Approved placements</p><b>9</b></div><div><p>Approved fees</p><b>${esc(month.fees)}</b></div></div>
      <ul class="d-bars">${month.rows
        .map(
          (r) =>
            `<li><span class="d-bars__who">${esc(r.who)}</span><span class="d-bars__track"><i style="--w:${(r.share / max) * 100}%"></i></span><span class="d-bars__val">${r.placements} · ${esc(r.fees)}</span></li>`,
        )
        .join('')}</ul>
      <p class="d-pending"><span class="d-pill d-pill--wait">Awaiting approval</span>${esc(month.pending.replace(' awaiting approval', ''))}</p>
    </div>
  </div>`;
}

function dittoPanel() {
  return `<div class="dpanel">
    <p class="dpanel__label"><i aria-hidden="true"></i>${esc(demo.panel)}</p>
    <div class="dapp" data-nav="Candidates" aria-hidden="true">
      <div class="dapp__side">
        <span class="dapp__logo">${markSvg('dapp__mark')}</span>
        <ul>${NAV.map((n) => `<li data-nav="${n}"><i></i><span>${n}</span></li>`).join('')}</ul>
      </div>
      <div class="dapp__main">${sourceScreen()}${engageScreen()}${placeScreen()}</div>
    </div>
  </div>`;
}

function demoSection() {
  return `
  <section class="aisec aidemo" id="day" data-theme="light">
    <canvas class="aidemo__fx" aria-hidden="true"></canvas>
    <div class="aisec__wrap">
      <div class="aidemo__head">
        <h2 class="aisec__title">${esc(demo.title)}</h2>
        <p class="aisec__body">${esc(demo.sub)}</p>
      </div>
      <div class="aidemo__bar">
        <div class="aidemo__tabs" role="tablist" aria-label="Chapters">
          ${chapters
            .map(
              (c, i) =>
                `<button type="button" role="tab" class="aidemo__tab${i ? '' : ' is-on'}" id="ch-tab-${c.id}" aria-selected="${i ? 'false' : 'true'}" aria-controls="ch-stage" data-ch="${i}"><span class="aidemo__time">${esc(c.time)}</span> ${esc(c.stage)}<i class="aidemo__progress" aria-hidden="true"></i></button>`,
            )
            .join('')}
        </div>
        <div class="aidemo__controls">
          <button type="button" class="aidemo__ctl aidemo__play" aria-label="Pause the demo">${ICONS.pause}</button>
          <button type="button" class="aidemo__ctl aidemo__restart" aria-label="Replay the demo from the start">${ICONS.replay}</button>
        </div>
      </div>
      <p class="aidemo__caption" aria-live="polite">${esc(chapters[0].caption)}</p>
      <div class="aidemo__stage" id="ch-stage" role="tabpanel" aria-labelledby="ch-tab-source">
        ${chatWindow()}
        ${dittoPanel()}
      </div>
      <p class="aidemo__note">${esc(demo.caption)}</p>
    </div>
  </section>`;
}

/* ---------- Below the demo ---------- */
function asksSection() {
  return `
  <section class="aisec aiasks" id="ask" data-theme="light">
    <div class="aisec__wrap">
      <div class="aisec__head">
        <h2 class="aisec__title">${esc(asks.title)}</h2>
        <p class="aisec__body">${esc(asks.intro)}</p>
      </div>
      <div class="aiasks__grid">
        ${asks.columns
          .map(
            (c) => `<div class="aiasks__col">
              <h3 class="aiasks__stage">${esc(c.stage)}</h3>
              <ul>${c.items.map((it) => `<li class="aiasks__q">“${esc(it)}”</li>`).join('')}</ul>
            </div>`,
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

function howSection() {
  return `
  <section class="aisec aihow" id="how" data-theme="light">
    <div class="aisec__wrap">
      <h2 class="aisec__title">${esc(howItWorks.title)}</h2>
      <ol class="aihow__steps">
        ${howItWorks.steps
          .map(
            (s, i) => `<li class="aihow__step"><span class="aihow__num">${String(i + 1).padStart(2, '0')}</span><h3 class="aihow__title">${esc(s.title)}</h3><p class="aihow__body">${esc(s.body)}</p></li>`,
          )
          .join('')}
      </ol>
    </div>
  </section>`;
}

function controlSection() {
  return `
  <section class="aisec aicontrol" id="control" data-theme="dark">
    <div class="aisec__wrap">
      <h2 class="aisec__title">${esc(control.title)}</h2>
      <ul class="aicontrol__grid">
        ${control.points.map((p) => `<li class="aicontrol__point"><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`).join('')}
      </ul>
      <p class="aicontrol__line">${esc(control.line)}</p>
    </div>
  </section>`;
}

function builtInSection() {
  return `
  <section class="aisec aibuilt" data-theme="light">
    <div class="aisec__wrap aibuilt__wrap">
      <h2 class="aisec__title aibuilt__title">${esc(builtIn.title)}</h2>
      <div>
        <p class="aisec__body">${esc(builtIn.body)}</p>
        <a class="textlink" href="${builtIn.link.href}">${esc(builtIn.link.label)}</a>
      </div>
    </div>
  </section>`;
}

const CHEV = `<svg class="aiq__chev" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function questionsSection() {
  return `
  <section class="aisec aiq" id="questions" data-theme="light">
    <div class="aisec__wrap aiq__wrap">
      <h2 class="aisec__title">${esc(questions.title)}</h2>
      <div class="aiq__list">
        ${questions.items.map((it) => `<details class="aiq__item"><summary><h3>${esc(it.q)}</h3>${CHEV}</summary><p>${esc(it.a)}</p></details>`).join('')}
        <a class="textlink" href="${questions.more.href}">${esc(questions.more.label)}</a>
      </div>
    </div>
  </section>`;
}

function render() {
  document.getElementById('main')!.innerHTML = `
  ${hero()}
  ${whatSection()}
  ${demoSection()}
  ${asksSection()}
  ${howSection()}
  ${controlSection()}
  ${builtInSection()}
  ${questionsSection()}
  ${ctaAndFooter(aiCta)}`;
}

/* ---------- The demo player ---------- */

/** Timing (ms), per brief 4.5: a recruiter's message is typed and sent in under a second; each Ditto step ~400ms. */
const T = { type: 650, afterMe: 450, step: 420, afterSteps: 250, cardGap: 160, hold: 2600, fade: 350 };
const readFor = (text: string) => Math.min(1900, 550 + text.length * 11);

type Cue = { el: HTMLElement; at: number };
type Plan = {
  dur: number;
  shows: Cue[];
  steps: { el: HTMLElement; at: number; done: number }[];
  typing: { text: string; from: number; to: number }[];
  screens: { state: string; at: number }[];
  hello?: HTMLElement;
};

function plan(ch: Chapter, thread: HTMLElement): Plan {
  const p: Plan = { dur: 0, shows: [], steps: [], typing: [], screens: [{ state: 'start', at: 0 }] };
  let t = 500;
  p.hello = q<HTMLElement>('.chat__hello', thread) ?? undefined;
  ch.turns.forEach((turn, j) => {
    const el = q<HTMLElement>(`[data-turn="${j}"]`, thread)!;
    let screenAt = t;
    switch (turn.kind) {
      case 'me':
        p.typing.push({ text: turn.text, from: t, to: t + T.type });
        t += T.type;
        p.shows.push({ el, at: t });
        t += T.afterMe;
        break;
      case 'steps':
        p.shows.push({ el, at: t });
        qa<HTMLElement>('.c-step', el).forEach((s, k) => p.steps.push({ el: s, at: t + k * T.step, done: t + (k + 1) * T.step }));
        t += turn.steps.length * T.step;
        screenAt = t;
        t += T.afterSteps;
        break;
      case 'reply':
        p.shows.push({ el, at: t });
        t += readFor(turn.text);
        break;
      case 'people':
        p.shows.push({ el, at: t });
        t += turn.people.length * T.cardGap + 1500;
        break;
      case 'draft':
        p.shows.push({ el, at: t });
        t += 2600;
        break;
      case 'placement':
      case 'month':
        p.shows.push({ el, at: t });
        t += 2200;
        break;
    }
    if (turn.screen) p.screens.push({ state: turn.screen, at: screenAt });
  });
  p.dur = t + T.hold;
  return p;
}

const NAV_FOR: Record<string, string> = {
  start: '',
  search: 'Candidates',
  job: 'Jobs',
  job4: 'Jobs',
  moved: 'Jobs',
  placed: 'Placements',
  month: 'Reports',
};
const START_NAV = ['Candidates', 'Jobs', 'Placements'];

function initDemo(reduce: boolean) {
  const section = q<HTMLElement>('#day')!;
  const tabs = qa<HTMLButtonElement>('.aidemo__tab', section);
  const caption = q<HTMLElement>('.aidemo__caption', section)!;
  const threads = qa<HTMLElement>('.chat__thread', section);
  const body = q<HTMLElement>('.chat__body', section)!;
  const screens = qa<HTMLElement>('.d-screen', section);
  const app = q<HTMLElement>('.dapp', section)!;
  const typed = q<HTMLElement>('.chat__typed', section)!;
  const field = q<HTMLElement>('.chat__field', section)!;
  const composer = q<HTMLElement>('.chat__composer', section)!;
  const end = q<HTMLElement>('.chat__end', section)!;
  const playBtn = q<HTMLButtonElement>('.aidemo__play', section)!;
  const stage = q<HTMLElement>('.aidemo__stage', section)!;
  const plans = chapters.map((c, i) => plan(c, threads[i]));

  let ch = 0;
  let t = 0;
  let playing = false;
  /** The visitor paused it: scrolling back into view doesn't start it again. */
  let held = false;
  let inView = false;
  let ended = false;
  let raf = 0;
  let last = 0;
  let lastShown = -1;

  const setChapter = (i: number) => {
    ch = i;
    tabs.forEach((b, k) => {
      b.classList.toggle('is-on', k === i);
      b.setAttribute('aria-selected', String(k === i));
      b.classList.toggle('is-past', k < i);
    });
    stage.setAttribute('aria-labelledby', tabs[i].id);
    caption.textContent = chapters[i].caption;
    threads.forEach((el, k) => (el.hidden = k !== i));
    screens.forEach((el, k) => (el.hidden = k !== i));
    lastShown = -1;
  };

  /** Draws chapter `ch` as it stands `t` ms in. Everything follows from (ch, t), so pausing and jumping are free. */
  const draw = () => {
    const p = plans[ch];
    p.hello?.classList.toggle('is-gone', p.typing.length > 0 && t >= p.typing[0].from);
    let shown = -1;
    p.shows.forEach((c, k) => {
      const on = t >= c.at;
      c.el.classList.toggle('is-in', on);
      if (on) shown = k;
    });
    p.steps.forEach((s) => {
      s.el.classList.toggle('is-live', t >= s.at);
      s.el.classList.toggle('is-done', t >= s.done);
    });
    const typing = p.typing.find((x) => t >= x.from && t < x.to);
    composer.classList.toggle('is-typing', !!typing);
    // Typed so far; once it's longer than the field, just its end (as a field scrolls along while you type).
    const sofar = typing ? typing.text.slice(0, Math.ceil(((t - typing.from) / (typing.to - typing.from)) * typing.text.length)) : '';
    const fits = Math.max(12, Math.floor(field.clientWidth / 7.6));
    typed.textContent = sofar.length > fits ? `\u2026${sofar.slice(-(fits - 1))}` : sofar;
    const state = [...p.screens].reverse().find((s) => t >= s.at)!.state;
    screens[ch].dataset.state = state;
    app.dataset.nav = NAV_FOR[state] || START_NAV[ch];
    // Each chapter ends on the Ditto screen.
    stage.classList.toggle('is-settled', t >= p.dur - T.hold + 400);
    tabs.forEach((b, k) => b.style.setProperty('--p', String(k < ch ? 1 : k > ch ? 0 : Math.min(1, t / p.dur))));
    if (shown !== lastShown) {
      lastShown = shown;
      // The newest line in view at the foot of the chat, as a chat scrolls.
      const target = Math.max(0, threads[ch].scrollHeight - body.clientHeight);
      body.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  const setPlaying = (on: boolean) => {
    playing = on;
    playBtn.innerHTML = on ? ICONS.pause : ICONS.play;
    playBtn.setAttribute('aria-label', on ? 'Pause the demo' : 'Play the demo');
    section.classList.toggle('is-playing', on);
    cancelAnimationFrame(raf);
    if (on) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const showEnd = (on: boolean) => {
    ended = on;
    end.hidden = !on;
    composer.hidden = on;
  };

  const fadeTo = (i: number, then?: () => void) => {
    stage.classList.add('is-fading');
    window.setTimeout(() => {
      setChapter(i);
      t = 0;
      draw();
      stage.classList.remove('is-fading');
      then?.();
    }, T.fade);
  };

  function tick(now: number) {
    const dt = Math.min(100, now - last);
    last = now;
    t += dt;
    const p = plans[ch];
    if (t >= p.dur) {
      t = p.dur;
      draw();
      if (ch < chapters.length - 1) {
        setPlaying(false);
        fadeTo(ch + 1, () => inView && !held && setPlaying(true));
      } else {
        setPlaying(false);
        showEnd(true);
        playBtn.innerHTML = ICONS.play;
      }
      return;
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  const restart = () => {
    showEnd(false);
    held = false;
    fadeTo(0, () => setPlaying(true));
  };

  if (reduce) {
    // No autoplay: each chapter as a still transcript, its Ditto screen in its final state; the tabs switch chapters.
    section.classList.add('is-static');
    q('.aidemo__controls', section)!.remove();
    const still = (i: number) => {
      setChapter(i);
      t = plans[i].dur;
      draw();
    };
    tabs.forEach((b, i) => b.addEventListener('click', () => still(i)));
    still(0);
    return;
  }

  setChapter(0);
  draw();

  tabs.forEach((b, i) =>
    b.addEventListener('click', () => {
      showEnd(false);
      setPlaying(false);
      fadeTo(i, () => !held && setPlaying(true));
    }),
  );
  // Arrow keys move between the tabs (the tablist pattern).
  q('.aidemo__tabs', section)!.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    if (k !== 'ArrowRight' && k !== 'ArrowLeft') return;
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const next = tabs[(i + (k === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    next.click();
  });
  playBtn.addEventListener('click', () => {
    if (ended) return restart();
    held = playing;
    setPlaying(!playing);
  });
  q('.aidemo__restart', section)!.addEventListener('click', restart);
  q('.chat__replay', section)!.addEventListener('click', restart);

  // Plays once half of it is in view; pauses when it leaves.
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !held && !ended && !playing) setPlaying(true);
      else if (!inView && playing) setPlaying(false);
    },
    { threshold: 0.5 },
  ).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) setPlaying(false);
    else if (!document.hidden && inView && !held && !ended && !playing) setPlaying(true);
  });
}

/* ---------- Boot ---------- */
boot({
  page: 'ai',
  render,
  init: ({ reduce, revealed }) => {
    initClouds(q('.fhero')!, q<HTMLCanvasElement>('.fhero__sky')!, 'fhero--sky', reduce, SKY_HERO, {
      bubbles: { params: HERO_BUBBLES, intensity: 0.6 },
    });
    initBlobBackdrop(q('.aidemo')!, q<HTMLCanvasElement>('.aidemo__fx')!, 'aidemo--fx', FOOTER_BLOBS, [253, 253, 253], reduce, 0.5, 30);
    initDemo(reduce);
    if (reduce) return;

    const { tween } = splitReveal('.aihero__title', { by: 'words', scrollTrigger: false, stagger: 0.05 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.aihero__eyebrow, .aihero__sub, .aihero__actions', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.3);
    revealed.then(() => {
      heroTl.play();
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3000);
    });
    // Headings and copy rise in once; the demo itself is there from the start (it has its own crossfade).
    qa<HTMLElement>('.aisec__wrap').forEach((w) => fadeUp([...w.children].filter((c) => !c.matches('.aidemo__stage, .aidemo__bar, .aidemo__caption')), w, { start: 'top 82%', stagger: 0.08 }));
  },
});
