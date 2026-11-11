/**
 * Footer link hover wave. A plain :hover animation stops the moment the pointer
 * leaves, so instead hovering (or focusing) adds .is-waving, and the class comes
 * off only when the last character has settled. Hovering again mid-wave is ignored,
 * so the ripple always plays through once.
 */
export function initFooterWave() {
  document.querySelectorAll<HTMLAnchorElement>('.footer__col a').forEach((link) => {
    const chars = link.querySelectorAll<HTMLElement>('.wave span');
    const last = chars[chars.length - 1];
    if (!last) return;
    const start = () => link.classList.add('is-waving');
    link.addEventListener('pointerenter', start);
    link.addEventListener('focus', start);
    last.addEventListener('animationend', () => link.classList.remove('is-waving'));
  });
}
