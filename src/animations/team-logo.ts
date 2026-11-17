import { gsap, q, qa } from './gsap';

/**
 * "A team with unusually high standards." (Figma 2395:98): the logomark draws itself from two strokes, then clicks
 * together, and the text follows. From the sketch:
 *
 *   1. blank;
 *   2. two thin strokes sweep in, each tracing the outline of one half of the mark, tilted apart;
 *   3. they fill out into the halves (the blue gradient and the ink) and drift in, stopping just short;
 *   4. they snap together, a quick satisfying click (a little overshoot), and the copy rises in.
 *
 * On wide screens this plays inside the "We think independently" stage, as the scroll's last stop there
 * (think-zoom.ts); on narrow screens and without the lens it's a normal section that plays once as it comes into view.
 */

const W = 165.603;
const H = 193;
/** The halves, as in the Figma mark (the blue one, then the ink one). */
const LEFT = 'M109.004 0H54.795L6.697 114.461C2.435 121.767 0 130.899 0 140.032C0 169.256 24.353 193 53.577 193C63.286 193 81.026 193 81.026 193C65.109 183.811 53.601 159.546 53.601 140.032C53.601 130.899 56.036 121.767 60.298 114.461L109.004 0Z';
const RIGHT = 'M110.808 193H54.795L104.719 76.104C107.764 68.798 109.59 61.492 109.59 52.969C109.59 33.986 97.754 9.353 82.723 0C82.723 0 102.392 0 112.634 0C141.858 0 165.603 23.745 165.603 52.969C165.603 61.492 163.776 68.798 160.732 76.104L110.808 193Z';

/** Where each half starts (tilted apart) and where it pauses just short of the click. */
const APART = { l: { x: -34, y: -22, rotate: -9 }, r: { x: 34, y: 22, rotate: 9 } };
const NEAR = { l: { x: -6, y: -4, rotate: -1.5 }, r: { x: 6, y: 4, rotate: 1.5 } };

export function teamLogoSvg() {
  return `<svg class="tlogo" viewBox="0 0 ${W} ${H}" overflow="visible" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="tlogo-grad" x1="24.3835" y1="193" x2="105.273" y2="-18.8614" gradientUnits="userSpaceOnUse">
        <stop offset="0.65263" stop-color="#00B0FF"/>
        <stop offset="0.986642" stop-color="#1E6EF3"/>
      </linearGradient>
    </defs>
    <g class="tlogo__half tlogo__half--l">
      <path class="tlogo__fill" d="${LEFT}" fill="url(#tlogo-grad)" fill-rule="evenodd" />
      <path class="tlogo__line" d="${LEFT}" fill="none" stroke="#00B0FF" stroke-width="2.6" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <g class="tlogo__half tlogo__half--r">
      <path class="tlogo__fill" d="${RIGHT}" fill="#171717" fill-rule="evenodd" />
      <path class="tlogo__line" d="${RIGHT}" fill="none" stroke="#171717" stroke-width="2.6" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>`;
}

export type TeamScene = {
  /** Plays the whole build (strokes, fill, click, text). Returns its length in seconds. */
  play: () => number;
  /** Straight to the finished state (arriving from below). */
  finish: () => void;
  /** Back to blank. */
  reset: () => void;
};

export function createTeamScene(root: HTMLElement): TeamScene {
  const logo = q<SVGSVGElement>('.tlogo', root)!;
  const halves = { l: q<SVGGElement>('.tlogo__half--l', logo)!, r: q<SVGGElement>('.tlogo__half--r', logo)! };
  const fills = qa<SVGPathElement>('.tlogo__fill', logo);
  const lines = qa<SVGPathElement>('.tlogo__line', logo);
  const text = qa<HTMLElement>('.team__title, .team__p', root);
  gsap.set([halves.l, halves.r], { transformOrigin: '50% 50%' });

  let tl: gsap.core.Timeline | null = null;
  const reset = () => {
    tl?.kill();
    gsap.set(halves.l, APART.l);
    gsap.set(halves.r, APART.r);
    gsap.set(fills, { opacity: 0 });
    gsap.set(lines, { opacity: 1, drawSVG: '0%' });
    gsap.set(logo, { scale: 1, rotate: 0 });
    gsap.set(text, { autoAlpha: 0, y: 28 });
  };
  const finish = () => {
    tl?.kill();
    gsap.set([halves.l, halves.r], { x: 0, y: 0, rotate: 0 });
    gsap.set(fills, { opacity: 1 });
    gsap.set(lines, { opacity: 0 });
    gsap.set(logo, { scale: 1, rotate: 0 });
    gsap.set(text, { autoAlpha: 1, y: 0 });
  };

  const play = () => {
    reset();
    tl = gsap.timeline();
    tl
      // 2. The strokes sweep in, tracing each half's outline, the second a beat behind.
      .to(lines[0], { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' }, 0)
      .to(lines[1], { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' }, 0.15)
      // 3. They fill out into the halves and drift in, stopping just short.
      .to(fills, { opacity: 1, duration: 0.5, ease: 'power1.out', stagger: 0.08 }, 0.95)
      .to(lines, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 1.05)
      .to(halves.l, { ...NEAR.l, duration: 0.7, ease: 'power3.out' }, 0.95)
      .to(halves.r, { ...NEAR.r, duration: 0.7, ease: 'power3.out' }, 0.95)
      // 4. The snap: accelerating into contact...
      .to([halves.l, halves.r], { x: 0, y: 0, rotate: 0, duration: 0.2, ease: 'power4.in' }, 1.75)
      // ...and the click: a quick swell and settle, with the faintest twist.
      .to(logo, { scale: 1.045, rotate: -0.8, duration: 0.09, ease: 'power2.out', transformOrigin: '50% 50%' }, 1.95)
      .to(logo, { scale: 1, rotate: 0, duration: 0.55, ease: 'elastic.out(1.1, 0.42)' }, 2.04)
      // Then the copy rises in.
      .to(text, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 }, 2.2);
    return tl.duration();
  };

  reset();
  return { play, finish, reset };
}
