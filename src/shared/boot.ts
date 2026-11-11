import { gsap, prefersReducedMotion, q, qa, ScrollSmoother, ScrollTrigger } from '../animations/gsap';
import { initMagnetic, initTilt } from '../animations/magnetic';
import type { PageId } from '../content/shared';
import { renderChrome } from './chrome';
import { coverAndGo, hideCurtain, playIntro, playReveal } from './curtain';
import { initFooterBlobs } from './footer-blobs';

export type BootContext = {
  reduce: boolean;
  smoother: ScrollSmoother | null;
  /** Resolves when the curtain has lifted enough for entrance animations to start. */
  revealed: Promise<void>;
};

type Options = {
  page: PageId;
  /** Builds the page's main markup. Runs after the chrome is rendered. */
  render: () => void;
  /** Wires up the page's animations. Runs after fonts are ready and the smoother exists. */
  init: (ctx: BootContext) => void;
};

export async function boot({ page, render, init }: Options) {
  const reduce = prefersReducedMotion();
  renderChrome(page);
  render();

  // Curtain first, so the page never flashes unstyled content.
  const revealed = reduce ? Promise.resolve(hideCurtain()) : page === 'home' ? playIntro() : playReveal();

  await document.fonts.ready;

  let smoother: ScrollSmoother | null = null;
  if (!reduce) {
    smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.1,
      effects: true,
      smoothTouch: 0.1,
      normalizeScroll: false,
    });
    smoother.paused(true);
    revealed.then(() => smoother!.paused(false));
  }

  const ctx: BootContext = { reduce, smoother, revealed };
  init(ctx);

  initMenu(ctx);
  initLinks(ctx);
  initMagnetic();
  initTilt();
  initFooterBlobs(reduce);
  // Nav theming last: its triggers depend on pinned sections' final positions.
  initNavTheme();
  ScrollTrigger.refresh();
  return ctx;
}

/* ---------- Nav theming ---------- */
function initNavTheme() {
  const nav = q('#nav')!;
  ScrollTrigger.create({ start: 'top -60', end: 'max', onToggle: (self) => nav.classList.toggle('nav--solid', self.isActive) });

  const lightSections = qa('[data-theme="light"]');
  // Declared before creating triggers: one can fire onToggle immediately (e.g. reloading mid-page).
  let triggers: ScrollTrigger[] = [];
  triggers = lightSections.map((s) =>
    ScrollTrigger.create({
      trigger: s,
      start: 'top 40px',
      end: 'bottom 40px',
      onToggle: () => nav.classList.toggle('nav--on-light', triggers.some((t) => t.isActive)),
    }),
  );
  // Initial state (before any scroll event).
  nav.classList.toggle('nav--on-light', triggers.some((t) => t.isActive));

  // Get out of the way once the footer is (nearly) fully in view. If the footer is taller than the
  // space below the nav, hide it as soon as the footer reaches the nav instead.
  const footer = q('.footer');
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: () => (footer.offsetHeight > window.innerHeight - nav.offsetHeight ? `top ${nav.offsetHeight}px` : 'bottom-=40px bottom'),
      invalidateOnRefresh: true,
      // Enter/leave-back only: the trigger "leaves" at the very end of the page, where the nav must stay hidden.
      onEnter: () => nav.classList.add('nav--hidden'),
      onLeaveBack: () => nav.classList.remove('nav--hidden'),
    });
  }
}

/* ---------- Links: hash scroll + page transitions ---------- */
function initLinks(ctx: BootContext) {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    const samePage = url.pathname.replace(/\.html$/, '') === window.location.pathname.replace(/\.html$/, '');
    if (samePage && url.hash) {
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (ctx.smoother) ctx.smoother.scrollTo(target, true, 'top 0px');
      else target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (samePage && !url.hash) {
      e.preventDefault();
      closeMenu();
      ctx.smoother ? ctx.smoother.scrollTo(0, true) : window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (ctx.reduce) return; // plain navigation
    e.preventDefault();
    coverAndGo(url.pathname + url.hash);
  });
}

/* ---------- Mobile menu ---------- */
let menuTl: gsap.core.Timeline | null = null;
let menuOpen = false;

function initMenu(ctx: BootContext) {
  const toggle = q<HTMLButtonElement>('#menu-toggle')!;
  const menu = q('#menu')!;
  const links = qa('.menu__links a', menu);
  const foot = q('.menu__foot', menu)!;

  gsap.set(menu, { autoAlpha: 0 });
  menuTl = gsap
    .timeline({ paused: true, defaults: { ease: 'expo.out' } })
    .set(menu, { autoAlpha: 1 })
    .fromTo('.menu__bg', { clipPath: 'circle(0% at calc(100% - 40px) 36px)' }, { clipPath: 'circle(150% at calc(100% - 40px) 36px)', duration: 0.9, ease: 'expo.inOut' }, 0)
    .from(links, { yPercent: 110, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.3)
    .from(foot, { y: 20, autoAlpha: 0, duration: 0.6 }, 0.55);
  if (ctx.reduce) menuTl.duration(0.01);

  toggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
}

function openMenu() {
  menuOpen = true;
  document.body.classList.add('menu-open');
  q('#menu-toggle')?.setAttribute('aria-expanded', 'true');
  q('#menu')?.setAttribute('aria-hidden', 'false');
  menuTl?.timeScale(1).play();
}

export function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  document.body.classList.remove('menu-open');
  q('#menu-toggle')?.setAttribute('aria-expanded', 'false');
  q('#menu')?.setAttribute('aria-hidden', 'true');
  menuTl?.timeScale(1.6).reverse();
}
