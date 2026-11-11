import '../styles/base.css';
import '../styles/contact.css';

import { aside, errors, fields, hero, interests, roles, success, teamSizes } from '../content/contact';
import { boot } from '../shared/boot';
import { footerHtml } from '../shared/chrome';
import { esc, markSvg } from '../shared/mark';
import { gsap, q, qa } from '../animations/gsap';
import { fadeUp, splitReveal, stickyPin } from '../shared/motion';

const text = (name: keyof typeof fields, type = 'text', extra = '') => {
  const f = fields[name] as { label: string; placeholder?: string };
  return `<label class="field" data-field="${name}">
    <span class="field__label">${esc(f.label)}</span>
    <input class="field__input" name="${name}" type="${type}" placeholder="${esc(f.placeholder ?? '')}" ${extra} />
    <span class="field__line" aria-hidden="true"></span>
    <span class="field__error" role="alert"></span>
  </label>`;
};
const select = (name: keyof typeof fields, options: string[]) => `<label class="field" data-field="${name}">
    <span class="field__label">${esc(fields[name].label)}</span>
    <select class="field__input" name="${name}">
      <option value="" disabled selected>Select an option</option>
      ${options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}
    </select>
    <span class="field__line" aria-hidden="true"></span>
    <span class="field__error" role="alert"></span>
  </label>`;

function render() {
  const main = document.getElementById('main')!;
  main.innerHTML = `
  <section class="page-hero contact-hero" data-theme="dark">
    <div class="page-hero__mark">${markSvg()}</div>
    <div class="wrap wrap--wide">
      <div class="page-hero__inner">
        <p class="eyebrow">${esc(hero.eyebrow)}</p>
        <h1 class="h-display contact-hero__title">${esc(hero.title)}</h1>
        <p class="h-sub">${esc(hero.subtitle)}</p>
        <p class="lead">${esc(hero.support)}</p>
      </div>
    </div>
  </section>

  <section class="contact" id="contact-form" data-theme="light">
    <div class="wrap wrap--wide contact__grid">
      <form class="form" id="form" novalidate>
        <div class="form__fields">
          ${text('name', 'text', 'autocomplete="name"')}
          ${text('email', 'email', 'autocomplete="email"')}
          ${text('business', 'text', 'autocomplete="organization"')}
          ${text('website', 'url', 'autocomplete="url" inputmode="url"')}
          ${text('phone', 'tel', 'autocomplete="tel" inputmode="tel"')}
          ${select('role', roles)}
          ${select('teamSize', teamSizes)}
          ${select('interest', interests)}
          <label class="field field--full" data-field="message">
            <span class="field__label">${esc(fields.message.label)}</span>
            <textarea class="field__input" name="message" rows="4" placeholder="${esc(fields.message.placeholder)}"></textarea>
            <span class="field__line" aria-hidden="true"></span>
            <span class="field__error" role="alert"></span>
          </label>
        </div>
        <div class="form__foot">
          <button type="submit" class="btn btn--solid btn--lg form__submit" data-magnetic><span class="form__submit-label">Send request</span><span class="form__submit-sending">Sending…</span></button>
          <p class="form__note">Prototype only: nothing is sent yet. The production form posts to Supabase with Turnstile spam protection.</p>
        </div>
        <div class="form__success" id="form-success" aria-live="polite">
          <div class="form__success-mark">${markSvg('mark--on-light')}</div>
          <h2 class="h-section">${esc(success.title)}</h2>
          <p class="lead muted">${esc(success.copy)}</p>
          <a class="btn btn--outline-dark" href="/">Back to home</a>
        </div>
      </form>

      <aside class="contact__aside">
        <p class="eyebrow eyebrow--blue">${esc(aside.eyebrow)}</p>
        <ol class="next">
          ${aside.steps.map((s, i) => `<li class="next__step"><span class="next__dot"><b>${i + 1}</b></span><div><h3>${esc(s.title)}</h3><p>${esc(s.copy)}</p></div></li>`).join('')}
        </ol>
        <div class="direct">
          <p class="eyebrow">${esc(aside.direct.label)}</p>
          <a class="direct__email" href="mailto:${aside.direct.email}">${esc(aside.direct.email)}</a>
        </div>
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
  website: (v) => /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(v.trim()),
  phone: (v) => /^[+\d][\d\s()-]{5,}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 6,
  role: (v) => !!v,
  teamSize: (v) => !!v,
  interest: (v) => !!v,
  message: (v) => v.trim().length > 0,
};

function initForm(animate: boolean) {
  const form = q<HTMLFormElement>('#form')!;
  const fieldEls = qa<HTMLElement>('.field', form);
  const submit = q<HTMLButtonElement>('.form__submit', form)!;

  const setError = (field: HTMLElement, msg: string) => {
    const err = q('.field__error', field)!;
    const had = field.classList.contains('is-invalid');
    field.classList.toggle('is-invalid', !!msg);
    err.textContent = msg;
    if (msg && !had && animate) {
      gsap.fromTo(field, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      gsap.fromTo(err, { y: -6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 });
    }
  };
  const validate = (field: HTMLElement) => {
    const name = field.dataset.field!;
    const input = q<HTMLInputElement>('.field__input', field)!;
    const ok = validators[name](input.value);
    setError(field, ok ? '' : errors[name as keyof typeof errors]);
    field.classList.toggle('is-filled', !!input.value);
    return ok;
  };

  fieldEls.forEach((field) => {
    const input = q<HTMLInputElement>('.field__input', field)!;
    input.addEventListener('blur', () => validate(field));
    input.addEventListener('input', () => field.classList.contains('is-invalid') && validate(field));
    input.addEventListener('change', () => validate(field));
    input.addEventListener('focus', () => field.classList.add('is-focused'));
    input.addEventListener('blur', () => field.classList.remove('is-focused'));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = fieldEls.map(validate);
    const firstBad = fieldEls[results.indexOf(false)];
    if (firstBad) {
      q<HTMLInputElement>('.field__input', firstBad)!.focus();
      if (animate) gsap.fromTo(submit, { x: -4 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    form.classList.add('is-sending');
    submit.disabled = true;
    // Simulated send (no backend in the prototype).
    gsap.delayedCall(animate ? 1.1 : 0, () => {
      form.classList.add('is-sent');
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to('.form__fields, .form__foot', { autoAlpha: 0, y: -20, duration: animate ? 0.5 : 0 })
        .set('.form__success', { display: 'grid' })
        .fromTo('.form__success-mark .mark__l', { x: -80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9 })
        .fromTo('.form__success-mark .mark__r', { x: 80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9 }, '<')
        .from('.form__success h2, .form__success p, .form__success .btn', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, '-=0.5');
    });
  });
}

boot({
  page: 'contact',
  render,
  init: ({ reduce, revealed }) => {
    initForm(!reduce);
    if (reduce) return;
    stickyPin(q('.contact__aside')!, q('.contact__grid')!);

    const { tween } = splitReveal('.contact-hero__title', { by: 'words', scrollTrigger: false, stagger: 0.05 });
    tween.pause();
    const heroTl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .from('.contact-hero .eyebrow', { y: 20, autoAlpha: 0, duration: 0.8 }, 0)
      .add(tween.play(), 0.05)
      .from('.contact-hero .h-sub, .contact-hero .lead', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.5)
      .from('.page-hero__mark', { autoAlpha: 0, scale: 0.9, duration: 1.6 }, 0.2);
    revealed.then(() => heroTl.play());

    fadeUp('.field', '.form', { y: 24, stagger: 0.06, start: 'top 80%' });
    fadeUp('.form__foot', '.form__foot', { y: 20, start: 'top 95%' });
    fadeUp('.contact__aside > *', '.contact__aside', { y: 24, stagger: 0.1 });
    fadeUp('.next__step', '.next', { y: 20, stagger: 0.1, start: 'top 85%' });
  },
});
