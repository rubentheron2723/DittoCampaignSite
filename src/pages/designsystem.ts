import '../styles/base.css';
import '../styles/designsystem.css';

import {
  blurs,
  breakpoints,
  colours,
  colourModes,
  shaderModes,
  gapScale,
  gradients,
  motion,
  radii,
  shadows,
  skyRamp,
  spacing,
  typeFacts,
  type Token,
} from '../content/design-system';
import { gsap, SplitText } from '../animations/gsap';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import { liftCover, markCoverGone } from '../shared/cover';
import { HERO_BUBBLES, HERO_BUBBLES_DARK, initClouds, SKY_HERO, SKY_HERO_DARK } from '../shared/cta-clouds';
import { FOOTER_BLOBS, FOOTER_BLOBS_DARK } from '../shared/footer-blobs';
import { navLogoSvg } from '../shared/nav-logo';
import { APP_ICONS, FILE_ICONS, icon, ICONS, type IconName } from '../shared/icons';
import { esc } from '../shared/mark';
import { renderEditor, renderSpecimen } from '../shared/type-editor';
import { initTypePreview, TYPE_FIELDS, TYPE_ROLES, typeVar } from '../shared/type-overrides';

/**
 * /designsystem: the campaign site's foundations (tokens, type, icons, brand marks), drawn from the same sources the
 * site uses, with an export for Claude Design. /designsystem?type-editor opens the type editor (formerly /type);
 * /designsystem?specimen is the specimen sheet the editor previews.
 */


/** Escaped for an HTML attribute (values here hold quotes: SVG markup, font names). */
const attr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- Sections and navigation ---------- */

const SECTIONS = [
  { id: 'overview', label: 'Overview', group: 'Start' },
  { id: 'colour', label: 'Colour', group: 'Tokens' },
  { id: 'modes', label: 'Light and dark', group: 'Tokens' },
  { id: 'gradients', label: 'Gradients', group: 'Tokens' },
  { id: 'typography', label: 'Typography', group: 'Tokens' },
  { id: 'spacing', label: 'Spacing and layout', group: 'Tokens' },
  { id: 'radius', label: 'Radius', group: 'Tokens' },
  { id: 'elevation', label: 'Elevation', group: 'Tokens' },
  { id: 'blur', label: 'Glass and blur', group: 'Tokens' },
  { id: 'motion', label: 'Motion', group: 'Tokens' },
  { id: 'icons', label: 'Icons', group: 'Assets' },
  { id: 'brand', label: 'Brand marks', group: 'Assets' },
  { id: 'export', label: 'Use with Claude Design', group: 'Export' },
] as const;

function nav() {
  const groups = [...new Set(SECTIONS.map((s) => s.group))];
  return `
  <nav class="ds-nav" aria-label="Design system">
    <a class="ds-nav__brand" href="/" aria-label="Ditto home"><img src="/brand/ditto-wordmark-black.svg" alt="Ditto" width="76" height="19" /></a>
    <p class="ds-nav__title">Design system</p>
    <div class="ds-nav__groups">
      ${groups
        .map(
          (g) => `
        <div class="ds-nav__group">
          <p class="ds-nav__label">${g}</p>
          ${SECTIONS.filter((s) => s.group === g)
            .map((s) => `<a class="ds-nav__link" href="#${s.id}" data-nav="${s.id}">${s.label}</a>`)
            .join('')}
        </div>`,
        )
        .join('')}
      <div class="ds-nav__group">
        <p class="ds-nav__label">Tools</p>
        <a class="ds-nav__link" href="/designsystem?type-editor">Type editor</a>
      </div>
    </div>
  </nav>`;
}

const section = (id: string, title: string, intro: string, body: string) => `
  <section class="ds-section" id="${id}" aria-labelledby="${id}-title">
    <header class="ds-section__head">
      <h2 class="ds-section__title" id="${id}-title">${title}</h2>
      <p class="ds-section__intro">${intro}</p>
    </header>
    ${body}
  </section>`;

/** A value shown as code, with the site's own variable when it has one. */
const meta = (t: Token) => `
  <span class="ds-meta">
    <code class="ds-code">${esc(t.value)}</code>
    <code class="ds-code ds-code--token">${esc(t.css ?? t.token)}</code>
  </span>`;

/* ---------- Tokens ---------- */

function colourSection() {
  const groups = colours
    .map(
      (g) => `
    <div class="ds-block">
      <h3 class="ds-block__title">${g.title}</h3>
      ${g.note ? `<p class="ds-block__note">${g.note}</p>` : ''}
      <div class="ds-grid ds-grid--swatches">
        ${g.tokens
          .map(
            (t) => `
          <button type="button" class="ds-card ds-swatch" data-copy="${attr(t.value)}">
            <span class="ds-swatch__chip"><span style="background:${t.value}"></span></span>
            <span class="ds-card__name">${t.name}</span>
            ${meta(t)}
            <span class="ds-card__uses">${t.uses}</span>
          </button>`,
          )
          .join('')}
      </div>
    </div>`,
    )
    .join('');
  const ramp = `
    <div class="ds-block">
      <h3 class="ds-block__title">Sky ramp</h3>
      <p class="ds-block__note">The stops of the hero sky, Ditto Blue to white. Use them in this order for anything sky-like.</p>
      <div class="ds-ramp">
        ${skyRamp
          .map(
            (t) => `<button type="button" class="ds-ramp__stop" data-copy="${t.value}" style="background:${t.value}"><span>${t.value}</span><em>${t.name}</em></button>`,
          )
          .join('')}
      </div>
    </div>`;
  return section('colour', 'Colour', 'Every colour the site uses, by role. Click a swatch to copy its value.', groups + ramp);
}

/** Light and dark: each semantic token's two values (read from tokens.css once rendered), the shader changes, and a
 *  live preview of a hero and a content section in each mode. */
function modesSection() {
  const groups = colourModes
    .map(
      (g) => `
    <div class="ds-block">
      <h3 class="ds-block__title">${g.title}</h3>
      ${g.note ? `<p class="ds-block__note">${g.note}</p>` : ''}
      <div class="ds-modes">
        <div class="ds-modes__head"><span>Token</span><span>Light</span><span>Dark</span></div>
        ${g.tokens
          .map(
            (t) => `
          <div class="ds-modes__row">
            <div class="ds-modes__name"><b>${t.name}</b><code class="ds-code ds-code--token">${t.token}</code><span>${t.uses}</span></div>
            <button type="button" class="ds-modes__value" data-mode-token="${t.token}" data-mode="light"><i></i><code class="ds-code"></code></button>
            <button type="button" class="ds-modes__value" data-mode-token="${t.token}" data-mode="dark"><i></i><code class="ds-code"></code></button>
          </div>`,
          )
          .join('')}
      </div>
    </div>`,
    )
    .join('');
  const shaders = `
    <div class="ds-block">
      <h3 class="ds-block__title">Shaders</h3>
      <p class="ds-block__note">The cloud sky and the moving blobs keep their shape in dark mode; their colours and the blobs’ mode change. Settings: <code>SKY_HERO_DARK</code>, <code>HERO_BUBBLES_DARK</code> and <code>FOOTER_BLOBS_DARK</code>.</p>
      <div class="ds-table ds-table--modes">
        <div class="ds-table__row ds-table__row--head"><b>Shader</b><b>Setting</b><b>Light</b><b>Dark</b></div>
        ${shaderModes.map((r) => `<div class="ds-table__row"><b>${r.shader}</b><span>${r.setting}</span><span>${r.light}</span><span>${r.dark}</span></div>`).join('')}
      </div>
    </div>`;
  const preview = (mode: 'light' | 'dark') => `
    <figure class="ds-mode" data-theme="${mode}">
      <div class="ds-mode__hero" data-hero="${mode}">
        <canvas class="ds-mode__sky"></canvas>
        <span class="ds-mode__glow"></span>
        <span class="ds-mode__fade"></span>
        <div class="ds-mode__nav">${navLogoSvg('ds-mode__logo')}<span>Product · Pricing · FAQ</span><span class="ds-mode__cta">Book a demo</span></div>
        <div class="ds-mode__copy">
          <p class="ds-mode__title">Recruitment software FAQs.</p>
          <p class="ds-mode__sub">Your questions, answered clearly.</p>
          <span class="ds-mode__field">${icon('search', { size: 16 })}Search questions</span>
        </div>
      </div>
      <div class="ds-mode__section" data-section="${mode}">
        <canvas class="ds-mode__blobs"></canvas>
        <div class="ds-mode__bar">${navLogoSvg('ds-mode__logo')}<span>Nav over a section</span></div>
        <div class="ds-mode__body">
          <div class="ds-mode__tabs">
            <span class="ds-mode__tab is-on">Active</span>
            <span class="ds-mode__tab is-hover">Hover</span>
            <span class="ds-mode__tab is-focus">Focus</span>
            <span class="ds-mode__tab">Default</span>
          </div>
          <div class="ds-mode__text">
            <p class="ds-mode__h">Getting started with Ditto</p>
            <p class="ds-mode__q">How long does implementation take?</p>
            <p class="ds-mode__a">Implementation is planned around your preferred start date, with clear milestones so everyone knows what happens when.</p>
          </div>
        </div>
      </div>
      <figcaption>${mode === 'light' ? 'Light (today’s site)' : 'Dark'}</figcaption>
    </figure>`;
  return section(
    'modes',
    'Light and dark',
    'Semantic colour tokens with a light and a dark value, from <code>src/styles/tokens.css</code>. Light is the site today; dark is from the Figma frames. Put <code>data-theme="dark"</code> on a section (or the page) to switch it. Click a value to copy it.',
    `<div class="ds-modes__preview">${preview('light')}${preview('dark')}</div>` + groups + shaders,
  );
}

function gradientSection() {
  const tiles = gradients
    .map(
      (t) => `
    <button type="button" class="ds-card ds-gradient" data-copy="${attr(t.value)}">
      <span class="ds-gradient__fill" style="background:${t.value}"></span>
      <span class="ds-card__name">${t.name}</span>
      <code class="ds-code ds-code--token">${esc(t.css ?? t.token)}</code>
      <span class="ds-card__uses">${t.uses}</span>
      <code class="ds-code ds-code--block">${esc(t.value)}</code>
    </button>`,
    )
    .join('');
  return section(
    'gradients',
    'Gradients',
    'Blue always runs from Ditto Blue to Sky Blue. Glass is white fading to clear, with a soft float shadow.',
    `<div class="ds-grid ds-grid--gradients">${tiles}</div>`,
  );
}

function typeSection() {
  const facts = `
    <ul class="ds-facts">
      <li><b>Family</b>${typeFacts.family}</li>
      <li><b>Optical size</b>${typeFacts.opsz}</li>
      <li><b>Weights</b>${typeFacts.weights}</li>
      <li><b>Fluid sizes</b>${typeFacts.fluid}</li>
      <li><b>Case</b>${typeFacts.case}</li>
    </ul>`;
  const rows = TYPE_ROLES.map(
    (r) => `
    <article class="ds-type" data-role="${r.key}">
      <div class="ds-type__meta">
        <b>${esc(r.label)}</b>
        <span class="ds-type__spec" data-spec="${r.key}"></span>
        <span class="ds-type__uses">${esc(r.uses)}</span>
        <code class="ds-code ds-code--token">--t-${r.key}-size</code>
      </div>
      <p class="ds-type__sample" style="font-size: var(--t-${r.key}-size); line-height: var(--t-${r.key}-lh); letter-spacing: var(--t-${r.key}-ls); font-weight: var(--t-${r.key}-wt);">${esc(r.sample)}</p>
    </article>`,
  ).join('');
  return section(
    'typography',
    'Typography',
    'Read live from <code>src/styles/type.css</code>, so this is always what the site uses. Samples show the size at this window’s width. <a href="/designsystem?type-editor">Open the type editor</a> to tune them.',
    facts + `<div class="ds-types">${rows}</div>`,
  );
}

function spacingSection() {
  const cards = spacing
    .map(
      (t) => `
    <button type="button" class="ds-card ds-space" data-copy="${attr(t.value)}">
      <span class="ds-card__name">${t.name}</span>
      ${meta(t)}
      <span class="ds-space__now" data-measure="${attr(t.value)}"></span>
      <span class="ds-card__uses">${t.uses}</span>
    </button>`,
    )
    .join('');
  const gaps = `
    <div class="ds-block">
      <h3 class="ds-block__title">Gap scale</h3>
      <p class="ds-block__note">The gaps the layouts use. 12, 20 and 40 are the most common.</p>
      <div class="ds-gaps">
        ${gapScale.map((g) => `<div class="ds-gap"><span style="width:${g}px"></span><em>${g}</em></div>`).join('')}
      </div>
    </div>`;
  const bps = `
    <div class="ds-block">
      <h3 class="ds-block__title">Breakpoints</h3>
      <div class="ds-table">
        ${breakpoints.map((t) => `<div class="ds-table__row"><b>${t.name}</b><code class="ds-code">${esc(t.value)}</code><span>${t.uses}</span></div>`).join('')}
      </div>
    </div>`;
  return section(
    'spacing',
    'Spacing and layout',
    'Spacing is fluid: most values scale with the window between a phone (375) and a desktop (1440) size. “Now” is the value at this window’s width.',
    `<div class="ds-grid ds-grid--cards">${cards}</div>` + gaps + bps,
  );
}

function radiusSection() {
  const cards = radii
    .map(
      (t) => `
    <button type="button" class="ds-card ds-radius" data-copy="${attr(t.value)}">
      <span class="ds-radius__shape" style="border-radius:${t.value}"></span>
      <span class="ds-card__name">${t.name}</span>
      ${meta(t)}
      <span class="ds-card__uses">${t.uses}</span>
    </button>`,
    )
    .join('');
  return section('radius', 'Radius', 'Pills are the default shape: buttons, chips, inputs and the nav are all fully round.', `<div class="ds-grid ds-grid--cards">${cards}</div>`);
}

function elevationSection() {
  const cards = shadows
    .map(
      (t) => `
    <button type="button" class="ds-card ds-shadow" data-copy="${attr(t.value)}">
      <span class="ds-shadow__stage"><span style="box-shadow:${t.value}"></span></span>
      <span class="ds-card__name">${t.name}</span>
      <code class="ds-code ds-code--token">${t.token}</code>
      <span class="ds-card__uses">${t.uses}</span>
      <code class="ds-code ds-code--block">${esc(t.value)}</code>
    </button>`,
    )
    .join('');
  return section(
    'elevation',
    'Elevation',
    'Shadows are wide and soft (50 to 100px blur, low opacity): things float rather than sit. Blue buttons cast a blue glow.',
    `<div class="ds-grid ds-grid--cards">${cards}</div>`,
  );
}

function blurSection() {
  const cards = blurs
    .map(
      (t) => `
    <button type="button" class="ds-card ds-blur" data-copy="${attr(t.value)}">
      <span class="ds-blur__stage"><i></i><i></i><span style="backdrop-filter:${t.value};-webkit-backdrop-filter:${t.value}">Glass</span></span>
      <span class="ds-card__name">${t.name}</span>
      ${meta(t)}
      <span class="ds-card__uses">${t.uses}</span>
    </button>`,
    )
    .join('');
  return section('blur', 'Glass and blur', 'Glass is a white 60% to clear gradient over a backdrop blur, always with the float shadow.', `<div class="ds-grid ds-grid--cards">${cards}</div>`);
}

/** GSAP's eases as CSS curves, for the demos (expo.out and power3.out). */
const CURVES: Record<string, string> = {
  'expo.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'power3.out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
};

function motionSection() {
  const eases = motion.filter((t) => !t.token.startsWith('--dur'));
  const durs = motion.filter((t) => t.token.startsWith('--dur'));
  const easeCards = eases
    .map(
      (t) => `
    <button type="button" class="ds-card ds-ease" data-play="${attr(CURVES[t.value] ?? t.value)}" aria-label="Play ${t.name}">
      <span class="ds-ease__track"><span class="ds-ease__dot"></span></span>
      <span class="ds-card__name">${t.name}</span>
      ${meta(t)}
      <span class="ds-card__uses">${t.uses}</span>
    </button>`,
    )
    .join('');
  const durRows = durs.map((t) => `<div class="ds-table__row"><b>${t.name}</b><code class="ds-code">${t.value}</code><span>${t.uses}</span></div>`).join('');
  const reveal = `
    <div class="ds-block">
      <h3 class="ds-block__title">Headline reveal</h3>
      <p class="ds-block__note">Every section headline enters like this: split into lines and words, each word rising 110% out of its line’s mask and fading in, 0.04s apart, over 1.05s on expo.out. Body copy fades up 36px over 1s.</p>
      <div class="ds-reveal">
        <p class="ds-reveal__line">Recruitment. Running at scale.</p>
        <button type="button" class="ds-btn ds-btn--glass" data-replay>Replay</button>
      </div>
    </div>`;
  return section(
    'motion',
    'Motion',
    'Motion is calm and confident: fast out, long settle. Click a curve to play it. Reduced motion turns every entrance off.',
    `<div class="ds-grid ds-grid--cards">${easeCards}</div><div class="ds-block"><h3 class="ds-block__title">Durations</h3><div class="ds-table">${durRows}</div></div>` + reveal,
  );
}

/* ---------- Assets ---------- */

function iconSection() {
  const line = (Object.keys(ICONS) as IconName[])
    .map((name) => {
      const def = ICONS[name];
      return `
      <button type="button" class="ds-card ds-icon" data-copy="${attr(icon(name))}" data-copy-label="${attr(def.label)} SVG">
        <span class="ds-icon__stage">${icon(name, { size: def.grid === 16 ? 32 : 40 })}<span class="ds-icon__small">${icon(name)}</span></span>
        <span class="ds-card__name">${def.label}</span>
        <span class="ds-meta"><code class="ds-code ds-code--token">${name}</code><code class="ds-code">${def.grid} grid</code></span>
        <span class="ds-card__uses">${def.uses}</span>
      </button>`;
    })
    .join('');
  const app = APP_ICONS.map(
    (a) => `
    <a class="ds-card ds-icon" href="/product/app/${a.name}.svg" download>
      <span class="ds-icon__stage"><img src="/product/app/${a.name}.svg" alt="" width="32" height="32" /><span class="ds-icon__small"><img src="/product/app/${a.name}.svg" alt="" width="16" height="16" /></span></span>
      <span class="ds-card__name">${a.label}</span>
      <span class="ds-meta"><code class="ds-code ds-code--token">${a.name}.svg</code><code class="ds-code">16 grid</code></span>
      <span class="ds-card__uses">${a.uses}</span>
    </a>`,
  ).join('');
  const files = FILE_ICONS.map(
    (f) => `
    <a class="ds-card ds-icon" href="${f.file}" download>
      <span class="ds-icon__stage"><img src="${f.file}" alt="" width="32" height="32" /><span class="ds-icon__small"><img src="${f.file}" alt="" width="16" height="16" /></span></span>
      <span class="ds-card__name">${f.label}</span>
      <span class="ds-meta"><code class="ds-code ds-code--token">${f.file.split('/').pop()}</code><code class="ds-code">16 grid</code></span>
      <span class="ds-card__uses">${f.uses}</span>
    </a>`,
  ).join('');
  return section(
    'icons',
    'Icons',
    'Line icons are drawn in <code>currentColor</code> so they take the text colour. Click one to copy its SVG; file icons download.',
    `
    <div class="ds-block">
      <h3 class="ds-block__title">Line icons</h3>
      <p class="ds-block__note">24 grid, 2px round strokes (the 16 grid glyphs use 1.4 to 1.6px). Shown large and at their real size.</p>
      <div class="ds-grid ds-grid--icons">${line}</div>
    </div>
    <div class="ds-block">
      <h3 class="ds-block__title">Product demo icons</h3>
      <p class="ds-block__note">Phosphor-style regular glyphs on a 16 grid, filled in Ink. Used in the chat mock on Product.</p>
      <div class="ds-grid ds-grid--icons">${app}${files}</div>
    </div>`,
  );
}

function brandSection() {
  const marks = [
    { file: '/brand/ditto-wordmark-black.svg', name: 'Wordmark, ink', bg: 'light', uses: 'Nav and light backgrounds' },
    { file: '/brand/ditto-wordmark-white.svg', name: 'Wordmark, white', bg: 'blue', uses: 'Over the sky and blue' },
    { file: '/brand/ditto-logomark-blue.svg', name: 'Logomark, blue', bg: 'light', uses: 'Favicon, small spaces on light' },
    { file: '/brand/ditto-logomark-white.svg', name: 'Logomark, white', bg: 'dark', uses: 'On dark and blue' },
  ];
  return section(
    'brand',
    'Brand marks',
    'The wordmark leads; the logomark (the slanted D) is for small spaces and favicons. Click to download the SVG.',
    `<div class="ds-grid ds-grid--brand">${marks
      .map(
        (m) => `
      <a class="ds-card ds-mark" href="${m.file}" download>
        <span class="ds-mark__stage ds-mark__stage--${m.bg}"><img src="${m.file}" alt="${m.name}" /></span>
        <span class="ds-card__name">${m.name}</span>
        <code class="ds-code ds-code--token">${m.file.split('/').pop()}</code>
        <span class="ds-card__uses">${m.uses}</span>
      </a>`,
      )
      .join('')}</div>`,
  );
}

function exportSection() {
  return section(
    'export',
    'Use with Claude Design',
    'Everything on this page, in a form you can paste into Claude Design so what it makes matches the site.',
    `
    <div class="ds-export">
      <div class="ds-export__item">
        <h3 class="ds-block__title">Design brief (Markdown)</h3>
        <p class="ds-block__note">Every token with its value and where it’s used, the type scale, icon SVGs and brand files. Paste it into Claude Design as context.</p>
        <button type="button" class="ds-btn ds-btn--blue" data-export="md">Copy brief</button>
      </div>
      <div class="ds-export__item">
        <h3 class="ds-block__title">CSS tokens</h3>
        <p class="ds-block__note">One <code>:root</code> block with every token as a custom property, type included.</p>
        <button type="button" class="ds-btn ds-btn--glass" data-export="css">Copy CSS</button>
      </div>
      <div class="ds-export__item">
        <h3 class="ds-block__title">Tokens JSON</h3>
        <p class="ds-block__note">The same tokens as a JSON file, for tools that read tokens.</p>
        <button type="button" class="ds-btn ds-btn--glass" data-export="json">Download JSON</button>
      </div>
    </div>`,
  );
}

/* ---------- Export ---------- */

type Role = { key: string; label: string; uses: string; min: string; max: string; lh: string; ls: string; wt: string };

function liveType(): Role[] {
  const cs = getComputedStyle(document.documentElement);
  return TYPE_ROLES.map((r) => {
    const v = Object.fromEntries(TYPE_FIELDS.map((f) => [f, cs.getPropertyValue(typeVar(r.key, f)).trim()]));
    return { key: r.key, label: r.label, uses: r.uses, ...(v as Record<(typeof TYPE_FIELDS)[number], string>) };
  });
}

const allTokens = () => ({
  colour: [...colours.flatMap((g) => g.tokens), ...skyRamp],
  gradient: gradients,
  shadow: shadows,
  radius: radii,
  blur: blurs,
  spacing,
  breakpoint: breakpoints,
  motion,
});

/** Every colour-mode token's value in each mode, read from tokens.css. */
function modeValues() {
  const read = (mode: string) => {
    const el = Object.assign(document.createElement('div'), { hidden: true });
    el.dataset.theme = mode;
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    const out = colourModes.flatMap((g) => g.tokens.map((t) => ({ ...t, group: g.title, value: cs.getPropertyValue(t.token).trim() })));
    el.remove();
    return out;
  };
  const light = read('light');
  const dark = read('dark');
  return light.map((t, i) => ({ ...t, light: t.value, dark: dark[i].value }));
}

function exportCss() {
  const groups = allTokens();
  const lines = Object.entries(groups)
    .filter(([k]) => k !== 'breakpoint')
    .map(([k, ts]) => `  /* ${k} */\n${ts.map((t) => `  ${t.token}: ${t.value};`).join('\n')}`);
  const type = liveType().map(
    (r) => `  --t-${r.key}-min: ${r.min}; --t-${r.key}-max: ${r.max}; --t-${r.key}-lh: ${r.lh}; --t-${r.key}-ls: ${r.ls}; --t-${r.key}-wt: ${r.wt};`,
  );
  return `/* Ditto campaign site design tokens. Sizes in the type block are px at 375 (min) and 1440 (max) wide. */
:root {
${lines.join('\n\n')}

  /* type: DM Sans, opsz 16 */
  --t-family: 'DM Sans';
  --t-opsz: 16;
${type.join('\n')}
}

/* Colour modes: light by default, dark inside [data-theme="dark"]. */
:root, [data-theme='light'] {
${modeValues().map((t) => `  ${t.token}: ${t.light};`).join('\n')}
}
[data-theme='dark'] {
${modeValues().map((t) => `  ${t.token}: ${t.dark};`).join('\n')}
}`;
}

function exportMarkdown() {
  const table = (ts: Token[]) =>
    `| Name | Token | Value | Use |\n|---|---|---|---|\n${ts.map((t) => `| ${t.name} | \`${t.css ?? t.token}\` | \`${t.value}\` | ${t.uses} |`).join('\n')}`;
  const type = liveType();
  const iconsMd = (Object.keys(ICONS) as IconName[])
    .map((n) => `- **${ICONS[n].label}** (\`${n}\`, ${ICONS[n].grid} grid): ${ICONS[n].uses}\n  \`\`\`svg\n  ${icon(n)}\n  \`\`\``)
    .join('\n');
  const origin = window.location.origin;
  return `# Ditto campaign site: design system

Use these exact values so designs match the live site (${origin}).

## Principles
- Light, airy pages on #fdfdfd with a blue sky (Ditto Blue #1e6ef3 to Sky Blue #00b0ff to white) at the top and the closing CTA.
- Text is Ink (#171717), never pure black. Secondary text is Ink at 60%.
- No all-caps text anywhere: labels, kickers, buttons and microcopy are sentence case, with no wide letter spacing.
- Pills are the default shape. Glass (white 60% to clear, backdrop blur, a wide soft shadow) for floating controls.
- Shadows are wide and soft (50–100px blur, low opacity). Blue buttons cast a blue glow.
- Motion: calm and confident. Headlines rise word by word out of a line mask (1.05s, expo.out); copy fades up 36px.

## Colour
${colours.map((g) => `### ${g.title}\n${g.note ? `${g.note}\n\n` : ''}${table(g.tokens)}`).join('\n\n')}

### Sky ramp (in order)
${skyRamp.map((t) => `\`${t.value}\` at ${t.name}`).join(' → ')}

## Colour modes (light and dark)
Light is the site today; dark mode uses the same tokens with these values (switch with data-theme="dark"). In dark mode every section sits on #171717 with white text, and the nav stays light throughout.

| Name | Token | Light | Dark | Use |
|---|---|---|---|---|
${modeValues().map((t) => `| ${t.name} | \`${t.token}\` | \`${t.light}\` | \`${t.dark}\` | ${t.uses} |`).join('\n')}

### Shaders in each mode
| Shader | Setting | Light | Dark |
|---|---|---|---|
${shaderModes.map((r) => `| ${r.shader} | ${r.setting} | ${r.light} | ${r.dark} |`).join('\n')}

## Gradients
${table(gradients)}

## Typography
${typeFacts.family}. ${typeFacts.opsz}. Weights: ${typeFacts.weights}. ${typeFacts.fluid}. ${typeFacts.case}.

| Style | Phone px | Desktop px | Weight | Line height | Letter spacing | Use |
|---|---|---|---|---|---|---|
${type.map((r) => `| ${r.label} | ${r.min} | ${r.max} | ${r.wt} | ${r.lh} | ${r.ls} | ${r.uses} |`).join('\n')}

## Spacing and layout
${table(spacing)}

Gap scale (px): ${gapScale.join(', ')}.

### Breakpoints
${table(breakpoints)}

## Radius
${table(radii)}

## Elevation
${table(shadows)}

## Glass and blur
${table(blurs)}

## Motion
${table(motion)}

## Icons
Line icons use currentColor, 2px round strokes on a 24 grid.
${iconsMd}

Product demo icons (Phosphor-style regular, 16 grid, filled Ink): ${APP_ICONS.map((a) => `${origin}/product/app/${a.name}.svg`).join(', ')}
Scroll chevron: ${origin}/brand/scroll-chev.svg

## Brand marks
- Wordmark, ink: ${origin}/brand/ditto-wordmark-black.svg
- Wordmark, white: ${origin}/brand/ditto-wordmark-white.svg
- Logomark, blue: ${origin}/brand/ditto-logomark-blue.svg
- Logomark, white: ${origin}/brand/ditto-logomark-white.svg
`;
}

function exportJson() {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [group, ts] of Object.entries(allTokens())) {
    out[group] = Object.fromEntries(ts.map((t) => [t.token.replace(/^--/, ''), { value: t.value, name: t.name, ...(t.css ? { css: t.css } : {}), use: t.uses }]));
  }
  out.modes = Object.fromEntries(modeValues().map((t) => [t.token.replace(/^--/, ''), { name: t.name, light: t.light, dark: t.dark, use: t.uses }]));
  out.type = Object.fromEntries(
    liveType().map((r) => [r.key, { family: 'DM Sans', opsz: 16, sizePhone: +r.min, sizeDesktop: +r.max, weight: +r.wt, lineHeight: +r.lh, letterSpacing: r.ls, use: r.uses }]),
  );
  return JSON.stringify(out, null, 2);
}

/* ---------- Page ---------- */

function renderSystem() {
  document.body.classList.add('ds-body');
  initTypePreview();
  const app = document.getElementById('app')!;
  app.innerHTML = `
  <div class="ds">
    ${nav()}
    <main class="ds-main">
      <header class="ds-hero" id="overview">
        <p class="ds-hero__eyebrow">Ditto campaign site</p>
        <h1 class="ds-hero__title">Design system</h1>
        <p class="ds-hero__lead">The foundations the campaign site is built on: colour, type, spacing, shape, elevation, motion, icons and brand marks. Every value here is the one the site uses.</p>
        <div class="ds-hero__actions">
          <a class="ds-btn ds-btn--blue" href="#export">Use with Claude Design</a>
          <a class="ds-btn ds-btn--glass" href="/designsystem?type-editor">Type editor</a>
        </div>
      </header>
      ${colourSection()}
      ${modesSection()}
      ${gradientSection()}
      ${typeSection()}
      ${spacingSection()}
      ${radiusSection()}
      ${elevationSection()}
      ${blurSection()}
      ${motionSection()}
      ${iconSection()}
      ${brandSection()}
      ${exportSection()}
    </main>
  </div>
  <div class="ds-toast" role="status" aria-live="polite"></div>`;

  /* Light and dark values, read from tokens.css through a probe in each mode. */
  const modeProbe = (mode: string) => {
    const el = document.createElement('div');
    el.dataset.theme = mode;
    el.hidden = true;
    document.body.appendChild(el);
    return getComputedStyle(el);
  };
  const modeStyles = { light: modeProbe('light'), dark: modeProbe('dark') };
  app.querySelectorAll<HTMLElement>('[data-mode-token]').forEach((el) => {
    const v = modeStyles[el.dataset.mode as 'light' | 'dark'].getPropertyValue(el.dataset.modeToken!).trim();
    el.dataset.copy = v;
    el.querySelector('code')!.textContent = v;
    const chip = el.querySelector<HTMLElement>('i')!;
    // A shadow is shown on a chip; anything else (a colour or a gradient) fills it.
    if (/^\d/.test(v)) {
      chip.style.boxShadow = v;
      chip.classList.add('is-shadow');
    } else chip.style.background = v;
  });

  /* The previews run the real shaders, light and dark. This page has no entry cover, so lift it for them. */
  liftCover();
  markCoverGone();
  for (const mode of ['light', 'dark'] as const) {
    const hero = app.querySelector<HTMLElement>(`[data-hero="${mode}"]`)!;
    initClouds(hero, hero.querySelector('canvas')!, 'is-sky', false, mode === 'dark' ? SKY_HERO_DARK : SKY_HERO, {
      bubbles: { params: mode === 'dark' ? HERO_BUBBLES_DARK : HERO_BUBBLES, intensity: 0.6 },
    });
    const sec = app.querySelector<HTMLElement>(`[data-section="${mode}"]`)!;
    initBlobBackdrop(sec, sec.querySelector('canvas')!, 'is-fx', mode === 'dark' ? FOOTER_BLOBS_DARK : FOOTER_BLOBS, mode === 'dark' ? [23, 23, 23] : [253, 253, 253], false, 0.55, 30);
  }

  /* Live values: type specs and fluid spacing at this width. */
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;height:0';
  document.body.appendChild(probe);
  const refresh = () => {
    for (const r of liveType()) {
      const el = app.querySelector<HTMLElement>(`[data-spec="${r.key}"]`);
      if (el) el.textContent = `${r.min}–${r.max}px · ${r.wt} · ${r.lh} / ${r.ls}`;
    }
    app.querySelectorAll<HTMLElement>('[data-measure]').forEach((el) => {
      probe.style.width = el.dataset.measure!;
      el.textContent = `Now: ${Math.round(probe.getBoundingClientRect().width)}px`;
    });
  };
  refresh();
  window.addEventListener('resize', refresh);
  document.fonts.ready.then(refresh);

  /* Copying */
  const toast = app.parentElement!.querySelector<HTMLElement>('.ds-toast')!;
  let toastTimer = 0;
  const say = (text: string) => {
    toast.textContent = text;
    toast.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-on'), 1600);
  };
  const copy = (text: string, label: string) =>
    navigator.clipboard?.writeText(text).then(
      () => say(`Copied ${label}`),
      () => say('Couldn’t copy: your browser blocked it'),
    );

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const copyEl = target.closest<HTMLElement>('[data-copy]');
    if (copyEl) {
      const v = copyEl.dataset.copy!;
      copy(v, copyEl.dataset.copyLabel ?? (v.length > 36 ? 'value' : v));
      return;
    }
    const play = target.closest<HTMLElement>('[data-play]');
    if (play) {
      play.querySelector<HTMLElement>('.ds-ease__dot')!.animate([{ left: '0%' }, { left: '100%' }], { duration: 1100, easing: play.dataset.play, fill: 'both' });
      return;
    }
    if (target.closest('[data-replay]')) return replay();
    const exp = target.closest<HTMLElement>('[data-export]')?.dataset.export;
    if (exp === 'md') copy(exportMarkdown(), 'the design brief');
    if (exp === 'css') copy(exportCss(), 'the CSS tokens');
    if (exp === 'json') {
      const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'ditto-design-tokens.json' });
      a.click();
      URL.revokeObjectURL(url);
      say('Downloaded ditto-design-tokens.json');
    }
  });

  /* The headline reveal, exactly as the site's splitReveal does it. */
  const line = app.querySelector<HTMLElement>('.ds-reveal__line')!;
  let split: SplitText | null = null;
  const replay = () => {
    split?.revert();
    split = SplitText.create(line, { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.words, { yPercent: 110, autoAlpha: 0, duration: 1.05, ease: 'expo.out', stagger: 0.04 });
  };
  document.fonts.ready.then(() => {
    const seen = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      seen.disconnect();
      replay();
    });
    seen.observe(line);
  });

  /* Navigation: the current section is marked as you scroll. */
  const links = new Map([...app.querySelectorAll<HTMLAnchorElement>('[data-nav]')].map((a) => [a.dataset.nav!, a]));
  const mark = (id: string) => {
    links.forEach((a, key) => a.classList.toggle('is-on', key === id));
    const on = links.get(id);
    // On phones the nav is a row: keep the current link in view.
    if (on && window.matchMedia('(max-width: 900px)').matches) on.scrollIntoView({ block: 'nearest', inline: 'center' });
  };
  // The current section is the last one whose top has passed a line 30% down the screen.
  const sections = [...app.querySelectorAll<HTMLElement>('#overview, .ds-section')];
  let current = '';
  let queued = false;
  const update = () => {
    queued = false;
    const line = window.innerHeight * 0.3;
    let id = sections[0].id;
    for (const sec of sections) if (sec.getBoundingClientRect().top <= line) id = sec.id;
    // At the very bottom, the last section counts even if it never reaches the line.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) id = sections[sections.length - 1].id;
    if (id !== current) mark((current = id));
  };
  window.addEventListener('scroll', () => queued || ((queued = true), requestAnimationFrame(update)), { passive: true });
  window.addEventListener('resize', update);
  update();

}

/* ---------- Start ---------- */

const params = new URLSearchParams(window.location.search);
if (params.has('specimen')) renderSpecimen();
else if (params.has('type-editor')) renderEditor();
else renderSystem();
