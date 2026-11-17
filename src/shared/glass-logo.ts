import { gsap } from '../animations/gsap';

/**
 * The glass logomark from the About hero (Figma 2388:50): the two halves of the mark in #FEFEFE at 32%, as two panes
 * of glass in 3D. Each pane is a stack of thin slices for its thickness, a frosted face with a bright rim, and a sheen.
 * The front half floats ahead of the back one, so tilting the mark shows the gap between them.
 *
 * Hovering anywhere over the hero tilts the mark towards the pointer. The halves part further, the slices fan out
 * and the sheen slides across the faces, so the layers move at different speeds (parallax). Left alone it drifts
 * gently. With reduced motion it stays still and flat.
 */

const W = 202.498;
const H = 236;
/** The two halves, back (left) first. */
const PANES = [
  'M101.153 0.000218109C109.492 5.1895 117.027 14.2255 122.771 24.717L73.7314 139.962C68.5202 148.896 65.5421 160.063 65.542 171.23C65.542 184.512 69.9033 199.594 77.126 212.294L67.0029 235.999H99.0762L99.0781 236C99.0781 236 77.3859 236 65.5137 236C29.7787 236 0 206.965 0 171.23C7.83759e-05 160.063 2.97726 148.896 8.18848 139.962L67.0029 0.000218109H101.153Z',
  'M135.495 236H67.0031L128.05 93.0599C131.773 84.1262 134.006 75.1924 134.006 64.7697C134.006 41.5585 119.533 11.437 101.154 0C101.154 0 125.205 0 137.729 0C173.464 0 202.498 29.0348 202.498 64.7697C202.498 75.1924 200.265 84.1262 196.542 93.0599L135.495 236Z',
];
/** Slices per pane and their spacing (px) at rest; hovering spreads them. */
const SLICES = 7;
/** Where each pane's face sits in depth (px), at rest and fully tilted. */
const DEPTH = { rest: [-14, 16], spread: [-34, 40] };
const SLICE_GAP = { rest: 1.6, spread: 2.6 };
/** The most the mark tilts (degrees) with the pointer at the hero's edge. */
const TILT = { x: 16, y: 22 };

let uid = 0;

export function glassLogoHtml() {
  const id = `glogo${uid++}`;
  const svg = (inner: string, cls: string) =>
    `<svg class="${cls}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" overflow="visible" aria-hidden="true" focusable="false">${inner}</svg>`;
  const panes = PANES.map((d, p) => {
    const slices = Array.from({ length: SLICES }, (_, i) =>
      svg(`<path d="${d}" fill="rgba(254,254,254,${(0.05 + (i / SLICES) * 0.06).toFixed(3)})" />`, 'glogo__slice'),
    ).join('');
    const face = svg(
      `<defs>
        <linearGradient id="${id}-sheen${p}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">
          <stop offset="0" stop-color="#fff" stop-opacity="0" />
          <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.55" />
          <stop offset="0.56" stop-color="#fff" stop-opacity="0" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="${id}-rim${p}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0.95" />
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.35" />
          <stop offset="1" stop-color="#fff" stop-opacity="0.8" />
        </linearGradient>
      </defs>
      <path d="${d}" fill="rgba(254,254,254,0.32)" />
      <path class="glogo__sheen" d="${d}" fill="url(#${id}-sheen${p})" />
      <path d="${d}" fill="none" stroke="url(#${id}-rim${p})" stroke-width="1.2" vector-effect="non-scaling-stroke" />`,
      'glogo__face',
    );
    return `<div class="glogo__pane glogo__pane--${p ? 'front' : 'back'}">${slices}${face}</div>`;
  }).join('');
  return `<div class="glogo" aria-hidden="true"><div class="glogo__rig">${panes}</div></div>`;
}

export function initGlassLogo(root: HTMLElement, area: HTMLElement, animate: boolean) {
  const rig = root.querySelector<HTMLElement>('.glogo__rig');
  if (!rig) return;
  const panes = Array.from(root.querySelectorAll<HTMLElement>('.glogo__pane'));
  const sheens = Array.from(root.querySelectorAll<SVGLinearGradientElement>('linearGradient[id$="sheen0"], linearGradient[id$="sheen1"]'));

  // One value drives everything: how far the pointer is from centre (x, y in -1..1) and how "lifted" the mark is.
  const state = { x: 0, y: 0, lift: 0 };
  const apply = () => {
    rig.style.transform = `rotateX(${-state.y * TILT.x}deg) rotateY(${state.x * TILT.y}deg)`;
    panes.forEach((pane, p) => {
      const z = DEPTH.rest[p] + (DEPTH.spread[p] - DEPTH.rest[p]) * state.lift;
      const gap = SLICE_GAP.rest + (SLICE_GAP.spread - SLICE_GAP.rest) * state.lift;
      pane.style.transform = `translateZ(${z}px)`;
      pane.querySelectorAll<SVGElement>('.glogo__slice').forEach((s, i) => {
        s.style.transform = `translateZ(${-(SLICES - i) * gap}px)`;
      });
    });
    // The sheen's band slides across the faces against the tilt, like light catching a pane.
    const shift = (-state.x * 0.6 - state.y * 0.4) * W;
    sheens.forEach((g, p) => {
      const k = p ? 1.25 : 0.85; // the front pane's sheen moves further: it's nearer
      g.setAttribute('gradientTransform', `translate(${shift * k} ${shift * k * 0.6})`);
    });
  };
  apply();
  if (!animate) return;

  const to = {
    x: gsap.quickTo(state, 'x', { duration: 0.9, ease: 'power3.out', onUpdate: apply }),
    y: gsap.quickTo(state, 'y', { duration: 0.9, ease: 'power3.out', onUpdate: apply }),
    lift: gsap.quickTo(state, 'lift', { duration: 1.1, ease: 'power3.out', onUpdate: apply }),
  };

  // Idle: a slow figure-of-eight drift while the pointer is away.
  let hovering = false;
  const idle = { t: 0 };
  const drift = gsap.to(idle, {
    t: Math.PI * 2,
    duration: 9,
    ease: 'none',
    repeat: -1,
    onUpdate: () => {
      if (hovering) return;
      to.x(Math.sin(idle.t) * 0.35);
      to.y(Math.sin(idle.t * 2) * 0.2);
    },
  });

  area.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    hovering = true;
    // Relative to the mark itself, reaching full tilt about half the hero's width away.
    const r = root.getBoundingClientRect();
    const reach = Math.max(area.clientWidth * 0.5, 1);
    to.x(gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / reach));
    to.y(gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (reach * 0.7)));
    // Nearer the mark, the panes part further.
    const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    to.lift(gsap.utils.clamp(0.35, 1, 1.2 - d / reach));
  });
  area.addEventListener('pointerleave', () => {
    hovering = false;
    to.lift(0);
  });

  // Off screen, no need to keep drifting.
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? drift.play() : drift.pause())).observe(root);
}
