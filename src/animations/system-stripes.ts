import { MARK_L, MARK_R } from '../shared/mark';

/**
 * Striped "contour" renderer for the system section.
 *
 * Draws a soft 3D-looking tube covered in black-and-white contour stripes,
 * inspired by layered-outline sculptures. The tube follows a shape's outline
 * (circle, triangle, square, ...), and the shapes morph into each other and
 * finally into the solid Ditto mark. Everything is a 2D signed-distance field
 * in one fragment shader, so morphing is a mix between two fields.
 *
 * Shape codes: 0 = circle, 3..8 = regular polygon with that many sides, 99 = Ditto mark.
 */
export const SHAPE_MARK = 99;

const MARK_W = 624;
const MARK_H = 727;
/** The mark's height in shader units (the visual box spans -1..1). */
const MARK_UNITS = 1.42;
/** Padding around the mark covered by the distance texture, as a fraction of its size. */
const MARK_PAD = 0.6;
const SDF_SCALE = 0.35;

const VERTEX = `#version 300 es
void main() {
  vec2 positions[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 uResolution;   // canvas size in px
uniform float uTime;
uniform float uShapeA;
uniform float uShapeB;
uniform float uMix;
uniform float uRotation;
uniform sampler2D uMarkSdf;  // R32F signed distance to the mark, in mark px (negative inside)
uniform vec2 uMarkSdfSize;   // texels
uniform vec4 uMarkDomain;    // x0, y0, width, height of the texture in mark px

out vec4 outColor;

const float PI = 3.14159265;
const float BAND = 0.19;      // tube half-width, in units
const float STRIPES = 6.0;    // stripes from the tube's edge to its crest
const vec3 INK = vec3(0.059, 0.078, 0.114);
const vec3 PAPER = vec3(1.0);

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float valueNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

// Exact distance to a regular polygon with circumradius r (Inigo Quilez).
float sdRegularPolygon(vec2 p, float r, float n) {
  float an = PI / n;
  vec2 acs = vec2(cos(an), sin(an));
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p.y += clamp(-p.y, 0.0, r * acs.y);
  return length(p) * sign(p.x);
}

vec2 rotate(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float markSdf(vec2 p) {
  // Units (y up) -> mark px (y down, origin at the mark's top-left).
  float pxPerUnit = ${MARK_H.toFixed(1)} / ${MARK_UNITS.toFixed(3)};
  vec2 m = vec2(p.x * pxPerUnit + ${(MARK_W / 2).toFixed(1)}, -p.y * pxPerUnit + ${(MARK_H / 2).toFixed(1)});
  vec2 t = (m - uMarkDomain.xy) / uMarkDomain.zw * uMarkSdfSize - 0.5;
  vec2 tc = clamp(t, vec2(0.0), uMarkSdfSize - 1.0);
  // Manual bilinear filtering (float textures aren't filterable without an extension).
  ivec2 i0 = ivec2(floor(tc));
  ivec2 i1 = min(i0 + 1, ivec2(uMarkSdfSize) - 1);
  vec2 f = tc - vec2(i0);
  float a = texelFetch(uMarkSdf, i0, 0).r;
  float b = texelFetch(uMarkSdf, ivec2(i1.x, i0.y), 0).r;
  float c = texelFetch(uMarkSdf, ivec2(i0.x, i1.y), 0).r;
  float d = texelFetch(uMarkSdf, i1, 0).r;
  float dist = mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  // Outside the texture, keep growing with distance so the field stays sensible.
  dist += length(t - tc) * uMarkDomain.z / uMarkSdfSize.x;
  return dist / pxPerUnit;
}

// Distance to a shape's centre line (the middle of the tube).
float centerline(vec2 p, float code) {
  vec2 q = rotate(p, uRotation);
  if (code < 0.5) return length(q) - 0.56;
  float r = 0.78 - 0.035 * code;   // more sides, slightly smaller
  float corner = 0.16;
  return sdRegularPolygon(q, r - corner, code) - corner;
}

// Signed field: negative inside the striped body.
// Between two outlines, the centre line itself morphs so the tube keeps an even width.
// Into the mark (a filled shape, not a tube), the two fields cross-fade.
float field(vec2 p) {
  float markness = (uShapeA > 50.0 ? 1.0 - uMix : 0.0) + (uShapeB > 50.0 ? uMix : 0.0);
  // Wobble bends the shape (a domain warp) rather than thickening it.
  vec2 warp = vec2(
    valueNoise(vec3(p * 1.5, uTime * 0.2)) - 0.5,
    valueNoise(vec3(p * 1.5 + 11.0, uTime * 0.2)) - 0.5
  ) * 0.14 + vec2(
    valueNoise(vec3(p * 3.2 + 3.0, uTime * 0.3)) - 0.5,
    valueNoise(vec3(p * 3.2 + 23.0, uTime * 0.3)) - 0.5
  ) * 0.04;
  vec2 q = p + warp * (1.0 - 0.8 * markness);

  bool aMark = uShapeA > 50.0;
  bool bMark = uShapeB > 50.0;
  if (aMark && bMark) return markSdf(q);
  if (!aMark && !bMark) return abs(mix(centerline(q, uShapeA), centerline(q, uShapeB), uMix)) - BAND;
  float tube = abs(centerline(q, aMark ? uShapeB : uShapeA)) - BAND;
  return aMark ? mix(markSdf(q), tube, uMix) : mix(tube, markSdf(q), uMix);
}

// Tube height profile: 0 at the edge, 1 at the crest.
float heightAt(float f) {
  float s = clamp(-f / BAND, 0.0, 1.0);
  return sqrt(1.0 - (1.0 - s) * (1.0 - s));
}

void main() {
  float unitsPerPx = 2.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * unitsPerPx;

  float f = field(p);
  float e = unitsPerPx;
  float fx = field(p + vec2(e, 0.0));
  float fy = field(p + vec2(0.0, e));

  // Thin hairline just outside the body, like the reference's outer outline.
  float hair = 1.0 - smoothstep(0.0, 1.2, abs(f - 0.012) / unitsPerPx);

  float coverage = clamp(0.5 - f / unitsPerPx, 0.0, 1.0);
  if (coverage <= 0.0 && hair <= 0.0) {
    outColor = vec4(0.0);
    return;
  }

  // Stripes are evenly spaced along the tube's cross-section arc, so they bunch up at the edges.
  float s = clamp(-f / BAND, 0.0, 1.0);
  float arc = acos(1.0 - s) / (PI * 0.5);
  float stripes = arc * STRIPES;
  float tri = abs(fract(stripes) - 0.5) * 2.0;
  float aa = fwidth(stripes) * 1.5;
  float ink = smoothstep(0.5 - aa, 0.5 + aa, tri);
  // Where stripes get finer than a pixel, settle to grey instead of shimmering.
  ink = mix(ink, 0.5, clamp(aa * 2.0 - 0.5, 0.0, 1.0));
  vec3 base = mix(PAPER, INK, ink);

  // Lighting from the tube's surface normal.
  float h = heightAt(f) * BAND;
  vec2 grad = vec2(heightAt(fx) * BAND - h, heightAt(fy) * BAND - h) / e;
  vec3 n = normalize(vec3(-grad, 1.0));
  vec3 light = normalize(vec3(-0.45, 0.6, 0.75));
  float diffuse = clamp(dot(n, light), 0.0, 1.0);
  float spec = pow(max(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);
  vec3 color = base * (0.62 + 0.38 * diffuse) + vec3(spec * 0.55);

  vec3 hairColor = vec3(0.55, 0.58, 0.62);
  float alpha = max(coverage, hair * 0.6);
  vec3 rgb = mix(hairColor, color, coverage / max(alpha, 0.0001));
  outColor = vec4(rgb * alpha, alpha);
}`;

/** Signed distance (in mark px) to the Ditto mark, computed once on the CPU. */
function buildMarkSdf() {
  const padX = MARK_W * MARK_PAD;
  const padY = MARK_H * MARK_PAD;
  const domain = { x: -padX, y: -padY, w: MARK_W + padX * 2, h: MARK_H + padY * 2 };
  const w = Math.round(domain.w * SDF_SCALE);
  const h = Math.round(domain.h * SDF_SCALE);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.scale(w / domain.w, h / domain.h);
  ctx.translate(-domain.x, -domain.y);
  ctx.fill(new Path2D(MARK_L), 'evenodd');
  ctx.fill(new Path2D(MARK_R), 'evenodd');
  const pixels = ctx.getImageData(0, 0, w, h).data;

  const INF = 1e20;
  const inside = new Float64Array(w * h);
  const outside = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const filled = pixels[i * 4 + 3] > 127;
    inside[i] = filled ? INF : 0;
    outside[i] = filled ? 0 : INF;
  }
  edt(inside, w, h);
  edt(outside, w, h);

  const data = new Float32Array(w * h);
  const pxPerTexel = domain.w / w;
  for (let i = 0; i < w * h; i++) data[i] = (Math.sqrt(outside[i]) - Math.sqrt(inside[i])) * pxPerTexel;
  return { data, w, h, domain };
}

/** 2D squared Euclidean distance transform (Felzenszwalb & Huttenlocher), in place. */
function edt(grid: Float64Array, w: number, h: number) {
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  const pass = (len: number) => {
    let k = 0;
    v[0] = 0;
    z[0] = -Infinity;
    z[1] = Infinity;
    for (let q = 1; q < len; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = Infinity;
    }
    k = 0;
    for (let q = 0; q < len; q++) {
      while (z[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
  };
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    pass(h);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    pass(w);
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];
  }
}

function compile(gl: WebGL2RenderingContext) {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'compile failed');
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link failed');
  return program;
}

export type StripesState = { shapeA: number; shapeB: number; mix: number; rotation: number };

export type StripesRenderer = {
  render: (state: StripesState, timeSeconds: number) => void;
  resize: () => void;
};

/** Returns null when WebGL2 isn't available, so the caller can keep its static fallback. */
export function createStripesRenderer(canvas: HTMLCanvasElement): StripesRenderer | null {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return null;

  let program: WebGLProgram;
  try {
    program = compile(gl);
  } catch (err) {
    console.warn('System section shape disabled:', err);
    return null;
  }

  const sdf = buildMarkSdf();
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, sdf.w, sdf.h, 0, gl.RED, gl.FLOAT, sdf.data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const vao = gl.createVertexArray();
  const loc = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    resolution: loc('uResolution'),
    time: loc('uTime'),
    shapeA: loc('uShapeA'),
    shapeB: loc('uShapeB'),
    mix: loc('uMix'),
    rotation: loc('uRotation'),
    markSdf: loc('uMarkSdf'),
    markSdfSize: loc('uMarkSdfSize'),
    markDomain: loc('uMarkDomain'),
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  const render = (state: StripesState, timeSeconds: number) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(u.resolution, canvas.width, canvas.height);
    gl.uniform1f(u.time, timeSeconds);
    gl.uniform1f(u.shapeA, state.shapeA);
    gl.uniform1f(u.shapeB, state.shapeB);
    gl.uniform1f(u.mix, state.mix);
    gl.uniform1f(u.rotation, state.rotation);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(u.markSdf, 0);
    gl.uniform2f(u.markSdfSize, sdf.w, sdf.h);
    gl.uniform4f(u.markDomain, sdf.domain.x, sdf.domain.y, sdf.domain.w, sdf.domain.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  resize();
  return { render, resize };
}
