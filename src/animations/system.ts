import { gsap, q, ScrollTrigger } from './gsap';

/** Pixels per second along the slant. */
const SPEED = 90;

/**
 * "Everything recruiters do.": the slanted "Source. Engage. Place." line runs as an endless marquee
 * along its own angle. The track holds two identical halves, so sliding it left by exactly one half
 * (xPercent -50) and starting over is seamless. The tilt is on the parent, so moving the track along
 * x moves it along the slant.
 *
 * A fixed x offset starts the line where the Figma frame has it: the "S" of the first "Source." just
 * past the left edge. With reduced motion the line stays there, still. Otherwise it only runs while
 * the section is on screen.
 */
export function initSystem(animate: boolean) {
  const section = q('.system');
  if (!section) return;
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
    // Start one phrase earlier, so the track still covers the right edge at the end of each loop.
    gsap.set(track, { x: edge - firstLetter - phrase.offsetWidth });
  };
  place();
  ScrollTrigger.addEventListener('refresh', place);

  if (!animate) return;

  const duration = () => track.offsetWidth / 2 / SPEED;
  const loop = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: duration(), paused: true });

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    // Keep the speed constant when the font size (and so the track's width) changes.
    onRefresh: () => loop.duration(duration()),
  });
}
