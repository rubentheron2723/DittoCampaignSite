import '../styles/base.css';
import '../styles/contact.css';

import { dialCodes, errors, fields, hero, interests, jobsLine, next, roles, sendError, submitLabel, success, teamSizes } from '../content/contact';
import { boot } from '../shared/boot';
import { footerHtml } from '../shared/chrome';
import { esc, markSvg } from '../shared/mark';
import { gsap, q, qa, ScrollTrigger } from '../animations/gsap';
import { fadeUp, splitReveal } from '../shared/motion';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import { FOOTER_BLOBS } from '../shared/footer-blobs';
import { initSelects, selectHtml } from '../shared/select';

/*
 * Contact (Figma 2396:121 hero, 2390:340 form with the 2396:478 dropdown; brief v2.2 3.9 and 4.3 point 11): the hero,
 * then the form on the left with "What happens next?" beside it, both in view together on desktop.
 */

type FieldName = keyof typeof fields;

/** A labelled field around `control`; the label's id is `<name>-label`. */
const field = (name: FieldName, control: string, extra = '') => `<div class="field${extra}${fields[name].optional ? ' field--optional' : ''}" data-field="${name}">
    <label class="field__label" id="${name}-label" for="${name}-input">${esc(fields[name].label)}${fields[name].optional ? ' <span class="field__opt">(optional)</span>' : ''}</label>
    ${control}
    <p class="field__error" id="${name}-error"></p>
  </div>`;

const text = (name: FieldName, type: string, attrs = '') => {
  const f = fields[name] as { placeholder?: string };
  return field(
    name,
    `<input class="pill field__input" id="${name}-input" name="${name}" type="${type}" placeholder="${esc(f.placeholder ?? '')}" ${attrs} />`,
  );
};

const choice = (name: FieldName, options: string[]) =>
  field(name, selectHtml(name, options.map((o) => ({ value: o, label: o })), { labelledBy: `${name}-label` }));

/** The contact number: a dialling-code chip (its own small dropdown) and the number, in one pill. */
const phone = () =>
  field(
    'phone',
    `<div class="pill phone">
      ${selectHtml(
        'dial',
        dialCodes.map((d) => ({ value: d.code, label: `${d.code}  ${d.country}`, short: d.code })),
        { labelledBy: 'phone-label', initial: '+27', variant: 'chip' },
      )}
      <input class="phone__input" id="phone-input" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="${esc(fields.phone.placeholder ?? "")}" />
    </div>`,
  );

function render() {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="chero" data-theme="dark">
    <div class="chero__bg" aria-hidden="true">
      <canvas class="chero__sky"></canvas>
      <div class="chero__glow"></div>
      <div class="chero__haze"></div>
    </div>
    <div class="chero__inner">
      <h1 class="chero__title">${hero.title.map((l) => `<span class="chero__line">${esc(l)}</span>`).join(' ')}</h1>
      <div class="chero__copy">
        <p class="chero__lead">${esc(hero.subtitle)}</p>
        <p class="chero__support">${esc(hero.support)}</p>
      </div>
    </div>
  </section>

  <section class="cform" id="contact-form" data-theme="light">
    <canvas class="cform__fx" aria-hidden="true"></canvas>
    <div class="cform__grid">
      <div class="cform__main">
        <form class="form" id="form" novalidate>
          <div class="form__fields">
            ${text('name', 'text', 'autocomplete="name"')}
            ${text('email', 'email', 'autocomplete="email"')}
            ${text('business', 'text', 'autocomplete="organization"')}
            ${text('website', 'text', 'autocomplete="url" inputmode="url"')}
            ${phone()}
            ${choice('role', roles)}
            ${choice('teamSize', teamSizes)}
            ${choice('interest', interests)}
            ${field(
              'message',
              `<textarea class="field__input form__message" id="message-input" name="message" rows="4" placeholder="${esc(fields.message.placeholder ?? '')}"></textarea>`,
              ' field--full',
            )}
          </div>
          <div class="form__trap" aria-hidden="true"><label for="company_fax-input">Leave this empty</label><input id="company_fax-input" name="company_fax" type="text" tabindex="-1" autocomplete="off" /></div>
          <button type="submit" class="bp bp--lg form__submit"><span class="form__submit-label">${esc(submitLabel)}</span><span class="form__submit-sending" aria-hidden="true">Sending…</span></button>
          <p class="form__send-error" id="form-send-error" role="alert"></p>
          <div class="form__success" id="form-success" aria-live="polite">
            <div class="form__success-mark">${markSvg('mark--on-light')}</div>
            <h2 class="form__success-title" tabindex="-1">${esc(success.title)}</h2>
            <p class="form__success-copy">${esc(success.copy)}</p>
          </div>
        </form>
        <p class="cform__jobs">${esc(jobsLine.lead)} <a href="${jobsLine.href}">${esc(jobsLine.label)}</a></p>
      </div>

      <aside class="cnext" aria-labelledby="next-title">
        <h2 class="cnext__title" id="next-title">${esc(next.title)}</h2>
        <ol class="cnext__steps">
          ${next.steps
            .map(
              (s, i) => `<li class="cnext__step">
                <span class="cnext__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
                <div class="cnext__desc"><h3>${esc(s.title)}</h3><p>${esc(s.copy)}</p></div>
              </li>`,
            )
            .join('')}
        </ol>
        <p class="cnext__mail">${esc(next.direct.label)} <a href="mailto:${next.direct.email}">${esc(next.direct.email)}</a></p>
      </aside>
    </div>
  </section>

  ${footerHtml()}`;
}

/* ---------- Validation + submit ---------- */
const validators: Record<string, (v: string) => boolean> = {
  name: (v) => v.trim().length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  business: (v) => v.trim().length > 1,
  // Optional: empty is fine; anything typed must look like a website.
  website: (v) => !v.trim() || /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(v.trim()),
  phone: (v) => /^[\d\s()-]{5,}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 6,
  role: (v) => !!v,
  teamSize: (v) => !!v,
  interest: (v) => !!v,
  // Optional.
  message: () => true,
};

function initForm(animate: boolean) {
  const form = q<HTMLFormElement>('#form')!;
  const fieldEls = qa<HTMLElement>('.field', form);
  const submit = q<HTMLButtonElement>('.form__submit', form)!;
  initSelects(form, animate);

  /** The field's own value: its text input, or its dropdown's hidden input (not the phone's dialling code). */
  const inputOf = (f: HTMLElement) =>
    q<HTMLInputElement>(`[name="${f.dataset.field}"]`, f)!;
  /** What to focus to fix it. */
  const focusOf = (f: HTMLElement) => q<HTMLElement>('.field__input, .phone__input, .select__button', f)!;

  const setError = (f: HTMLElement, msg: string) => {
    const err = q('.field__error', f)!;
    const had = f.classList.contains('is-invalid');
    f.classList.toggle('is-invalid', !!msg);
    err.textContent = msg;
    // The message belongs to its control: read out with it when it's focused (one at a time, not all at once).
    const control = focusOf(f);
    control.setAttribute('aria-invalid', String(!!msg));
    if (msg) control.setAttribute('aria-describedby', err.id);
    else control.removeAttribute('aria-describedby');
    if (msg && !had && animate) {
      gsap.fromTo(f, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      gsap.fromTo(err, { y: -6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 });
    }
  };
  const validate = (f: HTMLElement) => {
    const name = f.dataset.field!;
    const ok = validators[name](inputOf(f).value);
    setError(f, ok ? '' : (errors as Record<string, string>)[name] ?? '');
    return ok;
  };

  // Checked as you leave a field you've filled in (tabbing through an empty form doesn't turn it red), every field
  // once you've tried to send, and again as you correct one already marked.
  let tried = false;
  const check = (f: HTMLElement) => (tried || inputOf(f).value.trim() ? validate(f) : true);
  fieldEls.forEach((f) => {
    const input = inputOf(f);
    if (input.type === 'hidden') {
      input.addEventListener('change', () => validate(f));
      f.addEventListener('select:close', () => check(f));
    } else {
      input.addEventListener('blur', () => check(f));
      input.addEventListener('input', () => f.classList.contains('is-invalid') && validate(f));
    }
  });

  const sendErr = q<HTMLElement>('#form-send-error', form)!;

  /** Posts every named field to /api/contact (api/contact.ts); rejects unless the server says it was sent. */
  const send = async () => {
    const body = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v)]));
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const out = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !out?.ok) throw new Error(`contact: ${res.status}`);
  };

  const showSent = () => {
    form.classList.remove('is-sending');
    form.classList.add('is-sent');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.form__fields, .form__submit, .form__send-error', { autoAlpha: 0, y: -20, duration: animate ? 0.5 : 0 })
      .set('.form__success', { display: 'grid' })
      .fromTo('.form__success-mark .mark__l', { x: -80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9 })
      .fromTo('.form__success-mark .mark__r', { x: 80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9 }, '<')
      .from('.form__success-title, .form__success-copy', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, '-=0.5')
      // The button that had focus is gone: focus (and a screen reader) moves to the confirmation.
      .add(() => q<HTMLElement>('.form__success-title')?.focus({ preventScroll: true }));
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    tried = true;
    const results = fieldEls.map(validate);
    const firstBad = fieldEls[results.indexOf(false)];
    if (firstBad) {
      focusOf(firstBad).focus();
      if (animate) gsap.fromTo(submit, { x: -4 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    form.classList.add('is-sending');
    submit.disabled = true;
    sendErr.textContent = '';
    send()
      .then(showSent)
      .catch(() => {
        form.classList.remove('is-sending');
        submit.disabled = false;
        sendErr.innerHTML = `${esc(sendError.lead)} <a href="mailto:${sendError.email}">${esc(sendError.email)}</a>.`;
        if (animate) gsap.fromTo(sendErr, { y: -6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 });
      });
  });
}

/**
 * The form section's backdrop: #FDFDFD, fading into the footer's blue (#00B0FF) over its last FADE px, below the
 * content (contact.css keeps that much padding), drawn into a strip the blobs then distort.
 */
const FADE = 180;
function fadeToFooter(section: HTMLElement) {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  const at = Math.max(0.5, 1 - FADE / Math.max(1, section.offsetHeight));
  g.addColorStop(0, '#fdfdfd');
  g.addColorStop(at, '#fdfdfd');
  g.addColorStop(1, '#00b0ff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1, c.height);
  return c;
}

boot({
  page: 'contact',
  render,
  init: ({ reduce, revealed }) => {
    // The same sky as the About and Pricing heroes: Figma's Contact hero uses identical Clouds and Moving blobs.
    initClouds(q('.chero')!, q<HTMLCanvasElement>('.chero__sky')!, 'chero--sky', reduce, SKY_HERO, {
      bubbles: { params: HERO_BUBBLES, intensity: 0.6 },
    });
    initBlobBackdrop(q('.cform')!, q<HTMLCanvasElement>('.cform__fx')!, 'cform--fx', FOOTER_BLOBS, fadeToFooter(q('.cform')!), reduce, 0.5, 30);
    initForm(!reduce);
    if (reduce) return;

    const { tween } = splitReveal('.chero__title', { by: 'chars', scrollTrigger: false, stagger: 0.025 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .add(tween.play(), 0.05)
      .from('.chero__lead, .chero__support', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5);
    revealed.then(() => {
      heroTl.play();
      // Never leave the copy hidden if frames are starved.
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
    });

    fadeUp('.field', '.form', { y: 24, stagger: 0.05, start: 'top 80%' });
    fadeUp('.form__submit', '.form__submit', { y: 20, start: 'top 95%' });

    fadeUp('.cnext > *', '.cnext', { y: 24, stagger: 0.08, start: 'top 85%' });
    ScrollTrigger.refresh();
  },
});
