import { gsap, q, ScrollTrigger } from './gsap';

/**
 * "Everything recruiters do.": the slanted "Source. Engage. Place." line.
 *
 * With motion, the line is drawn by the next section's shared marquee (animations/flow.ts), which runs along this
 * slant here and then carries the same line down into Source / Engage / Place. This section only hides its own copy
 * and keeps the band's space.
 *
 * With reduced motion the line here stays, still, where the Figma frame has it: the "S" of the first "Source." just
 * past the left edge.
 */
export function initSystem(animate: boolean) {
  const section = q('.system');
  if (!section) return;
  if (animate) {
    section.classList.add('system--handoff');
    return;
  }

  const tilt = q('.system__tilt', section)!;
  const track = q('.system__track', section)!;
  const phrase = q('.system__phrase', track)!;

  const place = () => {
    const angle = (parseFloat(getComputedStyle(section).getPropertyValue('--system-angle')) * Math.PI) / 180 || 0;
    // Where the screen's left edge falls along the tilted line, in the tilt's own (unrotated) x.
    const edge = tilt.offsetWidth / 2 - section.clientWidth / 2 / Math.cos(angle);
    // The first letter's width, measured with the tilt briefly off (a rotated box measures wider).
    const range = document.createRange();
    range.setStart(phrase.firstChild!, 0);
    range.setEnd(phrase.firstChild!, 1);
    tilt.style.transform = 'none';
    const firstLetter = range.getBoundingClientRect().width;
    tilt.style.transform = '';
    gsap.set(track, { x: edge - firstLetter });
  };
  place();
  ScrollTrigger.addEventListener('refresh', place);
}
