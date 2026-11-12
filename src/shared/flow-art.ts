/**
 * Isometric line illustrations for the Source / Engage / Place step cards.
 * Drawn in code from a tiny 3D-to-isometric helper so the geometry stays exact.
 * Classes (styled in home.css): art-line (grey edge), art-faint (dashed guide),
 * art-blue (accent stroke), art-face (solid face that hides what's behind),
 * art-face--blue (accent face), art-dot (accent node).
 */

const S = 19; // px per unit
const CX = 200;
const CY = 120;

type V3 = [number, number, number];

/** 3D (x right-forward, y left-forward, z up) to isometric screen space. */
const iso = ([x, y, z]: V3) => [CX + (x - y) * 0.866 * S, CY + (x + y) * 0.5 * S - z * S] as const;
const pt = (v: V3) => iso(v).map((n) => n.toFixed(1)).join(',');
const path = (vs: V3[], close = true) => `M${vs.map(pt).join('L')}${close ? 'Z' : ''}`;
const el = (d: string, cls: string) => `<path class="${cls}" d="${d}"/>`;

/** A box from (x, y, z) with size w × d × h; draws the three faces facing the viewer. */
function box(x: number, y: number, z: number, w: number, d: number, h: number, accent = false) {
  const top: V3[] = [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]];
  const right: V3[] = [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]];
  const left: V3[] = [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]];
  const face = accent ? 'art-face art-face--blue art-line' : 'art-face art-line';
  return el(path(right), face) + el(path(left), face) + el(path(top), accent ? 'art-face art-face--blue art-blue' : 'art-face art-line');
}

/** A flat grid on the plane z, from (x0, y0) spanning n × m cells. */
function grid(x0: number, y0: number, z: number, n: number, m: number, cls = 'art-faint') {
  let d = '';
  for (let i = 0; i <= n; i++) d += path([[x0 + i, y0, z], [x0 + i, y0 + m, z]], false);
  for (let j = 0; j <= m; j++) d += path([[x0, y0 + j, z], [x0 + n, y0 + j, z]], false);
  return el(d, cls);
}

/** An ellipse lying flat on the plane z (a circle in 3D), centred at (x, y). */
function ring(x: number, y: number, z: number, r: number, cls: string) {
  const pts: V3[] = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z]);
  }
  return el(path(pts), cls);
}

const dot = (v: V3, r = 4) => {
  const [px, py] = iso(v);
  return `<circle class="art-dot" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}"/>`;
};

const svg = (body: string) => `<svg class="fstep__art" viewBox="0 0 400 300" aria-hidden="true" focusable="false">${body}</svg>`;

/** Source: a stack of database layers, with search running across the top one. */
function sourceArt() {
  const layers = [0, 1.6, 3.2]
    .map((z, i) => box(-3, -3, z, 6, 6, 0.7, false) + (i === 2 ? grid(-3, -3, z + 0.7, 6, 6, 'art-line art-line--soft') : ''))
    .join('');
  const guides = el(
    path([[-3, 3, 0], [-3, 3, -1.2]], false) + path([[3, 3, 0], [3, 3, -1.2]], false) + path([[3, -3, 0], [3, -3, -1.2]], false),
    'art-faint',
  );
  const lens = ring(0.5, 0.5, 5.2, 1.6, 'art-blue') + el(path([[1.6, 1.6, 5.2], [3, 3, 5.2]], false), 'art-blue art-blue--thick');
  const hits = [dot([-1.5, -1.5, 3.9]), dot([1.5, -0.5, 3.9]), dot([-0.5, 2, 3.9])].join('');
  const beam = el(path([[0.5, 0.5, 5.2], [0.5, 0.5, 3.9]], false), 'art-faint art-faint--blue');
  return svg(guides + layers + beam + hits + lens);
}

/** Engage: a candidate, a recruiter and a client wired into one live conversation. */
function engageArt() {
  const floor = grid(-4, -4, 0, 8, 8);
  const nodes = box(-3.4, -0.6, 0, 1.4, 1.4, 1.4) + box(2, -3.4, 0, 1.4, 1.4, 1.4) + box(0.6, 2, 0, 1.4, 1.4, 2.4, true);
  const link = (a: V3, b: V3, lift: number) => {
    const pts: V3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t + Math.sin(t * Math.PI) * lift]);
    }
    return el(path(pts, false), 'art-blue');
  };
  const links = link([-2.7, 0.1, 1.4], [1.3, 2.7, 2.4], 1.6) + link([2.7, -2.7, 1.4], [1.3, 2.7, 2.4], 1.4) + link([-2.7, 0.1, 1.4], [2.7, -2.7, 1.4], 2.2);
  // A message bubble floating over the hub.
  const bubble =
    el(path([[0.2, 1.2, 4.6], [2.6, 1.2, 4.6], [2.6, 1.2, 5.8], [0.9, 1.2, 5.8], [0.5, 1.2, 6.3], [0.6, 1.2, 5.8], [0.2, 1.2, 5.8]]), 'art-face art-blue') +
    el(path([[0.6, 1.2, 5.3], [2.2, 1.2, 5.3]], false) + path([[0.6, 1.2, 5.0], [1.7, 1.2, 5.0]], false), 'art-blue');
  return svg(floor + links + nodes + bubble + dot([-2.7, 0.1, 1.4]) + dot([2.7, -2.7, 1.4]) + dot([1.3, 2.7, 2.4]));
}

/** Place: activity stacking up into results, topped with a confirmed placement. */
function placeArt() {
  const floor = grid(-4, -4, 0, 8, 8);
  const bars = [
    [-3, 1.5, 1.2],
    [-1.4, 0, 2.2],
    [0.2, -1.5, 3.2],
    [1.8, -3, 4.6],
  ]
    .map(([x, y, h], i, all) => box(x, y, 0, 1.2, 1.2, h, i === all.length - 1))
    .join('');
  const trend = el(path([[-2.4, 2.1, 1.9], [-0.8, 0.6, 2.9], [0.8, -0.9, 3.9], [2.4, -2.4, 5.6]], false), 'art-faint art-faint--blue');
  const badge = ring(2.4, -2.4, 7, 1.1, 'art-face art-blue') + el(path([[1.9, -2.6, 7], [2.3, -2.2, 7], [3, -3, 7]], false), 'art-blue art-blue--thick');
  return svg(floor + bars + trend + badge);
}

export const FLOW_ART: Record<string, () => string> = {
  source: sourceArt,
  engage: engageArt,
  place: placeArt,
};
