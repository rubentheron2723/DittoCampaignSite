import '../styles/base.css';
import '../styles/sign-in.css';

import { endpoints, errors, form, intro, PASSWORD_MIN, register, reset, routes } from '../content/sign-in';
import { boot } from '../shared/boot';
import { esc } from '../shared/mark';
import { navLogoSvg } from '../shared/nav-logo';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';
import { gsap, q, qa } from '../animations/gsap';

/**
 * Sign in (Figma 2385:1678, with the active and error states in 2385:1037 and 2385:862): the home hero's sky on the
 * left, fading to white under the form on the right. One screen, no nav or footer; the logo leads home.
 *
 * Three views share it, swapped in place and each with its own address: sign in (/sign-in), reset password
 * (/reset-password) and create account (/register). Sign in and register check their fields, then post to the app
 * (content/sign-in.ts). Reset password has no endpoint yet, so its steps (email, then code and new password, then
 * done) run on the page without sending anything.
 */
type View = keyof typeof routes;
const TITLES: Record<View, string> = { signin: 'Ditto | Sign in', reset: 'Ditto | Reset password', register: 'Ditto | Create account' };

/** One labelled glass field; `show` adds the Show / Hide button for a password. */
function field(id: string, name: string, label: string, placeholder: string, type: string, extra = '', show = false) {
  return `<div class="sfield" data-field="${name}">
    <label class="sfield__label" for="${id}">${esc(label)}</label>
    <div class="sfield__box">
      <input class="sfield__input" id="${id}" name="${name}" type="${type}" placeholder="${esc(placeholder)}" aria-describedby="${id}-error" ${extra} />
      ${show ? `<button class="sfield__show" type="button" aria-controls="${id}" aria-pressed="false">${esc(form.password.show)}</button>` : ''}
    </div>
    <p class="sfield__error" id="${id}-error"></p>
  </div>`;
}
const go = (view: View, label: string, cls = 'sform__link') => `<a class="${cls}" href="${routes[view]}" data-go="${view}">${esc(label)}</a>`;

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
      <div class="sview" data-view="signin">
        <form class="sform" id="signin-form" method="post" action="${endpoints.signIn}" novalidate>
          <h2 class="sform__title" tabindex="-1">${esc(form.title)}</h2>
          <p class="sform__sub">${esc(form.subtitle)}</p>
          ${field('signin-email', 'email', form.email.label, form.email.placeholder, 'email', 'inputmode="email" autocomplete="username" required')}
          ${field('signin-password', 'password', form.password.label, form.password.placeholder, 'password', `autocomplete="current-password" required minlength="${PASSWORD_MIN}"`, true)}
          <div class="sform__row">
            <label class="scheck">
              <input class="scheck__input" type="checkbox" name="remember" value="1" />
              <span class="scheck__box" aria-hidden="true"></span>
              <span>${esc(form.remember)}</span>
            </label>
            ${go('reset', form.forgot, 'sform__forgot')}
          </div>
          <button class="sform__submit" type="submit">${esc(form.submit)}</button>
          <p class="sform__alt">${esc(form.newHere)} ${go('register', form.register)}</p>
        </form>
      </div>

      <div class="sview" data-view="reset" hidden>
        <form class="sform" id="reset-request" novalidate>
          <h2 class="sform__title" tabindex="-1">${esc(reset.request.title)}</h2>
          <p class="sform__sub">${esc(reset.request.subtitle)}</p>
          ${field('reset-email', 'email', form.email.label, form.email.placeholder, 'email', 'inputmode="email" autocomplete="username" required')}
          <div class="sform__actions">
            <button class="sform__submit" type="submit">${esc(reset.request.submit)}</button>
            ${go('signin', reset.back, 'sform__ghost')}
          </div>
        </form>
        <form class="sform" id="reset-verify" novalidate hidden>
          <h2 class="sform__title" tabindex="-1">${esc(reset.verify.title)}</h2>
          <p class="sform__sub">${esc(reset.verify.subtitle)} <strong class="sform__email" id="reset-sent-to"></strong></p>
          ${field('reset-code', 'code', reset.verify.code.label, reset.verify.code.placeholder, 'text', 'inputmode="numeric" autocomplete="one-time-code" maxlength="6" required')}
          ${field('reset-password', 'password', reset.verify.password.label, reset.verify.password.placeholder, 'password', `autocomplete="new-password" required minlength="${PASSWORD_MIN}"`, true)}
          ${field('reset-confirm', 'confirm', reset.verify.confirm.label, reset.verify.confirm.placeholder, 'password', 'autocomplete="new-password" required', true)}
          <p class="sform__alt"><button type="button" class="sform__link" id="reset-resend">${esc(reset.verify.resend)}</button><span class="sform__note" id="reset-resent" aria-live="polite"></span></p>
          <div class="sform__actions">
            <button class="sform__submit" type="submit">${esc(reset.verify.submit)}</button>
            ${go('signin', reset.back, 'sform__ghost')}
          </div>
        </form>
        <div class="sform" id="reset-done" hidden>
          <h2 class="sform__title" tabindex="-1">${esc(reset.done.title)}</h2>
          <p class="sform__sub">${esc(reset.done.subtitle)}</p>
          <div class="sform__actions">${go('signin', reset.done.submit, 'sform__submit')}</div>
        </div>
      </div>

      <div class="sview" data-view="register" hidden>
        <form class="sform sform--long" id="register-form" method="post" action="${endpoints.register}" novalidate>
          <h2 class="sform__title" tabindex="-1">${esc(register.title)}</h2>
          <p class="sform__sub">${esc(register.subtitle)}</p>
          <div class="sform__pair">
            ${field('register-first', 'firstName', register.firstName.label, register.firstName.placeholder, 'text', 'autocomplete="given-name" required')}
            ${field('register-last', 'lastName', register.lastName.label, register.lastName.placeholder, 'text', 'autocomplete="family-name" required')}
          </div>
          ${field('register-email', 'email', form.email.label, form.email.placeholder, 'email', 'inputmode="email" autocomplete="email" required')}
          ${field('register-password', 'password', register.password.label, register.password.placeholder, 'password', `autocomplete="new-password" required minlength="${PASSWORD_MIN}"`, true)}
          ${field('register-confirm', 'confirm', register.confirm.label, register.confirm.placeholder, 'password', 'autocomplete="new-password" required', true)}
          <button class="sform__submit" type="submit">${esc(register.submit)}</button>
          <p class="sform__alt">${esc(register.haveAccount)} ${go('signin', register.signIn)}</p>
        </form>
      </div>
    </div>
  </section>`;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A form's checks: each field's own (a message when it's wrong, '' when right). Errors show on a first submit, then
 * each field re-checks as it's corrected. Returns whether it all passed (focusing the first field that didn't).
 */
function checker(el: HTMLElement, checks: Record<string, () => string>) {
  const input = (name: string) => q<HTMLInputElement>(`[data-field="${name}"] .sfield__input`, el)!;
  let tried = false;
  const validate = (name: string) => {
    const message = checks[name]();
    const f = q(`[data-field="${name}"]`, el)!;
    q('.sfield__error', f)!.textContent = message;
    f.classList.toggle('is-invalid', !!message);
    input(name).setAttribute('aria-invalid', String(!!message));
    return !message;
  };
  Object.keys(checks).forEach((name) => input(name).addEventListener('input', () => tried && validate(name)));
  return {
    input,
    all() {
      tried = true;
      const bad = Object.keys(checks).filter((name) => !validate(name));
      if (bad.length) input(bad[0]).focus();
      return !bad.length;
    },
    reset() {
      tried = false;
      Object.keys(checks).forEach((name) => {
        const f = q(`[data-field="${name}"]`, el)!;
        q('.sfield__error', f)!.textContent = '';
        f.classList.remove('is-invalid');
        input(name).removeAttribute('aria-invalid');
      });
    },
  };
}

/** A submit button's busy state, restored if the page comes back from the back/forward cache. */
function busy(button: HTMLButtonElement, label: string) {
  const was = button.textContent;
  button.disabled = true;
  button.textContent = label;
  const restore = () => {
    button.disabled = false;
    button.textContent = was;
  };
  window.addEventListener('pageshow', (ev) => ev.persisted && restore(), { once: true });
  return restore;
}

function initForms(animate: boolean) {
  // Show / Hide on every password field.
  qa<HTMLButtonElement>('.sfield__show').forEach((show) => {
    const input = document.getElementById(show.getAttribute('aria-controls')!) as HTMLInputElement;
    show.addEventListener('click', () => {
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      show.textContent = visible ? form.password.hide : form.password.show;
      show.setAttribute('aria-pressed', String(visible));
      input.focus();
    });
  });

  // Sign in: posts to the app once the email and password look right.
  const signin = q<HTMLFormElement>('#signin-form')!;
  const signinCheck = checker(signin, {
    email: () => (EMAIL.test(signinCheck.input('email').value.trim()) ? '' : errors.email),
    password: () => (signinCheck.input('password').value.length >= PASSWORD_MIN ? '' : errors.password),
  });
  signin.addEventListener('submit', (e) => {
    if (!signinCheck.all()) return void e.preventDefault();
    busy(q<HTMLButtonElement>('.sform__submit', signin)!, form.submitting);
  });

  // Register: posts to the app once every field is right and the passwords match.
  const reg = q<HTMLFormElement>('#register-form')!;
  const regCheck = checker(reg, {
    firstName: () => (regCheck.input('firstName').value.trim() ? '' : errors.firstName),
    lastName: () => (regCheck.input('lastName').value.trim() ? '' : errors.lastName),
    email: () => (EMAIL.test(regCheck.input('email').value.trim()) ? '' : errors.email),
    password: () => (regCheck.input('password').value.length >= PASSWORD_MIN ? '' : errors.password),
    confirm: () => (regCheck.input('confirm').value === regCheck.input('password').value && regCheck.input('confirm').value ? '' : errors.confirm),
  });
  reg.addEventListener('submit', (e) => {
    if (!regCheck.all()) return void e.preventDefault();
    busy(q<HTMLButtonElement>('.sform__submit', reg)!, register.submitting);
  });

  // Reset password, on the page: email, then code and new password, then done.
  const request = q<HTMLFormElement>('#reset-request')!;
  const verify = q<HTMLFormElement>('#reset-verify')!;
  const done = q<HTMLElement>('#reset-done')!;
  const step = (from: HTMLElement, to: HTMLElement) => {
    from.hidden = true;
    to.hidden = false;
    if (animate) gsap.fromTo(qa(':scope > *', to), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.04 });
    q<HTMLElement>('.sform__title', to)?.focus({ preventScroll: true });
  };
  const requestCheck = checker(request, {
    email: () => (EMAIL.test(requestCheck.input('email').value.trim()) ? '' : errors.email),
  });
  request.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!requestCheck.all()) return;
    const restore = busy(q<HTMLButtonElement>('.sform__submit', request)!, reset.request.submitting);
    q('#reset-sent-to')!.textContent = requestCheck.input('email').value.trim();
    gsap.delayedCall(animate ? 0.9 : 0, () => {
      restore();
      step(request, verify);
    });
  });
  const verifyCheck = checker(verify, {
    code: () => (/^\d{6}$/.test(verifyCheck.input('code').value.trim()) ? '' : errors.code),
    password: () => (verifyCheck.input('password').value.length >= PASSWORD_MIN ? '' : errors.password),
    confirm: () => (verifyCheck.input('confirm').value === verifyCheck.input('password').value && verifyCheck.input('confirm').value ? '' : errors.confirm),
  });
  verify.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!verifyCheck.all()) return;
    const restore = busy(q<HTMLButtonElement>('.sform__submit', verify)!, reset.verify.submitting);
    gsap.delayedCall(animate ? 0.9 : 0, () => {
      restore();
      step(verify, done);
    });
  });
  const resent = q('#reset-resent')!;
  q('#reset-resend')!.addEventListener('click', () => {
    resent.textContent = reset.verify.resent;
    gsap.delayedCall(4, () => (resent.textContent = ''));
  });

  /** Back to the reset's first step, cleared (on leaving it, so it starts afresh next time). */
  const resetReset = () => {
    [request, verify].forEach((f) => f.reset());
    requestCheck.reset();
    verifyCheck.reset();
    resent.textContent = '';
    request.hidden = false;
    verify.hidden = true;
    done.hidden = true;
  };
  return resetReset;
}

/** The three views: swapped in place, each with its own address (and back / forward between them). */
function initViews(animate: boolean, onLeaveReset: () => void) {
  const views = qa<HTMLElement>('.sview');
  const viewOf = (path: string): View => {
    const p = path.replace(/\.html$/, '').replace(/\/$/, '');
    return (Object.keys(routes) as View[]).find((v) => routes[v] === p) ?? 'signin';
  };
  let current = viewOf(location.pathname);
  const show = (view: View, focus: boolean) => {
    const from = views.find((v) => v.dataset.view === current)!;
    const to = views.find((v) => v.dataset.view === view)!;
    if (current === 'reset' && view !== 'reset') onLeaveReset();
    current = view;
    document.title = TITLES[view];
    if (from !== to) {
      from.hidden = true;
      to.hidden = false;
    }
    if (animate) gsap.fromTo(qa('.sform:not([hidden]) > *', to), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.04 });
    if (focus) q<HTMLElement>('.sform:not([hidden]) .sform__title', to)?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  };
  // The page opened on its own address: that view (no animation; the page's entrance plays).
  views.forEach((v) => (v.hidden = v.dataset.view !== current));
  document.title = TITLES[current];

  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-go]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      // Ours, not boot's link handler (which would load it as a new page).
      e.preventDefault();
      e.stopPropagation();
      const view = a.dataset.go as View;
      if (view === current && view !== 'reset') return;
      history.pushState({ view }, '', routes[view]);
      show(view, true);
    },
    true,
  );
  window.addEventListener('popstate', () => show(viewOf(location.pathname), true));
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
    const resetReset = initForms(!reduce);
    initViews(!reduce, resetReset);
    if (reduce) return;

    const intro = qa('.signin__logo, .signin__headline span, .signin__lede');
    const fields = qa('.sview:not([hidden]) .sform:not([hidden]) > *');
    gsap.set([...intro, ...fields], { autoAlpha: 0, y: 30 });
    revealed.then(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out', duration: 1.1 } })
        .to(intro, { autoAlpha: 1, y: 0, stagger: 0.07 }, 0)
        .to(fields, { autoAlpha: 1, y: 0, stagger: 0.05 }, 0.15);
    });
  },
});
