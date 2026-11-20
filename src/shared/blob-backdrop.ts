import { createBlobsPass, type BlobParams } from './footer-blobs';
import { covered } from './cover';

const MAX_DPR = 1.5;

/**
 * The footer's Moving blobs over a flat colour (or an image: a canvas, such as a gradient drawn into one, stretched over
 * the section), on a canvas (sized by its own CSS box) behind a section's content (Figma's ShaderEffect works on
 * the whole frame, but that needs HTML-in-Canvas, so here the content sits on top, undistorted). Renders only while
 * the section is on screen; with reduced motion it draws one still frame. Without WebGL2 float targets the canvas
 * just stays hidden. Adds `<section class>--fx` once the first frame is drawn.
 */
export function initBlobBackdrop(
  section: HTMLElement,
  canvas: HTMLCanvasElement,
  fxClass: string,
  params: BlobParams,
  colour: [number, number, number] | HTMLCanvasElement,
  reduce: boolean,
  intensity = 1,
  /** Frames per second at most. Behind long reading pages (FAQ, legal) 30 looks the same and halves the GPU work. */
  fps = 60,
) {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: true });
  if (!gl) return;
  const pass = createBlobsPass(gl, params, intensity);
  if (!pass) return;

  // The input: one pixel of the section's colour, or the given image, stretched.
  const input = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, input);
  if (colour instanceof HTMLCanvasElement) {
    // GL's rows run bottom-up: flipped on the way in, the image's top is the canvas's top.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, colour);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([...colour, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  let visible = false;
  let raf = 0;
  let lost = false;
  let lastDraw = 0;
  // A lost context (iOS drops them under memory pressure): stop drawing and let the section's own colour show.
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    section.classList.remove(fxClass);
  });
  const frame = (now: number) => {
    if (lost) return;
    pass.draw(input, now, reduce);
    section.classList.add(fxClass);
  };
  const loop = (now: number) => {
    // Held still under the entry cover (see cover.ts); it resumes as the cover lifts.
    if (lost) return void (raf = 0);
    if (covered(kick)) return void (raf = 0);
    if (now - lastDraw >= 1000 / fps - 2) {
      lastDraw = now;
      frame(now);
    }
    raf = visible && !reduce ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => {
    if (visible && !raf) raf = requestAnimationFrame(loop);
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    pass.resize(w, h);
    // Resizing clears the canvas (to black, as it is opaque): redraw before the browser paints it.
    frame(performance.now());
  };
  resize();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  }).observe(section);
}
