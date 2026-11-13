import '../styles/base.css';
import '../styles/pricing.css';

import { ANNUAL_MULTIPLIER, calculator, guarantees, hero, nextSteps, tierForUsers, tiers, type Currency } from '../content/pricing';
import { boot } from '../shared/boot';
import { ctaAndFooter } from '../shared/chrome';
import { esc, markSvg } from '../shared/mark';
import { Draggable, gsap, q, qa } from '../animations/gsap';
import { fadeUp, rollNumber, splitReveal } from '../shared/motion';

/* ---------- Render ---------- */
function render() {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="page-hero pricing-hero" data-theme="dark">
    <div class="page-hero__mark">${markSvg()}</div>
    <div class="pricing-hero__coins" aria-hidden="true">${[949, 849, 749].map((v, i) => `<span class="coin coin--${i + 1}" data-depth="${0.6 + i * 0.3}">R${v}</span>`).join('')}</div>
    <div class="wrap wrap--wide">
      <div class="page-hero__inner">
        <h1 class="h-display pricing-hero__title"><span>${esc(hero.titleOne)}</span><span>${esc(hero.titleTwo)}</span></h1>
        <p class="h-sub">${esc(hero.subtitle)}</p>
        <p class="lead">${esc(hero.body)}</p>
        <div class="page-hero__actions">
          <a class="btn btn--light btn--lg" href="#calculator" data-magnetic>Calculate your price</a>
          <a class="btn btn--outline btn--lg" href="/contact" data-magnetic>Book a demo</a>
        </div>
      </div>
    </div>
  </section>

  <section class="calc" id="calculator" data-theme="light">
    <div class="wrap wrap--wide">
      <header class="calc__head">
        <h2 class="h-section calc__title">${esc(calculator.title)}</h2>
        <p class="lead muted">${esc(calculator.description)}</p>
      </header>

      <div class="calc__controls">
        <div class="seg" id="billing" role="tablist" aria-label="Billing cycle">
          <span class="seg__pill"></span>
          <button type="button" role="tab" aria-selected="true" data-value="monthly">Monthly</button>
          <button type="button" role="tab" aria-selected="false" data-value="annual">Annual <em>save 15%</em></button>
        </div>
        <div class="seg seg--small" id="currency" role="tablist" aria-label="Currency">
          <span class="seg__pill"></span>
          <button type="button" role="tab" aria-selected="true" data-value="ZAR">ZAR</button>
          <button type="button" role="tab" aria-selected="false" data-value="USD">USD</button>
        </div>
      </div>

      <div class="calc__grid">
        <div class="calc__left">
          <p class="calc__label">${esc(calculator.sliderLabel)}</p>
          <div class="slider" id="slider">
            <div class="slider__track"><div class="slider__fill"></div>
              ${tiers.map((t) => `<span class="slider__tick" style="left:${((t.min - 1) / 99) * 100}%"><b>${t.min}</b></span>`).join('')}
              <span class="slider__tick slider__tick--end" style="left:100%"><b>100</b></span>
            </div>
            <button type="button" class="slider__knob" id="knob" aria-label="Recruiter count" aria-valuemin="1" aria-valuemax="100" aria-valuenow="5" role="slider">
              <span class="slider__value" id="slider-value">5</span>
            </button>
          </div>
          <div class="tiers-row" id="tiers-row">
            ${tiers
              .map(
                (t) => `<button type="button" class="tierchip" data-min="${t.min}" data-label="${t.label}">
                  <b>${esc(t.label)}</b><span>${esc(t.rangeLabel)}</span>
                </button>`,
              )
              .join('')}
          </div>
          <p class="calc__includes">${esc(calculator.includes)}</p>
        </div>

        <div class="quote" id="quote">
          <div class="quote__glow" aria-hidden="true"></div>
          <p class="quote__tier"><span id="q-tier">Starter</span><em id="q-range">1 – 9 users</em></p>
          <p class="quote__desc" id="q-desc">${esc(tiers[0].description)}</p>
          <div class="quote__rate">
            <span class="quote__cur" id="q-cur">R</span><span class="quote__amount" id="q-rate">949</span>
            <span class="quote__per">${esc(calculator.perLicense)}</span>
          </div>
          <div class="quote__totals">
            <div><span class="quote__k" id="q-period">Monthly total</span><strong id="q-total">R4,745</strong></div>
            <div><span class="quote__k">Recruiters</span><strong id="q-users">5</strong></div>
            <div class="quote__save" id="q-save-wrap"><span class="quote__k">You save</span><strong id="q-save">R0</strong></div>
          </div>
          <p class="quote__enterprise" id="q-enterprise">${esc(calculator.enterprise)}</p>
          <a class="btn btn--light btn--lg" href="/contact" data-magnetic id="q-cta">Book a demo</a>
        </div>
      </div>
    </div>
  </section>

  <section class="guarantees" data-theme="light">
    <div class="wrap wrap--wide">
      <ul class="guarantees__grid">
        ${guarantees.map((g, i) => `<li class="guarantee"><span>0${i + 1}</span><h3>${esc(g.title)}</h3><p>${esc(g.copy)}</p></li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="steps-section" data-theme="dark">
    <div class="wrap wrap--wide">
      <header class="steps-section__head">
        <h2 class="h-section">${esc(nextSteps.title)}</h2>
      </header>
      <ol class="timeline">
        <span class="timeline__line"><span class="timeline__fill"></span></span>
        ${nextSteps.steps
          .map(
            (s, i) => `<li class="tstep">
              <span class="tstep__dot"><b>${i + 1}</b></span>
              <div class="tstep__body"><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>
            </li>`,
          )
          .join('')}
      </ol>
    </div>
  </section>

  ${ctaAndFooter()}`;
}

/* ---------- Calculator ---------- */
function initCalculator(animate: boolean) {
  let users = 5;
  let period: 'monthly' | 'annual' = 'monthly';
  let currency: Currency = 'ZAR';

  const knob = q<HTMLButtonElement>('#knob')!;
  const track = q('.slider__track')!;
  const fill = q('.slider__fill')!;
  const sliderValue = q('#slider-value')!;
  const quote = q('#quote')!;
  const chips = qa<HTMLButtonElement>('.tierchip');
  const el = {
    tier: q('#q-tier')!, range: q('#q-range')!, desc: q('#q-desc')!, cur: q('#q-cur')!, rate: q('#q-rate')!,
    period: q('#q-period')!, total: q('#q-total')!, users: q('#q-users')!, save: q('#q-save')!, saveWrap: q('#q-save-wrap')!,
    enterprise: q('#q-enterprise')!,
  };

  const sym = () => (currency === 'ZAR' ? 'R' : '$');
  const money = (n: number) => `${sym()}${Math.round(n).toLocaleString('en-US')}`;
  const dur = animate ? 0.7 : 0;

  function update() {
    const tier = tierForUsers(users);
    const monthlyRate = tier.rates ? tier.rates[currency] : 0;
    const rate = period === 'annual' ? monthlyRate * ANNUAL_MULTIPLIER : monthlyRate;
    const months = period === 'annual' ? 12 : 1;
    const total = rate * users * months;
    const saving = period === 'annual' ? (monthlyRate - rate) * users * 12 : 0;

    sliderValue.textContent = String(users);
    knob.setAttribute('aria-valuenow', String(users));
    el.users.textContent = String(users);
    el.tier.textContent = tier.label;
    el.range.textContent = tier.rangeLabel;
    el.desc.textContent = tier.description;
    el.cur.textContent = sym();
    el.period.textContent = period === 'annual' ? 'Annual total' : 'Monthly total';
    quote.classList.toggle('quote--enterprise', !tier.rates);
    quote.dataset.tier = tier.label.toLowerCase();
    chips.forEach((c) => c.classList.toggle('is-active', c.dataset.label === tier.label));

    if (tier.rates) {
      rollNumber(el.rate, rate, (n) => (Number.isInteger(rate) ? String(Math.round(n)) : n.toFixed(2)), dur);
      rollNumber(el.total, total, money, dur);
      rollNumber(el.save, saving, money, dur);
    } else {
      el.rate.textContent = '—';
      el.total.textContent = 'Custom';
      el.save.textContent = '—';
    }
    gsap.to(el.saveWrap, { autoAlpha: period === 'annual' && tier.rates ? 1 : 0.35, duration: 0.3 });
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
    onPress() { quote.classList.add('quote--live'); gsap.to(knob, { scale: 1.12, duration: 0.2 }); },
    onRelease() { quote.classList.remove('quote--live'); gsap.to(knob, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }); setUsers(users); },
  });
  track.addEventListener('click', (e) => {
    const r = track.getBoundingClientRect();
    setUsers(((e.clientX - r.left) / r.width) * 99 + 1);
  });
  knob.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setUsers(users + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setUsers(users - 1); }
  });
  chips.forEach((c) => c.addEventListener('click', () => setUsers(Number(c.dataset.min))));
  window.addEventListener('resize', place);

  // Segmented controls
  function seg(id: string, onChange: (v: string) => void) {
    const root = q(`#${id}`)!;
    const pill = q('.seg__pill', root)!;
    const buttons = qa<HTMLButtonElement>('button', root);
    const move = (b: HTMLButtonElement, instant = false) =>
      gsap.to(pill, { x: b.offsetLeft - 5, width: b.offsetWidth, duration: instant ? 0 : 0.5, ease: 'power3.inOut' });
    move(buttons[0], true);
    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        buttons.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
        move(b);
        onChange(b.dataset.value!);
        if (animate) gsap.fromTo(quote, { scale: 0.985 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.6)' });
      }),
    );
    window.addEventListener('resize', () => move(buttons.find((b) => b.getAttribute('aria-selected') === 'true')!, true));
  }
  seg('billing', (v) => { period = v as typeof period; update(); });
  seg('currency', (v) => { currency = v as Currency; update(); });

  place();
  update();
  document.fonts.ready.then(place);
}

function initTimeline(animate: boolean) {
  if (!animate) return;
  const tl = q('.timeline')!;
  gsap.fromTo('.timeline__fill', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: tl, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } });
  qa('.tstep').forEach((step) => {
    gsap.from(step.querySelector('.tstep__dot'), { scale: 0, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)', scrollTrigger: { trigger: step, start: 'top 72%', toggleActions: 'play none none reverse' } });
    gsap.from(step.querySelector('.tstep__body'), { x: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 72%', toggleActions: 'play none none reverse' } });
  });
}

boot({
  page: 'pricing',
  render,
  init: ({ reduce, revealed }) => {
    initCalculator(!reduce);
    initTimeline(!reduce);
    if (reduce) return;

    const { tween } = splitReveal('.pricing-hero__title span', { by: 'chars', scrollTrigger: false, stagger: 0.015 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.pricing-hero .h-sub, .pricing-hero .lead, .pricing-hero .page-hero__actions', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5)
      .from('.coin', { y: 80, autoAlpha: 0, rotate: -8, duration: 1.4, stagger: 0.12 }, 0.6)
      .from('.page-hero__mark', { autoAlpha: 0, scale: 0.9, duration: 1.6 }, 0.2);
    revealed.then(() => heroTl.play());
    qa('.coin').forEach((c, i) => gsap.to(c, { y: `+=${14 + i * 6}`, duration: 3 + i, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

    splitReveal('.calc__title');
    fadeUp('.calc__head .lead, .calc__controls', '.calc__head', { y: 24 });
    fadeUp('.calc__left > *', '.calc__grid', { y: 30 });
    gsap.from('#quote', { y: 60, autoAlpha: 0, rotateX: 6, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.calc__grid', start: 'top 75%', toggleActions: 'play none none reverse' } });
    fadeUp('.guarantee', '.guarantees__grid', { y: 40 });
    splitReveal('.steps-section .h-section');
  },
});
