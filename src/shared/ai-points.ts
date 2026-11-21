import { assistantPoints } from '../content/ai-assistant';
import { esc } from './mark';

/* The AI assistant's three points as cards (styles/ai-points.css): on /ai-assistant and Home. */

/** Small line icons for the point cards (no numbers on cards: brief 4.4, point 6). */
const POINT_ICONS = [
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 12.2l2.4 2.4 4.6-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 19.5c1.2-3.3 3.9-5 7-5s5.8 1.7 7 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
];

export function pointCards(cls = '') {
  return `<ul class="aipoints${cls ? ` ${cls}` : ''}">
    ${assistantPoints
      .map(
        (p, i) => `<li class="aipoint">
          <span class="aipoint__icon">${POINT_ICONS[i]}</span>
          <h3 class="aipoint__title">${esc(p.title)}</h3>
          <p class="aipoint__body">${esc(p.body)}</p>
        </li>`,
      )
      .join('')}
  </ul>`;
}
