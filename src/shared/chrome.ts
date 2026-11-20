import { finalCta, footer, nav, signInUrl, type PageId } from '../content/shared';
import { esc, markSvg } from './mark';
import { navLogoSvg } from './nav-logo';
import { artSvg, FOOTER_LOGOMARK, FOOTER_WORDMARK } from './footer-art';
import { INTRO_MARK } from './intro';

/** Fixed chrome shared by every page: curtain, the landing intro, nav and mobile menu. */
export function renderChrome(page: PageId) {
  const chrome = document.getElementById('chrome')!;
  const links = nav
    .map((n) => `<a href="${n.href}" ${n.id === page ? 'aria-current="page" class="is-active"' : ''}>${esc(n.label)}</a>`)
    .join('');

  chrome.innerHTML = `
    <div class="curtain" id="curtain" aria-hidden="true">
      <div class="curtain__panel"></div>
      <div class="curtain__mark" id="curtain-mark">${markSvg('mark--curtain')}</div>
    </div>
    <div class="intro" id="intro" aria-hidden="true">
      <div class="intro__stage">${INTRO_MARK}<div class="intro__white"></div></div>
      <div class="intro__veil"></div>
      <canvas class="intro__clouds"></canvas>
    </div>

    <header class="nav" id="nav">
      <a class="nav__brand" href="/" aria-label="Ditto home">
        ${navLogoSvg('', 'mark--nav')}
      </a>
      <nav class="nav__links" aria-label="Primary">${links}</nav>
      <div class="nav__actions">
        <a class="nav__signin" href="${signInUrl}">Sign in</a>
        <a class="nav__cta" href="/contact" data-magnetic>Book a demo</a>
        <button class="menu-toggle" id="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu">
          <span></span><span></span>
        </button>
      </div>
    </header>

    <!-- Mobile menu slideout (Figma 2433:9): white under the Moving blobs, the pages in 40/44 bold, two glass
         buttons at the foot. The nav's own logo and close button sit over it. -->
    <div class="menu" id="menu" aria-hidden="true">
      <div class="menu__bg"><canvas class="menu__fx" aria-hidden="true"></canvas></div>
      <nav class="menu__links" aria-label="Mobile">
        <a href="/" ${page === 'home' ? 'aria-current="page"' : ''}>Home</a>
        ${nav.map((n) => `<a href="${n.href}" ${n.id === page ? 'aria-current="page"' : ''}>${esc(n.label)}</a>`).join('')}
      </nav>
      <div class="menu__foot">
        <a class="menu__btn" href="/contact">Book a demo</a>
        <a class="menu__btn menu__btn--clear" href="/product">See the product</a>
      </div>
    </div>
`;
}

/** Closing band + footer, appended to the end of a page's main content. */
export function ctaAndFooter(opts: { lineOne?: string; lineTwo?: string; copy?: string; button?: string; id?: string } = {}) {
  const c = { ...finalCta, ...opts };
  return `
  <section class="cta" id="${opts.id ?? 'cta'}" data-theme="light">
    <canvas class="cta__sky" aria-hidden="true"></canvas>
    <div class="cta__shade" aria-hidden="true"></div>
    <div class="cta__inner">
      <h2 class="cta__title">
        <span class="cta__line">${esc(c.lineOne)}</span>
        <span class="cta__line">${esc(c.lineTwo)}</span>
      </h2>
      <p class="cta__copy">${esc(c.copy)}</p>
      <a class="btn btn--glass" href="/contact" data-magnetic><span>${esc(c.button)}</span></a>
    </div>
  </section>
  ${footerHtml()}`;
}

/** Splits a label into per-character spans for the footer's hover wave (see .wave in base.css). */
function waveText(label: string) {
  const chars = Array.from(label)
    .map((ch, i) => `<span style="--i:${i}">${esc(ch)}</span>`)
    .join('');
  return `<span class="wave" aria-hidden="true">${chars}</span>`;
}

/** Blue footer from the Figma design. The canvas runs the Moving blobs effect over the artwork (see footer-blobs.ts). */
export function footerHtml() {
  const columns = footer.columns
    .map(
      (col) => `<div class="footer__col">
        <p class="footer__title">${esc(col.title)}</p>
        ${col.links.map((l) => `<a href="${l.href}" aria-label="${esc(l.label)}" ${l.href.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${waveText(l.label)}</a>`).join('')}
      </div>`,
    )
    .join('');
  return `
    <footer class="footer">
      <canvas class="footer__fx" aria-hidden="true"></canvas>
      <div class="footer__menu">
        <a class="footer__logomark" href="/" aria-label="Ditto home">${artSvg(FOOTER_LOGOMARK, '')}</a>
        ${columns}
      </div>
      ${artSvg(FOOTER_WORDMARK, 'footer__wordmark')}
    </footer>`;
}
