import { gsap, q, qa } from '../animations/gsap';
import { esc } from './mark';

/**
 * A dropdown in the site's style (Figma 2396:478): a pill button that opens a white panel of pill options. It is a
 * listbox, so it works from the keyboard as a native select does:
 *   - on the button: Enter, Space, Up or Down opens it;
 *   - in the list: Up/Down/Home/End move, a letter jumps to the next option starting with it, Enter or Space picks,
 *     Escape closes, Tab picks the highlighted option and moves on.
 * Options show Figma's four states: the chosen one (blue outline), hover (grey), the keyboard's place (a wide pale
 * blue ring, only while the keyboard is in use) and the rest plain.
 *
 * The value lives in a hidden input (`name`), which fires `change` when it changes, so forms read and validate it
 * like any other field.
 */

export type Option = { value: string; label: string; short?: string };

const CHEVRON = `<svg class="select__chev" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let uid = 0;

/**
 * The markup. `labelledBy` is the id of the visible label. `placeholder` shows until something is picked; with
 * `initial` an option starts picked. `variant: 'chip'` is the small glass button used inside the phone field.
 */
export function selectHtml(
  name: string,
  options: Option[],
  opts: { labelledBy: string; placeholder?: string; initial?: string; variant?: 'pill' | 'chip' },
) {
  const id = `sel${uid++}`;
  const picked = options.find((o) => o.value === opts.initial);
  const shown = picked ? (picked.short ?? picked.label) : (opts.placeholder ?? 'Select an option');
  const chip = opts.variant === 'chip';
  return `<div class="select${chip ? ' select--chip' : ''}" data-select>
    <button type="button" class="select__button${chip ? '' : ' pill'}" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-list" aria-labelledby="${opts.labelledBy} ${id}-value">
      <span class="select__value${picked ? '' : ' is-placeholder'}" id="${id}-value">${esc(shown)}</span>${chip ? '' : CHEVRON}
    </button>
    <ul class="select__list" id="${id}-list" role="listbox" tabindex="-1" aria-labelledby="${opts.labelledBy}" hidden>
      ${options
        .map(
          (o, i) =>
            `<li class="select__option${o.value === opts.initial ? ' is-selected' : ''}" id="${id}-o${i}" role="option" aria-selected="${o.value === opts.initial}" data-value="${esc(o.value)}"${o.short ? ` data-short="${esc(o.short)}"` : ''}>${esc(o.label)}</li>`,
        )
        .join('')}
    </ul>
    <input type="hidden" class="select__input" name="${name}" value="${esc(picked?.value ?? '')}" />
  </div>`;
}

/** Wires every dropdown under `root`. */
export function initSelects(root: ParentNode, animate: boolean) {
  const all = qa<HTMLElement>('[data-select]', root as HTMLElement);
  const closers: (() => void)[] = [];

  all.forEach((el) => {
    const button = q<HTMLButtonElement>('.select__button', el)!;
    const list = q<HTMLUListElement>('.select__list', el)!;
    const value = q('.select__value', el)!;
    const input = q<HTMLInputElement>('.select__input', el)!;
    const options = qa<HTMLLIElement>('.select__option', el);
    let active = Math.max(0, options.findIndex((o) => o.classList.contains('is-selected')));
    let open = false;

    const highlight = (i: number) => {
      active = (i + options.length) % options.length;
      options.forEach((o, k) => o.classList.toggle('is-active', k === active));
      list.setAttribute('aria-activedescendant', options[active].id);
      // Keep it in view inside the panel (no page scroll).
      const o = options[active];
      if (o.offsetTop < list.scrollTop) list.scrollTop = o.offsetTop - 16;
      else if (o.offsetTop + o.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = o.offsetTop + o.offsetHeight - list.clientHeight + 16;
    };
    const pick = (i: number) => {
      const o = options[i];
      options.forEach((x) => {
        const on = x === o;
        x.classList.toggle('is-selected', on);
        x.setAttribute('aria-selected', String(on));
      });
      value.textContent = o.dataset.short ?? o.textContent;
      value.classList.remove('is-placeholder');
      if (input.value !== o.dataset.value) {
        input.value = o.dataset.value!;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    const close = (refocus = true) => {
      if (!open) return;
      open = false;
      el.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      if (animate) gsap.to(list, { opacity: 0, y: -6, duration: 0.18, ease: 'power2.in', onComplete: () => void (list.hidden = !open) });
      else list.hidden = true;
      if (refocus) button.focus();
      // Leaving the field: let the form check it.
      el.dispatchEvent(new Event('select:close', { bubbles: true }));
    };
    const openList = (at?: number) => {
      if (open) return;
      closers.forEach((c) => c !== close && c());
      open = true;
      el.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      list.hidden = false;
      // Opacity only: visibility (autoAlpha) would stop the list taking focus on this first frame.
      if (animate) gsap.fromTo(list, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.28, ease: 'expo.out', overwrite: true });
      list.focus({ preventScroll: true });
      highlight(at ?? Math.max(0, options.findIndex((o) => o.classList.contains('is-selected'))));
    };
    closers.push(close);

    button.addEventListener('click', () => (open ? close() : openList()));
    button.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        el.classList.add('is-kbd');
        openList(e.key === 'ArrowUp' ? options.length - 1 : undefined);
      }
    });

    // The keyboard's place shows only while the keyboard is being used; the pointer clears it.
    list.addEventListener('pointermove', () => el.classList.remove('is-kbd'));
    let typed = '';
    let typedAt = 0;
    list.addEventListener('keydown', (e) => {
      el.classList.add('is-kbd');
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          return highlight(active + 1);
        case 'ArrowUp':
          e.preventDefault();
          return highlight(active - 1);
        case 'Home':
          e.preventDefault();
          return highlight(0);
        case 'End':
          e.preventDefault();
          return highlight(options.length - 1);
        case 'Enter':
        case ' ':
          e.preventDefault();
          pick(active);
          return close();
        case 'Escape':
          e.preventDefault();
          return close();
        case 'Tab':
          pick(active);
          return close(false);
      }
      // Type to jump: letters typed in quick succession build up a prefix.
      if (e.key.length === 1 && /\S/.test(e.key)) {
        const now = performance.now();
        typed = now - typedAt > 700 ? e.key.toLowerCase() : typed + e.key.toLowerCase();
        typedAt = now;
        const from = typed.length === 1 ? active + 1 : active;
        for (let k = 0; k < options.length; k++) {
          const i = (from + k) % options.length;
          if ((options[i].textContent ?? '').trim().toLowerCase().startsWith(typed)) return highlight(i);
        }
      }
    });
    options.forEach((o, i) => {
      o.addEventListener('click', () => {
        pick(i);
        close();
      });
    });
    // Clicking or tabbing anywhere else closes it.
    document.addEventListener('pointerdown', (e) => open && !el.contains(e.target as Node) && close(false));
    list.addEventListener('focusout', (e) => open && !el.contains(e.relatedTarget as Node) && close(false));
  });
}
