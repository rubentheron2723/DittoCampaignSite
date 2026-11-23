import '../styles/base.css';
import '../styles/pricing.css';

import { ANNUAL_MULTIPLIER, calculator, guarantees, hero, nextSteps, tierForUsers, tiers, type Currency } from '../content/pricing';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import { boot } from '../shared/boot';
import { FOOTER_BLOBS } from '../shared/footer-blobs';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { Draggable } from 'gsap/Draggable';
import { fadeUp, rollNumber, splitReveal } from '../shared/motion';
import { initPricingCards } from '../animations/pricing-cards';

gsap.registerPlugin(Draggable);

/* ---------- Render ---------- */
/**
 * Pricing (Figma 2378:655 hero, 2378:786 calculator; the third section is designed to match them).
 *   1. Hero: the home hero's cloud sky and bubbles (the frame uses the same shader settings), centred white copy and a
 *      glass "Get started" pill.
 *   2. Calculator on #fdfdfd (one screen at 1440), under the footer's Moving blobs: the headline and toggles; the plan
 *      cards over the slider on the left and the price check on the right; a blue "Book a demo" centred below.
 *   3. "From first call to first placement" (Figma 2378:1018): five numbered steps in a centred column, with the four
 *      guarantees as tilted cards around them. Sections 2 and 3 share one #fdfdfd field and one pinned blob layer.
 */
function render() {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="phero" data-theme="dark">
    <div class="phero__bg" aria-hidden="true">
      <canvas class="phero__sky"></canvas>
      <div class="phero__glow"></div>
      <div class="phero__haze"></div>
    </div>
    <div class="phero__inner">
      <h1 class="phero__title"><span>${esc(hero.titleOne)}</span><span>${esc(hero.titleTwo)}</span></h1>
      <div class="phero__lower">
        <p class="phero__sub">${esc(hero.subtitle)}</p>
        <p class="phero__body">${esc(hero.body)}</p>
      </div>
      <a class="gbtn gbtn--lg" href="#calculator" data-magnetic>${esc(hero.cta)}</a>
    </div>
  </section>

  <div class="pfield">
  <!-- One Moving blobs layer behind the calculator and the steps, pinned to the screen while they scroll past, so the
       blobs carry on across the join between the two sections. -->
  <canvas class="pfield__fx" aria-hidden="true"></canvas>
  <section class="calc" id="calculator" data-theme="light">
    <header class="calc__head">
      <h2 class="ptitle calc__title"><span>${esc(calculator.titleOne)}</span><span>${esc(calculator.titleTwo)}</span></h2>
      <p class="psub">${esc(calculator.description)}</p>
    </header>

    <div class="calc__area">
      <div class="calc__controls">
        <div class="gseg" id="billing" role="radiogroup" aria-label="Billing cycle">
          <span class="gseg__pill" aria-hidden="true"></span>
          <button type="button" role="radio" aria-checked="true" tabindex="0" data-value="monthly">Monthly</button>
          <button type="button" role="radio" aria-checked="false" tabindex="-1" data-value="annual">Annual, <em>save 15%</em></button>
        </div>
        <div class="gseg" id="currency" role="radiogroup" aria-label="Currency">
          <span class="gseg__pill" aria-hidden="true"></span>
          <button type="button" role="radio" aria-checked="true" tabindex="0" data-value="ZAR">ZAR</button>
          <button type="button" role="radio" aria-checked="false" tabindex="-1" data-value="USD">USD</button>
        </div>
      </div>

      <div class="calc__body">
        <div class="calc__pick">
          <div class="lcards" id="tiers-row">
            ${tiers
              .map(
                (t) => `<button type="button" class="lcard" data-min="${t.min}" data-label="${t.label}">
                  <b>${esc(t.label)}</b><span>${esc(t.rangeLabel)}</span>
                </button>`,
              )
              .join('')}
          </div>
          <div class="slider" id="slider">
            <div class="slider__track"><div class="slider__fill"></div>
              ${tiers.map((t) => `<span class="slider__tick" style="left:${((t.min - 1) / 99) * 100}%"><b>${t.min}</b></span>`).join('')}
              <span class="slider__tick slider__tick--end" style="left:100%"><b>100</b></span>
            </div>
            <button type="button" class="slider__knob" id="knob" aria-label="Recruiter count" aria-valuemin="1" aria-valuemax="100" aria-valuenow="7" role="slider">
              <span class="slider__value" id="slider-value">7</span>
            </button>
          </div>
        </div>

        <div class="quote" id="quote">
          <p class="quote__tier"><span id="q-tier">${esc(tiers[0].label)}</span> <em id="q-range">${esc(tiers[0].rangeLabel)}</em></p>
          <div class="quote__rate"><strong id="q-rate">R949</strong><span id="q-per">${esc(`${calculator.perLicense}, ${calculator.tax.ZAR}`)}</span></div>
          <div class="quote__totals">
            <div class="quote__total"><strong id="q-total">R6,643</strong><span id="q-period">${esc(`${calculator.monthlyTotal}, ${calculator.tax.ZAR}`)}</span></div>
            <div class="quote__total"><strong id="q-users">7</strong><span>Recruiters</span></div>
          </div>
          <p class="quote__enterprise" id="q-enterprise">${esc(calculator.enterprise)}</p>
        </div>
      </div>
    </div>

    <a class="bbtn calc__cta" href="/contact" data-magnetic>Book a demo</a>
  </section>

  <section class="pnext" data-theme="light">
    <canvas class="pnext__canvas" aria-hidden="true"></canvas>
    <h2 class="ptitle pnext__title"><span>From first call</span> <span>to first placement</span></h2>
    <ol class="pnext__steps">
      ${nextSteps.steps
        .map(
          (s, i) => `<li class="pstep">
            <span class="pstep__num">${String(i + 1).padStart(2, '0')}</span>
            <div class="pstep__body"><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>
          </li>`,
        )
        .join('')}
    </ol>
    <ul class="pnext__promises">
      ${guarantees.map((g) => `<li class="promise promise--${g.id}"><div class="promise__face"><h3>${esc(g.title)}</h3><p>${esc(g.copy).replace('\n', '<br>')}</p></div></li>`).join('')}
    </ul>
  </section>
  </div>

  ${ctaAndFooter()}`;
}

/* ---------- Calculator ---------- */
function initCalculator(animate: boolean) {
  let users = 7;
  let period: 'monthly' | 'annual' = 'monthly';
  let currency: Currency = 'ZAR';

  const knob = q<HTMLButtonElement>('#knob')!;
  const track = q('.slider__track')!;
  const fill = q('.slider__fill')!;
  const sliderValue = q('#slider-value')!;
  const quote = q('#quote')!;
  const cards = qa<HTMLButtonElement>('.lcard');
  const el = {
    tier: q('#q-tier')!, range: q('#q-range')!, rate: q('#q-rate')!, period: q('#q-period')!, per: q('#q-per')!,
    total: q('#q-total')!, users: q('#q-users')!,
  };

  const sym = () => (currency === 'ZAR' ? 'R' : '$');
  const money = (n: number, decimals = false) =>
    `${sym()}${n.toLocaleString('en-US', { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 })}`;
  const dur = animate ? 0.7 : 0;

  let rateRoll: gsap.core.Tween | undefined;
  let totalRoll: gsap.core.Tween | undefined;
  /** `instant`: set the figures at once (while dragging) instead of rolling them. */
  function update(instant = false) {
    const tier = tierForUsers(users);
    const monthlyRate = tier.rates ? tier.rates[currency] : 0;
    const rate = period === 'annual' ? monthlyRate * ANNUAL_MULTIPLIER : monthlyRate;
    const total = rate * users * (period === 'annual' ? 12 : 1);

    sliderValue.textContent = String(users);
    knob.setAttribute('aria-valuenow', String(users));
    knob.setAttribute('aria-valuetext', `${users} ${users === 1 ? 'recruiter' : 'recruiters'}`);
    el.users.textContent = String(users);
    el.tier.textContent = tier.label;
    el.range.textContent = tier.rangeLabel;
    const tax = calculator.tax[currency];
    el.period.textContent = `${period === 'annual' ? calculator.annualTotal : calculator.monthlyTotal}, ${tax}`;
    el.per.textContent = `${calculator.perLicense}, ${tax}`;
    quote.classList.toggle('quote--enterprise', !tier.rates);
    cards.forEach((c) => c.classList.toggle('is-active', c.dataset.label === tier.label));

    // A roll still running (a fast drag into Enterprise) would write its number over "Custom", and two rolls on one
    // figure fight: each new one replaces the last.
    rateRoll?.kill();
    totalRoll?.kill();
    if (tier.rates) {
      rateRoll = rollNumber(el.rate, rate, (n) => money(n, !Number.isInteger(rate)), instant ? 0 : dur);
      totalRoll = rollNumber(el.total, Math.round(total), (n) => money(Math.round(n)), instant ? 0 : dur);
    } else {
      el.rate.textContent = 'Custom';
      el.total.textContent = 'Let’s talk';
      // Rolling back to a price starts from nothing rather than a stale figure.
      delete el.rate.dataset.value;
      delete el.total.dataset.value;
    }
  }

  // Slider geometry
  const pct = () => (users - 1) / 99;
  const place = () => {
    const w = track.clientWidth;
    gsap.set(knob, { x: pct() * w });
    gsap.set(fill, { width: `${pct() * 100}%` });
  };
  const setUsers = (n: number, tween = true) => {
    users = Math.max(1, Math.min(100, Math.round(n)));
    const w = track.clientWidth;
    if (tween && animate) {
      gsap.to(knob, { x: pct() * w, duration: 0.6, ease: 'expo.out' });
      gsap.to(fill, { width: `${pct() * 100}%`, duration: 0.6, ease: 'expo.out' });
    } else place();
    update();
  };

  // Bounds by the knob's centre, not its box: the box sits half outside the track at either end (its negative
  // margin), so bounding the box by the track would stop the centre short of 1 and 100.
  const bounds = () => ({ minX: 0, maxX: track.clientWidth });
  const [drag] = Draggable.create(knob, {
    type: 'x',
    bounds: bounds(),
    inertia: false,
    // The knob takes the whole touch: a slightly diagonal drag moves it rather than scrolling the page.
    allowNativeTouchScrolling: false,
    onDrag() {
      gsap.set(fill, { width: `${(this.x / track.clientWidth) * 100}%` });
      const next = Math.max(1, Math.min(100, Math.round((this.x / track.clientWidth) * 99 + 1)));
      // Only when the count changes, and set straight away: a roll restarted on every pointer move never caught up.
      if (next === users) return;
      users = next;
      update(true);
    },
    onPress() { this.applyBounds(bounds()); gsap.to(knob, { scale: 1.12, duration: 0.2 }); },
    onRelease() { gsap.to(knob, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }); setUsers(users); },
  });
  // The whole slider (track, ticks and the space around them) takes a tap, not just the 6px track.
  q('#slider')!.addEventListener('click', (e) => {
    if (knob.contains(e.target as Node)) return;
    const r = track.getBoundingClientRect();
    setUsers(((e.clientX - r.left) / r.width) * 99 + 1);
  });
  knob.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setUsers(users + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setUsers(users - 1); }
    if (e.key === 'PageUp') { e.preventDefault(); setUsers(users + 10); }
    if (e.key === 'PageDown') { e.preventDefault(); setUsers(users - 10); }
    if (e.key === 'Home') { e.preventDefault(); setUsers(1); }
    if (e.key === 'End') { e.preventDefault(); setUsers(100); }
  });
  cards.forEach((c) => c.addEventListener('click', () => setUsers(Number(c.dataset.min))));
  window.addEventListener('resize', () => { drag.applyBounds(bounds()); place(); });

  // Glass toggles: the raised glass pill slides to the chosen option.
  function seg(id: string, onChange: (v: string) => void) {
    const root = q(`#${id}`)!;
    const pill = q('.gseg__pill', root)!;
    const buttons = qa<HTMLButtonElement>('button', root);
    const move = (b: HTMLButtonElement, instant = false) =>
      gsap.to(pill, { x: b.offsetLeft, y: b.offsetTop, width: b.offsetWidth, height: b.offsetHeight, duration: instant ? 0 : 0.5, ease: 'power3.inOut' });
    const current = () => buttons.find((b) => b.getAttribute('aria-checked') === 'true')!;
    move(buttons[0], true);
    const choose = (b: HTMLButtonElement) => {
      if (b === current()) return;
      buttons.forEach((x) => {
        x.setAttribute('aria-checked', String(x === b));
        x.tabIndex = x === b ? 0 : -1;
      });
      move(b);
      onChange(b.dataset.value!);
    };
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => choose(b));
      // A radio group: the arrow keys move the choice (and focus) along it.
      b.addEventListener('keydown', (e) => {
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = buttons[(i + step + buttons.length) % buttons.length];
        next.focus();
        choose(next);
      });
    });
    window.addEventListener('resize', () => move(current(), true));
    document.fonts.ready.then(() => move(current(), true));
  }
  seg('billing', (v) => { period = v as typeof period; update(); });
  seg('currency', (v) => { currency = v as Currency; update(); });

  place();
  update();
  document.fonts.ready.then(place);
}

boot({
  page: 'pricing',
  render,
  init: ({ reduce, revealed }) => {
    // The home hero's sky and bubbles: the Figma frame uses the same Clouds and Moving blobs settings.
    initClouds(q('.phero')!, q<HTMLCanvasElement>('.phero__sky')!, 'phero--sky', reduce, SKY_HERO, {
      bubbles: { params: HERO_BUBBLES, intensity: 0.6 },
    });
    initBlobBackdrop(q('.pfield')!, q<HTMLCanvasElement>('.pfield__fx')!, 'pfield--fx', FOOTER_BLOBS, [253, 253, 253], reduce, 0.55);
    // The blob layer is one screen tall and held on screen through both sections (a pin, as ScrollSmoother rules out
    // position: sticky), so the blobs neither repeat nor restart at the join.
    // Phones: no pin. Moving the canvas against the scroll every frame jittered there, so it sits behind the first screen of
    // the calculator and fades out (pricing.css).
    gsap.matchMedia().add('(min-width: 901px)', () => {
      ScrollTrigger.create({ trigger: '.pfield', start: 'top top', end: 'bottom bottom', pin: '.pfield__fx', pinSpacing: false });
    });
    initCalculator(!reduce);
    if (reduce) return;

    const { tween } = splitReveal('.phero__title span', { by: 'words', scrollTrigger: false, stagger: 0.05 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.phero__lower > *, .phero .gbtn', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.45);
    revealed.then(() => {
      heroTl.play();
      // Never leave the copy hidden if frames are starved.
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
    });

    splitReveal('.calc__title span', { by: 'words' });
    fadeUp('.calc__head .psub, .calc__controls', '.calc__head', { y: 24 });
    // The row, not the cards: each card has a CSS hover transition on transform, which would fight the tween and
    // could leave the cards short of their place (below the plan title they line up with).
    fadeUp('.lcards, .slider', '.calc__pick', { y: 30, stagger: 0.1 });
    fadeUp('.quote > :not(.quote__enterprise), .calc__cta', '.quote', { y: 30, stagger: 0.08 });

    splitReveal('.pnext__title span', { by: 'words' });
    fadeUp('.pstep', '.pnext__steps', { y: 40, stagger: 0.1 });
    // Wide screens: the cards fly in as paper sheets and stick (animations/pricing-cards.ts). Below that the HTML
    // cards sit in a grid under the steps and rise in.
    initPricingCards(true);
    qa('.promise').forEach((card) => fadeUp(card, card, { y: 60, duration: 1.2, start: 'top 90%' }));
  },
});
