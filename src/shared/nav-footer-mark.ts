import { gsap, q, ScrollTrigger } from '../animations/gsap';
import { FOOTER_LOGOMARK } from './footer-art';
import { setFooterMarkHidden } from './footer-blobs';

/**
 * Scrolling into the footer, the nav's little logomark grows and flies down into the footer's big one. The rest of
 * the nav (glass, links, buttons, wordmark) folds away as it does when scrolling down, so only the mark travels.
 *
 * The flight is tied to the scroll: it starts as the footer's logomark comes up from the bottom of the screen and
 * lands when that logomark reaches 30% of the way down (or the end of the page, if that comes first), so scrolling
 * back up flies it home again. On the way it scales up, turns from the nav's colour to the footer's white and leans a
 * little, as if thrown. A copy of the mark does the flying, fixed above everything; the nav's and footer's own marks
 * hide while it's in the air.
 */
export function initNavFooterMark() {
  const nav = q('#nav');
  const brandMark = nav && q<SVGGElement>('.nav-logo__mark', nav);
  const target = q('.footer__logomark svg');
  if (!nav || !brandMark || !target) return false;

  const [w, h] = [FOOTER_LOGOMARK.width, FOOTER_LOGOMARK.height];
  const fly = document.createElement('div');
  fly.className = 'mark-fly';
  fly.setAttribute('aria-hidden', 'true');
  fly.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="currentColor" focusable="false">${FOOTER_LOGOMARK.paths
    .map((d) => `<path fill-rule="${FOOTER_LOGOMARK.rule}" d="${d}"/>`)
    .join('')}</svg>`;
  document.body.appendChild(fly);

  const ease = gsap.parseEase('sine.inOut');
  const lean = (f: number) => -9 * Math.sin(Math.PI * f);
  let state: 'home' | 'flying' | 'landed' = 'home';

  // The nav mark is fixed, so its box (and the nav's colour) is read once as the flight sets off, not every frame.
  let from = { left: 0, top: 0, width: 0 };
  let fromColor = '#fefefe';
  const setState = (next: typeof state) => {
    if (next === state) return;
    if (next === 'flying') {
      const r = brandMark.getBoundingClientRect();
      from = { left: r.left, top: r.top, width: r.width };
      fromColor = getComputedStyle(nav).color;
    }
    state = next;
    nav.classList.toggle('nav--footer', next !== 'home');
    brandMark.style.opacity = next === 'home' ? '' : '0';
    fly.style.visibility = next === 'flying' ? 'visible' : 'hidden';
    setFooterMarkHidden(next !== 'landed');
  };
  // The footer mark waits for the flight from the start.
  setFooterMarkHidden(true);

  const place = (p: number) => {
    if (p <= 0) return setState('home');
    if (p >= 1) return setState('landed');
    setState('flying');
    const f = ease(p);
    // The footer's end is measured live (it moves with the scroll); the nav's was read at take-off.
    const a = from;
    const b = target.getBoundingClientRect();
    const x = a.left + (b.left - a.left) * f;
    const y = a.top + (b.top - a.top) * f;
    const scale = (a.width + (b.width - a.width) * f) / w;
    // The nav's colour at rest (dark over light sections, white over dark ones) into the footer's white.
    fly.style.color = gsap.utils.interpolate(fromColor, '#fefefe', f);
    // Leaning about its own centre.
    const [cx, cy] = [(w * scale) / 2, (h * scale) / 2];
    fly.style.transform = `translate(${x + cx}px, ${y + cy}px) rotate(${lean(f)}deg) translate(${-cx}px, ${-cy}px) scale(${scale})`;
  };

  ScrollTrigger.create({
    trigger: target,
    start: 'top bottom',
    end: 'clamp(top 30%)',
    invalidateOnRefresh: true,
    onUpdate: (self) => place(self.progress),
    onRefresh: (self) => place(self.progress),
  });
  return true;
}
