export const MARK_L =
  'M410.599 0H206.404L25.2271 431.155C9.17349 458.675 0 493.076 0 527.476C0 637.558 91.735 727 201.817 727C238.39 727 305.212 727 305.212 727C245.254 692.385 201.905 600.986 201.905 527.476C201.905 493.076 211.078 458.675 227.132 431.155L410.599 0Z';
export const MARK_R =
  'M417.397 727H206.406L394.463 286.672C405.93 259.152 412.81 231.631 412.81 199.524C412.81 128.021 368.224 35.2318 311.608 0C311.608 0 385.697 0 424.277 0C534.359 0 623.801 89.4419 623.801 199.524C623.801 231.631 616.92 259.152 605.454 286.672L417.397 727Z';

export function markSvg(className = '') {
  return `<svg viewBox="0 0 624 727" class="mark ${className}" focusable="false" aria-hidden="true">
    <path class="mark__l" d="${MARK_L}" />
    <path class="mark__r" d="${MARK_R}" />
  </svg>`;
}

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
