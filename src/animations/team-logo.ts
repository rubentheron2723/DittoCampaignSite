import { gsap, q, qa } from './gsap';

/**
 * "A team with unusually high standards." The logomark is formed by two ribbons flowing into it (Figma 2395:24), then
 * the section settles into its layout (Figma 2395:98).
 *
 *   1. The blue ribbon sweeps in from the top right and the ink one rises from the bottom left, each flowing along its
 *      curve until its head (one half of the mark) reaches the middle of the screen. Each tail follows, catching up so
 *      that it reaches the mark just as the head arrives: the ribbon is absorbed into its half as it lands.
 *   2. The blue half takes on its gradient.
 *   3. Straight away, a quick, satisfying click: a swell and an elastic settle.
 *   4. The mark grows and moves into its place on the left of the layout, and the copy rises in on the right.
 *
 * The ribbons are Figma's own shapes (the strokes outlined), revealed and drained by a wide stroke along each one's
 * centre line in a mask, so they keep their tapering. Everything is laid out in the 1440 x 1024 Figma frame, cover-
 * fitted to wherever the scene plays (the locked "We think independently" stage on wide screens, or the section's own
 * box on narrow ones).
 */

const LEFT = 'M109.004 0H54.795L6.697 114.461C2.435 121.767 0 130.899 0 140.032C0 169.256 24.353 193 53.577 193C63.286 193 81.026 193 81.026 193C65.109 183.811 53.601 159.546 53.601 140.032C53.601 130.899 56.036 121.767 60.298 114.461L109.004 0Z';
const RIGHT = 'M110.808 193H54.795L104.719 76.104C107.764 68.798 109.59 61.492 109.59 52.969C109.59 33.986 97.754 9.353 82.723 0C82.723 0 102.392 0 112.634 0C141.858 0 165.603 23.745 165.603 52.969C165.603 61.492 163.776 68.798 160.732 76.104L110.808 193Z';
const MARK = { w: 165.603, h: 193, x: 637.2, y: 415.5 };

/** Figma's ribbons (2395:78 "back stroke", 2395:77 "front stroke"), each in its own frame's coordinates. */
const RIBBON_BACK = {
  at: [637.2, -15.05],
  d: 'M34.7875 478.286C39.1422 464.714 43.4973 451.142 47.852 437.57L62.2807 392.602L62.7358 391.576C88.57 321.066 127.03 246.271 198.862 194.011C270.85 141.394 357.436 127.326 428.322 114.236C504.649 102.446 579.756 43.1733 574.321 15.8066C573.974 12.6857 572.71 11.2204 571.384 10.0996C639.634 6.733 707.885 3.36661 776.135 0C776.241 27.2705 770.804 54.3605 761.456 78.1611C684.809 235.313 549.286 253.054 441.193 258.863C296.437 250.076 193.121 289.466 122.869 419.523L123.324 418.498C115.888 432.373 108.451 446.249 101.015 460.124C94.2822 472.687 87.5497 485.25 80.8168 497.813C65.4738 491.304 50.1306 484.795 34.7875 478.286Z',
  // Its centre line, from the far end (off screen), into the mark and on through its half to the far side.
  spine: 'M700 -60C690 20 640 60 560 92C480 130 400 175 330 205C240 240 170 290 120 360C100 395 82 445 58 492C45 525 36 570 40 612',
};
const RIBBON_FRONT = {
  at: [48.13, 415.5],
  d: 'M720.85 142.959C716.165 156.391 711.481 169.823 706.796 183.255C701.622 198.09 696.449 212.926 691.275 227.761L690.843 228.73C663.466 298.367 623.539 371.362 552.516 420.884C481.386 470.784 396.753 482.886 325.73 494.159C246.56 504.694 165.442 558.787 161.953 598.944C161.229 604.123 161.712 608.18 162.819 611.984C108.551 614.661 54.2833 617.339 0.0159262 620.016C-0.308833 595.429 4.348 570.93 12.6253 549.188C80.3481 404.827 209.86 381.906 315.111 374.841C460.312 380.753 568.377 333.57 633.908 202.27L633.476 203.239C640.548 189.21 647.62 175.18 654.692 161.15C661.095 148.447 667.498 135.744 673.901 123.041C689.55 129.68 705.2 136.32 720.85 142.959Z',
  spine: 'M60 690C80 610 100 545 140 500C200 445 260 440 320 435C420 425 510 400 556 360C600 320 640 262 662 215C675 185 688 160 697 133C705 100 711 60 711 12',
};

/**
 * How far along each centre line a tail drains to (%): where the ribbon is all but gone (its last ~250 px², at the
 * join, goes as the mark takes over) while its half is still whole (the stroke's round end reaches 120 back). Measured
 * from the shapes: the lines enter the mark at 81-82%.
 */
const DRAIN_TO = 93.5;

/** The blue ribbon's colour where it meets the mark: the blue half arrives in it, then takes on the mark's gradient. */
const RIBBON_BLUE = '#00B0FF';

export function teamLogoSvg() {
  return `<svg class="tlogo" viewBox="0 0 ${MARK.w} ${MARK.h}" overflow="visible" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="tlogo-grad" x1="24.3835" y1="193" x2="105.273" y2="-18.8614" gradientUnits="userSpaceOnUse">
        <stop offset="0.65263" stop-color="#00B0FF"/>
        <stop offset="0.986642" stop-color="#1E6EF3"/>
      </linearGradient>
    </defs>
    <path d="${LEFT}" fill="url(#tlogo-grad)" fill-rule="evenodd" />
    <path d="${RIGHT}" fill="#171717" fill-rule="evenodd" />
  </svg>`;
}

/**
 * The flowing ribbons and the forming mark, laid over the scene in the Figma frame's coordinates. Each half is part of
 * its ribbon (as in Figma, where each ribbon and its half are one group): both are revealed by the same mask, a wide
 * stroke along the ribbon's centre line that runs on through the half, so the head grows out of the flow rather than
 * fading in on top of it. Once a ribbon has arrived, an identical, unmasked copy of the mark takes over (pixel for
 * pixel the same), and the ribbon's tail drains away from under it.
 */
function flowSvg() {
  const flow = (r: typeof RIBBON_BACK, id: string, fill: string, half: string, halfFill: string) => `
    <mask id="${id}-mask" maskUnits="userSpaceOnUse" x="-600" y="-600" width="2700" height="2300">
      <path class="tflow__spine" transform="translate(${r.at[0]} ${r.at[1]})" d="${r.spine}" fill="none" stroke="#fff" stroke-width="240" stroke-linecap="round" />
    </mask>
    <g mask="url(#${id}-mask)">
      <path transform="translate(${MARK.x} ${MARK.y})" d="${half}" fill="${halfFill}" fill-rule="evenodd" />
      <path transform="translate(${r.at[0]} ${r.at[1]})" d="${r.d}" fill="${fill}" />
    </g>`;
  return `<svg class="tflow" viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="tflow-back" x1="50.19" y1="497.81" x2="760.73" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="translate(${RIBBON_BACK.at[0]} ${RIBBON_BACK.at[1]})">
        <stop stop-color="#00B0FF"/><stop offset="1" stop-color="#1E6EF3"/>
      </linearGradient>
      <linearGradient id="tflow-mark" x1="24.3835" y1="193" x2="105.273" y2="-18.8614" gradientUnits="userSpaceOnUse">
        <stop offset="0.65263" stop-color="#00B0FF"/><stop offset="0.986642" stop-color="#1E6EF3"/>
      </linearGradient>
    </defs>
    <!-- Layered back to front as they meet: the blue ribbon, the blue half, the ink ribbon, the ink half. With the
         whole mark on top, the blue half's tip cut across the ink ribbon; now it tucks behind it. -->
    ${flow(RIBBON_BACK, 'tflow-b', 'url(#tflow-back)', LEFT, RIBBON_BLUE)}
    <g class="tflow__mark tflow__mark--l" transform="translate(${MARK.x} ${MARK.y})">
      <path d="${LEFT}" fill="${RIBBON_BLUE}" fill-rule="evenodd" />
      <path class="tflow__tint" d="${LEFT}" fill="url(#tflow-mark)" fill-rule="evenodd" />
    </g>
    ${flow(RIBBON_FRONT, 'tflow-f', '#171717', RIGHT, '#171717')}
    <g class="tflow__mark tflow__mark--r" transform="translate(${MARK.x} ${MARK.y})">
      <path d="${RIGHT}" fill="#171717" fill-rule="evenodd" />
    </g>
  </svg>`;
}

export type TeamScene = {
  /** Plays the whole sequence. Returns its length in seconds. */
  play: () => number;
  /** Fades straight into the finished layout (once it has played, it isn't played again). */
  show: () => void;
  /** Straight to the finished layout (arriving from below). */
  finish: () => void;
  /** Back to blank. */
  reset: () => void;
};

/**
 * `root` holds the layout (.team__inner's logo and copy); the flow is drawn over `stage` (the box the scene fills).
 */
export function createTeamScene(root: HTMLElement, stage: HTMLElement = root): TeamScene {
  stage.insertAdjacentHTML('beforeend', flowSvg());
  const svg = stage.lastElementChild as SVGSVGElement;
  const spines = qa<SVGPathElement>('.tflow__spine', svg);
  // The mark's two halves, in their own layers (see flowSvg), moved as one.
  const mark = qa<SVGGElement>('.tflow__mark', svg);
  const tint = q<SVGPathElement>('.tflow__tint', svg)!;
  const logo = q<SVGSVGElement>('.tlogo', root)!;
  const text = qa<HTMLElement>('.team__title, .team__p', root);
  const markAt = `translate(${MARK.x} ${MARK.y})`;
  const setMark = (x: number, y: number, k: number) => mark.forEach((g) => g.setAttribute('transform', `translate(${x} ${y}) scale(${k})`));

  /** The layout's logo, in the flow's frame units (so the forming mark can grow into exactly its place). */
  const target = () => {
    const box = svg.getBoundingClientRect();
    const s = Math.max(box.width / 1440, box.height / 1024);
    const ox = box.left + (box.width - 1440 * s) / 2;
    const oy = box.top + (box.height - 1024 * s) / 2;
    const r = logo.getBoundingClientRect();
    return { x: (r.left - ox) / s, y: (r.top - oy) / s, k: r.height / s / MARK.h };
  };

  let tl: gsap.core.Timeline | null = null;
  const reset = () => {
    tl?.kill();
    gsap.set(svg, { autoAlpha: 1 });
    gsap.set(spines, { drawSVG: '0% 0%' });
    gsap.set(mark, { autoAlpha: 0 });
    gsap.set(tint, { opacity: 0 });
    mark.forEach((g) => g.setAttribute('transform', markAt));
    gsap.set(logo, { autoAlpha: 0 });
    gsap.set(text, { autoAlpha: 0, y: 28 });
  };
  const finish = () => {
    tl?.kill();
    gsap.set(svg, { autoAlpha: 0 });
    gsap.set(logo, { autoAlpha: 1 });
    gsap.set(text, { autoAlpha: 1, y: 0 });
  };

  const show = () => {
    tl?.kill();
    gsap.set(svg, { autoAlpha: 0 });
    gsap.fromTo(logo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' });
    gsap.fromTo(text, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04 });
  };

  const play = () => {
    reset();
    // The click's swell and the move into the layout both drive the mark's own transform.
    const m = { swell: 1, p: 0 };
    let to = { x: MARK.x, y: MARK.y, k: 1 };
    const apply = () => {
      const k = Math.pow(to.k, m.p) * m.swell;
      const x = MARK.x + (to.x - MARK.x) * m.p - (MARK.w * (k - Math.pow(to.k, m.p))) / 2;
      const y = MARK.y + (to.y - MARK.y) * m.p - (MARK.h * (k - Math.pow(to.k, m.p))) / 2;
      setMark(x, y, k);
    };
    // Each ribbon's visible stretch along its centre line: tail (a) to head (b), in %.
    const ends = spines.map(() => ({ a: 0, b: 0 }));
    const drawn = (i: number) => () => gsap.set(spines[i], { drawSVG: `${ends[i].a}% ${ends[i].b}%` });
    const FLOW = 1.6;
    const LAG = 0.2; // the ink ribbon a beat behind the blue
    const landed = [FLOW, FLOW + LAG];
    const t = gsap.timeline();
    tl = t;
    landed.forEach((end, i) => {
      t
        // 1. The head flows in along the curve and on into the mark, its half growing out of the ribbon...
        .to(ends[i], { b: 100, duration: FLOW, ease: 'power2.inOut', onUpdate: drawn(i) }, end - FLOW)
        // ...and the tail follows, setting off later and quicker, to reach the mark as the head lands.
        .to(ends[i], { a: DRAIN_TO, duration: FLOW * 0.62, ease: 'power2.in', onUpdate: drawn(i) }, end - FLOW * 0.62)
        // Landed: the unmasked half takes over (identical), and the last of the ribbon goes with the mask.
        .set(mark[i], { autoAlpha: 1 }, end)
        .set(spines[i], { drawSVG: '100% 100%' }, end);
    });
    const click = landed[1] + 0.02;
    t
      // 2. The blue half takes on the mark's gradient.
      .to(tint, { opacity: 1, duration: 0.6, ease: 'power1.inOut' }, landed[0])
      // 3. The click, straight away: a quick swell, then an elastic settle.
      .to(m, { swell: 1.06, duration: 0.1, ease: 'power2.out', onUpdate: apply }, click)
      .to(m, { swell: 1, duration: 0.65, ease: 'elastic.out(1.1, 0.4)', onUpdate: apply }, click + 0.1)
      // 4. Into the layout: the mark grows and moves into the logo's place, then the real logo takes over.
      .add(() => {
        to = target();
      }, click + 0.55)
      .to(m, { p: 1, duration: 1.1, ease: 'expo.inOut', onUpdate: apply }, click + 0.55)
      .set(logo, { autoAlpha: 1 }, click + 1.65)
      .set(svg, { autoAlpha: 0 }, click + 1.65)
      .to(text, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 }, click + 1.3);
    return t.duration();
  };

  reset();
  return { play, show, finish, reset };
}
