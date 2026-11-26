import { gsap, q } from '../animations/gsap';
import type { PageId } from '../content/shared';
import { markCoverGone, settleUnderCover } from './cover';
import { currentMode } from './colour-mode';
import {
  compile, EASE_PART, FLIP_Y, FULL_VERT, GLSL_MAP, kernel, LENS_FRAG, loadClouds, quad, R210, R_22, TURN,
  type Cloud,
} from './intro';

/**
 * Moving between pages (Figma "Transition anim", 2378:1385): the page arrives under a white veil, and a drift of
 * clouds sweeps across the screen, through the same lens as the landing intro, pulling the veil off with it.
 * One 1.2 s move, every value read from the Figma keyframes:
 *
 *   0 → 1.2 s      Four cloud cut-outs (each doubled, as in the file) sweep 1500–2200 px across the screen.
 *   0.27 → 1.2 s   The big blurred white veil follows them off the screen, uncovering the page.
 *
 * Figma sweeps up and to the left. Each page has its own heading for the same move (SWEEP below), so going from page
 * to page feels like the sky moving on in a different direction each time. The landing intro (intro.ts) still plays
 * on a fresh visit or reload; this plays only after following a link from another page of the site.
 */

/** The direction the veil and clouds travel, in screen degrees (0 = to the right, 90 = down). Figma's is up-left. */
const FIGMA_HEADING = (Math.atan2(-1633, -2217) * 180) / Math.PI; // ≈ -143.6
const SWEEP: Record<PageId, number> = {
  home: FIGMA_HEADING, // as designed: off towards the top left
  product: 0, // in from the left, off to the right
  pricing: -90, // up from below
  about: -180 - FIGMA_HEADING, // the design mirrored: off towards the top right
  faq: 180, // in from the right, off to the left
  contact: 90, // down from the top
  signin: -FIGMA_HEADING, // off towards the bottom left
  privacy: 180 + FIGMA_HEADING, // off towards the bottom right
  terms: FIGMA_HEADING + 90, // off towards the top right, steeper than About
};

const DURATION = 1.2;
/** The veil holds still for the first 22.64% of the move while the clouds get going. */
const VEIL_HOLD = 0.2717;

/** The Figma frame (1440 × 1024) and its Clouds frame. */
const FRAME: [number, number] = [1440, 1024];
const CLOUDS: [number, number, number, number] = [-342, -255, 2062.6, 1539];
const LAYERS: Cloud[] = [
  { box: [772, 1197, 1377.193, 1185.369], size: [1200, 675.926], m: R210, to: [-1507, -1854] },
  { box: [1390, 1197, 721, 1048], size: [721, 1048], m: FLIP_Y, from: [312, 19], to: [-1507, -1854] },
  { box: [801, 1463, 520, 346], size: [520, 346], m: TURN, to: [-1507, -1854] },
  { box: [1601, -114, 1538.293, 1297.238], size: [1307.183, 871.455], m: R_22, from: [-5, 280], to: [-2171, -655] },
];
const ALL = [...LAYERS, ...LAYERS];
/** The lens: Figma's 0.36 barrel distortion, no aberration. */
const DISTORTION = 0.36;
/** The veil: a 2071 × 1473 white ellipse blurred 52.55 px, centred on the frame, travelling 2754 px. */
const VEIL: [number, number] = [2071, 1473];
const VEIL_BLUR = 52.55;
const VEIL_TRAVEL = Math.hypot(2217, 1633);
/** A little larger than Figma's, so its blurred rim stays clear of the corners for any heading and screen shape. */
const VEIL_GROW = 1.14;

const KEY = 'ditto:page-transition';

/**
 * The layers are object-fit: cover crops of one 3:2 cut-out, and the tall crop cuts straight through its big cloud.
 * Figma shows that hard edge; here each layer's edges fade out over FEATHER of its size, so only soft cloud shows.
 */
const FEATHER = 0.14;
const SPRITE_VERT = `#version 300 es
in vec2 aPos; in vec2 aUv; in vec2 aLocal;
uniform vec2 uSize;
out vec2 vUv; out vec2 vLocal;
void main() {
  vUv = aUv; vLocal = aLocal;
  gl_Position = vec4(aPos.x / uSize.x * 2.0 - 1.0, 1.0 - aPos.y / uSize.y * 2.0, 0.0, 1.0);
}`;
const SPRITE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv; in vec2 vLocal; uniform sampler2D uTex; out vec4 o;${GLSL_MAP}
void main() {
  vec2 e = smoothstep(0.0, ${FEATHER}, vLocal) * smoothstep(0.0, ${FEATHER}, 1.0 - vLocal);
  o = gradientMap(texture(uTex, vUv)) * e.x * e.y;
}`;
const LOCAL = [[0, 0], [1, 0], [1, 1], [0, 1]];

/** Marks the next page load as a move within the site (see coverAndGo). */
export function flagPageTransition() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage blocked: the next page plays the landing intro instead */
  }
}

/** True once, on the page load that follows a move within the site. */
export function takePageTransition() {
  try {
    const on = sessionStorage.getItem(KEY) === '1';
    sessionStorage.removeItem(KEY);
    return on;
  } catch {
    return false;
  }
}

type Renderer = { draw: (p: number) => void; resize: () => void; dispose: () => void };

/** Cover-fits the Figma frame to the screen, and where the Clouds frame lands. */
function fit(W: number, H: number) {
  const s = Math.max(W / FRAME[0], H / FRAME[1]);
  const ox = (W - FRAME[0] * s) / 2;
  const oy = (H - FRAME[1] * s) / 2;
  return { s, frameX: ox + CLOUDS[0] * s, frameY: oy + CLOUDS[1] * s, frameW: CLOUDS[2] * s, frameH: CLOUDS[3] * s, ox, oy };
}

/** Every layer's corners (in the Clouds frame's own px, at scale s), turned about the screen centre by `turn`. */
function layerQuads(p: number, s: number, turn: number, pivotX: number, pivotY: number) {
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  return ALL.map((layer) => {
    const { corners, uvs } = quad(layer, p, s, 0, 0, 0, 0);
    return {
      uvs,
      corners: corners.map(([x, y]) => {
        const dx = x - pivotX;
        const dy = y - pivotY;
        return [pivotX + dx * cos - dy * sin, pivotY + dx * sin + dy * cos];
      }),
    };
  });
}

function webglRenderer(canvas: HTMLCanvasElement, img: HTMLImageElement, turn: number): Renderer | null {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  let sprite: WebGLProgram, lensProg: WebGLProgram;
  try {
    sprite = compile(gl, SPRITE_VERT, SPRITE_FRAG);
    lensProg = compile(gl, FULL_VERT, LENS_FRAG);
  } catch {
    return null;
  }

  const cloudTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, cloudTex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

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
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 24, 8);
  const aLocal = gl.getAttribLocation(sprite, 'aLocal');
  gl.enableVertexAttribArray(aLocal);
  gl.vertexAttribPointer(aLocal, 2, gl.FLOAT, false, 24, 16);

  const fullVao = gl.createVertexArray();
  gl.bindVertexArray(fullVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aFull = gl.getAttribLocation(lensProg, 'aPos');
  gl.enableVertexAttribArray(aFull);
  gl.vertexAttribPointer(aFull, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const su = { size: U(sprite, 'uSize'), tex: U(sprite, 'uTex'), map: U(sprite, 'uMap') };
  const lu = {
    tex: U(lensProg, 'uTex'), screen: U(lensProg, 'uScreen'), dpr: U(lensProg, 'uDpr'), frame: U(lensProg, 'uFrame'),
    amount: U(lensProg, 'uAmount'), chroma: U(lensProg, 'uChroma'), taps: U(lensProg, 'uTaps'),
    inv: U(lensProg, 'uInvKernel'), sum: U(lensProg, 'uWeightSum'),
  };
  const kn = kernel(0);
  const verts = new Float32Array(ALL.length * 6 * 6);
  const maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE) as number, 4096);
  let W = 1, H = 1;

  const resize = () => {
    W = Math.max(1, canvas.clientWidth);
    H = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, W < 640 ? 2 : 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const f = fit(W, H);
    // Soft clouds: the frame texture never needs more than the screen's own density.
    const scale = Math.min(dpr, maxTex / f.frameW, maxTex / f.frameH);
    const nw = Math.max(1, Math.round(f.frameW * scale));
    const nh = Math.max(1, Math.round(f.frameH * scale));
    if (nw === fboW && nh === fboH) return;
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
  };

  const draw = (p: number) => {
    const f = fit(W, H);
    // The screen's centre, in the Clouds frame's px.
    const quads = layerQuads(p, f.s, turn, W / 2 - f.frameX, H / 2 - f.frameY);
    let k = 0;
    for (const { corners, uvs } of quads) {
      for (const i of [0, 1, 2, 0, 2, 3]) {
        verts[k++] = corners[i][0];
        verts[k++] = corners[i][1];
        verts[k++] = uvs[i][0];
        verts[k++] = uvs[i][1];
        verts[k++] = LOCAL[i][0];
        verts[k++] = LOCAL[i][1];
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fboW, fboH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(sprite);
    gl.uniform2f(su.size, f.frameW, f.frameH);
    gl.uniform1f(su.map, currentMode() === 'dark' ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cloudTex);
    gl.uniform1i(su.tex, 0);
    gl.bindVertexArray(spriteVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, k / 6);

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
    gl.uniform4f(lu.frame, f.frameX, f.frameY, f.frameW, f.frameH);
    gl.uniform1f(lu.amount, DISTORTION);
    gl.uniform1f(lu.chroma, 0);
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

/** No WebGL2: the same clouds on a 2D canvas, without the lens. */
function canvasRenderer(canvas: HTMLCanvasElement, img: HTMLImageElement, turn: number): Renderer | null {
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
  const draw = (p: number) => {
    const f = fit(W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const { corners, uvs } of layerQuads(p, f.s, turn, W / 2 - f.frameX, H / 2 - f.frameY)) {
      const [x0, y0] = corners[0], [x1, y1] = corners[1], [x3, y3] = corners[3];
      const sw = (uvs[1][0] - uvs[0][0]) * img.naturalWidth;
      const sh = (uvs[3][1] - uvs[0][1]) * img.naturalHeight;
      ctx.setTransform(
        ((x1 - x0) / sw) * dpr, ((y1 - y0) / sw) * dpr, ((x3 - x0) / sh) * dpr, ((y3 - y0) / sh) * dpr,
        (f.frameX + x0) * dpr, (f.frameY + y0) * dpr,
      );
      ctx.drawImage(img, uvs[0][0] * img.naturalWidth, uvs[0][1] * img.naturalHeight, sw, sh, 0, 0, sw, sh);
    }
  };
  resize();
  return { draw, resize, dispose: () => {} };
}

/** Sizes the veil for the screen: the Figma ellipse, cover-scaled, centred. */
function placeVeil(veil: HTMLElement) {
  const { s } = fit(window.innerWidth, window.innerHeight);
  const w = VEIL[0] * s * VEIL_GROW;
  const h = VEIL[1] * s * VEIL_GROW;
  Object.assign(veil.style, {
    width: `${w}px`, height: `${h}px`, left: `${(window.innerWidth - w) / 2}px`, top: `${(window.innerHeight - h) / 2}px`,
    filter: `blur(${VEIL_BLUR * s}px)`,
  });
  return s;
}

/**
 * Plays the move onto this page. Resolves partway through, as the veil starts to clear, so the page's own entrance
 * runs while it is uncovered.
 */
export function playPageTransition(page: PageId): Promise<void> {
  const intro = q('#intro');
  const curtain = q('#curtain');
  if (curtain) curtain.style.display = 'none';
  if (!intro) return Promise.resolve();
  // A fresh canvas each time: the one before may already have played (and released its WebGL context), as when the
  // browser brings a page back from its back/forward cache.
  const used = q<HTMLCanvasElement>('.intro__clouds', intro)!;
  const canvas = used.cloneNode() as HTMLCanvasElement;
  canvas.removeAttribute('style');
  used.replaceWith(canvas);
  const veil = q('.intro__veil', intro)!;
  gsap.set(veil, { x: 0, y: 0 });
  intro.style.display = '';
  gsap.set(intro, { autoAlpha: 1 });
  // The landing intro's own pieces stay hidden; the intro's white backing holds until the veil is in place.
  intro.classList.add('intro--page');
  gsap.set(canvas, { autoAlpha: 0 });

  const heading = SWEEP[page] ?? FIGMA_HEADING;
  const turn = ((heading - FIGMA_HEADING) * Math.PI) / 180;
  const dir = [Math.cos((heading * Math.PI) / 180), Math.sin((heading * Math.PI) / 180)];

  // The clouds are preloaded (see the pages' <head>) and usually cached; if they're slow, the veil goes without them
  // rather than holding the page back.
  return loadClouds(600).then(
    (img) =>
      new Promise<void>((resolve) => {
        const renderer = img ? (webglRenderer(canvas, img, turn) ?? canvasRenderer(canvas, img, turn)) : null;
        if (!renderer) canvas.style.display = 'none';
        const clock = { p: 0 };
        const draw = () => renderer?.draw(clock.p);
        let s = placeVeil(veil);
        const onResize = () => {
          s = placeVeil(veil);
          renderer?.resize();
          draw();
        };
        window.addEventListener('resize', onResize);
        draw(); // compile and upload before anything moves

        let started = false;
        const start = () => {
          if (started) return;
          started = true;
          // The veil now covers the screen on its own.
          intro.style.background = 'transparent';
          gsap
            .timeline({
              onComplete: () => {
                window.removeEventListener('resize', onResize);
                renderer?.dispose();
                intro.style.display = 'none';
                intro.style.background = '';
                markCoverGone();
                intro.classList.remove('intro--page');
              },
            })
            .to(canvas, { autoAlpha: 1, duration: 0.15, ease: 'power1.out' }, 0)
            .to(clock, { p: 1, duration: DURATION, ease: EASE_PART, onUpdate: draw }, 0)
            .to(veil, {
              x: () => dir[0] * VEIL_TRAVEL * s,
              y: () => dir[1] * VEIL_TRAVEL * s,
              duration: DURATION - VEIL_HOLD,
              ease: EASE_PART,
            }, VEIL_HOLD)
            .add(resolve, VEIL_HOLD + 0.2);
        };
        // Start once frames are reaching the screen again. Arriving, the page sets up its own WebGL backgrounds under
        // the cover, and the GPU compiles their shaders before it shows another frame (most of a second on a Mac).
        // A fixed timer started the clouds' clock inside that stall, so the sweep ran half-unseen and then froze; two
        // quick frames in a row mean the GPU has caught up. Capped, so a slow machine still gets the sweep.
        // First, the page's own heavy set-up runs under the still cover (cover.ts underCover), so it doesn't land on
        // the moving clouds.
        settleUnderCover(1200).then(() => {
          const t0 = performance.now();
          let prev = 0;
          let quick = 0;
          const wait = (now: number) => {
            quick = prev && now - prev < 50 ? quick + 1 : 0;
            prev = now;
            if (quick >= 2 || now - t0 > 1500) start();
            else requestAnimationFrame(wait);
          };
          requestAnimationFrame(wait);
          // rAF doesn't run in a background tab: start there without waiting for frames.
          if (document.hidden) window.setTimeout(start, 150);
        });
      }),
  );
}
