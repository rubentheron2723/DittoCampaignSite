import '../styles/base.css';
import '../styles/type-editor.css';

import { esc } from '../shared/mark';
import {
  applyTypeOverrides,
  initTypePreview,
  loadTypeOverrides,
  saveTypeOverrides,
  TYPE_FIELDS,
  TYPE_ROLES,
  typeVar,
  type TypeField,
} from '../shared/type-overrides';

/**
 * /type: a small visual editor for the site's type system (src/styles/type.css).
 *
 * Sliders change the type tokens live in a preview of the specimen sheet or any
 * real page, at desktop or phone width. Tweaks are kept in this browser only
 * (the whole site picks them up, with a "Previewing custom type" pill), and
 * "Export tokens" gives the CSS block to commit to type.css.
 *
 * /type?specimen renders just the specimen sheet; the editor loads it in its frame.
 */

const app = document.getElementById('app')!;

/* ---------- Specimen ---------- */
function roleStyle(key: string) {
  return `font-size: var(--t-${key}-size); line-height: var(--t-${key}-lh); letter-spacing: var(--t-${key}-ls); font-weight: var(--t-${key}-wt);`;
}

function renderSpecimen() {
  document.body.classList.add('specimen-body');
  initTypePreview();
  app.innerHTML = `
  <main class="specimen">
    <p class="specimen__kicker">Ditto type system</p>
    ${TYPE_ROLES.map(
      (r) => `
      <section class="specimen__row${r.key === 'display' || r.key === 'hero' ? ' specimen__row--dark' : ''}">
        <div class="specimen__meta">
          <b>${esc(r.label)}</b>
          <span class="specimen__size" data-role="${r.key}"></span>
          <span>${esc(r.uses)}</span>
        </div>
        <p class="specimen__sample${r.key === 'eyebrow' ? ' specimen__sample--upper' : ''}${r.key === 'number' ? ' specimen__sample--num' : ''}" style="${roleStyle(r.key)}">${esc(r.sample)}</p>
      </section>`,
    ).join('')}
  </main>`;

  // Show each role's live size range; the editor calls this after every change.
  const label = () => {
    const cs = getComputedStyle(document.documentElement);
    app.querySelectorAll<HTMLElement>('.specimen__size').forEach((el) => {
      const k = el.dataset.role!;
      const v = (f: TypeField) => cs.getPropertyValue(typeVar(k, f)).trim();
      el.textContent = `${v('min')}–${v('max')}px · ${v('wt')} · ${v('lh')} / ${v('ls')}`;
    });
  };
  (window as unknown as { refreshSpecimen: () => void }).refreshSpecimen = label;
  label();
}

/* ---------- Editor ---------- */
type Control = { field: TypeField | 'opsz'; label: string; min: number; max: number; step: number; unit?: string };

const CONTROLS: Control[] = [
  { field: 'min', label: 'Size on phone', min: 8, max: 200, step: 1, unit: 'px' },
  { field: 'max', label: 'Size on desktop', min: 8, max: 200, step: 1, unit: 'px' },
  { field: 'wt', label: 'Weight', min: 100, max: 1000, step: 10 },
  { field: 'lh', label: 'Line height', min: 0.7, max: 2.2, step: 0.01 },
  { field: 'ls', label: 'Letter spacing', min: -0.12, max: 0.4, step: 0.005, unit: 'em' },
];

const PAGES = [
  ['Specimen', '/type?specimen'],
  ['Home', '/'],
  ['Product', '/product'],
  ['Pricing', '/pricing'],
  ['About', '/about'],
  ['FAQ', '/faq'],
  ['Contact', '/contact'],
] as const;

function renderEditor() {
  document.body.classList.add('editor-body');

  // Committed values, read straight from type.css before any preview is applied.
  const rootStyle = getComputedStyle(document.documentElement);
  const defaults: Record<string, string> = { '--t-opsz': rootStyle.getPropertyValue('--t-opsz').trim() };
  for (const r of TYPE_ROLES) for (const f of TYPE_FIELDS) defaults[typeVar(r.key, f)] = rootStyle.getPropertyValue(typeVar(r.key, f)).trim();

  let overrides = loadTypeOverrides();
  const value = (name: string) => overrides[name] ?? defaults[name];
  const num = (name: string) => parseFloat(value(name));

  const slider = (name: string, c: Control) => `
    <label class="ctl">
      <span class="ctl__label">${c.label}</span>
      <input class="ctl__range" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${num(name)}" data-var="${name}" data-unit="${c.unit ?? ''}" />
      <input class="ctl__num" type="number" min="${c.min}" max="${c.max}" step="${c.step}" value="${num(name)}" data-var="${name}" data-unit="${c.unit ?? ''}" />
    </label>`;

  app.innerHTML = `
  <div class="editor">
    <aside class="editor__panel">
      <header class="editor__head">
        <h1>Type system</h1>
        <p>Changes preview live and stay in this browser only. Export the tokens when you're happy and send them over to make them the site standard.</p>
        <div class="editor__actions">
          <button type="button" class="ebtn ebtn--primary" data-action="export">Export tokens</button>
          <button type="button" class="ebtn" data-action="reset">Reset all</button>
        </div>
      </header>
      <section class="role role--global">
        <div class="role__head"><b>Global</b><span>Applies to every role</span></div>
        ${slider('--t-opsz', { field: 'opsz', label: 'Optical size', min: 9, max: 40, step: 1 })}
        <p class="role__hint">14 matches Figma. Higher values switch DM Sans to its tighter display cut.</p>
      </section>
      ${TYPE_ROLES.map(
        (r) => `
        <details class="role" data-role="${r.key}">
          <summary class="role__head"><b>${esc(r.label)}</b><span>${esc(r.uses)}</span><i class="role__dot" hidden></i></summary>
          ${CONTROLS.map((c) => slider(typeVar(r.key, c.field as TypeField), c)).join('')}
          <button type="button" class="role__reset" data-reset="${r.key}">Reset ${esc(r.label)}</button>
        </details>`,
      ).join('')}
    </aside>
    <section class="editor__stage">
      <div class="stage__bar">
        <div class="seg-ctl" data-group="page">
          ${PAGES.map(([name, url], i) => `<button type="button" data-url="${url}"${i === 0 ? ' class="is-on"' : ''}>${name}</button>`).join('')}
        </div>
        <div class="seg-ctl" data-group="width">
          <button type="button" data-width="1440" class="is-on">Desktop</button>
          <button type="button" data-width="375">Phone</button>
        </div>
      </div>
      <div class="stage__viewport"><iframe class="stage__frame" title="Preview" src="/type?specimen"></iframe></div>
    </section>
  </div>
  <dialog class="export">
    <h2>Export tokens</h2>
    <p>Send this to Claude, or paste it over the TOKENS block in <code>src/styles/type.css</code>.</p>
    <textarea readonly spellcheck="false"></textarea>
    <div class="editor__actions">
      <button type="button" class="ebtn ebtn--primary" data-action="copy">Copy</button>
      <button type="button" class="ebtn" data-action="close">Close</button>
    </div>
  </dialog>`;

  const frame = app.querySelector<HTMLIFrameElement>('.stage__frame')!;
  const viewport = app.querySelector<HTMLElement>('.stage__viewport')!;
  let frameWidth = 1440;
  let applied: string[] = [];

  /* Preview frame: real pages at true width, scaled to fit the stage. */
  const layoutFrame = () => {
    const scale = Math.min(1, viewport.clientWidth / frameWidth);
    frame.style.width = `${frameWidth}px`;
    frame.style.height = `${viewport.clientHeight / scale}px`;
    frame.style.transform = `scale(${scale})`;
    viewport.classList.toggle('is-phone', frameWidth < 768);
  };
  new ResizeObserver(layoutFrame).observe(viewport);

  let resizeTimer = 0;
  const pushToFrame = () => {
    const doc = frame.contentDocument;
    if (!doc?.documentElement) return;
    applyTypeOverrides(doc, overrides, applied);
    applied = Object.keys(overrides);
    const win = frame.contentWindow as (Window & { refreshSpecimen?: () => void }) | null;
    win?.refreshSpecimen?.();
    // Let pinned sections and split text re-measure once the sliders settle.
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => win?.dispatchEvent(new Event('resize')), 250);
  };
  frame.addEventListener('load', () => {
    applied = [];
    pushToFrame();
  });

  /* Controls */
  const syncInputs = (name: string) => {
    app.querySelectorAll<HTMLInputElement>(`input[data-var="${name}"]`).forEach((el) => (el.value = String(num(name))));
  };
  const markDirty = () => {
    app.querySelectorAll<HTMLElement>('.role[data-role]').forEach((el) => {
      const k = el.dataset.role!;
      el.querySelector<HTMLElement>('.role__dot')!.hidden = !TYPE_FIELDS.some((f) => typeVar(k, f) in overrides);
    });
  };
  const set = (name: string, raw: number, unit: string) => {
    const v = `${+raw.toFixed(4)}${unit}`;
    if (v === defaults[name] || parseFloat(defaults[name]) === raw) delete overrides[name];
    else overrides[name] = v;
    saveTypeOverrides(overrides);
    syncInputs(name);
    markDirty();
    pushToFrame();
  };

  app.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (!el.dataset.var || el.value === '') return;
    set(el.dataset.var, parseFloat(el.value), el.dataset.unit ?? '');
  });

  const resetVars = (names: string[]) => {
    for (const n of names) delete overrides[n];
    saveTypeOverrides(overrides);
    names.forEach(syncInputs);
    markDirty();
    pushToFrame();
  };

  const dialog = app.querySelector<HTMLDialogElement>('.export')!;
  const textarea = dialog.querySelector('textarea')!;

  app.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!btn) return;
    const group = btn.parentElement?.dataset.group;
    if (group) {
      btn.parentElement!.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', b === btn));
      if (group === 'page') frame.src = btn.dataset.url!;
      if (group === 'width') {
        frameWidth = Number(btn.dataset.width);
        layoutFrame();
        pushToFrame();
      }
      return;
    }
    if (btn.dataset.reset) resetVars(TYPE_FIELDS.map((f) => typeVar(btn.dataset.reset!, f)));
    switch (btn.dataset.action) {
      case 'reset':
        resetVars(Object.keys(defaults));
        break;
      case 'export':
        textarea.value = exportTokens(value);
        dialog.showModal();
        textarea.select();
        break;
      case 'copy':
        navigator.clipboard?.writeText(textarea.value).then(
          () => (btn.textContent = 'Copied'),
          () => textarea.select(),
        );
        break;
      case 'close':
        dialog.close();
        app.querySelector<HTMLButtonElement>('[data-action="copy"]')!.textContent = 'Copy';
        break;
    }
  });

  markDirty();
  layoutFrame();
}

/** The TOKENS block of type.css, with the current values. */
function exportTokens(value: (name: string) => string) {
  const lines = TYPE_ROLES.map(
    (r) => `  ${TYPE_FIELDS.map((f) => `${typeVar(r.key, f)}: ${value(typeVar(r.key, f))};`).join(' ')}`,
  );
  return `/* TOKENS:START */
:root {
  --t-family: 'DM Sans';
  --t-opsz: ${value('--t-opsz')};

${lines.join('\n')}
}
/* TOKENS:END */`;
}

if (new URLSearchParams(window.location.search).has('specimen')) renderSpecimen();
else renderEditor();
