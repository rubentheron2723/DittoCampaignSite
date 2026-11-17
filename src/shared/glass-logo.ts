import { gsap } from '../animations/gsap';
import { uncovered } from './cover';

/**
 * The glass logomark from the About hero (Figma 2388:50): one solid block of glass in the shape of the mark, in CSS 3D.
 *
 * - The front face is Figma's: both halves in #FEFEFE at 32%, with a bright rim and a sheen of light across it.
 * - The back face sits the glass's thickness behind it, fainter, and shows through the front, as glass does.
 * - The side walls are a stack of outline slices between the two, lit brighter towards the front, so the edges read
 *   as a solid thickness when the block turns.
 *
 * Moving the pointer over the hero turns the block towards it. The front, the back and the sheen then move
 * differently, which gives the parallax. Hovering near it makes the glass a touch thicker. Left alone it drifts
 * gently. With reduced motion it stays still, face on.
 */

const W = 202.498;
const H = 236;
/** The two halves as Figma draws them (left, then right). */
const PATHS = [
  'M101.153 0.000218109C109.492 5.1895 117.027 14.2255 122.771 24.717L73.7314 139.962C68.5202 148.896 65.5421 160.063 65.542 171.23C65.542 184.512 69.9033 199.594 77.126 212.294L67.0029 235.999H99.0762L99.0781 236C99.0781 236 77.3859 236 65.5137 236C29.7787 236 0 206.965 0 171.23C7.83759e-05 160.063 2.97726 148.896 8.18848 139.962L67.0029 0.000218109H101.153Z',
  'M135.495 236H67.0031L128.05 93.0599C131.773 84.1262 134.006 75.1924 134.006 64.7697C134.006 41.5585 119.533 11.437 101.154 0C101.154 0 125.205 0 137.729 0C173.464 0 202.498 29.0348 202.498 64.7697C202.498 75.1924 200.265 84.1262 196.542 93.0599L135.495 236Z',
];
/** Outline slices making the side walls, and the glass's thickness (px) at rest and when hovered. */
const SLICES = 14;
const DEPTH = { rest: 26, near: 36 };
/** The most the block turns (degrees) with the pointer at the edge of its reach. */
const TILT = { x: 20, y: 28 };

let uid = 0;

const svg = (inner: string, cls: string) =>
  `<svg class="${cls}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" overflow="visible" aria-hidden="true" focusable="false">${inner}</svg>`;
const both = (attrs: string) => PATHS.map((d) => `<path d="${d}" ${attrs} />`).join('');

export function glassLogoHtml() {
  const id = `glogo${uid++}`;
  // Walls: outlines only, so the inside stays clear; brighter and whiter towards the front face.
  const walls = Array.from({ length: SLICES }, (_, i) => {
    const k = i / (SLICES - 1); // 0 = back, 1 = front
    const alpha = (0.1 + k * 0.32).toFixed(3);
    return svg(both(`fill="none" stroke="rgba(236,246,255,${alpha})" stroke-width="2" vector-effect="non-scaling-stroke"`), 'glogo__slice');
  }).join('');
  const back = svg(
    both(`fill="rgba(254,254,254,0.10)" stroke="rgba(255,255,255,0.45)" stroke-width="1" vector-effect="non-scaling-stroke"`),
    'glogo__back',
  );
  const front = svg(
    `<defs>
      <linearGradient id="${id}-sheen" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">
        <stop offset="0" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.42" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.5" stop-color="#fff" stop-opacity="0.5" />
        <stop offset="0.53" stop-color="#fff" stop-opacity="0.15" />
        <stop offset="0.6" stop-color="#fff" stop-opacity="0" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="${id}-body" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="#fefefe" stop-opacity="0.42" />
        <stop offset="1" stop-color="#fefefe" stop-opacity="0.24" />
      </linearGradient>
      <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="1" />
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.45" />
        <stop offset="1" stop-color="#fff" stop-opacity="0.85" />
      </linearGradient>
    </defs>
    ${both(`fill="url(#${id}-body)"`)}
    ${both(`class="glogo__sheen" fill="url(#${id}-sheen)"`)}
    ${both(`fill="none" stroke="url(#${id}-rim)" stroke-width="1.4" vector-effect="non-scaling-stroke"`)}`,
    'glogo__front',
  );
  return `<div class="glogo" aria-hidden="true"><div class="glogo__rig">${back}${walls}${front}</div></div>`;
}

export function initGlassLogo(root: HTMLElement, area: HTMLElement, animate: boolean) {
  const rig = root.querySelector<HTMLElement>('.glogo__rig');
  if (!rig) return;
  const back = root.querySelector<SVGElement>('.glogo__back')!;
  const front = root.querySelector<SVGElement>('.glogo__front')!;
  const slices = Array.from(root.querySelectorAll<SVGElement>('.glogo__slice'));
  const sheen = root.querySelector<SVGLinearGradientElement>('linearGradient[id$="-sheen"]');

  // Pointer offset from the mark (x, y in -1..1) and how near it is (0..1).
  const state = { x: 0, y: 0, near: 0 };
  const apply = () => {
    const depth = DEPTH.rest + (DEPTH.near - DEPTH.rest) * state.near;
    // Centred on its own depth, so it turns about its middle rather than its front face.
    rig.style.transform = `rotateX(${-state.y * TILT.x}deg) rotateY(${state.x * TILT.y}deg)`;
    front.style.transform = `translateZ(${depth / 2}px)`;
    back.style.transform = `translateZ(${-depth / 2}px)`;
    slices.forEach((s, i) => {
      s.style.transform = `translateZ(${-depth / 2 + (depth * (i + 0.5)) / slices.length}px)`;
    });
    // The light catches the face at a different place as it turns.
    const shift = (-state.x * 0.7 - state.y * 0.45) * W;
    sheen?.setAttribute('gradientTransform', `translate(${shift} ${shift * 0.6})`);
  };
  apply();
  if (!animate) return;

  const to = {
    x: gsap.quickTo(state, 'x', { duration: 0.9, ease: 'power3.out', onUpdate: apply }),
    y: gsap.quickTo(state, 'y', { duration: 0.9, ease: 'power3.out', onUpdate: apply }),
    near: gsap.quickTo(state, 'near', { duration: 1.1, ease: 'power3.out', onUpdate: apply }),
  };

  // Idle: a slow figure-of-eight while the pointer is elsewhere.
  let hovering = false;
  const idle = { t: 0 };
  const drift = gsap.to(idle, {
    t: Math.PI * 2,
    duration: 10,
    ease: 'none',
    repeat: -1,
    onUpdate: () => {
      if (hovering) return;
      to.x(Math.sin(idle.t) * 0.45);
      to.y(Math.sin(idle.t * 2) * 0.25);
    },
  });

  area.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    hovering = true;
    const r = root.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const reach = Math.max(area.clientWidth * 0.45, 1);
    to.x(gsap.utils.clamp(-1, 1, (e.clientX - cx) / reach));
    to.y(gsap.utils.clamp(-1, 1, (e.clientY - cy) / (reach * 0.7)));
    to.near(gsap.utils.clamp(0, 1, 1.3 - Math.hypot(e.clientX - cx, e.clientY - cy) / reach));
  });
  area.addEventListener('pointerleave', () => {
    hovering = false;
    to.near(0);
  });

  // Still under the entry cover; it starts drifting as the cover lifts (cover.ts).
  drift.pause();
  uncovered().then(() =>
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? drift.play() : drift.pause())).observe(root),
  );
}
