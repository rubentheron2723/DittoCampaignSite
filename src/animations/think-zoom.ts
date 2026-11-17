import { gsap, q, qa, ScrollSmoother, ScrollTrigger } from './gsap';
import { bezier, compile, FULL_VERT, kernel, LENS_FRAG } from '../shared/intro';

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

/** A drawn statement, where it sits, and the point it zooms about (the middle of its title). */
type Plate = { tex: WebGLTexture; x: number; y: number; w: number; h: number; px: number; py: number };

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
function drawFromDom(item: HTMLElement, origin: DOMRect, res: number, family: string) {
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
  for (const el of qa<HTMLElement>('.think__title, .think__body', item)) {
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${family}`;
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    ctx.fillStyle = cs.color;
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

export function initThinkZoom(animate: boolean) {
  const section = q('.think');
  const stage = section && q('.think__stage', section);
  const canvas = section && q<HTMLCanvasElement>('.think__lens', section);
  if (!section || !stage || !canvas || !animate) return;
  const statements = qa<HTMLElement>('.think__item', section);
  if (statements.length < 2) return;
  let family = "'DM Sans', sans-serif";

  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: true });
  if (!gl) return;
  let sprite: WebGLProgram, lensProg: WebGLProgram;
  try {
    sprite = compile(gl, SPRITE_VERT, SPRITE_FRAG);
    lensProg = compile(gl, FULL_VERT, LENS_FRAG);
  } catch (err) {
    console.warn('think: shaders failed', err);
    return;
  }
  section.classList.add('think--gl');

  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const su = { size: U(sprite, 'uSize'), tex: U(sprite, 'uTex'), alpha: U(sprite, 'uAlpha') };
  const lu = {
    tex: U(lensProg, 'uTex'), screen: U(lensProg, 'uScreen'), dpr: U(lensProg, 'uDpr'), frame: U(lensProg, 'uFrame'),
    amount: U(lensProg, 'uAmount'), chroma: U(lensProg, 'uChroma'), taps: U(lensProg, 'uTaps'),
    inv: U(lensProg, 'uInvKernel'), sum: U(lensProg, 'uWeightSum'),
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
    // Text drawn sharper than the screen, so it holds up a little as it grows.
    plates.forEach((p) => gl.deleteTexture(p.tex));
    const res = Math.min(dpr * 1.5, 3);
    const origin = stage.getBoundingClientRect();
    plates = statements.map((item) => {
      const d = drawFromDom(item, origin, res, family);
      return { tex: texFrom(d.canvas), x: d.x, y: d.y, w: d.w, h: d.h, px: d.px, py: d.py };
    });
  };

  /** Where the scroll is: a step number (0 = the first statement settled) with a fraction. */
  const pos = { v: 0 };
  const stateOf = (i: number) => {
    // The statement's own step runs from i (arriving) to i + 1 (leaving).
    const local = pos.v - i;
    if (local < -1 || local > 1) return null;
    if (local < 0) {
      // Arriving: during the end of the previous step.
      const t = 1 + local;
      const a = EASE(gsap.utils.clamp(0, 1, (t - T.fadeInStart) / (T.fadeInEnd - T.fadeInStart)));
      return a > 0 ? { scale: ARRIVE_SCALE + (1 - ARRIVE_SCALE) * a, turn: 0, alpha: a } : null;
    }
    if (i === statements.length - 1) return { scale: 1, turn: 0, alpha: 1 };
    const z = EASE(gsap.utils.clamp(0, 1, (local - T.zoomStart) / (T.zoomEnd - T.zoomStart)));
    const f = EASE(gsap.utils.clamp(0, 1, (local - T.fadeOutStart) / (T.zoomEnd - T.fadeOutStart)));
    const alpha = 1 - f;
    return alpha > 0.001 ? { scale: 1 + (SCALE - 1) * z, turn: TURN * z, alpha } : null;
  };
  /** How far through the current move the flight is (0 at rest on a statement). */
  const moveAt = () => {
    const i = Math.floor(pos.v);
    return i >= statements.length - 1 ? 0 : pos.v - i;
  };

  /** Whether a statement is in flight: then the canvas shows; otherwise the HTML statement does. */
  let flying = false;
  const show = (current: number, inFlight: boolean) => {
    flying = inFlight;
    section.classList.toggle('think--flying', inFlight);
    statements.forEach((el, i) => el.classList.toggle('is-current', i === current));
  };

  const draw = () => {
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
    gl.useProgram(sprite);
    gl.uniform2f(su.size, frame.w, frame.h);
    gl.uniform1i(su.tex, 0);
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
      gl.bindTexture(gl.TEXTURE_2D, p.tex);
      gl.uniform1f(su.alpha, st.alpha);
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
    const kn = kernel(fringe);
    gl.uniform1f(lu.amount, amount);
    gl.uniform1f(lu.chroma, (1 + Math.abs(amount)) * fringe);
    gl.uniform1i(lu.taps, kn.taps);
    gl.uniform1f(lu.inv, kn.inv);
    gl.uniform1f(lu.sum, kn.sum);
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

  const steps = statements.length - 1;

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
  /** Wheel input since the last move (trackpads send many small events per gesture). */
  let acc = 0;
  /** Until this time, wheel events are the tail of a gesture already used (trackpad inertia), not a new one. */
  let quietUntil = 0;
  const QUIET = 220;
  const THRESHOLD = 30;

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
    busyUntil = performance.now() + duration * 1000;
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
    quietUntil = performance.now() + QUIET;
    // Stop at the section's top, a pixel inside so the pin counts as active (the stage is pinned there, so the page
    // doesn't visibly move).
    jumpTo(st.start + 1);
    freeze(true);
    flight?.kill();
    busyUntil = 0;
    index = at;
    pos.v = at;
    show(at, false);
    schedule();
  };
  const release = (dir: 1 | -1) => {
    if (!captured || !st) return;
    captured = false;
    releasedAt = performance.now();
    freeze(false);
    // Carry on from the section's far edge going down (still pinned, so nothing jumps), or from just above it going up.
    jumpTo(dir > 0 ? st.end + 2 : st.start - 2);
  };
  const busy = () => performance.now() < busyUntil;
  const step = (dir: 1 | -1) => {
    if (busy()) return;
    const to = index + dir;
    if (to < 0) release(-1);
    else if (to > steps) release(1);
    else move(to);
    acc = 0;
    // Swallow the rest of this gesture (and its inertia) so one swipe is one step.
    quietUntil = performance.now() + QUIET + STEP_TIME * 1000;
  };

  window.addEventListener(
    'wheel',
    (e) => {
      if (!captured) return;
      e.preventDefault();
      const now = performance.now();
      if (now < quietUntil || busy()) {
        // Still the same gesture: keep waiting for a pause before the next one counts.
        quietUntil = Math.max(quietUntil, now + QUIET);
        return;
      }
      acc += e.deltaY;
      if (Math.abs(acc) > THRESHOLD) step(acc > 0 ? 1 : -1);
    },
    { passive: false },
  );
  let touchY = 0;
  window.addEventListener('touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
  window.addEventListener(
    'touchmove',
    (e) => {
      if (!captured) return;
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) > 40) {
        step(dy > 0 ? 1 : -1);
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
    step(down ? 1 : -1);
  });

  show(0, false);
  Promise.all([document.fonts.ready, loadCanvasFont()]).then(([, f]) => {
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
        layout();
        draw();
      },
    });
    ScrollTrigger.refresh();
  });
}
