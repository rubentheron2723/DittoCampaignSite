import { gsap, q, qa, ScrollSmoother, ScrollTrigger } from './gsap';
import { onModeChange } from '../shared/colour-mode';
import { bezier, capKernel, compile, FULL_VERT, kernel, LENS_FRAG } from '../shared/intro';
import { createTeamScene, type TeamScene } from './team-logo';
import { sdfField } from './sdf';
import { coverGone } from '../shared/cover';
import { loadCanvasFont } from '../shared/canvas-font';

/**
 * "We think independently." (Figma 2390:287): the section pins and scrolling flies the reader through its statements.
 * Each one holds, then swells twenty times over and turns 30 degrees as if the camera rushes through it, fading as it
 * passes, and the next statement settles in behind it. All of it is seen through Figma's Lens distortion, which wakes
 * up as the zoom starts and bends the type outwards as it grows (Figma's own lens keyframes, below).
 *
 * The section takes over the scroll while it's on screen (see "takes the scroll" below): each gesture moves one
 * statement, and each move plays over a fixed time (Figma's 2 s zoom), however fast the wheel or trackpad goes.
 *
 * At rest, the statement on screen is the page's own HTML text: crisp, and set exactly as the design system sets it.
 * Only while one flies does the WebGL version take over: each statement is drawn into a texture word by word at the
 * HTML's own positions (so its breaks, spacing and size match), in DM Sans fixed at the site's optical size (opsz 16,
 * which canvas text can't otherwise take), and composited in WebGL2 at the screen's full resolution: first
 * flat into the lens frame, then through the lens onto the screen. The HTML list stays in the page for screen readers
 * and is what shows without WebGL or with reduced motion.
 */

/**
 * Timings as fractions of one move (STEP_TIME). The zoom is Figma's 2 s; the fade-out starts a little into it, and the
 * next statement arrives over the second half, rising out of the depth (from ARRIVE_SCALE) as the last one clears.
 */
const T = {
  zoomStart: 0,
  zoomEnd: 1,
  fadeOutStart: 0.25,
  fadeInStart: 0.5,
  fadeInEnd: 1,
};
/** How long one move takes (s). Figma's zoom runs 2 s; quicker here so stepping through doesn't feel like a wait. */
const STEP_TIME = 1.2;
const ARRIVE_SCALE = 0.82;
const SCALE = 20.180792;
const TURN = (-30 * Math.PI) / 180;
const EASE = bezier(0.5, 0, 0.5, 1);
/**
 * The zoom's own ease: quicker off the mark than Figma's in-out (0.5, 0, 0.5, 1), which barely moved the statement for
 * the first fifth of a second (1x to 1.07x), so a scroll seemed to pause before anything happened. This one is at
 * 1.18x by 0.1 s and 1.75x by 0.2 s, and still settles as gently.
 */
const ZOOM_EASE = bezier(0.3, 0, 0.4, 1);
/** The lens: Figma's Lens distortion over a 2062.6 x 1539 frame at (-265, -304) in the 1440 x 1024 section. */
const FRAME = { x: -265, y: -304, w: 2062.6, h: 1539 };
/**
 * Figma's lens keyframes (the Lens distortion on 2390:521), as fractions of a move (Figma's 1.0 s to 3.0 s). The lens
 * is off at rest; it eases in as the zoom starts (0.11 distortion, 0.07 aberration at 1.5 s), peaks at 2.6 s (0.6 and
 * 0.52) and snaps back to nothing as the statement clears. Each key's ease runs to the next key.
 */
type Key = { t: number; v: number; ease?: (x: number) => number };
const E_INOUT = bezier(0.5, 0, 0.5, 1);
const E_OUT = bezier(0, 0, 0, 1);
const at = (s: number) => (s - 1) / 2;
const LENS_DISTORTION: Key[] = [
  { t: at(1), v: 0, ease: E_INOUT },
  { t: at(1.49662), v: 0.11, ease: E_INOUT },
  { t: at(2.601206), v: 0.6, ease: E_OUT },
  { t: at(3), v: 0 },
];
const LENS_ABERRATION: Key[] = [
  { t: at(1), v: 0, ease: E_INOUT },
  { t: at(1.49662), v: 0.07, ease: E_INOUT },
  { t: at(2.601206), v: 0.52, ease: E_OUT },
  { t: at(3), v: 0 },
];
const sample = (keys: Key[], t: number) => {
  if (t <= keys[0].t) return keys[0].v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t < b.t) return a.v + (b.v - a.v) * (a.ease ?? E_INOUT)((t - a.t) / (b.t - a.t));
  }
  return keys[keys.length - 1].v;
};

const SPRITE_VERT = `#version 300 es
in vec2 aPos; in vec2 aUv;
uniform vec2 uSize;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos.x / uSize.x * 2.0 - 1.0, 1.0 - aPos.y / uSize.y * 2.0, 0.0, 1.0);
}`;
const SPRITE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform float uAlpha; out vec4 o;
void main() { o = texture(uTex, vUv) * uAlpha; }`;

/**
 * The same, from a signed distance field (title in R, copy in G; 0.5 on the letters' edges): the letters' edges are
 * found afresh at whatever size they're drawn, so they stay sharp however far the statement zooms (a bitmap blurs and
 * pixelates as it grows 20x). Each part takes its own colour.
 */
const SDF_FRAG = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform float uAlpha; uniform vec4 uTitle; uniform vec4 uBody; out vec4 o;
float edge(float d) {
  float w = max(fwidth(d) * 0.7, 1e-4);
  return smoothstep(0.5 - w, 0.5 + w, d);
}
void main() {
  vec2 d = texture(uTex, vUv).rg;
  float t = edge(d.r) * uTitle.a;
  float b = edge(d.g) * uBody.a;
  // Premultiplied; the two never overlap.
  o = (vec4(uTitle.rgb, 1.0) * t + vec4(uBody.rgb, 1.0) * b) * uAlpha;
}`;

/** A drawn statement, where it sits, and the point it zooms about (the middle of its title). */
type Plate = {
  tex: WebGLTexture;
  /** Its distance field, once made (until then the bitmap is drawn). */
  sdf?: WebGLTexture;
  title: number[];
  body: number[];
  x: number;
  y: number;
  w: number;
  h: number;
  px: number;
  py: number;
};

/** The distance fields' resolution (texels per CSS px) and reach (texels either side of an edge). */
const SDF_RES = 2;
const SDF_SPREAD = 6;

/** A colour as straight RGBA in 0..1 ('rgb(23, 23, 23)' / 'rgba(23, 23, 23, 0.6)'). */
function rgba(css: string): number[] {
  const m = css.match(/[\d.]+/g)?.map(Number) ?? [23, 23, 23, 1];
  return [m[0] / 255, m[1] / 255, m[2] / 255, m[3] ?? 1];
}


/**
 * Draws a statement exactly where and how the HTML lays it out: every word at its own line box, in the element's
 * computed size, weight, spacing and colour. (A word broken across lines, at a hyphen, is drawn letter by letter.)
 */
function drawFromDom(item: HTMLElement, origin: DOMRect, res: number, family: string, part?: string) {
  const pad = 24;
  const box = item.getBoundingClientRect();
  const c = document.createElement('canvas');
  c.width = Math.ceil((box.width + pad * 2) * res);
  c.height = Math.ceil((box.height + pad * 2) * res);
  const ctx = c.getContext('2d')!;
  ctx.scale(res, res);
  ctx.translate(pad - box.left, pad - box.top);
  ctx.textBaseline = 'alphabetic';
  const range = document.createRange();
  const draw = (node: Text, from: number, to: number, size: number) => {
    range.setStart(node, from);
    range.setEnd(node, to);
    const rects = range.getClientRects();
    if (rects.length !== 1) {
      for (let i = from; i < to; i++) draw(node, i, i + 1, size);
      return;
    }
    const r = rects[0];
    // The text's content box runs from the ascender to the descender (DM Sans: 0.992em and 0.31em).
    ctx.fillText(node.data.slice(from, to), r.left, r.bottom - size * 0.31);
  };
  // One part alone is drawn for its shape only (a distance field), so solid: its colour is applied when drawn.
  for (const el of qa<HTMLElement>(part ?? '.think__title, .think__body', item)) {
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${family}`;
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    ctx.fillStyle = part ? '#000' : cs.color;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      for (const m of node.data.matchAll(/\S+/g)) draw(node, m.index!, m.index! + m[0].length, size);
    }
  }
  const title = q('.think__title', item)!.getBoundingClientRect();
  // Its pivot: the middle of the title's text (the widest line), so the flight passes through the letters.
  range.selectNodeContents(q('.think__title', item)!);
  const lines = Array.from(range.getClientRects());
  const widest = lines.length ? Math.max(...lines.map((r) => r.right)) - title.left : title.width;
  return {
    canvas: c,
    x: box.left - origin.left - pad,
    y: box.top - origin.top - pad,
    w: box.width + pad * 2,
    h: box.height + pad * 2,
    px: title.left - origin.left + widest / 2,
    py: title.top - origin.top + title.height / 2,
  };
}

/** The smallest the team copy is scaled to fit the stage (16-20px type at 12-15px). */
const MIN_FIT = 0.75;
/**
 * Scales the team copy in the stage (--fit) so it, and the mark, fit within the screen. Returns whether they do at
 * MIN_FIT or larger. Side by side only the copy column has to fit; stacked, the copy plus a mark at least 120 tall.
 */
function fitTeam(team: HTMLElement): boolean {
  const copy = q<HTMLElement>('.team__copy', team);
  if (!copy) return false;
  const need = () => {
    const css = getComputedStyle(team);
    return css.flexDirection === 'column' ? copy.scrollHeight + (parseFloat(css.rowGap) || 0) + 120 : copy.scrollHeight;
  };
  let k = 1;
  // Text rewraps as it shrinks, so settle it over a few passes.
  for (let i = 0; i < 4; i++) {
    team.style.setProperty('--fit', k.toFixed(3));
    const ratio = team.clientHeight / need();
    if (ratio >= 1) return true;
    if (k === MIN_FIT) return false;
    k = Math.max(MIN_FIT, k * ratio * 0.99);
  }
  return team.clientHeight >= need();
}

/**
 * A stop after the screen, played on the screen itself (Product: the chat zooming in and running a request). Entering
 * it plays it and returns how long it holds the stage (s); `back` plays it out again going up; `hurry` speeds a play
 * under way to its end (a swipe during it) and returns the time left; `finish` and `reset` jump to its end or start.
 */
export type StageScene = {
  play(): number;
  back(): number;
  hurry(): number;
  finish(): void;
  reset(): void;
};

/**
 * Sets up the section. Its last stop can be one of:
 *   - `team` (About: the next section's content), which joins the stage where it fits and builds its logo in the same
 *     locked view (team-logo.ts);
 *   - `screens` (Product: the app window, then its chat), already in the stage. Each arrives behind the statement
 *     before it as that one flies, exactly as a next statement would (rising out of the depth), but as live HTML,
 *     fitted to the screen (its scale left in its `data-fit`; `fill` ones are the stage's own size and aren't
 *     scaled). After each come its `scenes`, a stop each. Statements belong after the screen numbered in their
 *     `data-group` (0, the default: before the first), and arrive through the lens as the screen before them fades.
 * `onStop` hears of every stop reached, with the statement it belongs to (the last one at or before it). A
 * `think:go` event on the section, with a statement as its detail, takes the stage to it.
 * Returns whether the team joined the stage.
 */
export type StageScreen = { el: HTMLElement; scenes?: StageScene[]; fill?: boolean };
export function initThinkZoom(
  animate: boolean,
  opts: { team?: HTMLElement; screens?: StageScreen[]; onStop?: (statement: HTMLElement) => void } = {},
): boolean {
  const { team, onStop } = opts;
  const screens = opts.screens ?? [];
  const section = q('.think');
  const stage = section && q('.think__stage', section);
  const canvas = section && q<HTMLCanvasElement>('.think__lens', section);
  if (!section || !stage || !canvas || !animate) return false;
  const statements = qa<HTMLElement>('.think__item', section);
  if (statements.length + screens.length < 2) return false;
  let family = "'DM Sans', sans-serif";

  // No multisampling: everything reaching the screen is one full-screen pass, which it would only slow down.
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return false;
  let sprite: WebGLProgram, sdfProg: WebGLProgram, lensProg: WebGLProgram;
  try {
    sprite = compile(gl, SPRITE_VERT, SPRITE_FRAG);
    sdfProg = compile(gl, SPRITE_VERT, SDF_FRAG);
    lensProg = compile(gl, FULL_VERT, LENS_FRAG);
  } catch (err) {
    console.warn('think: shaders failed', err);
    return false;
  }
  section.classList.add('think--gl');

  // The team section moves into the stage as its last stop, and its own section goes: on any screen where its copy
  // fits within one screen (scaled down a little if need be). Where even that can't fit, it stays its own section.
  let scene: TeamScene | null = null;
  if (team) {
    const host = team.closest('section');
    const home = team.parentElement;
    const next = team.nextSibling;
    team.classList.add('think__team');
    stage.appendChild(team);
    if (fitTeam(team)) {
      host?.remove();
      scene = createTeamScene(team, stage);
    } else {
      team.classList.remove('think__team');
      team.style.removeProperty('--fit');
      home?.insertBefore(team, next);
    }
  }

  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const su = { size: U(sprite, 'uSize'), tex: U(sprite, 'uTex'), alpha: U(sprite, 'uAlpha') };
  const du = {
    size: U(sdfProg, 'uSize'), tex: U(sdfProg, 'uTex'), alpha: U(sdfProg, 'uAlpha'),
    title: U(sdfProg, 'uTitle'), body: U(sdfProg, 'uBody'),
  };
  const lu = {
    tex: U(lensProg, 'uTex'), screen: U(lensProg, 'uScreen'), dpr: U(lensProg, 'uDpr'), frame: U(lensProg, 'uFrame'),
    amount: U(lensProg, 'uAmount'), chroma: U(lensProg, 'uChroma'), taps: U(lensProg, 'uTaps'),
    inv: U(lensProg, 'uInvKernel'), sum: U(lensProg, 'uWeightSum'), jitter: U(lensProg, 'uJitter'),
  };

  const quadVao = gl.createVertexArray();
  const quadBuf = gl.createBuffer();
  gl.bindVertexArray(quadVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  const aPos = gl.getAttribLocation(sprite, 'aPos');
  const aUv = gl.getAttribLocation(sprite, 'aUv');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
  const fullVao = gl.createVertexArray();
  gl.bindVertexArray(fullVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aFull = gl.getAttribLocation(lensProg, 'aPos');
  gl.enableVertexAttribArray(aFull);
  gl.vertexAttribPointer(aFull, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const fboTex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  let plates: Plate[] = [];
  let W = 1, H = 1, dpr = 1, fw = 1, fh = 1;
  const frame = { x: 0, y: 0, w: 1, h: 1 };
  const verts = new Float32Array(24);
  /**
   * The stops in order: each group of statements, then the screen after it and that screen's scenes. `screenAt` is a
   * screen's stop and `screenEnd` its last scene's; `stopOf` is a statement's stop.
   */
  const stops: { scene?: StageScene }[] = [];
  const statementStop: number[] = [];
  const screenAt: number[] = [];
  const screenEnd: number[] = [];
  for (let g = 0; g <= screens.length; g++) {
    statements.forEach((el, i) => {
      if (Number(el.dataset.group ?? 0) !== g) return;
      statementStop[i] = stops.length;
      stops.push({});
    });
    if (g === screens.length) break;
    screenAt[g] = stops.length;
    stops.push({});
    (screens[g].scenes ?? []).forEach((scene) => stops.push({ scene }));
    screenEnd[g] = stops.length - 1;
  }
  const stopOf = (i: number) => statementStop[i];
  const sceneAt = (stop: number) => stops[stop]?.scene ?? null;
  /** Each screen's scale to fit the stage. */
  const screenFit = screens.map(() => 1);

  const texFrom = (src: HTMLCanvasElement) => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  };

  const layout = () => {
    W = Math.max(1, stage.clientWidth);
    H = Math.max(1, stage.clientHeight);
    // The screen at its design size (Figma's 1024 x 768 in a 1440 x 1024 frame: 208 either side, 120 above and below),
    // scaled down to keep those margins on a smaller stage.
    screens.forEach((s, k) => {
      screenFit[k] = s.fill ? 1 : Math.min(1, (W - 160) / s.el.offsetWidth, (H - 240) / s.el.offsetHeight);
      s.el.dataset.fit = String(screenFit[k]);
    });
    // The screen's own resolution (to 2x): the flying type stays as sharp as the HTML it takes over from.
    // On touch screens (phones, smaller GPUs, more contexts on the page) 1.5 is plenty.
    dpr = Math.min(window.devicePixelRatio || 1, window.matchMedia('(pointer: coarse)').matches ? 1.5 : 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    // The lens frame, cover-fitted like the section's 1440 x 1024 design frame.
    const s = Math.max(W / 1440, H / 1024);
    const ox = (W - 1440 * s) / 2;
    const oy = (H - 1024 * s) / 2;
    Object.assign(frame, { x: ox + FRAME.x * s, y: oy + FRAME.y * s, w: FRAME.w * s, h: FRAME.h * s });
    const maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE) as number, 4096);
    const fs = Math.min(dpr, maxTex / frame.w, maxTex / frame.h);
    fw = Math.max(1, Math.round(frame.w * fs));
    fh = Math.max(1, Math.round(frame.h * fs));
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // A bitmap of each statement first (drawn at once), then its distance field, made a statement at a time in idle
    // moments, which takes over as each is ready.
    plates.forEach((p) => {
      gl.deleteTexture(p.tex);
      if (p.sdf) gl.deleteTexture(p.sdf);
    });
    const res = Math.min(dpr * 1.5, 3);
    const origin = stage.getBoundingClientRect();
    plates = statements.map((item) => {
      const d = drawFromDom(item, origin, res, family);
      const title = rgba(getComputedStyle(q('.think__title', item)!).color);
      const body = rgba(getComputedStyle(q('.think__body', item)!).color);
      return { tex: texFrom(d.canvas), title, body, x: d.x, y: d.y, w: d.w, h: d.h, px: d.px, py: d.py };
    });
    makeFields(origin);
  };

  let fieldsRun = 0;
  const idle = () =>
    new Promise<void>((r) => ('requestIdleCallback' in window ? requestIdleCallback(() => r(), { timeout: 500 }) : setTimeout(r, 16)));
  // The fields are built in a worker: each is a few hundred thousand distance sums, which on the main thread made the
  // page (and the landing intro over it) stutter. Without workers they're built here, between frames.
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL('./sdf-worker.ts', import.meta.url), { type: 'module' });
  } catch {
    worker = null;
  }
  let jobId = 0;
  const jobs = new Map<number, (field: Uint8Array) => void>();
  worker?.addEventListener('message', (e: MessageEvent<{ id: number; field: Uint8Array }>) => {
    jobs.get(e.data.id)?.(e.data.field);
    jobs.delete(e.data.id);
  });
  const fieldOf = (title: Uint8Array, body: Uint8Array, w: number, h: number) =>
    worker
      ? new Promise<Uint8Array>((resolve) => {
          const id = ++jobId;
          jobs.set(id, resolve);
          worker!.postMessage({ id, title, body, w, h, spread: SDF_SPREAD }, [title.buffer, body.buffer]);
        })
      : Promise.resolve(sdfField(title, body, w, h, SDF_SPREAD));
  /** A canvas's alpha channel, one byte per pixel. */
  const alphaOf = (c: HTMLCanvasElement) => {
    const rgba = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    const a = new Uint8Array(c.width * c.height);
    for (let i = 0; i < a.length; i++) a[i] = rgba[i * 4 + 3];
    return a;
  };
  const makeFields = async (origin: DOMRect) => {
    const run = ++fieldsRun;
    const list = plates;
    for (let i = 0; i < list.length; i++) {
      await idle();
      if (run !== fieldsRun) return;
      const item = statements[i];
      const title = drawFromDom(item, origin, SDF_RES, family, '.think__title');
      const body = drawFromDom(item, origin, SDF_RES, family, '.think__body');
      const w = title.canvas.width;
      const h = title.canvas.height;
      const data = await fieldOf(alphaOf(title.canvas), alphaOf(body.canvas), w, h);
      if (run !== fieldsRun) return;
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8, w, h, 0, gl.RG, gl.UNSIGNED_BYTE, data);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      list[i].sdf = tex;
    }
  };

  /** Where the scroll is: a step number (0 = the first statement settled) with a fraction. */
  const pos = { v: 0 };
  const stateOf = (i: number) => {
    // The statement's own step runs from its stop (arriving) to the next (leaving).
    const local = pos.v - stopOf(i);
    if (local < -1 || local > 1) return null;
    if (local < 0) {
      // Arriving: during the end of the previous step.
      const t = 1 + local;
      const a = EASE(gsap.utils.clamp(0, 1, (t - T.fadeInStart) / (T.fadeInEnd - T.fadeInStart)));
      return a > 0 ? { scale: ARRIVE_SCALE + (1 - ARRIVE_SCALE) * a, turn: 0, alpha: a } : null;
    }
    if (i === statements.length - 1 && !screens.length) return { scale: 1, turn: 0, alpha: 1 };
    const z = ZOOM_EASE(gsap.utils.clamp(0, 1, (local - T.zoomStart) / (T.zoomEnd - T.zoomStart)));
    const f = EASE(gsap.utils.clamp(0, 1, (local - T.fadeOutStart) / (T.zoomEnd - T.fadeOutStart)));
    const alpha = 1 - f;
    return alpha > 0.001 ? { scale: 1 + (SCALE - 1) * z, turn: TURN * z, alpha } : null;
  };
  /** How far through the current move the flight is (0 at rest on a statement). */
  const moveAt = () => {
    const i = Math.floor(pos.v);
    return i >= steps ? 0 : pos.v - i;
  };
  /**
   * The screen: arriving as a statement would over the end of the last move, then at rest at full size through its
   * scenes; leaving, it fades over the first half of the move on (as the next statement starts to arrive), growing
   * a little as if passed.
   */
  const placeScreen = () =>
    screens.forEach(({ el }, k) => {
      const local = pos.v - screenAt[k];
      let a: number, scale: number;
      if (local < 0) {
        a = local < -1 ? 0 : EASE(gsap.utils.clamp(0, 1, (1 + local - T.fadeInStart) / (T.fadeInEnd - T.fadeInStart)));
        scale = ARRIVE_SCALE + (1 - ARRIVE_SCALE) * a;
      } else {
        const out = EASE(gsap.utils.clamp(0, 1, (pos.v - screenEnd[k]) / T.fadeInStart));
        a = 1 - out;
        scale = 1 + 0.08 * out;
      }
      el.style.opacity = String(a);
      el.style.visibility = a > 0 ? 'visible' : 'hidden';
      el.style.transform = `translate(-50%, -50%) scale(${screenFit[k] * scale})`;
    });

  /** Whether a statement is in flight: then the canvas shows; otherwise the HTML statement does. */
  let flying = false;
  // The swap happens in one frame: the canvas is drawn before the HTML text is hidden (taking off), and cleared only
  // after the HTML is back (landing). Drawing on the next frame instead left one frame with neither: a flash.
  const show = (current: number, inFlight: boolean) => {
    flying = inFlight;
    if (inFlight) draw();
    section.classList.toggle('think--flying', inFlight);
    statements.forEach((el, i) => el.classList.toggle('is-current', stopOf(i) === current));
    if (onStop) {
      let owner = statements[0];
      statements.forEach((el, i) => stopOf(i) <= current && (owner = el));
      onStop(owner);
    }
    if (!inFlight) draw();
  };

  const draw = () => {
    placeScreen();
    if (!flying) {
      // At rest the HTML statement is on screen: nothing to draw.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    // 1. The statements, flat, into the lens frame.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fw, fh);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    // Zoom about the middle of the screen, in the frame's own px.
    plates.forEach((p, i) => {
      const st = stateOf(i);
      if (!st) return;
      // Its pivot, in the frame's own px.
      const cx = p.px - frame.x;
      const cy = p.py - frame.y;
      const cos = Math.cos(st.turn) * st.scale;
      const sin = Math.sin(st.turn) * st.scale;
      const corners = [
        [p.x, p.y, 0, 0],
        [p.x + p.w, p.y, 1, 0],
        [p.x + p.w, p.y + p.h, 1, 1],
        [p.x, p.y, 0, 0],
        [p.x + p.w, p.y + p.h, 1, 1],
        [p.x, p.y + p.h, 0, 1],
      ];
      corners.forEach(([x, y, u, v], k) => {
        const dx = x - frame.x - cx;
        const dy = y - frame.y - cy;
        verts.set([cx + dx * cos - dy * sin, cy + dx * sin + dy * cos, u, v], k * 4);
      });
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
      if (p.sdf) {
        gl.useProgram(sdfProg);
        gl.uniform2f(du.size, frame.w, frame.h);
        gl.uniform1i(du.tex, 0);
        gl.uniform4fv(du.title, p.title);
        gl.uniform4fv(du.body, p.body);
        gl.uniform1f(du.alpha, st.alpha);
        gl.bindTexture(gl.TEXTURE_2D, p.sdf);
      } else {
        gl.useProgram(sprite);
        gl.uniform2f(su.size, frame.w, frame.h);
        gl.uniform1i(su.tex, 0);
        gl.uniform1f(su.alpha, st.alpha);
        gl.bindTexture(gl.TEXTURE_2D, p.tex);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
    // 2. Through the lens onto the screen.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(lensProg);
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.uniform1i(lu.tex, 0);
    gl.uniform2f(lu.screen, canvas.width, canvas.height);
    gl.uniform1f(lu.dpr, canvas.width / W);
    gl.uniform4f(lu.frame, frame.x, frame.y, frame.w, frame.h);
    const m = moveAt();
    const amount = sample(LENS_DISTORTION, m);
    const fringe = sample(LENS_ABERRATION, m);
    // At most 12 of Figma's aberration taps, jittered so they blend (see capKernel).
    const kn = capKernel(kernel(fringe), 12);
    gl.uniform1f(lu.amount, amount);
    gl.uniform1f(lu.chroma, (1 + Math.abs(amount)) * fringe);
    gl.uniform1i(lu.taps, kn.taps);
    gl.uniform1f(lu.inv, kn.inv);
    gl.uniform1f(lu.sum, kn.sum);
    gl.uniform1f(lu.jitter, kn.jitter);
    gl.bindVertexArray(fullVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  };

  // At most one draw per frame, however many scroll updates arrive.
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      draw();
    });
  };

  /** The last stop: the team scene when it's in the stage, otherwise the last statement or scene. */
  const last = statements.length - 1;
  const teamAt = scene ? statements.length : -1;
  const steps = scene ? teamAt : stops.length - 1;
  /** How long fading the last statement out takes before the logo starts building (s). */
  const HANDOVER = 0.45;

  /*
   * The section takes the scroll while it is on screen. When it reaches the top (coming down, or back up from below),
   * the page stops there and holds still; each scroll gesture (wheel, trackpad swipe, touch swipe, arrow or page key)
   * then moves one statement, at its own pace. Only past the last statement (or before the first) does a gesture let
   * go of the page, which carries on from where the section ends (or begins).
   *
   * Driving the moves from scroll distance didn't work with smooth scrolling: a flick sent the real scroll position
   * far past the section before the smoothed one caught up, so the page ran on to the next section mid-statement.
   */
  let index = 0;
  let flight: gsap.core.Tween | null = null;
  let captured = false;
  let st: ScrollTrigger | null = null;
  /*
   * One swipe (or wheel spin) is one step, and the next swipe counts as soon as it starts: no need to wait for the
   * page to go quiet. A trackpad keeps sending wheel events for a second or so after the fingers lift (inertia), as
   * a fading tail; a new swipe shows up as a pause, or as the deltas jumping up again once the tail has faded.
   * A swipe that comes while a move is still playing is kept (one at most) and runs as soon as the move allows.
   */
  /** Wheel input in the current gesture. */
  let acc = 0;
  /** The current gesture (counted up as new ones start) and the last one that moved the stage. */
  let gesture = 0;
  let used = -1;
  /** The current gesture's largest delta, and the last delta and its time. */
  let peak = 0;
  let lastAbs = 0;
  let lastAt = 0;
  /** A gap this long between wheel events starts a new gesture (ms). */
  const QUIET = 180;
  /** Scroll (px) a gesture takes to count: low, so a gentle trackpad swipe moves the stage as soon as it starts. */
  const THRESHOLD = 14;
  /** A step asked for while the last is still playing, run when it can (1 down, -1 up, 0 none). */
  let pending: 1 | -1 | 0 = 0;
  /**
   * After a move lands, the statement holds this long before a kept swipe moves on (s): each is seen at rest, and
   * fast scrolling settles between moves rather than running them back to back.
   */
  const HOLD = 0.35;
  /*
   * There is deliberately no way to scroll past the section in one go: a long or fast gesture (a trackpad flick, a
   * spun wheel) is still one step, so nobody skips it by accident. Home and End leave it, and Product's toggle jumps
   * between its stops. (A long-gesture escape hatch used to let go of the section mid-statement.)
   */

  // While the stage holds the scroll the nav stays folded to its mark (see .nav--hold in base.css), and opens fully
  // while the pointer is up in its strip.
  //
  // Something of the stage's own up there (`data-peek-stop`: Product's toggle) is kept clear of it: the nav only opens
  // above it, and while open the stage gets .think--peek with --peek-shift, how far that thing must move down to clear
  // the nav's strip (so it slides out from under the nav, and from under the pointer, which closes the nav again once
  // it leaves the strip).
  const nav = document.getElementById('nav');
  const stop = q<HTMLElement>('[data-peek-stop]', stage);
  const peek = (on: boolean) => {
    nav?.classList.toggle('nav--peek', on);
    section.classList.toggle('think--peek', on);
  };
  const holdNav = (on: boolean) => {
    nav?.classList.toggle('nav--hold', on);
    if (!on) peek(false);
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      if (!captured || !nav || e.pointerType === 'touch') return;
      const strip = nav.offsetHeight + 24;
      // (offsetTop: where it sits unmoved; the stage is pinned at the top of the screen.)
      const stopTop = stop ? stop.offsetTop : Infinity;
      if (stop) section.style.setProperty('--peek-shift', `${Math.max(0, strip + 4 - stopTop)}px`);
      const open = nav.classList.contains('nav--peek');
      peek(e.clientY < (open ? strip : Math.min(strip, stopTop)));
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => peek(false));

  const smoother = () => ScrollSmoother.get();
  /*
   * Holding the page still while the stage has the scroll. On desktop the smoother is paused. On touch screens pausing
   * it laid observers over the whole page, and taps there no longer brought iOS Safari's minimised toolbar back. So
   * there only the smoother's touch normaliser is switched off: our own touchmove handler (below) blocks the drag, taps
   * pass through untouched, and a guard puts the scroll back should anything (a fling's momentum) move it.
   */
  const touchOnly = ScrollTrigger.isTouch === 1;
  let heldAt: number | null = null;
  const guard = () => {
    // The page's own scroll (the smoother's eased position trails it).
    if (heldAt !== null && Math.abs(window.scrollY - heldAt) > 1) window.scrollTo(0, heldAt);
  };
  const freeze = (on: boolean) => {
    const sm = smoother();
    if (!sm) {
      // Native scroll (touch devices, reduced motion): overflow hidden stops the page and any momentum still carrying
      // it; on touch, no panning at all, and the guard puts back anything that slips through.
      const root = document.documentElement;
      root.style.overflow = on ? 'hidden' : '';
      if (!touchOnly) return;
      root.style.touchAction = on ? 'none' : '';
      if (on) {
        heldAt = window.scrollY;
        window.addEventListener('scroll', guard, { passive: true });
      } else {
        heldAt = null;
        window.removeEventListener('scroll', guard);
      }
      return;
    }
    if (!touchOnly) return void sm.paused(on);
    const root = document.documentElement;
    if (on) {
      sm.normalizer?.disable();
      // And no native panning at all while held: left to Safari, a drag could still hide or show its toolbar, resizing
      // the screen under the smoother (black showed below the page). Taps aren't affected by touch-action.
      root.style.touchAction = 'none';
      heldAt = window.scrollY;
      window.addEventListener('scroll', guard, { passive: true });
    } else {
      heldAt = null;
      window.removeEventListener('scroll', guard);
      root.style.touchAction = '';
      sm.normalizer?.enable();
    }
  };
  const jumpTo = (y: number) => {
    const sm = smoother();
    if (sm) sm.scrollTop(y);
    else window.scrollTo(0, y);
  };

  /** When the current move ends, by the clock (not the tween, which stalls if frames do). */
  let busyUntil = 0;
  const move = (to: number) => {
    index = to;
    flight?.kill();
    const duration = STEP_TIME * Math.min(1, Math.abs(to - pos.v));
    busyUntil = performance.now() + (duration + HOLD) * 1000;
    show(to, true);
    flight = gsap.to(pos, {
      v: to,
      duration,
      ease: 'none',
      onUpdate: schedule,
      // Landed: the HTML statement takes over again (drawn at the same place, so nothing shifts).
      onComplete: () => {
        show(to, false);
        schedule();
      },
    });
  };
  /** Just after letting go, the jump out of the section must not count as entering it again. */
  let releasedAt = -Infinity;
  const capture = (at: number) => {
    if (captured || !st || performance.now() - releasedAt < 800) return;
    captured = true;
    acc = 0;
    pending = 0;
    // The gesture that scrolled the page here (and its inertia) has done its job.
    used = gesture;
    // Stop at the section's top, a pixel inside so the pin counts as active (the stage is pinned there, so the page
    // doesn't visibly move).
    jumpTo(st.start + 1);
    freeze(true);
    building = false;
    holdNav(true);
    flight?.kill();
    busyUntil = 0;
    index = at;
    if (at === teamAt) {
      // Back up from below: the team scene, already built.
      pos.v = last;
      section.classList.add('think--team');
      scene!.finish();
      show(last, false);
    } else {
      pos.v = at;
      section.classList.remove('think--team');
      scene?.reset();
      settleScenes(at);
      show(at, false);
    }
    schedule();
  };
  /** The screens' scenes as they'd be at a stop: played up to it, not yet beyond (the later ones reset first). */
  function settleScenes(at: number) {
    for (let k = stops.length - 1; k > at; k--) stops[k].scene?.reset();
    for (let k = 0; k <= at && k < stops.length; k++) stops[k].scene?.finish();
  }
  const release = (dir: 1 | -1) => {
    if (!captured || !st) return;
    captured = false;
    releasedAt = performance.now();
    freeze(false);
    holdNav(false);
    // Carry on from the section's far edge going down (still pinned, so nothing jumps), or from just above it going up.
    jumpTo(dir > 0 ? st.end + 2 : st.start - 2);
  };
  const busy = () => performance.now() < busyUntil;
  /** Whether the team scene has been built this visit: after that it persists as its finished layout. */
  let built = false;
  /** Into the team scene: the last statement fades away, then the logo builds and the copy follows. */
  const toTeam = () => {
    index = teamAt;
    // Settle any flight still under way on the last statement, so only the HTML is left to fade.
    flight?.kill();
    pos.v = last;
    show(last, false);
    section.classList.add('think--team');
    building = !built;
    if (built) {
      // Played once already: the finished layout simply fades back in (a refresh plays it again).
      scene!.show();
      busyUntil = performance.now() + 700;
      return;
    }
    scene!.reset();
    // Busy through the hand-over and then the build itself, whose length is set once it starts. Until then, held
    // indefinitely: a short guess left a gap if that start came late (a slow frame), and a swipe in it left the page.
    busyUntil = Infinity;
    gsap.delayedCall(HANDOVER, () => {
      const d = scene!.play();
      built = true;
      // Held through the build: the page can't be scrolled on until the layout has landed.
      busyUntil = performance.now() + d * 1000;
    });
  };
  /** Back up out of it: the team layout fades away, then the last statement fades back in (toTeam in reverse). */
  const fromTeam = () => {
    index = last;
    building = false;
    busyUntil = performance.now() + (HANDOVER + 0.6) * 1000;
    show(last, false);
    gsap.to(team!, {
      opacity: 0,
      duration: HANDOVER,
      ease: 'power1.out',
      onComplete: () => {
        section.classList.remove('think--team');
        gsap.set(team!, { clearProps: 'opacity' });
        if (built) scene!.finish();
        else scene!.reset();
        gsap.fromTo(statements[last], { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out', clearProps: 'opacity' });
      },
    });
  };
  /** Into one of a screen's scenes, or back out of it: played on the screen, which stays where it is. */
  const toScene = (to: number, s: StageScene, dir: 1 | -1) => {
    index = to;
    flight?.kill();
    pos.v = to;
    show(to, false);
    schedule();
    const d = dir > 0 ? s.play() : s.back();
    busyUntil = performance.now() + (d + (dir > 0 ? HOLD : 0)) * 1000;
  };
  const step = (dir: 1 | -1) => {
    const to = index + dir;
    const into = dir > 0 ? sceneAt(to) : null;
    const outOf = dir < 0 ? sceneAt(index) : null;
    if (to < 0) release(-1);
    else if (to > steps) release(1);
    else if (to === teamAt) toTeam();
    else if (index === teamAt) fromTeam();
    else if (into) toScene(to, into, 1);
    else if (outOf) toScene(to, outOf, -1);
    else move(to);
  };
  /** Whether the logo is building (the first time in); set until the build's end, which busy() marks. */
  let building = false;
  /** Runs the step now, or keeps it for when the current move allows. */
  let waiting: ReturnType<typeof setTimeout> | undefined;
  const flush = () => {
    clearTimeout(waiting);
    if (!pending || !captured) return void (pending = 0);
    const left = busyUntil - performance.now();
    // (Checked again at least every second: the end isn't known yet while the logo's build is starting.)
    if (left > 0) return void (waiting = setTimeout(flush, Math.min(left, 1000) + 10));
    const dir = pending;
    pending = 0;
    step(dir);
  };
  const request = (dir: 1 | -1) => {
    // A scene still playing (judged by the scene, not the clock, which runs ahead when frames are slow): a swipe on
    // hurries it to its end, where it then holds, rather than leaving it.
    const playing = sceneAt(index);
    if (dir > 0 && playing) {
      const left = playing.hurry();
      if (left > 0) {
        busyUntil = performance.now() + (left + HOLD) * 1000;
        return;
      }
    }
    if (!busy()) {
      pending = 0;
      step(dir);
      return;
    }
    // While the logo builds (the first time in), scrolling on does nothing: the build always plays out in full, and the
    // next swipe after it moves on. (Speeding it up, and keeping a swipe for afterwards, let two quick swipes skip
    // the section almost entirely.)
    if (dir > 0 && index === teamAt && building) return;
    pending = dir;
    flush();
  };

  /**
   * Straight to a stop (Product's toggle): arriving as if from the stop before it, with the scenes settled to match.
   * From outside the section, the page goes to it and it opens there.
   */
  const goTo = (to: number) => {
    if (!st || scene || to < 0 || to > steps) return;
    if (!captured) {
      releasedAt = -Infinity;
      capture(to);
      return;
    }
    if (to === index) return;
    pending = 0;
    flight?.kill();
    settleScenes(to - 1);
    pos.v = to - 1;
    index = to - 1;
    const into = sceneAt(to);
    if (into) toScene(to, into, 1);
    else move(to);
  };
  section.addEventListener('think:go', (e) => {
    const i = statements.indexOf((e as CustomEvent<HTMLElement>).detail);
    if (i >= 0) goTo(stopOf(i));
  });

  window.addEventListener(
    'wheel',
    (e) => {
      // Gestures are tracked even while the page scrolls freely, so the one that arrives here is known as such.
      const now = performance.now();
      const d = Math.abs(e.deltaY);
      // A new gesture: after a pause, or the deltas jumping back up once the last one's tail had faded.
      if (now - lastAt > QUIET || (lastAbs < peak * 0.5 && d > lastAbs * 1.6 + 4)) {
        gesture++;
        acc = 0;
        peak = 0;
      }
      peak = Math.max(peak, d);
      lastAbs = d;
      lastAt = now;
      if (!captured) return;
      e.preventDefault();
      if (gesture === used) return;
      acc += e.deltaY;
      if (Math.abs(acc) > THRESHOLD) {
        used = gesture;
        request(acc > 0 ? 1 : -1);
      }
    },
    { passive: false },
  );
  let touchY = 0;
  /** Whether this touch has already stepped: one swipe, one step. */
  let touchUsed = false;
  window.addEventListener(
    'touchstart',
    (e) => {
      touchY = e.touches[0].clientY;
      touchUsed = false;
    },
    { passive: true },
  );
  window.addEventListener(
    'touchmove',
    (e) => {
      if (!captured) return;
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      if (!touchUsed && Math.abs(dy) > 40) {
        touchUsed = true;
        request(dy > 0 ? 1 : -1);
        touchY = e.touches[0].clientY;
      }
    },
    { passive: false },
  );
  window.addEventListener('keydown', (e) => {
    if (!captured) return;
    // Home and End leave the section for the page's top or bottom (the browser's own jump then carries on).
    if (e.key === 'End' || e.key === 'Home') return release(e.key === 'End' ? 1 : -1);
    const down = ['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key);
    const up = ['ArrowUp', 'PageUp'].includes(e.key);
    if (!down && !up) return;
    e.preventDefault();
    request(down ? 1 : -1);
  });

  show(0, false);
  // Set up once the entry cover is fully gone: drawing the statements (and then their fields), pinning and refreshing
  // ScrollTrigger is real work, which mid-transition made the clouds jump. The section is a long way down anyway.
  Promise.all([document.fonts.ready, loadCanvasFont(), coverGone()]).then(([, f]) => {
    family = f;
    layout();
    draw();
    st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      // One screen of pinned scroll: room to stop at the top, and to leave from the bottom without a jump.
      end: '+=100%',
      pin: stage,
      invalidateOnRefresh: true,
      // Measured before the triggers set up earlier at boot (the nav's light/dark sections, reveals): created after
      // them, it was measured last, so they all missed its screen of pinned scroll and the nav turned white over the
      // stage's last screen.
      refreshPriority: 1,
      onEnter: () => capture(0),
      onEnterBack: () => capture(steps),
      onRefresh: () => {
        if (scene && team) fitTeam(team);
        layout();
        draw();
      },
    });
    ScrollTrigger.refresh();
    // Light or dark mode: the statements are drawn from their CSS colours, so draw them again in the new ones.
    onModeChange(() => {
      layout();
      draw();
    });
  });
  return !!scene;
}
