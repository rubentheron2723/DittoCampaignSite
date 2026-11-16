import '../styles/base.css';
import '../styles/pricing.css';

import { ANNUAL_MULTIPLIER, calculator, guarantees, hero, nextSteps, tierForUsers, tiers, type Currency } from '../content/pricing';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import { boot } from '../shared/boot';
import { FOOTER_BLOBS } from '../shared/footer-blobs';
import { ctaAndFooter } from '../shared/chrome';
import { esc } from '../shared/mark';
import { Draggable, gsap, q, qa } from '../animations/gsap';
import { fadeUp, rollNumber, splitReveal } from '../shared/motion';

/* ---------- Render ---------- */
/**
 * Pricing (Figma 2378:655 hero, 2378:786 calculator; the third section is designed to match them).
 *   1. Hero: the home hero's cloud sky and bubbles (the frame uses the same shader settings), centred white copy and a
 *      glass "Get started" pill.
 *   2. Calculator on #fdfdfd (one screen at 1440), under the footer's Moving blobs: the headline and toggles; the plan
 *      cards over the slider on the left and the price check on the right; a blue "Book a demo" centred below.
 *   3. "From first call to first placement": the five steps as glass rows with big blue numbers, then the four
 *      guarantees as glass cards.
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

  <section class="calc" id="calculator" data-theme="light">
    <canvas class="calc__fx" aria-hidden="true"></canvas>
    <header class="calc__head">
      <h2 class="ptitle calc__title"><span>${esc(calculator.titleOne)}</span><span>${esc(calculator.titleTwo)}</span></h2>
      <p class="psub">${esc(calculator.description)}</p>
    </header>

    <div class="calc__area">
      <div class="calc__controls">
        <div class="gseg" id="billing" role="tablist" aria-label="Billing cycle">
          <span class="gseg__pill" aria-hidden="true"></span>
          <button type="button" role="tab" aria-selected="true" data-value="monthly">Monthly</button>
          <button type="button" role="tab" aria-selected="false" data-value="annual">Annual <em>Save 15%</em></button>
        </div>
        <div class="gseg" id="currency" role="tablist" aria-label="Currency">
          <span class="gseg__pill" aria-hidden="true"></span>
          <button type="button" role="tab" aria-selected="true" data-value="ZAR">ZAR</button>
          <button type="button" role="tab" aria-selected="false" data-value="USD">USD</button>
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
          <p class="quote__tier"><span id="q-tier">Starter</span> <em id="q-range">1 – 9 users</em></p>
          <div class="quote__rate"><strong id="q-rate">R949</strong><span>${esc(calculator.perLicense)}</span></div>
          <div class="quote__totals">
            <div class="quote__total"><strong id="q-total">R6,643</strong><span id="q-period">Monthly total</span></div>
            <div class="quote__total"><strong id="q-users">7</strong><span>Recruiters</span></div>
          </div>
          <p class="quote__enterprise" id="q-enterprise">${esc(calculator.enterprise)}</p>
        </div>
      </div>
    </div>

    <a class="bbtn calc__cta" href="/contact" data-magnetic>Book a demo</a>
  </section>

  <section class="pnext" data-theme="light">
    <h2 class="ptitle pnext__title">${esc(nextSteps.title)}</h2>
    <ol class="pnext__steps">
      ${nextSteps.steps
        .map(
          (s, i) => `<li class="pstep glass">
            <span class="pstep__num">${String(i + 1).padStart(2, '0')}</span>
            <div class="pstep__body"><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>
          </li>`,
        )
        .join('')}
    </ol>
    <ul class="pnext__promises">
      ${guarantees.map((g) => `<li class="promise glass"><h3>${esc(g.title)}</h3><p>${esc(g.copy)}</p></li>`).join('')}
    </ul>
  </section>

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
  const dur = animate ? 0.7 : 0;

  function update() {
    const tier = tierForUsers(users);
    const monthlyRate = tier.rates ? tier.rates[currency] : 0;
    const rate = period === 'annual' ? monthlyRate * ANNUAL_MULTIPLIER : monthlyRate;
    const total = rate * users * (period === 'annual' ? 12 : 1);

    sliderValue.textContent = String(users);
    knob.setAttribute('aria-valuenow', String(users));
    el.users.textContent = String(users);
    el.tier.textContent = tier.label;
    el.range.textContent = tier.rangeLabel;
    el.period.textContent = period === 'annual' ? 'Annual total' : 'Monthly total';
    quote.classList.toggle('quote--enterprise', !tier.rates);
    cards.forEach((c) => c.classList.toggle('is-active', c.dataset.label === tier.label));

    if (tier.rates) {
      rollNumber(el.rate, rate, (n) => money(n, !Number.isInteger(rate)), dur);
      rollNumber(el.total, Math.round(total), (n) => money(Math.round(n)), dur);
    } else {
      el.rate.textContent = 'Custom';
      el.total.textContent = 'Let’s talk';
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

  Draggable.create(knob, {
    type: 'x',
    bounds: track,
    inertia: false,
    onDrag() {
      users = Math.max(1, Math.min(100, Math.round((this.x / track.clientWidth) * 99 + 1)));
      gsap.set(fill, { width: `${(this.x / track.clientWidth) * 100}%` });
      update();
    },
    onPress() { gsap.to(knob, { scale: 1.12, duration: 0.2 }); },
    onRelease() { gsap.to(knob, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }); setUsers(users); },
  });
  track.addEventListener('click', (e) => {
    const r = track.getBoundingClientRect();
    setUsers(((e.clientX - r.left) / r.width) * 99 + 1);
  });
  knob.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setUsers(users + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setUsers(users - 1); }
  });
  cards.forEach((c) => c.addEventListener('click', () => setUsers(Number(c.dataset.min))));
  window.addEventListener('resize', place);

  // Glass toggles: the raised glass pill slides to the chosen option.
  function seg(id: string, onChange: (v: string) => void) {
    const root = q(`#${id}`)!;
    const pill = q('.gseg__pill', root)!;
    const buttons = qa<HTMLButtonElement>('button', root);
    const move = (b: HTMLButtonElement, instant = false) =>
      gsap.to(pill, { x: b.offsetLeft, y: b.offsetTop, width: b.offsetWidth, height: b.offsetHeight, duration: instant ? 0 : 0.5, ease: 'power3.inOut' });
    const current = () => buttons.find((b) => b.getAttribute('aria-selected') === 'true')!;
    move(buttons[0], true);
    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        buttons.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
        move(b);
        onChange(b.dataset.value!);
      }),
    );
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
    initBlobBackdrop(q('.calc')!, q<HTMLCanvasElement>('.calc__fx')!, 'calc--fx', FOOTER_BLOBS, [253, 253, 253], reduce, 0.55);
    initCalculator(!reduce);
    if (reduce) return;

    const { tween } = splitReveal('.phero__title span', { by: 'words', scrollTrigger: false, stagger: 0.05 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.phero__lower > *, .phero .gbtn', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.45);
    revealed.then(() => heroTl.play());

    splitReveal('.calc__title span', { by: 'words' });
    fadeUp('.calc__head .psub, .calc__controls', '.calc__head', { y: 24 });
    fadeUp('.lcard, .slider', '.calc__pick', { y: 30, stagger: 0.06 });
    fadeUp('.quote > *, .calc__cta', '.quote', { y: 30, stagger: 0.08 });

    splitReveal('.pnext__title', { by: 'words' });
    fadeUp('.pstep', '.pnext__steps', { y: 40, stagger: 0.1 });
    fadeUp('.promise', '.pnext__promises', { y: 30, stagger: 0.08 });
  },
});
