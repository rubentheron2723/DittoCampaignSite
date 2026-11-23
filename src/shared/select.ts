import { gsap, q, qa } from '../animations/gsap';
import { esc } from './mark';
import { icon } from './icons';

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

const CHEVRON = icon('chevron-down', { className: 'select__chev', size: 24 });

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
    let moved = false;
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
      moved = at !== undefined;
      highlight(at ?? Math.max(0, options.findIndex((o) => o.classList.contains('is-selected'))));
    };
    closers.push(close);

    // Whether it was open as the press began: on iOS a tap doesn't focus the button, so the list's focusout (below)
    // closed it first and the click then opened it again. A press on the button of an open list closes it.
    let wasOpen = false;
    button.addEventListener('pointerdown', () => (wasOpen = open));
    button.addEventListener('click', () => {
      const closing = open || wasOpen;
      wasOpen = false;
      if (closing) close();
      else openList();
    });
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
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || (e.key.length === 1 && /\S/.test(e.key))) moved = true;
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
          // Only an option the keyboard moved to: opening the list and tabbing on mustn't pick the first one.
          if (moved) pick(active);
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
    // Only a tap picks: a touch that scrolled the list (or moved the finger) ends without choosing, so the list stays
    // open to choose from.
    let pressY = 0;
    let pressScroll = 0;
    let dragged = false;
    list.addEventListener('pointerdown', (e) => {
      pressY = e.clientY;
      pressScroll = list.scrollTop;
      dragged = false;
    });
    list.addEventListener('pointermove', (e) => {
      if (Math.abs(e.clientY - pressY) > 8) dragged = true;
    });
    list.addEventListener('scroll', () => {
      if (Math.abs(list.scrollTop - pressScroll) > 4) dragged = true;
    });
    options.forEach((o, i) => {
      o.addEventListener('click', () => {
        if (dragged) return void (dragged = false);
        pick(i);
        close();
      });
    });
    // Clicking or tabbing anywhere else closes it.
    document.addEventListener('pointerdown', (e) => open && !el.contains(e.target as Node) && close(false));
    list.addEventListener('focusout', (e) => open && !el.contains(e.relatedTarget as Node) && close(false));
  });
}
