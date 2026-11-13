import { gsap, q } from '../animations/gsap';

/**
 * The home page's landing animation, from the Figma frames "landing anim" (2364:820, desktop)
 * and "Mobile start" (2364:1369). One 3.8 s timeline:
 *
 *   0.52 → 2.25 s  Fifteen copies of one cloud cut-out slide away off screen, parting over the mark.
 *   0 → 2.72 s     The whole cloud layer goes through a lens: barrel distortion and chromatic
 *                  aberration build up while the clouds part, then settle back to nothing.
 *   0.83 → 2.25 s  The logomark scales down from 1.67× and fades in, centred.
 *   2.08 → 3.72 s  A big blurred white disc appears below right of the mark, then sweeps up
 *                  over it, leaving a plain white screen. The white then fades to the hero.
 *
 * All the values below are read straight from the Figma keyframes. The lens is a WebGL2 port of
 * Figma's "Lens distortion" effect (the same maths, see LENS_FRAG). Without WebGL2 the clouds are
 * drawn with a 2D canvas and no lens; if the image can't load, the mark and the white sweep still play.
 */

const CLOUD_SRC = '/intro/clouds.webp';
/** The cut-out is 3:2 (2400 × 1600). */
const IMG_ASPECT = 1.5;

/* ---------- Easing and keyframes ---------- */

/** CSS cubic-bezier(x1, y1, x2, y2) as an easing function. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(t) - x;
      const d = dx(t);
      if (Math.abs(err) < 1e-6) break;
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    if (t < 0 || t > 1 || Math.abs(sx(t) - x) > 1e-4) {
      // Newton didn't settle: fall back to bisection.
      let lo = 0, hi = 1;
      t = x;
      for (let i = 0; i < 30; i++) {
        if (sx(t) < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return sy(t);
  };
}

const EASE_INOUT = bezier(0.5, 0, 0.5, 1);
const EASE_PART = bezier(0.73, 0, 0.15, 1);
const EASE_OUT = bezier(0, 0, 0, 1);
const EASE_FADE_IN = bezier(0.714, 0, 0.028, 1);

/** A keyframe track: each key's ease runs from that key to the next (as in Figma's CSS export). */
type Key = { t: number; v: number; ease?: (x: number) => number };
function sample(keys: Key[], t: number) {
  if (t <= keys[0].t) return keys[0].v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t < b.t) return a.v + (b.v - a.v) * (a.ease ?? EASE_INOUT)((t - a.t) / (b.t - a.t));
  }
  return keys[keys.length - 1].v;
}

/** Timeline marks, in seconds (percentages of the 3.8 s Figma timeline). */
const T = {
  partStart: 0.521, // 13.71 %
  partEnd: 2.2528, // 59.284 %
  markScaleStart: 0.8272, // 21.768 %
  markScaleEnd: 1.9909, // 52.393 %
  markFadeStart: 1.1848, // 31.18 %
  markFadeEnd: 2.2528, // 59.284 %
  whiteIn: 1.9909, // 52.393 %
  whiteInEnd: 2.079, // 54.711 %
  sweepStart: 2.6074, // 68.615 %
  sweepEnd: 3.7171, // 97.818 %
  lens: [0, 0.4348, 1.8866, 2.7226],
};

/**
 * Before the Figma timeline starts, the clouds fade in while drifting outward into their places,
 * from SETTLE_PULL of their travel nearer the centre. The drift runs straight on into the parting,
 * which also moves outward, so the two read as one movement. `settle` goes 0 → 1.
 */
const SETTLE_PULL = 0.08;
const partProgress = (t: number, settle: number) =>
  EASE_PART(Math.min(1, Math.max(0, (t - T.partStart) / (T.partEnd - T.partStart)))) - (1 - settle) * SETTLE_PULL;

/* ---------- Layouts ---------- */

/** One cloud layer: its box in the Clouds frame (left, top, width, height of the box that holds it),
 * the image's own size inside it, its 2D matrix (CSS matrix(a, b, c, d)), and how far it travels. */
type Cloud = { box: [number, number, number, number]; size: [number, number]; m: [number, number, number, number]; from?: [number, number]; to: [number, number] };

type Layout = {
  /** The design frame the screen is fitted to. */
  frame: [number, number];
  /** The Clouds frame (the lens's frame) within it. */
  clouds: [number, number, number, number];
  layers: Cloud[];
  /** Logomark height, and the white disc's top-left relative to the mark's centre. */
  markH: number;
  white: [number, number];
  distortion: Key[];
  aberration: Key[];
};

const I: [number, number, number, number] = [1, 0, 0, 1];
const FLIP_Y: [number, number, number, number] = [1, 0, 0, -1];
const FLIP_X: [number, number, number, number] = [-1, 0, 0, 1];
const TURN: [number, number, number, number] = [-1, 0, 0, -1];
const R30: [number, number, number, number] = [0.866025, 0.5, -0.5, 0.866025];
const R210: [number, number, number, number] = [-0.866025, -0.5, 0.5, -0.866025];
const R_75: [number, number, number, number] = [0.258819, -0.965926, 0.965926, 0.258819];
const R_75F: [number, number, number, number] = [-0.258819, -0.965926, -0.965926, 0.258819];
const R_22: [number, number, number, number] = [0.92737, -0.374145, 0.374145, 0.92737];
const R158: [number, number, number, number] = [-0.92737, 0.374145, -0.374145, -0.92737];

/** Where each layer travels (the same on desktop and mobile), bottom layer first. */
const TRAVEL: { to: [number, number]; from?: [number, number] }[] = [
  { to: [257, 854] },
  { to: [0, 573] },
  { to: [-467, -1026] },
  { to: [0, -760] },
  { to: [-563, 461] },
  { to: [495.896, 561.146] },
  { to: [176, -749] },
  { to: [465.163, -419.658] },
  { to: [-384, -345] },
  { to: [-904, 0] },
  { to: [902, 0] },
  { from: [50, -14], to: [655.61, -706.602] },
  { to: [-646, 422] },
  { to: [-430, -400] },
  { to: [494.248, 326.274] },
];

const withTravel = (layers: Omit<Cloud, 'to' | 'from'>[]): Cloud[] => layers.map((l, i) => ({ ...l, ...TRAVEL[i] }));

/** Desktop, "landing anim" (1440 × 1024). */
const DESKTOP: Layout = {
  frame: [1440, 1024],
  clouds: [-342, -255, 2062.6, 1539],
  layers: withTravel([
    { box: [264, 403, 1377.193, 1185.369], size: [1200, 675.926], m: R30 },
    { box: [801, 869, 461, 670], size: [461, 670], m: I },
    { box: [299, -12, 1377.193, 1185.369], size: [1200, 675.926], m: R210 },
    { box: [801, -378, 721, 1048], size: [721, 1048], m: FLIP_Y },
    { box: [342, 931, 520, 347], size: [520, 347], m: FLIP_X },
    { box: [1262, 933, 520, 346], size: [520, 346], m: I },
    { box: [1086, 204, 745, 496], size: [745, 496], m: FLIP_Y },
    { box: [1262, 256, 520, 347], size: [520, 347], m: FLIP_Y },
    { box: [342, 255, 520, 346], size: [520, 346], m: TURN },
    { box: [-297, 241, 1359.075, 1056.857], size: [772.6, 1200], m: R_75 },
    { box: [1013, 335, 1359.075, 1056.857], size: [772.6, 1200], m: R_75F },
    { box: [731, -234, 1538.293, 1297.238], size: [1307.183, 871.455], m: R_22 },
    { box: [-224, 574, 1538.293, 1297.238], size: [1307.183, 871.455], m: R158 },
    { box: [-212, -145, 1200, 800], size: [1200, 800], m: I },
    { box: [1041, 918, 1200, 800], size: [1200, 800], m: TURN },
  ]),
  markH: 193,
  // The disc's top-left (746, 609) against the mark's centre (719.8, 512.5).
  white: [26.2, 96.5],
  distortion: [
    { t: T.lens[0], v: 0 },
    { t: T.lens[1], v: 0.11 },
    { t: T.lens[2], v: 0.6, ease: EASE_OUT },
    { t: T.lens[3], v: 0 },
  ],
  aberration: [
    { t: T.lens[0], v: 0 },
    { t: T.lens[1], v: 0.07 },
    { t: T.lens[2], v: 0.52, ease: EASE_OUT },
    { t: T.lens[3], v: 0 },
  ],
};

/** Mobile, "Mobile start" (320 × 720). Same travel, smaller clouds, a much gentler lens. */
const MOBILE: Layout = {
  frame: [320, 720],
  clouds: [0, 1, 320, 767],
  layers: withTravel([
    { box: [-172, 274, 575.089, 494.987], size: [501.096, 282.253], m: R30 },
    { box: [190, 408, 192, 280], size: [192, 280], m: I },
    { box: [-220, -91, 575.089, 494.987], size: [501.096, 282.253], m: R210 },
    { box: [102, -245, 301, 438], size: [301, 438], m: FLIP_Y },
    { box: [-93, 434, 217, 144], size: [217, 144], m: FLIP_X },
    { box: [157, 345, 217, 145], size: [217, 145], m: I },
    { box: [180, 156, 311, 207], size: [311, 207], m: FLIP_Y },
    { box: [253, 178, 218, 145], size: [218, 145], m: FLIP_Y },
    { box: [-163, 139, 217, 145], size: [217, 145], m: TURN },
    { box: [-377, 132, 567.523, 441.323], size: [322.623, 501.096], m: R_75 },
    { box: [106, 91, 567.523, 441.323], size: [322.623, 501.096], m: R_75F },
    { box: [-68, -98, 642.361, 541.701], size: [545.854, 363.903], m: R_22 },
    { box: [-260, 475, 642.361, 541.701], size: [545.854, 363.903], m: R158 },
    { box: [-334, -141, 501, 334], size: [501, 334], m: I },
    { box: [25, 521, 501, 334], size: [501, 334], m: TURN },
  ]),
  markH: 97.438,
  // The disc's top-left (181, 436) against the mark's centre (160.2, 360.3).
  white: [20.8, 75.7],
  distortion: [
    { t: T.lens[0], v: 0 },
    { t: T.lens[1], v: 0 },
    { t: 1.884, v: 0.05 },
    { t: T.lens[2], v: 0.06, ease: EASE_OUT },
    { t: T.lens[3], v: 0 },
  ],
  aberration: [
    { t: T.lens[0], v: 0 },
    { t: T.lens[1], v: 0.16 },
    { t: T.lens[2], v: 0.05, ease: EASE_OUT },
    { t: T.lens[3], v: 0 },
  ],
};

const pickLayout = (w: number, h: number) => (w < 640 || w / h < 0.7 ? MOBILE : DESKTOP);

/**
 * Fits a layout to the screen. The clouds cover the screen (like background-size: cover), centred;
 * the mark and white disc keep their size relative to the screen (like contain), centred too.
 */
function fit(layout: Layout, w: number, h: number) {
  const [fw, fh] = layout.frame;
  const cover = Math.max(w / fw, h / fh);
  const contain = Math.min(w / fw, h / fh);
  return { cover, contain, ox: (w - fw * cover) / 2, oy: (h - fh * cover) / 2 };
}

/** The 4 corners (screen px, clockwise from top-left of the image) and object-fit: cover UVs of a layer at progress p. */
function quad(layer: Cloud, p: number, s: number, ox: number, oy: number, cx: number, cy: number) {
  const [bl, bt, bw, bh] = layer.box;
  const [w, h] = layer.size;
  const [a, b, c, d] = layer.m;
  const from = layer.from ?? [0, 0];
  const tx = from[0] + (layer.to[0] - from[0]) * p;
  const ty = from[1] + (layer.to[1] - from[1]) * p;
  // Centre in the design frame (Clouds-frame coords shifted by the frame's offset).
  const mx = cx + bl + bw / 2 + tx;
  const my = cy + bt + bh / 2 + ty;
  const corners = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(([x, y]) => [ox + (mx + a * x + c * y) * s, oy + (my + b * x + d * y) * s]);
  // object-fit: cover of a 3:2 image into a w × h box.
  const boxAspect = w / h;
  let u0 = 0, u1 = 1, v0 = 0, v1 = 1;
  if (boxAspect > IMG_ASPECT) {
    const span = IMG_ASPECT / boxAspect;
    v0 = (1 - span) / 2;
    v1 = 1 - v0;
  } else {
    const span = boxAspect / IMG_ASPECT;
    u0 = (1 - span) / 2;
    u1 = 1 - u0;
  }
  const uvs = [
    [u0, v0],
    [u1, v0],
    [u1, v1],
    [u0, v1],
  ];
  return { corners, uvs };
}

/* ---------- WebGL2 renderer ---------- */

const SPRITE_VERT = `#version 300 es
in vec2 aPos; in vec2 aUv;
uniform vec2 uSize; // the target's size in px
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos.x / uSize.x * 2.0 - 1.0, 1.0 - aPos.y / uSize.y * 2.0, 0.0, 1.0);
}`;

const SPRITE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; out vec4 o;
void main() { o = texture(uTex, vUv); }`;

const FULL_VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/**
 * Figma's "Lens distortion" effect (lateral chromatic mode), ported from WGSL. The cloud layer is
 * pre-rendered into a texture covering the Clouds frame; this pass reads it through the lens.
 * Figma also averages 4 jittered taps per pixel (sub-pixel antialiasing); one tap is used here,
 * which looks the same on soft clouds and costs a quarter as much.
 */
const LENS_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uScreen;     // canvas size in px
uniform float uDpr;
uniform vec4 uFrame;      // Clouds frame: x, y, w, h in CSS px
uniform float uAmount;    // distortion strength
uniform float uChroma;    // (1 + |amount|) * aberration strength
uniform int uTaps;        // 0 = no aberration
uniform float uInvKernel;
uniform float uWeightSum;
out vec4 o;

vec4 tex(vec2 local) {
  vec2 uv = local / uFrame.zw;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(uTex, vec2(uv.x, 1.0 - uv.y));
}
vec2 lens(vec2 local, float amount) {
  vec2 centre = uFrame.zw * 0.5;
  vec2 c = local - centre;
  vec2 n = c / (length(uFrame.zw) * 0.5);
  float d2 = dot(n, n);
  return c * (1.0 + amount * (d2 + d2 * d2)) + centre;
}
vec4 distorted(vec2 local, float amount) { return tex(lens(local, amount)); }

void main() {
  vec2 px = vec2(gl_FragCoord.x, uScreen.y - gl_FragCoord.y) / uDpr;
  vec2 local = px - uFrame.xy;
  if (uTaps == 0) { o = distorted(local, uAmount); return; }
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 48; i++) {
    if (i >= uTaps) break;
    float fi = float(i) * uInvKernel - 0.5;
    float window = 1.0 - abs(fi * 2.0);
    vec4 r = distorted(local, uAmount + (fi + 0.5) * uChroma);
    vec4 g = distorted(local, uAmount + fi * uChroma);
    vec4 b = distorted(local, uAmount + (fi - 0.5) * uChroma);
    float rs = r.a > 0.01 ? r.r / max(0.001, r.a) : 1.0;
    float gs = g.a > 0.01 ? g.g / max(0.001, g.a) : 1.0;
    float bs = b.a > 0.01 ? b.b / max(0.001, b.a) : 1.0;
    float a = max(max(r.a, g.a), b.a);
    acc += vec4(rs * a, gs * a, bs * a, a) * window;
  }
  o = acc / max(uWeightSum, 0.0001);
}`;

/** Figma's aberration kernel at quality "Low" (the setting used in the file). */
function kernel(aberration: number) {
  const bucket = aberration <= 0.001 ? 0 : aberration < 0.08 ? 1 : aberration < 0.18 ? 2 : aberration < 0.35 ? 3 : 4;
  if (bucket === 0) return { taps: 0, inv: 1, sum: 1 };
  const size = Math.max(3, (64 / 3) * [0, 0.25, 0.5, 0.75, 1][bucket]);
  const taps = Math.ceil(size);
  const inv = 1 / Math.max(size - 1, 1);
  let sum = 0;
  for (let i = 0; i < taps; i++) sum += 1 - Math.abs((i * inv - 0.5) * 2);
  return { taps, inv, sum };
}

type Renderer = { draw: (t: number, settle: number) => void; resize: () => void; dispose: () => void };

function compile(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const prog = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader');
    gl.attachShader(prog, sh);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
  return prog;
}

function webglRenderer(canvas: HTMLCanvasElement, img: HTMLImageElement): Renderer | null {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: import.meta.env.DEV });
  if (!gl) return null;
  let sprite: WebGLProgram, lensProg: WebGLProgram;
  try {
    sprite = compile(gl, SPRITE_VERT, SPRITE_FRAG);
    lensProg = compile(gl, FULL_VERT, LENS_FRAG);
  } catch (e) {
    console.warn('intro: lens shader failed, drawing clouds without it', e);
    return null;
  }

  // The cloud cut-out, premultiplied, mipmapped (it's often drawn well below its size).
  const cloudTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, cloudTex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // The Clouds frame, rendered flat, before the lens.
  const fboTex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  let fboW = 0, fboH = 0;

  const spriteVao = gl.createVertexArray();
  const spriteBuf = gl.createBuffer();
  gl.bindVertexArray(spriteVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
  const aPos = gl.getAttribLocation(sprite, 'aPos');
  const aUv = gl.getAttribLocation(sprite, 'aUv');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

  const fullVao = gl.createVertexArray();
  gl.bindVertexArray(fullVao);
  const fullBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fullBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aFull = gl.getAttribLocation(lensProg, 'aPos');
  gl.enableVertexAttribArray(aFull);
  gl.vertexAttribPointer(aFull, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const su = { size: U(sprite, 'uSize'), tex: U(sprite, 'uTex') };
  const lu = {
    tex: U(lensProg, 'uTex'),
    screen: U(lensProg, 'uScreen'),
    dpr: U(lensProg, 'uDpr'),
    frame: U(lensProg, 'uFrame'),
    amount: U(lensProg, 'uAmount'),
    chroma: U(lensProg, 'uChroma'),
    taps: U(lensProg, 'uTaps'),
    inv: U(lensProg, 'uInvKernel'),
    sum: U(lensProg, 'uWeightSum'),
  };

  let W = 1, H = 1, dpr = 1, fboScale = 1;
  let layout = DESKTOP;
  const verts = new Float32Array(15 * 6 * 4);
  const maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE) as number, 4096);

  const resize = () => {
    W = Math.max(1, canvas.clientWidth);
    H = Math.max(1, canvas.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, W < 640 ? 2 : 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    layout = pickLayout(W, H);
    const { cover } = fit(layout, W, H);
    const cw = layout.clouds[2] * cover;
    const ch = layout.clouds[3] * cover;
    fboScale = Math.min(dpr, maxTex / cw, maxTex / ch);
    const nw = Math.max(1, Math.round(cw * fboScale));
    const nh = Math.max(1, Math.round(ch * fboScale));
    if (nw !== fboW || nh !== fboH) {
      fboW = nw;
      fboH = nh;
      gl.bindTexture(gl.TEXTURE_2D, fboTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fboW, fboH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  };

  const draw = (t: number, settle: number) => {
    const { cover: s, ox, oy } = fit(layout, W, H);
    const [cx, cy, cw, ch] = layout.clouds;
    const p = partProgress(t, settle);

    // 1. Clouds into the frame texture, in frame-local px.
    let k = 0;
    for (const layer of layout.layers) {
      // Positions relative to the Clouds frame's top-left, at the cover scale.
      const { corners, uvs } = quad(layer, p, s, 0, 0, 0, 0);
      for (const i of [0, 1, 2, 0, 2, 3]) {
        verts[k++] = corners[i][0];
        verts[k++] = corners[i][1];
        verts[k++] = uvs[i][0];
        verts[k++] = uvs[i][1];
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fboW, fboH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(sprite);
    gl.uniform2f(su.size, cw * s, ch * s);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cloudTex);
    gl.uniform1i(su.tex, 0);
    gl.bindVertexArray(spriteVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, k / 4);

    // 2. Through the lens onto the screen.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.BLEND);
    gl.useProgram(lensProg);
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.uniform1i(lu.tex, 0);
    gl.uniform2f(lu.screen, canvas.width, canvas.height);
    gl.uniform1f(lu.dpr, canvas.width / W);
    gl.uniform4f(lu.frame, ox + cx * s, oy + cy * s, cw * s, ch * s);
    const amount = sample(layout.distortion, t);
    const ab = sample(layout.aberration, t);
    const kn = kernel(ab);
    gl.uniform1f(lu.amount, amount);
    gl.uniform1f(lu.chroma, (1 + Math.abs(amount)) * ab);
    gl.uniform1i(lu.taps, kn.taps);
    gl.uniform1f(lu.inv, kn.inv);
    gl.uniform1f(lu.sum, kn.sum);
    gl.bindVertexArray(fullVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  };

  const dispose = () => {
    gl.deleteTexture(cloudTex);
    gl.deleteTexture(fboTex);
    gl.deleteFramebuffer(fbo);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

  resize();
  return { draw, resize, dispose };
}

/** No WebGL2: the same clouds with a 2D canvas, without the lens. */
function canvasRenderer(canvas: HTMLCanvasElement, img: HTMLImageElement): Renderer | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  let W = 1, H = 1, dpr = 1;
  const resize = () => {
    W = Math.max(1, canvas.clientWidth);
    H = Math.max(1, canvas.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  };
  const draw = (t: number, settle: number) => {
    const layout = pickLayout(W, H);
    const { cover: s, ox, oy } = fit(layout, W, H);
    const p = partProgress(t, settle);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const [cx, cy] = layout.clouds;
    for (const layer of layout.layers) {
      const { corners, uvs } = quad(layer, p, s, ox, oy, cx, cy);
      // Map the image's crop rectangle onto the quad (an affine map: three corners are enough).
      const [x0, y0] = corners[0], [x1, y1] = corners[1], [x3, y3] = corners[3];
      const sw = (uvs[1][0] - uvs[0][0]) * img.naturalWidth;
      const sh = (uvs[3][1] - uvs[0][1]) * img.naturalHeight;
      ctx.setTransform(((x1 - x0) / sw) * dpr, ((y1 - y0) / sw) * dpr, ((x3 - x0) / sh) * dpr, ((y3 - y0) / sh) * dpr, x0 * dpr, y0 * dpr);
      ctx.drawImage(img, uvs[0][0] * img.naturalWidth, uvs[0][1] * img.naturalHeight, sw, sh, 0, 0, sw, sh);
    }
  };
  resize();
  return { draw, resize, dispose: () => {} };
}

/* ---------- The intro ---------- */

/** Loads the cloud cut-out, giving up after `timeout` ms. */
function loadClouds(timeout: number): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    const timer = window.setTimeout(() => resolve(null), timeout);
    img.onload = () => {
      window.clearTimeout(timer);
      // decode() can stall in a background tab; the image is usable once loaded anyway.
      const done = () => resolve(img);
      img.decode().then(done, done);
      window.setTimeout(done, 300);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = CLOUD_SRC;
  });
}

/** Positions the mark and the white disc for the current screen. */
function placeStage(stage: HTMLElement) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const layout = pickLayout(w, h);
  const { contain } = fit(layout, w, h);
  // The mark is drawn 193 px tall; the mobile design's is half that.
  stage.style.setProperty('--intro-scale', String(contain * (layout.markH / DESKTOP.markH)));
  // The disc keeps its 613 px size in the design's own px, so its offset is set in mark units.
  const unit = DESKTOP.markH / layout.markH;
  stage.style.setProperty('--intro-white-x', `${layout.white[0] * unit}px`);
  stage.style.setProperty('--intro-white-y', `${layout.white[1] * unit}px`);
  stage.style.setProperty('--intro-white-size', `${613 * unit}px`);
  stage.style.setProperty('--intro-sweep', `${-281 * unit}px`);
}

/** How far the Figma timeline is pushed back to make room for the clouds fading in. */
const LEAD = 0.4;
/** The fade-in and drift into place; it ends just before the parting starts. */
const FADE_IN = LEAD + T.partStart - 0.02;

/**
 * Plays the landing animation. Resolves when the screen has gone white and starts fading to the
 * page, so the hero entrance can start underneath it.
 */
export function playCloudIntro(): Promise<void> {
  const intro = q('#intro');
  const curtain = q('#curtain');
  if (curtain) curtain.style.display = 'none';
  if (!intro) return Promise.resolve();
  const canvas = q<HTMLCanvasElement>('.intro__clouds', intro)!;
  const stage = q('.intro__stage', intro)!;
  const mark = q('.intro__mark', intro)!;
  const white = q('.intro__white', intro)!;

  placeStage(stage);
  gsap.set(mark, { scale: 1.67, autoAlpha: 0 });
  gsap.set(white, { autoAlpha: 0, x: 0, y: 0 });
  gsap.set(canvas, { autoAlpha: 0 });

  return loadClouds(4000).then(
    (img) =>
      new Promise<void>((resolve) => {
        const renderer = img ? (webglRenderer(canvas, img) ?? canvasRenderer(canvas, img)) : null;
        if (!renderer) canvas.style.display = 'none';
        const clock = { t: 0, settle: 0 };
        let cloudsDone = !renderer;
        const draw = () => {
          if (cloudsDone || !renderer) return;
          renderer.draw(clock.t, clock.settle);
          // Past the end of the lens and the parting, the clouds are gone: stop drawing.
          if (clock.t >= T.lens[3] && clock.t >= T.partEnd) {
            cloudsDone = true;
            canvas.style.display = 'none';
            renderer.dispose();
          }
        };
        const onResize = () => {
          placeStage(stage);
          if (!cloudsDone) {
            renderer?.resize();
            draw();
          }
        };
        window.addEventListener('resize', onResize);

        // Warm up while the canvas is still invisible: the first draw compiles the shaders and
        // uploads the texture, which can stall a frame or two. The fade-in only starts after that,
        // so its first frames are smooth.
        draw();
        let started = false;
        const start = () => {
          if (started) return;
          started = true;
          const sweep = () => parseFloat(stage.style.getPropertyValue('--intro-sweep')) || -281;
          const at = (figmaTime: number) => LEAD + figmaTime;
          const tl = gsap
            .timeline({
              onComplete: () => {
                window.removeEventListener('resize', onResize);
                intro.style.display = 'none';
              },
            })
            // The clouds fade in and drift outward into place.
            .to(canvas, { autoAlpha: 1, duration: FADE_IN * 0.8, ease: 'power2.out' }, 0)
            .to(clock, { settle: 1, duration: FADE_IN, ease: 'power3.out', onUpdate: draw }, 0)
            // Then the Figma timeline.
            .to(clock, { t: T.sweepEnd, duration: T.sweepEnd, ease: 'none', onUpdate: draw }, at(0))
            .to(mark, { scale: 1, duration: T.markScaleEnd - T.markScaleStart, ease: EASE_INOUT }, at(T.markScaleStart))
            .to(mark, { autoAlpha: 1, duration: T.markFadeEnd - T.markFadeStart, ease: EASE_FADE_IN }, at(T.markFadeStart))
            .to(white, { autoAlpha: 1, duration: T.whiteInEnd - T.whiteIn, ease: EASE_INOUT }, at(T.whiteIn))
            .to(white, { x: sweep, y: sweep, duration: T.sweepEnd - T.sweepStart, ease: EASE_PART }, at(T.sweepStart))
            // Plain white now: fade it away to the hero.
            .add(resolve, at(T.sweepEnd))
            .to(intro, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, at(T.sweepEnd));
          if (import.meta.env.DEV) (window as unknown as { __intro: gsap.core.Timeline }).__intro = tl; // for checking frames in dev
        };
        requestAnimationFrame(() => requestAnimationFrame(start));
        window.setTimeout(start, 150); // rAF doesn't run in a background tab
      }),
  );
}

export function hideIntro() {
  const intro = q('#intro');
  if (intro) intro.style.display = 'none';
}

/** The logomark as drawn in the Figma frame (165.6 × 193). */
export const INTRO_MARK = `<svg class="intro__mark" viewBox="0 0 165.603 193" width="165.603" height="193" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="intro-mark-grad" x1="24.3835" y1="193" x2="105.273" y2="-18.8614" gradientUnits="userSpaceOnUse">
      <stop offset="0.65263" stop-color="#00B0FF"/>
      <stop offset="0.986642" stop-color="#1E6EF3"/>
    </linearGradient>
  </defs>
  <path fill="url(#intro-mark-grad)" fill-rule="evenodd" clip-rule="evenodd" d="M109.004 0H54.795L6.697 114.461C2.435 121.767 0 130.899 0 140.032C0 169.256 24.353 193 53.577 193C63.286 193 81.026 193 81.026 193C65.109 183.811 53.601 159.546 53.601 140.032C53.601 130.899 56.036 121.767 60.298 114.461L109.004 0Z"/>
  <path fill="#171717" fill-rule="evenodd" clip-rule="evenodd" d="M110.808 193H54.795L104.719 76.104C107.764 68.798 109.59 61.492 109.59 52.969C109.59 33.986 97.754 9.353 82.723 0C82.723 0 102.392 0 112.634 0C141.858 0 165.603 23.745 165.603 52.969C165.603 61.492 163.776 68.798 160.732 76.104L110.808 193Z"/>
</svg>`;
