/**
 * The design system's foundations, as used on the campaign site (/designsystem renders this, and its export for
 * Claude Design is built from it).
 *
 * Values are the site's real ones, taken from src/styles: `css` names the custom property where the site already has
 * one; `token` is the name the system gives every value (used in the export). Type isn't listed here: the page reads it
 * live from src/styles/type.css, the single source for text styles.
 */

export type Token = {
  token: string;
  name: string;
  value: string;
  /** The site's own CSS custom property, where there is one. */
  css?: string;
  uses: string;
};

export type ColourGroup = { title: string; note?: string; tokens: Token[] };

export const colours: ColourGroup[] = [
  {
    title: 'Brand blue',
    note: 'Ditto Blue is the primary: every blue gradient runs from it to Sky Blue.',
    tokens: [
      { token: '--ditto-blue', name: 'Ditto Blue', value: '#1e6ef3', uses: 'Primary. Gradient start, buttons, ticks, selected rings, links in the demo' },
      { token: '--sky-blue', name: 'Sky Blue', value: '#00b0ff', css: '--blue', uses: 'Gradient end, accents, the hero sky' },
      { token: '--sky-blue-hover', name: 'Sky Blue hover', value: '#18b5ff', css: '--blue-2', uses: 'Hover on Sky Blue fills' },
      { token: '--blue-deep', name: 'Deep Blue', value: '#0f8ecf', css: '--blue-deep', uses: 'Progress bar start' },
      { token: '--blue-glow', name: 'Blue glow', value: 'rgba(30, 110, 243, 0.2)', uses: 'Selected ring halo, soft blue fills' },
    ],
  },
  {
    title: 'Ink',
    note: 'Text is Ink, never pure black. Secondary text is Ink at 60%.',
    tokens: [
      { token: '--ink', name: 'Ink', value: '#171717', css: '--brand-ink', uses: 'Headlines and body text on light' },
      { token: '--ink-60', name: 'Ink 60', value: 'rgba(23, 23, 23, 0.6)', uses: 'Secondary text, meta, the scroll cue' },
      { token: '--ink-40', name: 'Ink 40', value: 'rgba(23, 23, 23, 0.4)', uses: 'Placeholders, disabled' },
      { token: '--ink-deep', name: 'Ink deep', value: '#0f141d', css: '--ink', uses: 'Text on glass buttons, older components' },
      { token: '--ink-soft', name: 'Ink soft', value: '#4d596b', css: '--ink-soft', uses: 'Muted labels' },
      { token: '--near-black', name: 'Near black', value: '#0a0f15', uses: 'Solid buttons, tooltips' },
    ],
  },
  {
    title: 'Surfaces',
    note: 'Light sections sit on #fdfdfd; #fefefe is the white the sections fade into at their joins.',
    tokens: [
      { token: '--white', name: 'White', value: '#ffffff', css: '--white', uses: 'Cards, inputs, text on blue' },
      { token: '--page', name: 'Page', value: '#fdfdfd', uses: 'Light section background' },
      { token: '--page-join', name: 'Page join', value: '#fefefe', uses: 'Where sections fade into each other and the CTA' },
      { token: '--paper', name: 'Paper', value: '#e7eff4', css: '--paper', uses: 'Text on dark, cool fills' },
      { token: '--paper-2', name: 'Paper 2', value: '#ebf0f6', css: '--paper-2', uses: 'Light button hover' },
      { token: '--black', name: 'Black', value: '#000000', css: '--black', uses: 'Page base, dark sections' },
      { token: '--navy', name: 'Navy', value: '#063149', css: '--navy', uses: 'Dark section tint, solid button hover' },
      { token: '--navy-2', name: 'Navy 2', value: '#073d5a', css: '--navy-2', uses: 'Dark gradient end' },
    ],
  },
  {
    title: 'Lines and glass',
    tokens: [
      { token: '--line-light', name: 'Line on light', value: 'rgba(15, 20, 29, 0.12)', css: '--line-light', uses: 'Dividers and outlines on light' },
      { token: '--line-dark', name: 'Line on dark', value: 'rgba(255, 255, 255, 0.14)', css: '--line-dark', uses: 'Dividers on dark' },
      { token: '--glass-60', name: 'Glass 60', value: 'rgba(255, 255, 255, 0.6)', uses: 'Glass pills and panels' },
      { token: '--glass-10', name: 'Glass 10', value: 'rgba(255, 255, 255, 0.1)', uses: 'Clear glass button, fills on blue' },
    ],
  },
  {
    title: 'Feedback',
    note: 'Two error oranges are in use (Sign in and Contact); #fa5a02 is the newer one.',
    tokens: [
      { token: '--error', name: 'Error', value: '#fa5a02', uses: 'Sign in field errors' },
      { token: '--error-contact', name: 'Error (Contact)', value: '#d4572a', uses: 'Contact form errors and rings' },
    ],
  },
];

/** The hero sky's ramp, Ditto Blue to white (the stops of the sky gradient, in order). */
export const skyRamp: Token[] = [
  ['#1e6ef3', '0%'],
  ['#108ff9', '25%'],
  ['#01b0ff', '50%'],
  ['#11b5ff', '53%'],
  ['#21baff', '56%'],
  ['#41c4ff', '62.5%'],
  ['#60ceff', '69%'],
  ['#80d8ff', '75%'],
  ['#c0ebff', '87.5%'],
  ['#ffffff', '100%'],
].map(([value, at], i) => ({ token: `--sky-${i}`, name: at, value, uses: 'Sky gradient stop' }));

export const gradients: Token[] = [
  {
    token: '--grad-blue',
    name: 'Blue, vertical',
    value: 'linear-gradient(180deg, #1e6ef3 0%, #00b0ff 100%)',
    uses: 'Page heroes and the closing CTA (under their sky)',
  },
  {
    token: '--grad-blue-button',
    name: 'Blue button',
    value: 'linear-gradient(-80deg, #1e6ef3 0.875%, #00b0ff 100%)',
    uses: 'Primary pill buttons, checked boxes, the FAQ empty icon',
  },
  {
    token: '--grad-sky',
    name: 'Sky',
    value:
      'radial-gradient(134.57% 124.02% at 50% -24.02%, #1e6ef3 0%, #108ff9 25%, #01b0ff 50%, #11b5ff 53.125%, #21baff 56.25%, #41c4ff 62.5%, #60ceff 68.75%, #80d8ff 75%, #c0ebff 87.5%, #fff 100%)',
    uses: 'Hero sky fallback (the live sky is WebGL clouds over it)',
  },
  {
    token: '--grad-glass',
    name: 'Glass',
    value: 'linear-gradient(-80deg, rgba(255, 255, 255, 0.6) 56.239%, rgba(255, 255, 255, 0) 100%)',
    uses: 'Glass pill buttons and the nav pill',
  },
  {
    token: '--grad-card',
    name: 'Feature card',
    value:
      'linear-gradient(246.83deg, #1a7cf5 0%, #0b98fb 12%, #03a9fe 24%, #0b98fb 38%, #1583f6 58%, #1b74f4 80%, #1e6ef3 100%)',
    uses: 'Every second Product feature card',
  },
  {
    token: '--grad-dark',
    name: 'Dark',
    value: 'linear-gradient(135deg, #000000 0%, #052a40 55%, #073d5a 100%)',
    css: '--dark-grad',
    uses: 'Dark page heroes',
  },
];

export const shadows: Token[] = [
  { token: '--shadow-float', name: 'Float', value: '0 8px 100px rgba(0, 0, 0, 0.25)', uses: 'Glass buttons, the nav pill, floating chips' },
  { token: '--shadow-soft', name: 'Soft', value: '0 8px 100px rgba(0, 0, 0, 0.1)', uses: 'Inputs, cards on white' },
  { token: '--shadow-card', name: 'Card', value: '0 1px 50px rgba(0, 0, 0, 0.1)', uses: 'Chat cards and panels' },
  { token: '--shadow-low', name: 'Low', value: '0 8px 40px rgba(0, 0, 0, 0.08)', uses: 'Small cards' },
  { token: '--shadow-blue', name: 'Blue glow', value: '0 8px 40px rgba(30, 110, 243, 0.3)', uses: 'Blue buttons' },
  { token: '--shadow-blue-lg', name: 'Blue glow large', value: '0 8px 100px rgba(30, 110, 243, 0.35)', uses: 'Large blue buttons' },
  { token: '--ring-selected', name: 'Selected ring', value: 'inset 0 0 0 1px #1e6ef3, inset 0 0 0 7px rgba(30, 110, 243, 0.2)', uses: 'Selected plan cards and options' },
  { token: '--shadow-knob', name: 'Knob', value: '0 2px 5px rgba(0, 0, 0, 0.18)', uses: 'Slider knob, toggles' },
];

export const radii: Token[] = [
  { token: '--radius-pill', name: 'Pill', value: '999px', uses: 'Buttons, chips, inputs, the nav (the default shape)' },
  { token: '--radius-xl', name: 'XL', value: '36px', uses: 'Large panels' },
  { token: '--radius-lg', name: 'Large', value: '24px', uses: 'Cards and chat panels' },
  { token: '--radius-bubble', name: 'Chat bubble', value: '18px 18px 4px 18px', uses: 'The recruiter’s message bubble' },
  { token: '--radius-md', name: 'Medium', value: '16px', uses: 'Inner cards, dialogs' },
  { token: '--radius-sm', name: 'Small', value: '12px', uses: 'Small tiles' },
  { token: '--radius-xs', name: 'XS', value: '6px', uses: 'Checkboxes, tags' },
  { token: '--radius-circle', name: 'Circle', value: '50%', uses: 'Avatars, icon buttons, knobs' },
];

export const blurs: Token[] = [
  { token: '--blur-glass', name: 'Glass', value: 'blur(36px) saturate(1.4)', uses: 'Nav pill and glass panels' },
  { token: '--blur-md', name: 'Medium', value: 'blur(14px)', uses: 'Overlays' },
  { token: '--blur-sm', name: 'Small', value: 'blur(4px)', uses: 'Light frosting' },
];

export const spacing: Token[] = [
  { token: '--gutter', name: 'Page gutter', value: 'clamp(20px, 5.556vw, 80px)', uses: 'Left and right page padding (20 at 375 wide, 80 at 1440)' },
  { token: '--section-y', name: 'Section padding', value: 'clamp(96px, 10vw, 160px)', uses: 'Top and bottom of standard sections' },
  { token: '--section-y-sm', name: 'Section padding, compact', value: 'clamp(80px, 8.333vw, 120px)', uses: 'Shorter sections, hero insets' },
  { token: '--nav-h', name: 'Nav height', value: '72px', css: '--nav-h', uses: 'Fixed nav; offsets under it' },
  { token: '--content-max', name: 'Content width', value: '1280px', uses: 'Max width of section content' },
  { token: '--content-wide', name: 'Wide content', value: '1440px', uses: 'Full-bleed rows' },
];

/** Gaps the layouts use, smallest to largest (px). */
export const gapScale = [4, 8, 12, 16, 20, 24, 28, 40, 80];

export const breakpoints: Token[] = [
  { token: '--bp-phone', name: 'Phone and tablet', value: '(max-width: 900px)', uses: 'Main switch: stacked layouts, the menu, native scroll' },
  { token: '--bp-small', name: 'Small phone', value: '(max-width: 760px)', uses: 'Tighter grids' },
  { token: '--bp-laptop', name: 'Laptop', value: '(max-width: 1100px)', uses: 'Narrower desktop rows' },
  { token: '--bp-touch', name: 'Touch', value: '(pointer: coarse)', uses: 'Targets at least 44px tall' },
];

export const motion: Token[] = [
  { token: '--ease-out', name: 'Ease out', value: 'cubic-bezier(0.22, 1, 0.36, 1)', css: '--ease-out', uses: 'CSS transitions: hovers, fades, toggles' },
  { token: '--ease-reveal', name: 'Reveal (GSAP)', value: 'expo.out', uses: 'Every entrance: text rising, cards flying in' },
  { token: '--ease-default', name: 'Default (GSAP)', value: 'power3.out', uses: 'GSAP default for small moves' },
  { token: '--dur-fast', name: 'Fast', value: '0.25s', uses: 'Hover colour and shadow' },
  { token: '--dur-base', name: 'Base', value: '0.35s', uses: 'Toggles, small transforms' },
  { token: '--dur-slow', name: 'Slow', value: '0.6s', uses: 'Panels, fades' },
  { token: '--dur-reveal', name: 'Reveal', value: '1.05s', uses: 'Headline reveal: words rise 110% from a line mask, 0.04s apart' },
  { token: '--dur-stage', name: 'Stage step', value: '2s', uses: 'One step of the About and Product lens stages' },
];

export const typeFacts = {
  family: 'DM Sans (variable, Google Fonts)',
  opsz: 'Optical size fixed at 16 everywhere (font-optical-sizing: none), as in Figma',
  weights: '400 regular, 500 medium, 600 semibold, 700 bold',
  fluid: 'Each style has a phone size (375 wide) and a desktop size (1440 wide) and scales smoothly in between',
};
