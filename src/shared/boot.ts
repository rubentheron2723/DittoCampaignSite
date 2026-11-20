import { gsap, prefersReducedMotion, q, qa, ScrollSmoother, ScrollTrigger } from '../animations/gsap';
import { initMagnetic, initTilt } from '../animations/magnetic';
import type { PageId } from '../content/shared';
import { renderChrome } from './chrome';
import { hideCurtain } from './curtain';
import { coverAndGo, hideIntro, playCloudIntro } from './intro';
import { initFooterBlobs, type BlobParams } from './footer-blobs';
import { initBlobBackdrop } from './blob-backdrop';
import { HERO_BUBBLES, initCtaClouds } from './cta-clouds';
import { initFooterWave } from './wave';
import { initTypePreview } from './type-overrides';
import { initNavFooterMark } from './nav-footer-mark';
import { flagPageTransition, playPageTransition, takePageTransition } from './page-transition';
import { liftCover, markCoverGone } from './cover';

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

  // Always start from the top on load/reload. The browser (and ScrollTrigger) would otherwise
  // restore the old scroll position before the pinned sections add their scroll length, landing
  // somewhere between sections, while the intro curtain assumes the top of the page.
  // Links to a #section still go there: the browser handles those, not restoration.
  ScrollTrigger.clearScrollMemory('manual');
  if (!window.location.hash) window.scrollTo(0, 0);
  initTypePreview();
  renderChrome(page);
  render();

  // Curtain first, so the page never flashes unstyled content. A fresh visit or reload plays the landing intro;
  // arriving from another page of the site plays the page transition instead.
  // Following a link here, or going back or forward to this page, is a move within the site.
  const moved = takePageTransition() || cameBackOrForward();
  const cover = reduce ? Promise.resolve((hideCurtain(), hideIntro())) : moved ? playPageTransition(page) : playCloudIntro();
  // Failsafe: the cover must never stay up. If the animation stalls or throws (a blocked image, a lost WebGL context,
  // a browser shield), the page is shown anyway after a little longer than the animation would take.
  // (The transition takes 1.2 s after its clouds load; the landing intro about 4.9 s after waiting up to 4 s for them.)
  const limit = moved ? 2500 : 9000;
  const revealed = Promise.race([
    cover.catch((err) => console.warn('Entry animation failed:', err)),
    new Promise<void>((r) => window.setTimeout(r, limit)),
  ]);
  if (!reduce) liftCoverIfStuck(limit + 500);
  // The page's animated backgrounds start as the cover lifts, not underneath it (cover.ts).
  revealed.then(liftCover);
  // And fully gone once its animation is over. They mark it themselves; this is only the backstop, well past their end
  // (the transition's motion runs 1.2 s, the landing intro's fade 0.8 s after the reveal) so slow frames, which stretch
  // an animation, don't bring set-up work back into it.
  revealed.then(() => window.setTimeout(markCoverGone, 2500));
  // The intro's white cover is up (or, with reduced motion, the page itself): the body can take its own colour.
  document.documentElement.classList.remove('booting');

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
  blendCtaIntoPrevious();
  initCtaClouds(reduce);
  initFooterBlobs(reduce);
  initFooterWave();
  // Nav theming last: its triggers depend on pinned sections' final positions.
  initNavTheme(!reduce);
  ScrollTrigger.refresh();
  return ctx;
}

/** Hides the entry cover if it's still up a beat after the animation should have finished with it. */
function liftCoverIfStuck(after: number) {
  window.setTimeout(() => {
    const intro = q('#intro');
    if (!intro || getComputedStyle(intro).display === 'none') return;
    // Plain timers and a CSS fade, not GSAP: if the animation stalled because frames aren't running, a tween would
    // stall with it.
    gsap.killTweensOf(intro);
    intro.style.transition = 'opacity 0.4s ease';
    intro.style.opacity = '0';
    window.setTimeout(() => {
      hideIntro();
      intro.style.transition = '';
    }, 450);
  }, after);
}

/** True when this load came from the browser's back or forward buttons. */
function cameBackOrForward() {
  const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return entry?.type === 'back_forward';
}

// Back or forward to a page the browser kept in its back/forward cache: it comes back exactly as it was left, under the
// white cover it faded to on the way out, so uncover it with the page transition (or just lift the cover).
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  takePageTransition(); // a flag from leaving this page belongs to the page we left for
  const page = document.body.dataset.page as PageId | undefined;
  if (prefersReducedMotion() || !page) hideIntro();
  else playPageTransition(page);
});

/* ---------- CTA join ---------- */
/**
 * Removes the edge between the closing CTA and the section above it.
 * - Light sections: the section's own background now ends in the CTA's top
 *   white (#FEFEFE), so it flows straight into the Figma white haze.
 * - Dark sections: the CTA's top fade starts in the section's navy and fades
 *   straight into the sky (and the nav keeps its dark style there).
 */
function blendCtaIntoPrevious() {
  const cta = q('.cta');
  const prev = cta?.previousElementSibling as HTMLElement | null;
  if (!cta || !prev) return;
  const style = getComputedStyle(prev);
  // The last colour of a background gradient is the colour at the bottom edge.
  const colours = style.backgroundImage.match(/rgba?\([^)]*\)/g);
  const colour = colours?.[colours.length - 1] ?? style.backgroundColor;
  const [r, g, b, a = 1] = (colour.match(/[\d.]+/g) ?? []).map(Number);
  if (r === undefined || a === 0) return;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance < 0.5) {
    cta.style.setProperty('--cta-from', `rgb(${r}, ${g}, ${b})`);
    cta.classList.add('cta--from-dark');
    cta.dataset.theme = 'dark';
    return;
  }
  // Swap the gradient's last stop (or the flat colour) for the CTA's white.
  const white = 'rgb(254, 254, 254)';
  if (colours?.length) {
    const img = style.backgroundImage;
    const at = img.lastIndexOf(colours[colours.length - 1]);
    prev.style.backgroundImage = img.slice(0, at) + white + img.slice(at + colours[colours.length - 1].length);
  } else {
    prev.style.backgroundImage = `linear-gradient(${colour}, ${white})`;
  }
}

/* ---------- Nav theming ---------- */
function initNavTheme(animate: boolean) {
  const nav = q('#nav')!;
  ScrollTrigger.create({ start: 'top -60', end: 'max', onToggle: (self) => nav.classList.toggle('nav--solid', self.isActive) });

  // Out of the way while reading: the nav slides up as you scroll down and comes back as soon as you scroll up.
  // Always shown near the top of the page and while the menu is open. A few pixels of slack stop it flickering.
  const SHOW_ABOVE = 120;
  const SLACK = 6;
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      if (y < SHOW_ABOVE || document.body.classList.contains('menu-open')) nav.classList.remove('nav--away');
      else if (y - lastY > SLACK) nav.classList.add('nav--away');
      else if (lastY - y > SLACK) nav.classList.remove('nav--away');
      else return; // within the slack: keep the reference point until the move is clear
      lastY = y;
    },
  });

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
  // With motion, the logomark flies down into the footer's instead (nav-footer-mark.ts).
  const footer = q('.footer');
  if (footer && !(animate && initNavFooterMark())) {
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
  // Fetch a page as soon as a link to it is pointed at or focused, so it's ready by the time it's clicked.
  const fetched = new Set<string>([window.location.pathname]);
  const prefetch = (e: Event) => {
    const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href]');
    if (!a || a.target === '_blank') return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin || fetched.has(url.pathname)) return;
    fetched.add(url.pathname);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.pathname;
    document.head.appendChild(link);
  };
  document.addEventListener('pointerover', prefetch, { passive: true });
  document.addEventListener('focusin', prefetch);
  document.addEventListener('touchstart', prefetch, { passive: true });

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
    flagPageTransition();
    coverAndGo(url.pathname + url.hash);
  });
}

/* ---------- Mobile menu ---------- */
let menuTl: gsap.core.Timeline | null = null;
let menuOpen = false;

/** The menu's Moving blobs: the hero's, with Figma's threshold for this frame (27.5). */
const MENU_BLOBS: BlobParams = { ...HERO_BUBBLES, threshold: 27.5 };
let menuReduce = false;

function initMenu(ctx: BootContext) {
  menuReduce = ctx.reduce;
  const toggle = q<HTMLButtonElement>('#menu-toggle')!;
  const menu = q('#menu')!;
  const links = qa('.menu__links a', menu);
  const foot = q('.menu__foot', menu)!;

  // Closed, it's out of the layout (display: none), so its blobs stop drawing; they start on the first opening.
  gsap.set(menu, { autoAlpha: 0, display: 'none' });
  menuTl = gsap
    .timeline({ paused: true, defaults: { ease: 'expo.out' } })
    .set(menu, { autoAlpha: 1, display: 'flex' })
    .fromTo('.menu__bg', { clipPath: 'circle(0% at calc(100% - 40px) 36px)' }, { clipPath: 'circle(150% at calc(100% - 40px) 36px)', duration: 0.9, ease: 'expo.inOut' }, 0)
    .from(links, { yPercent: 110, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.3)
    .from(foot, { y: 20, autoAlpha: 0, duration: 0.6 }, 0.55);
  // Fully closed: out of the layout again, so the blobs' canvas stops drawing (they only draw while on screen).
  menuTl.eventCallback('onReverseComplete', () => gsap.set(menu, { display: 'none' }));
  if (ctx.reduce) menuTl.duration(0.01);

  toggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
}

let menuFx = false;
function openMenu() {
  if (!menuFx) {
    menuFx = true;
    const menu = q('#menu')!;
    // Shown first, so the canvas has its size when the backdrop measures it.
    gsap.set(menu, { display: 'flex' });
    initBlobBackdrop(menu, q<HTMLCanvasElement>('.menu__fx', menu)!, 'menu--fx', MENU_BLOBS, [255, 255, 255], menuReduce, 0.6);
  }
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
