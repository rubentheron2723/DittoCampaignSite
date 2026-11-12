/**
 * Type system roles and the /type editor's preview overrides.
 *
 * The real values live in src/styles/type.css. The editor stores your
 * unsaved tweaks in this browser's localStorage and applyTypeOverrides()
 * layers them over the defaults on every page, so you can browse the whole
 * site with them. Nobody else sees them until the exported tokens are
 * committed to type.css.
 */

export type TypeRole = { key: string; label: string; uses: string; sample: string };

export const TYPE_ROLES: TypeRole[] = [
  { key: 'hero', label: 'Hero', uses: 'Home page headline', sample: 'Recruitment. Running at scale.' },
  { key: 'display', label: 'Display', uses: 'Page headlines, closing CTA', sample: 'Ready to scale your recruitment business?' },
  { key: 'h1', label: 'Heading 1', uses: 'Section titles, mobile menu', sample: 'Everything recruiters do, in one system.' },
  { key: 'h2', label: 'Heading 2', uses: 'Card and panel titles, FAQ topics', sample: 'Agentic search that cuts screening noise' },
  { key: 'h3', label: 'Heading 3', uses: 'Small headings, FAQ questions, CTA subline', sample: 'Book a guided demo and see why recruiters run on Ditto.' },
  { key: 'subtitle', label: 'Subtitle', uses: 'Hero subheads, intro lines, ticker', sample: 'The operating system behind high-performing recruitment teams.' },
  { key: 'lead', label: 'Lead', uses: 'Intro paragraphs', sample: 'Built to structure sourcing, engagement and placements for teams operating at scale. One system. One flow.' },
  { key: 'body', label: 'Body', uses: 'Paragraphs, answers, form inputs', sample: 'Ditto keeps every candidate, client and conversation in one place, so nothing slips between tools and your team always knows the next step.' },
  { key: 'small', label: 'Small', uses: 'Card copy, notes, stat labels', sample: 'Shortlists update the moment a candidate replies, with the full history attached.' },
  { key: 'label', label: 'Label', uses: 'Nav links, chips, toggles, form labels', sample: 'Product   Pricing   About   FAQ' },
  { key: 'caption', label: 'Caption', uses: 'Meta text, ticks, errors', sample: 'Match 96 · Cape Town · Updated 2m ago' },
  { key: 'eyebrow', label: 'Eyebrow', uses: 'Uppercase kickers and indexes', sample: 'THE RECRUITMENT OPERATING SYSTEM' },
  { key: 'button', label: 'Button', uses: 'Standard buttons', sample: 'Book a demo' },
  { key: 'button-lg', label: 'Button large', uses: 'Big CTA buttons', sample: 'Book a demo' },
  { key: 'number', label: 'Number', uses: 'Stats and prices', sample: '12,480' },
  { key: 'footer', label: 'Footer link', uses: 'Footer menu links', sample: 'Pricing   FAQ   About   Contact' },
];

export const TYPE_FIELDS = ['min', 'max', 'lh', 'ls', 'wt'] as const;
export type TypeField = (typeof TYPE_FIELDS)[number];

const STORAGE_KEY = 'ditto:type-overrides';

/** CSS custom property name for a role field, e.g. --t-h1-min. */
export const typeVar = (role: string, field: TypeField) => `--t-${role}-${field}`;

export function loadTypeOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return {};
    // Sizes must be unitless: an earlier editor saved them as "56px", which breaks the size calc.
    for (const name of Object.keys(parsed)) {
      if (/-(min|max)$/.test(name)) parsed[name] = String(parseFloat(parsed[name]));
    }
    return parsed;
  } catch {
    return {};
  }
}

export function saveTypeOverrides(vars: Record<string, string>) {
  try {
    if (Object.keys(vars).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: the preview just won't persist */
  }
}

export function applyTypeOverrides(doc: Document, vars: Record<string, string>, previous: string[] = []) {
  const style = doc.documentElement.style;
  for (const name of previous) if (!(name in vars)) style.removeProperty(name);
  for (const [name, value] of Object.entries(vars)) if (name.startsWith('--t-')) style.setProperty(name, value);
}

/**
 * On the live site: apply this browser's saved preview, and show a small pill
 * so it's obvious the page is not showing the committed type.
 */
export function initTypePreview() {
  const vars = loadTypeOverrides();
  if (!Object.keys(vars).length) return;
  applyTypeOverrides(document, vars);
  if (window.top !== window) return; // inside the editor's preview frame

  const pill = document.createElement('div');
  pill.className = 'type-preview-pill';
  pill.innerHTML = `<span>Previewing custom type</span><a href="/type">Edit</a><button type="button">Reset</button>`;
  pill.querySelector('button')!.addEventListener('click', () => {
    saveTypeOverrides({});
    window.location.reload();
  });
  document.body.appendChild(pill);
}
