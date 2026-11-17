import { gsap, q, qa } from './gsap';

/**
 * "A team with unusually high standards." The logomark is formed by two ribbons flowing into it (Figma 2395:24), then
 * the section settles into its layout (Figma 2395:98).
 *
 *   1. The blue ribbon sweeps in from the top right and the ink one rises from the bottom left, each flowing along its
 *      curve until its head (one half of the mark) reaches the middle of the screen.
 *   2. Their tails drain away into the heads, leaving the two halves, just apart.
 *   3. They snap together: a quick, satisfying click.
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
  // Its centre line, from the far end (off screen) to where it meets the mark.
  spine: 'M700 -60C690 20 640 60 560 92C480 130 400 175 330 205C240 240 170 290 120 360C100 395 82 445 58 492',
};
const RIBBON_FRONT = {
  at: [48.13, 415.5],
  d: 'M720.85 142.959C716.165 156.391 711.481 169.823 706.796 183.255C701.622 198.09 696.449 212.926 691.275 227.761L690.843 228.73C663.466 298.367 623.539 371.362 552.516 420.884C481.386 470.784 396.753 482.886 325.73 494.159C246.56 504.694 165.442 558.787 161.953 598.944C161.229 604.123 161.712 608.18 162.819 611.984C108.551 614.661 54.2833 617.339 0.0159262 620.016C-0.308833 595.429 4.348 570.93 12.6253 549.188C80.3481 404.827 209.86 381.906 315.111 374.841C460.312 380.753 568.377 333.57 633.908 202.27L633.476 203.239C640.548 189.21 647.62 175.18 654.692 161.15C661.095 148.447 667.498 135.744 673.901 123.041C689.55 129.68 705.2 136.32 720.85 142.959Z',
  spine: 'M60 690C80 610 100 545 140 500C200 445 260 440 320 435C420 425 510 400 556 360C600 320 640 262 662 215C675 185 688 160 697 133',
};

/** How far each half sits off its place before the click, in frame units (along its ribbon's line of approach). */
const APART = { l: { x: 9, y: -13 }, r: { x: -9, y: 13 } };

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

/** The flowing ribbons and the forming mark, laid over the scene in the Figma frame's coordinates. */
function flowSvg() {
  const ribbon = (r: typeof RIBBON_BACK, id: string, fill: string) => `
    <!-- In the ribbon's own coordinates: a mask is measured in the user space of the shape using it, transform and all. -->
    <mask id="${id}-mask" maskUnits="userSpaceOnUse" x="-400" y="-400" width="1800" height="1500">
      <path class="tflow__spine" d="${r.spine}" fill="none" stroke="#fff" stroke-width="240" stroke-linecap="round" />
    </mask>
    <path class="tflow__ribbon" mask="url(#${id}-mask)" transform="translate(${r.at[0]} ${r.at[1]})" d="${r.d}" fill="${fill}" />`;
  return `<svg class="tflow" viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="tflow-back" x1="50.19" y1="497.81" x2="760.73" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="translate(${RIBBON_BACK.at[0]} ${RIBBON_BACK.at[1]})">
        <stop stop-color="#00B0FF"/><stop offset="1" stop-color="#1E6EF3"/>
      </linearGradient>
      <linearGradient id="tflow-mark" x1="24.3835" y1="193" x2="105.273" y2="-18.8614" gradientUnits="userSpaceOnUse">
        <stop offset="0.65263" stop-color="#00B0FF"/><stop offset="0.986642" stop-color="#1E6EF3"/>
      </linearGradient>
    </defs>
    ${ribbon(RIBBON_BACK, 'tflow-b', 'url(#tflow-back)')}
    ${ribbon(RIBBON_FRONT, 'tflow-f', '#171717')}
    <g class="tflow__mark" transform="translate(${MARK.x} ${MARK.y})">
      <g class="tflow__half tflow__half--l"><path d="${LEFT}" fill="url(#tflow-mark)" fill-rule="evenodd" /></g>
      <g class="tflow__half tflow__half--r"><path d="${RIGHT}" fill="#171717" fill-rule="evenodd" /></g>
    </g>
  </svg>`;
}

export type TeamScene = {
  /** Plays the whole sequence. Returns its length in seconds. */
  play: () => number;
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
  const mark = q<SVGGElement>('.tflow__mark', svg)!;
  const halves = { l: q<SVGGElement>('.tflow__half--l', svg)!, r: q<SVGGElement>('.tflow__half--r', svg)! };
  const logo = q<SVGSVGElement>('.tlogo', root)!;
  const text = qa<HTMLElement>('.team__title, .team__p', root);
  const markAt = `translate(${MARK.x} ${MARK.y})`;
  const setMark = (x: number, y: number, k: number) => mark.setAttribute('transform', `translate(${x} ${y}) scale(${k})`);

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
    gsap.set(halves.l, { ...APART.l, autoAlpha: 0 });
    gsap.set(halves.r, { ...APART.r, autoAlpha: 0 });
    mark.setAttribute('transform', markAt);
    gsap.set(logo, { autoAlpha: 0 });
    gsap.set(text, { autoAlpha: 0, y: 28 });
  };
  const finish = () => {
    tl?.kill();
    gsap.set(svg, { autoAlpha: 0 });
    gsap.set(logo, { autoAlpha: 1 });
    gsap.set(text, { autoAlpha: 1, y: 0 });
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
    tl = gsap.timeline();
    tl
      // 1. The ribbons flow in along their curves, the ink one a beat behind.
      .to(spines[0], { drawSVG: '0% 100%', duration: 1.25, ease: 'power2.inOut' }, 0)
      .to(spines[1], { drawSVG: '0% 100%', duration: 1.25, ease: 'power2.inOut' }, 0.18)
      // Each head arrives as its ribbon does.
      .to(halves.l, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' }, 1.0)
      .to(halves.r, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' }, 1.18)
      // 2. The tails drain into the heads.
      .to(spines[0], { drawSVG: '100% 100%', duration: 0.95, ease: 'power3.inOut' }, 1.35)
      .to(spines[1], { drawSVG: '100% 100%', duration: 0.95, ease: 'power3.inOut' }, 1.5)
      // 3. The click: accelerating into contact, then a swell that settles.
      .to([halves.l, halves.r], { x: 0, y: 0, duration: 0.22, ease: 'power4.in' }, 2.35)
      .to(m, { swell: 1.07, duration: 0.08, ease: 'power2.out', onUpdate: apply }, 2.57)
      .to(m, { swell: 1, duration: 0.6, ease: 'elastic.out(1.1, 0.4)', onUpdate: apply }, 2.65)
      // 4. Into the layout: the mark grows and moves into the logo's place, then the real logo takes over.
      .add(() => {
        to = target();
      }, 3.2)
      .to(m, { p: 1, duration: 1.05, ease: 'expo.inOut', onUpdate: apply }, 3.2)
      .set(logo, { autoAlpha: 1 }, 4.25)
      .set(svg, { autoAlpha: 0 }, 4.25)
      .to(text, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 }, 3.95);
    return tl.duration();
  };

  reset();
  return { play, finish, reset };
}
