/**
 * The site's icons, in one place: the pages draw them from here and /designsystem shows them from here, so the
 * design system can't drift from what the site uses.
 *
 * Two families:
 * - Line icons drawn inline (`icon()`): a 24 grid with 2px round strokes, or the 16 grid for the small chat glyphs.
 *   They take `currentColor`, so they follow the text colour around them.
 * - The product mock's toolbar icons (`APP_ICONS`): Phosphor-style regular glyphs on a 16 grid, served as files from
 *   /product/app and filled in ink.
 */

export type IconName = keyof typeof ICONS;

type IconDef = {
  label: string;
  /** Grid the paths are drawn on (the viewBox is 0 0 grid grid). */
  grid: 16 | 24;
  /** Where the site uses it. */
  uses: string;
  body: string;
  /** Lets the shape reach past its box (the tick's circle sits right on the edge). */
  overflow?: boolean;
};

const stroke = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"';

export const ICONS = {
  'chevron-down': {
    label: 'Chevron down',
    grid: 24,
    uses: 'Select menus; FAQ answers (turns over when open)',
    body: `<path d="M6 9l6 6 6-6" ${stroke} stroke-linejoin="round"/>`,
  },
  search: {
    label: 'Search',
    grid: 24,
    uses: 'FAQ search field and its empty state',
    body: `<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4 4" ${stroke}/>`,
  },
  close: {
    label: 'Close',
    grid: 24,
    uses: 'Clearing the FAQ search',
    body: `<path d="M6 6l12 12M18 6L6 18" ${stroke}/>`,
  },
  copy: {
    label: 'Copy',
    grid: 16,
    uses: 'Copy button on drafted messages (Product demo)',
    body: `<rect x="5.5" y="5.5" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  },
  tick: {
    label: 'Tick (done)',
    grid: 16,
    uses: 'Finished steps in the Product demo; Ditto Blue circle, white check',
    overflow: true,
    body: `<circle cx="8" cy="8" r="7.75" fill="#1e6ef3"/><path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
} satisfies Record<string, IconDef>;

/** An icon as inline SVG markup, `size` px square (the drawing scales from its grid). */
export function icon(name: IconName, { className, size }: { className?: string; size?: number } = {}) {
  const def: IconDef = ICONS[name];
  const s = size ?? def.grid;
  return `<svg${className ? ` class="${className}"` : ''} viewBox="0 0 ${def.grid} ${def.grid}" width="${s}" height="${s}"${def.overflow ? ' overflow="visible"' : ''} aria-hidden="true" focusable="false">${def.body}</svg>`;
}

/** The Product demo's chat toolbar icons (files in /product/app, 16 × 16). */
export const APP_ICONS = [
  { name: 'new', label: 'New', uses: 'Composer: add' },
  { name: 'write', label: 'Write', uses: 'Composer shortcut' },
  { name: 'learn', label: 'Learn', uses: 'Composer shortcut' },
  { name: 'code', label: 'Code', uses: 'Composer shortcut' },
  { name: 'career', label: 'Career chat', uses: 'Composer shortcut' },
  { name: 'scheduled', label: 'Scheduled', uses: 'Held call slot' },
  { name: 'mic', label: 'Microphone', uses: 'Composer: voice' },
  { name: 'send', label: 'Voice / send', uses: 'Composer: voice mode' },
] as const;

/** Single-file glyphs in /brand. */
export const FILE_ICONS = [
  { file: '/brand/scroll-chev.svg', label: 'Scroll chevron', uses: '"Keep scrolling." cue under held sections; ink at 60%' },
] as const;
