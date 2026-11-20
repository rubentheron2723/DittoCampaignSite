import '../styles/base.css';
import '../styles/sign-in.css';

import { endpoints, errors, form, intro, PASSWORD_MIN } from '../content/sign-in';
import { boot } from '../shared/boot';
import { esc } from '../shared/mark';
import { navLogoSvg } from '../shared/nav-logo';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { gsap, q, qa } from '../animations/gsap';

/**
 * Sign in (Figma 2385:1678, with the active and error states in 2385:1037 and 2385:862): the home hero's sky on the
 * left, fading to white under the form on the right. One screen, no nav or footer; the logo leads home.
 *
 * The form checks the email and password length itself, then posts to the app (content/sign-in.ts), which signs in.
 */
function render() {
  document.getElementById('main')!.innerHTML = `
  <section class="signin" data-theme="light">
    <div class="signin__bg" aria-hidden="true">
      <canvas class="signin__sky"></canvas>
      <div class="signin__fade"></div>
    </div>

    <div class="signin__intro">
      <a class="signin__logo" href="/" aria-label="Ditto home">${navLogoSvg()}</a>
      <h1 class="signin__headline"><span>${esc(intro.titleOne)}</span><span>${esc(intro.titleTwo)}</span></h1>
      <p class="signin__lede">${esc(intro.body)}</p>
    </div>

    <div class="signin__panel">
      <form class="sform" id="signin-form" method="post" action="${endpoints.signIn}" novalidate>
        <h2 class="sform__title">${esc(form.title)}</h2>
        <p class="sform__sub">${esc(form.subtitle)}</p>

        <div class="sfield" data-field="email">
          <label class="sfield__label" for="signin-email">${esc(form.email.label)}</label>
          <div class="sfield__box">
            <input class="sfield__input" id="signin-email" name="email" type="email" inputmode="email" autocomplete="username"
              placeholder="${esc(form.email.placeholder)}" aria-describedby="signin-email-error" required />
          </div>
          <p class="sfield__error" id="signin-email-error" role="alert"></p>
        </div>

        <div class="sfield" data-field="password">
          <label class="sfield__label" for="signin-password">${esc(form.password.label)}</label>
          <div class="sfield__box">
            <input class="sfield__input" id="signin-password" name="password" type="password" autocomplete="current-password"
              placeholder="${esc(form.password.placeholder)}" aria-describedby="signin-password-error" required minlength="${PASSWORD_MIN}" />
            <button class="sfield__show" type="button" aria-controls="signin-password" aria-pressed="false">${esc(form.password.show)}</button>
          </div>
          <p class="sfield__error" id="signin-password-error" role="alert"></p>
        </div>

        <div class="sform__row">
          <label class="scheck">
            <input class="scheck__input" type="checkbox" name="remember" value="1" />
            <span class="scheck__box" aria-hidden="true"></span>
            <span>${esc(form.remember)}</span>
          </label>
          <a class="sform__forgot" href="${endpoints.forgot}">${esc(form.forgot)}</a>
        </div>

        <button class="sform__submit" type="submit">${esc(form.submit)}</button>
      </form>
    </div>
  </section>`;
}

function initForm() {
  const el = q<HTMLFormElement>('#signin-form')!;
  const email = q<HTMLInputElement>('#signin-email')!;
  const password = q<HTMLInputElement>('#signin-password')!;
  const show = q<HTMLButtonElement>('.sfield__show')!;
  const submit = q<HTMLButtonElement>('.sform__submit')!;

  const checks = {
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : errors.email),
    password: () => (password.value.length >= PASSWORD_MIN ? '' : errors.password),
  };
  const inputs = { email, password };
  let tried = false;

  const setError = (name: keyof typeof checks, message: string) => {
    const field = q(`[data-field="${name}"]`, el)!;
    q('.sfield__error', field)!.textContent = message;
    field.classList.toggle('is-invalid', !!message);
    inputs[name].setAttribute('aria-invalid', String(!!message));
  };
  const validate = (name: keyof typeof checks) => {
    const message = checks[name]();
    setError(name, message);
    return !message;
  };

  // After a first attempt, each field re-checks as it's corrected, so its error clears as soon as it's right.
  (Object.keys(inputs) as (keyof typeof checks)[]).forEach((name) =>
    inputs[name].addEventListener('input', () => tried && validate(name)),
  );

  show.addEventListener('click', () => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    show.textContent = visible ? form.password.hide : form.password.show;
    show.setAttribute('aria-pressed', String(visible));
    password.focus();
  });

  el.addEventListener('submit', (e) => {
    tried = true;
    const ok = [validate('email'), validate('password')].every(Boolean);
    if (!ok) {
      e.preventDefault();
      (checks.email() ? email : password).focus();
      return;
    }
    // Valid: the browser posts the form to the app.
    const label = submit.textContent;
    submit.disabled = true;
    submit.textContent = form.submitting;
    // Back from the app (the back/forward cache restores this page as it was left): ready to sign in again.
    window.addEventListener(
      'pageshow',
      (ev) => {
        if (!ev.persisted) return;
        submit.disabled = false;
        submit.textContent = label;
      },
      { once: true },
    );
  });
}

const narrow = window.matchMedia('(max-width: 900px)');

boot({
  page: 'signin',
  render,
  init: ({ reduce, revealed }) => {
    initClouds(q('.signin')!, q<HTMLCanvasElement>('.signin__sky')!, 'signin--sky', reduce, SKY_HERO, {
      // Figma runs Moving blobs over the whole frame at full strength, after the sky's white fade.
      bubbles: { params: HERO_BUBBLES, intensity: 1 },
      // Figma's fade: clear at 18.7% across to #FEFEFE at 54.4%; on narrow screens, top to bottom instead.
      fade: () => (narrow.matches ? { from: 0.26, to: 0.46, axis: 'y' } : { from: 0.18715, to: 0.54444, axis: 'x' }),
    });
    initForm();
    if (reduce) return;

    const intro = qa('.signin__logo, .signin__headline span, .signin__lede');
    const fields = qa('.sform > *');
    gsap.set([...intro, ...fields], { autoAlpha: 0, y: 30 });
    revealed.then(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out', duration: 1.1 } })
        .to(intro, { autoAlpha: 1, y: 0, stagger: 0.07 }, 0)
        .to(fields, { autoAlpha: 1, y: 0, stagger: 0.05 }, 0.15);
    });
  },
});
