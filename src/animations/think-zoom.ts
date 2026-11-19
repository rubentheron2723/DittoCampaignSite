import { gsap, q, qa, ScrollSmoother, ScrollTrigger } from './gsap';
import { bezier, capKernel, compile, FULL_VERT, kernel, LENS_FRAG } from '../shared/intro';
import { createTeamScene, type TeamScene } from './team-logo';
import { sdfField } from './sdf';
import { coverGone } from '../shared/cover';

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
/** How long one move takes (s): Figma's zoom, 27.8% to 83.3% of 3.6 s. */
const STEP_TIME = 2;
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
 * DM Sans with its optical size fixed at the site's 16 (type.css sets opsz with font-variation-settings, which canvas
 * text ignores; at 84px the variable font would otherwise switch to its tighter display cut). Google Fonts serves an
 * instance pinned at one opsz; it is registered under its own name so it never replaces the page's font.
 */
let canvasFamily: Promise<string> | null = null;
function loadCanvasFont() {
  canvasFamily ??= (async () => {
    try {
      const css = await (await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@16,400;16,500;16,700&display=block')).text();
      const style = document.createElement('style');
      style.textContent = css.replace(/font-family: 'DM Sans'/g, "font-family: 'DM Sans Canvas'");
      document.head.appendChild(style);
      await Promise.all(['400', '500', '700'].map((w) => document.fonts.load(`${w} 40px "DM Sans Canvas"`)));
      return "'DM Sans Canvas', 'DM Sans', sans-serif";
    } catch {
      return "'DM Sans', sans-serif";
    }
  })();
  return canvasFamily;
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
 *   - `screen` (Product: the app window), already in the stage: it arrives behind the last statement as that one
 *     flies, exactly as a next statement would (rising out of the depth), but as live HTML, fitted to the screen
 *     (its scale is left in its `data-fit`). After it come its `scenes`, a stop each, and then any statements marked
 *     `data-after`, which arrive through the lens as the screen fades.
 * `onStop` hears of every stop reached, with the statement it belongs to (the last one at or before it).
 * Returns whether the team joined the stage.
 */
export function initThinkZoom(
  animate: boolean,
  opts: { team?: HTMLElement; screen?: HTMLElement; scenes?: StageScene[]; onStop?: (statement: HTMLElement) => void } = {},
): boolean {
  const { team, screen, onStop } = opts;
  const scenes = screen ? (opts.scenes ?? []) : [];
  const section = q('.think');
  const stage = section && q('.think__stage', section);
  const canvas = section && q<HTMLCanvasElement>('.think__lens', section);
  if (!section || !stage || !canvas || !animate) return false;
  const statements = qa<HTMLElement>('.think__item', section);
  if (statements.length + (screen ? 1 : 0) < 2) return false;
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
   * The stops in order: the statements, the screen, its scenes, then the statements after it. `screenAt` is the
   * screen's stop and `screenEnd` its last scene's; `stopOf` is a statement's stop.
   */
  const before = screen ? statements.filter((el) => !('after' in el.dataset)).length : statements.length;
  const screenAt = screen ? before : -1;
  const screenEnd = screen ? screenAt + scenes.length : -1;
  const stopOf = (i: number) => (i < before ? i : screenEnd + 1 + (i - before));
  const sceneAt = (stop: number) => (screen && stop > screenAt && stop <= screenEnd ? scenes[stop - screenAt - 1] : null);
  /** The screen's scale to fit the stage. */
  let screenFit = 1;

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
    if (screen) {
      screenFit = Math.min(1, (W - 160) / screen.offsetWidth, (H - 240) / screen.offsetHeight);
      screen.dataset.fit = String(screenFit);
    }
    // The screen's own resolution (to 2x): the flying type stays as sharp as the HTML it takes over from.
    dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    if (i === statements.length - 1 && !screen) return { scale: 1, turn: 0, alpha: 1 };
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
  const placeScreen = () => {
    if (!screen) return;
    const local = pos.v - screenAt;
    let a: number, scale: number;
    if (local < 0) {
      a = local < -1 ? 0 : EASE(gsap.utils.clamp(0, 1, (1 + local - T.fadeInStart) / (T.fadeInEnd - T.fadeInStart)));
      scale = ARRIVE_SCALE + (1 - ARRIVE_SCALE) * a;
    } else {
      const out = EASE(gsap.utils.clamp(0, 1, (pos.v - screenEnd) / T.fadeInStart));
      a = 1 - out;
      scale = 1 + 0.08 * out;
    }
    screen.style.opacity = String(a);
    screen.style.visibility = a > 0 ? 'visible' : 'hidden';
    screen.style.transform = `translate(-50%, -50%) scale(${screenFit * scale})`;
  };

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

  /** The last stop: the team scene when it's in the stage, otherwise the last statement (or the screen's last scene). */
  const last = statements.length - 1;
  const teamAt = scene ? statements.length : -1;
  const steps = scene ? teamAt : screen ? Math.max(screenEnd, stopOf(last)) : last;
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
  /** After a move lands, the statement holds this long before a kept swipe moves on (s): each is seen at rest. */
  const HOLD = 0.5;

  // While the stage holds the scroll the nav stays folded to its mark (see .nav--hold in base.css), and opens fully
  // while the pointer is up in its strip.
  const nav = document.getElementById('nav');
  const holdNav = (on: boolean) => {
    nav?.classList.toggle('nav--hold', on);
    if (!on) nav?.classList.remove('nav--peek');
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      if (!captured || !nav || e.pointerType === 'touch') return;
      nav.classList.toggle('nav--peek', e.clientY < nav.offsetHeight + 24);
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => nav?.classList.remove('nav--peek'));

  const smoother = () => ScrollSmoother.get();
  const freeze = (on: boolean) => {
    const sm = smoother();
    if (sm) sm.paused(on);
    else document.documentElement.style.overflow = on ? 'hidden' : '';
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
      // The screen's scenes as they'd be by now: played up to here, not yet beyond.
      for (let k = scenes.length - 1; k >= 0; k--) if (screenAt + 1 + k > at) scenes[k].reset();
      scenes.forEach((s, k) => screenAt + 1 + k <= at && s.finish());
      show(at, false);
    }
    schedule();
  };
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
  /** Into one of the screen's scenes, or back out of it: played on the screen, which stays where it is. */
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
      onEnter: () => capture(0),
      onEnterBack: () => capture(steps),
      onRefresh: () => {
        if (scene && team) fitTeam(team);
        layout();
        draw();
      },
    });
    ScrollTrigger.refresh();
  });
  return !!scene;
}
