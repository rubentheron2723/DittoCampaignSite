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
import { fadeUp, splitReveal } from '../shared/motion';

gsap.registerPlugin(Draggable);

/* ---------- Render ---------- */
/**
 * Pricing (brief v2.2, 3.6; design notes 4.3 and 4.4 point 10).
 *   1. Hero: the cloud sky, about 70% of the screen, and "See your price ↓" to the calculator.
 *   2. Calculator: the plans over the slider on the left, the price card beside them (it changes at once, no counting
 *      up), with Book a demo and the billing FAQ link. Fifty or more recruiters: "Let's talk" in place of a price.
 *   3. "From first call to first placement": five numbered steps, then the four promises as flat white cards.
 *   Sections 2 and 3 share one #fdfdfd field and one pinned blob layer.
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
      <a class="gbtn gbtn--lg" href="#calculator">${esc(hero.cta)}</a>
    </div>
  </section>

  <div class="pfield">
  <!-- One Moving blobs layer behind the calculator and the steps, pinned to the screen while they scroll past, so the
       blobs carry on across the join between the two sections. -->
  <canvas class="pfield__fx" aria-hidden="true"></canvas>
  <section class="calc" id="calculator" data-theme="light">
    <header class="calc__head">
      <h2 class="ptitle calc__title">${esc(calculator.title)}</h2>
      <p class="psub">${esc(calculator.description)}</p>
    </header>

    <div class="calc__area">
      <div class="calc__controls">
        <div class="gseg" id="billing" role="radiogroup" aria-label="Billing cycle">
          <span class="gseg__pill" aria-hidden="true"></span>
          <button type="button" role="radio" aria-checked="true" tabindex="0" data-value="monthly">Monthly</button>
          <button type="button" role="radio" aria-checked="false" tabindex="-1" data-value="annual">${esc(calculator.annualToggle)}</button>
        </div>
        <div class="gseg" id="currency" role="radiogroup" aria-label="Currency">
          <span class="gseg__pill" aria-hidden="true"></span>
          <button type="button" role="radio" aria-checked="true" tabindex="0" data-value="ZAR">ZAR</button>
          <button type="button" role="radio" aria-checked="false" tabindex="-1" data-value="USD">USD</button>
        </div>
      </div>

      <div class="calc__body">
        <div class="calc__pick">
          <p class="calc__ask" id="slider-label">${esc(calculator.sliderLabel)}</p>
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
            <button type="button" class="slider__knob" id="knob" aria-labelledby="slider-label" aria-valuemin="1" aria-valuemax="100" aria-valuenow="7" role="slider">
              <span class="slider__value" id="slider-value">7</span>
            </button>
          </div>
        </div>

        <div class="quote" id="quote" aria-live="polite">
          <p class="quote__tier"><span id="q-tier">Starter</span> <em id="q-range">1 to 9 recruiters</em></p>
          <div class="quote__price">
            <p class="quote__rate"><strong id="q-rate">R949</strong><span id="q-per">${esc(calculator.perRecruiter.ZAR)}</span></p>
            <p class="quote__total"><strong id="q-total">R6,643</strong><span><span id="q-period">${esc(calculator.monthlyTotal.ZAR)}</span> · <span id="q-users">7 recruiters</span></span></p>
            <p class="quote__save" id="q-save" hidden></p>
          </div>
          <div class="quote__ent">
            <strong>${esc(calculator.enterprise.big)}</strong>
            <p>${esc(calculator.enterprise.line)}</p>
          </div>
          <a class="bp bp--lg quote__cta" id="q-cta" href="/contact" data-magnetic>${esc(calculator.book)}</a>
          <p class="quote__faq">${esc(calculator.faq.lead)} <a href="${calculator.faq.href}">${esc(calculator.faq.label)}</a></p>
        </div>
      </div>
    </div>
  </section>

  <section class="pnext" data-theme="light">
    <h2 class="ptitle pnext__title">${esc(nextSteps.title)}</h2>
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
      ${guarantees.map((g) => `<li class="promise"><h3>${esc(g.title)}</h3><p>${esc(g.copy)}</p></li>`).join('')}
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
    tier: q('#q-tier')!, range: q('#q-range')!, rate: q('#q-rate')!, period: q('#q-period')!,
    total: q('#q-total')!, users: q('#q-users')!,
  };

  const sym = () => (currency === 'ZAR' ? 'R' : '$');
  const money = (n: number, decimals = false) =>
    `${sym()}${n.toLocaleString('en-US', { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 })}`;

  const cta = q<HTMLAnchorElement>('#q-cta')!;
  const save = q('#q-save')!;
  const per = q('#q-per')!;
  /** Sets every figure at once: no counting up through wrong values (brief 4.4, point 10). */
  function update() {
    const tier = tierForUsers(users);
    const monthlyRate = tier.rates ? tier.rates[currency] : 0;
    const rate = period === 'annual' ? monthlyRate * ANNUAL_MULTIPLIER : monthlyRate;
    const total = rate * users * (period === 'annual' ? 12 : 1);
    const label = `${users} ${users === 1 ? 'recruiter' : 'recruiters'}`;

    sliderValue.textContent = String(users);
    knob.setAttribute('aria-valuenow', String(users));
    knob.setAttribute('aria-valuetext', label);
    el.users.textContent = label;
    el.tier.textContent = tier.label;
    el.range.textContent = tier.rangeLabel;
    per.textContent = calculator.perRecruiter[currency];
    el.period.textContent = (period === 'annual' ? calculator.annualTotal : calculator.monthlyTotal)[currency];
    quote.classList.toggle('quote--enterprise', !tier.rates);
    cards.forEach((c) => c.classList.toggle('is-active', c.dataset.label === tier.label));
    cta.textContent = tier.rates ? calculator.book : calculator.enterprise.button;

    if (!tier.rates) {
      save.hidden = true;
      return;
    }
    el.rate.textContent = money(rate, !Number.isInteger(rate));
    el.total.textContent = money(Math.round(total));
    // Annual: what a year on monthly billing would cost, less the annual total.
    const saved = Math.round(monthlyRate * users * 12) - Math.round(total);
    save.hidden = period !== 'annual';
    save.textContent = period === 'annual' ? `${calculator.savePrefix}${money(saved)}${calculator.saveSuffix}` : '';
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
      // Only when the count changes.
      if (next === users) return;
      users = next;
      update();
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

    splitReveal('.calc__title', { by: 'words' });
    fadeUp('.calc__head .psub, .calc__controls', '.calc__head', { y: 24 });
    // The row, not the cards: each card has a CSS hover transition on transform, which would fight the tween and
    // could leave the cards short of their place (below the plan title they line up with).
    fadeUp('.lcards, .slider', '.calc__pick', { y: 30, stagger: 0.1 });
    fadeUp('.quote', '.quote', { y: 30 });

    splitReveal('.pnext__title', { by: 'words' });
    fadeUp('.pstep', '.pnext__steps', { y: 40, stagger: 0.1 });
    fadeUp('.promise', '.pnext__promises', { y: 30, stagger: 0.08 });
  },
});
