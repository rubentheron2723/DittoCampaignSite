import { appUrl, finalCta, footer, nav, type PageId } from '../content/shared';
import { esc, markSvg } from './mark';

/** Fixed chrome shared by every page: curtain, nav, mobile menu, and (on home) the progress rail. */
export function renderChrome(page: PageId) {
  const chrome = document.getElementById('chrome')!;
  const links = nav
    .map((n) => `<a href="${n.href}" ${n.id === page ? 'aria-current="page" class="is-active"' : ''}>${esc(n.label)}</a>`)
    .join('');

  chrome.innerHTML = `
    <div class="curtain" id="curtain" aria-hidden="true">
      <div class="curtain__panel"></div>
      <div class="curtain__mark" id="curtain-mark">${markSvg('mark--curtain')}</div>
      <p class="curtain__words"><span>Source.</span><span>Engage.</span><span>Place.</span></p>
    </div>

    <header class="nav" id="nav">
      <a class="nav__brand" href="/" aria-label="Ditto home">
        ${markSvg('mark--nav')}
        <span class="nav__wordmark">ditto</span>
      </a>
      <nav class="nav__links" aria-label="Primary">${links}</nav>
      <div class="nav__actions">
        <a class="btn btn--ghost" href="${appUrl}" target="_blank" rel="noreferrer">Sign in</a>
        <a class="btn btn--solid" href="/contact" data-magnetic>Book a demo</a>
        <button class="menu-toggle" id="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu">
          <span></span><span></span>
        </button>
      </div>
    </header>

    <div class="menu" id="menu" aria-hidden="true">
      <div class="menu__bg"></div>
      <nav class="menu__links" aria-label="Mobile">
        <a href="/" ${page === 'home' ? 'aria-current="page"' : ''}><em>00</em>Home</a>
        ${nav.map((n, i) => `<a href="${n.href}" ${n.id === page ? 'aria-current="page"' : ''}><em>0${i + 1}</em>${esc(n.label)}</a>`).join('')}
      </nav>
      <div class="menu__foot">
        <a class="btn btn--light btn--lg" href="/contact">Book a demo</a>
        <a class="btn btn--outline" href="${appUrl}" target="_blank" rel="noreferrer">Sign in</a>
      </div>
    </div>

    ${
      page === 'home'
        ? `<aside class="rail" id="rail" aria-hidden="true">
            <span class="rail__track"><span class="rail__fill"></span></span>
            <ol class="rail__items">
              <li data-act="source"><i></i><b>Source</b></li>
              <li data-act="engage"><i></i><b>Engage</b></li>
              <li data-act="place"><i></i><b>Place</b></li>
            </ol>
          </aside>`
        : ''
    }`;
}

/** Closing band + footer, appended to the end of a page's main content. */
export function ctaAndFooter(opts: { lineOne?: string; lineTwo?: string; copy?: string; button?: string; id?: string } = {}) {
  const c = { ...finalCta, ...opts };
  return `
  <section class="cta" id="${opts.id ?? 'cta'}" data-theme="dark">
    <div class="cta__bg" aria-hidden="true">${markSvg('mark--cta')}</div>
    <div class="cta__inner">
      <h2 class="cta__title">
        <span class="cta__line">${esc(c.lineOne)}</span>
        <span class="cta__line">${esc(c.lineTwo)}</span>
      </h2>
      <p class="cta__copy">${esc(c.copy)}</p>
      <a class="btn btn--light btn--xl" href="/contact" data-magnetic><span>${esc(c.button)}</span></a>
    </div>
    ${footerHtml()}
  </section>`;
}

export function footerHtml() {
  return `
    <footer class="footer">
      <div class="footer__brand">${markSvg('mark--footer')}<span>ditto</span><p>${esc(footer.tagline)}</p></div>
      ${footer.columns
        .map(
          (col) => `<div class="footer__col">
            <p class="footer__title">${esc(col.title)}</p>
            ${col.links.map((l) => `<a href="${l.href}" ${l.href.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${esc(l.label)}</a>`).join('')}
          </div>`,
        )
        .join('')}
      <p class="footer__legal">${esc(footer.legal)}</p>
    </footer>`;
}
