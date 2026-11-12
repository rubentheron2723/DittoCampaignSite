/**
 * The closing CTA's cloudy sky.
 *
 * A WebGL2 port of the Figma "Clouds" shader fill (version 3) on the
 * "footerpt1" frame, run with that frame's settings. Figma's runtime is
 * WebGPU-only, so the WGSL is translated line for line to GLSL and the uniform
 * mapping mirrors Figma's render(). The clouds drift slowly by advancing the
 * shader's "Phase" (evolution) over time, starting from the frame's value.
 *
 * Without WebGL2 the section keeps its CSS sky gradient.
 */

const PARAMS = {
  cloudColor: [0.929, 0.973, 1.0],
  cloudShadowColor: [0.1176, 0.4314, 0.9529],
  sky: [
    { at: 0, color: [0.1176, 0.4314, 0.9529] },
    { at: 1, color: [0, 0.6902, 1] },
  ],
  transform: { x: 29.5724, y: 44.37, radius: 59.3623, angle: 5.4422 },
  coverage: 21,
  density: 53,
  brightness: 58,
  globalDetail: 50,
  shadingVariation: 50,
  warpAmount: 84,
  warpScale: 1,
  stretch: 8,
  evolution: 13,
};

/** How fast the clouds evolve, in shader phase units per second. */
const DRIFT = 0.012;
/** The clouds are soft, so they render below screen resolution (canvas pixels per CSS pixel). */
const RENDER_SCALE = 0.75;

const VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 positions[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vec2 p = positions[gl_VertexID];
  // Top-left origin, like Figma's quad.
  vUv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform vec3 uCloudColor;
uniform vec3 uCloudShadowColor;
uniform vec3 uSky0;
uniform vec3 uSky1;
uniform vec2 uSkyP;
uniform vec2 uGlobalPos;
uniform float uGlobalZoom;
uniform float uEvolution;
uniform float uGlobalDetail;
uniform float uCoverage;
uniform float uDensity;
uniform float uBrightness;
uniform float uShadingVariation;
uniform float uWarpAmount;
uniform float uWarpScale;
uniform float uStretch;
uniform float uCloudRotation;
uniform vec2 uDims;
// Parting (0 = none): clouds slide out to the sides and the sky flattens to uFlat.
uniform float uPart;
uniform vec3 uFlat;

in vec2 vUv;
out vec4 outColor;

vec2 hash2(vec2 p) {
  vec2 q = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(q) * 43758.5453123);
}

float noise(vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = a.x > a.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), vec3(0.0));
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

vec2 rotateScale(vec2 v) {
  return vec2(1.6 * v.x + 1.2 * v.y, -1.2 * v.x + 1.6 * v.y);
}

mat2 rot2(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, s, -s, c);
}

float field(vec2 uv0, int octaves, float startW, float decay, bool ridged, float t) {
  vec2 v = uv0;
  float total = 0.0;
  float w = startW;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    float s = noise(v);
    if (ridged) s = abs(s);
    total += w * s;
    v = rotateScale(v) + t;
    w *= decay;
  }
  return total;
}

vec2 fieldPair(vec2 uv0, int octaves, vec2 startW, vec2 decay, float t) {
  vec2 v = uv0;
  vec2 total = vec2(0.0);
  vec2 w = startW;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    float s = noise(v);
    total += w * vec2(s, abs(s));
    v = rotateScale(v) + t;
    w *= decay;
  }
  return total;
}

vec2 applyGlobal(vec2 uvA, float aspect) {
  vec2 centerOff = vec2(0.5 * aspect, 0.5);
  vec2 v = (uvA - centerOff) * uGlobalZoom + centerOff;
  return v + uGlobalPos;
}

vec2 applyLayer(vec2 uvA, float aspect, float rotDeg) {
  vec2 centerOff = vec2(0.5 * aspect, 0.5);
  return rot2(radians(rotDeg)) * (uvA - centerOff) + centerOff;
}

vec2 applyStretch(vec2 uvA, float aspect, float stretch) {
  vec2 centerOff = vec2(0.5 * aspect, 0.5);
  vec2 pp = uvA - centerOff;
  pp.x /= stretch;
  return pp + centerOff;
}

float cloudDensity(vec2 uv) {
  float cd = clamp(uGlobalDetail, 0.4, 1.4);
  float cloudT = uEvolution;
  const float cs = 1.56;
  float q = 0.0;
  if (uWarpAmount != 0.0) q = field(uv * cs * uWarpScale, 7, 0.1, 0.4, false, 0.0);
  vec2 fields = fieldPair(uv * cs - (q * uWarpAmount - cloudT), 8, vec2(0.7, 0.8), vec2(0.6 * cd, 0.7 * cd), cloudT);
  float f = fields.x;
  float r = fields.y;
  f = f * (r + f);
  return uCoverage + uDensity * f * r;
}

vec3 skyGradient(float t) {
  if (t <= uSkyP.x) return uSky0;
  if (t <= uSkyP.y) return mix(uSky0, uSky1, clamp((t - uSkyP.x) / max(uSkyP.y - uSkyP.x, 0.0001), 0.0, 1.0));
  return uSky1;
}

void main() {
  vec2 p = vUv;
  float aspect = uDims.x / uDims.y;
  vec2 baseA = p * vec2(aspect, 1.0);
  // Parting: sample from nearer the centre so the clouds appear to slide outward.
  float side = p.x - 0.5;
  baseA.x -= sign(side) * uPart * uPart * 0.45 * aspect;
  vec2 g = applyGlobal(baseA, aspect);
  vec2 gs = applyStretch(g, aspect, uStretch);
  vec2 cloudUV = applyLayer(gs, aspect, uCloudRotation);

  float cd = clamp(uGlobalDetail, 0.4, 1.4);
  float cloudT = uEvolution;
  float cloudT2 = uEvolution * 2.0;
  float cloudT3 = uEvolution * 3.0;
  const float cs = 1.56;
  float wa = uWarpAmount;

  float q = 0.0;
  if (wa != 0.0) q = field(cloudUV * cs * uWarpScale, 7, 0.1, 0.4, false, 0.0);

  vec2 fields = fieldPair(cloudUV * cs - (q * wa - cloudT), 8, vec2(0.7, 0.8), vec2(0.6 * cd, 0.7 * cd), cloudT);
  float f = fields.x;
  float r = fields.y;
  f = f * (r + f);

  float c = field(cloudUV * cs * 2.0 - (q * wa - cloudT2), 7, 0.4, 0.6 * cd, false, cloudT2);
  float c1 = field(cloudUV * cs * 3.0 - (q * wa - cloudT3), 7, 0.4, 0.6 * cd, true, cloudT3);
  c += c1;

  float fd = uCoverage + uDensity * f * r;

  float sunRad = radians(140.0);
  vec2 sunDir = vec2(cos(sunRad), sin(sunRad));
  float dLit = cloudDensity(cloudUV + sunDir * 0.15);
  float diffuse = clamp((fd - dLit) / (uDensity * 0.15 + 0.001), 0.0, 1.0);

  vec3 sky = mix(skyGradient(p.y), uFlat, smoothstep(0.0, 0.7, uPart));
  float shading = clamp(uBrightness + uShadingVariation * c + 0.15 * diffuse, 0.0, 1.0);
  vec3 cloud = mix(uCloudShadowColor, uCloudColor, shading);

  // The sky is opaque, so Figma's alpha blend reduces to a straight mix.
  float blend = clamp(fd + c, 0.0, 1.0);
  // Clear a widening gap down the middle as the clouds part.
  float reach = abs(side) * 2.0;
  blend *= smoothstep(uPart * 1.1 - 0.3, uPart * 1.1, reach);
  outColor = vec4(mix(sky, cloud, blend), 1.0);
}`;

function compile(gl: WebGL2RenderingContext) {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed');
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed');
  return program;
}

export function initCtaClouds(reduce: boolean) {
  const section = document.querySelector<HTMLElement>('.cta');
  const canvas = section?.querySelector<HTMLCanvasElement>('.cta__sky');
  if (section && canvas) initClouds(section, canvas, 'cta--sky', reduce);
}

/**
 * Runs the cloud sky in `canvas`, sized to the canvas's own box. `host` gets
 * `readyClass` once the first frame is drawn (and loses it if WebGL is lost),
 * so its CSS can keep a fallback until then.
 */
export type Clouds = { setPart: (amount: number) => void };
const running = new WeakMap<HTMLCanvasElement, Clouds>();

export function initClouds(host: HTMLElement, canvas: HTMLCanvasElement, readyClass: string, reduce: boolean): Clouds | null {
  const existing = running.get(canvas);
  if (existing) return existing; // already running (matchMedia can re-run section setup)
  const section = host;
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
  if (!gl) return null;

  let program: WebGLProgram;
  try {
    program = compile(gl);
  } catch (err) {
    console.warn('Clouds disabled:', err);
    return null;
  }

  const p = PARAMS;
  const loc = (n: string) => gl.getUniformLocation(program, n);
  const vao = gl.createVertexArray();
  gl.useProgram(program);
  // Static uniforms, mapped exactly as Figma's render() does.
  gl.uniform3fv(loc('uCloudColor'), p.cloudColor);
  gl.uniform3fv(loc('uCloudShadowColor'), p.cloudShadowColor);
  gl.uniform3fv(loc('uSky0'), p.sky[0].color);
  gl.uniform3fv(loc('uSky1'), p.sky[1].color);
  gl.uniform2f(loc('uSkyP'), p.sky[0].at, p.sky[1].at);
  gl.uniform2f(loc('uGlobalPos'), -((p.transform.x - 50) / 100), -((p.transform.y - 50) / 100));
  gl.uniform1f(loc('uGlobalZoom'), 0.2 + (1 - p.transform.radius / 100) * 2.8);
  gl.uniform1f(loc('uGlobalDetail'), 0.5 + (p.globalDetail / 100) * 0.8);
  gl.uniform1f(loc('uCoverage'), -0.2 + (p.coverage / 100) * 1.2);
  gl.uniform1f(loc('uDensity'), 1 + (p.density / 100) * 19);
  gl.uniform1f(loc('uBrightness'), p.brightness / 100);
  gl.uniform1f(loc('uShadingVariation'), p.shadingVariation / 100);
  gl.uniform1f(loc('uWarpAmount'), (p.warpAmount / 100) * 3);
  gl.uniform1f(loc('uWarpScale'), 0.1 + (p.warpScale / 100) * 1.9);
  gl.uniform1f(loc('uStretch'), 1 + (p.stretch / 100) * 5);
  gl.uniform1f(loc('uCloudRotation'), -p.transform.angle);
  const evolutionLoc = loc('uEvolution');
  const partLoc = loc('uPart');
  gl.uniform3f(loc('uFlat'), 0, 0.6902, 1); // #00B0FF
  let part = 0;
  const dimsLoc = loc('uDims');
  const baseEvolution = -5 + (p.evolution / 100) * 10;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * RENDER_SCALE));
    const h = Math.max(1, Math.round(rect.height * RENDER_SCALE));
    if (w === canvas.width && h === canvas.height) return;
    canvas.width = w;
    canvas.height = h;
  };

  const start = performance.now();
  const render = (now: number) => {
    const t = reduce ? 0 : (now - start) / 1000;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform1f(evolutionLoc, baseEvolution + t * DRIFT);
    gl.uniform2f(dimsLoc, canvas.width, canvas.height);
    gl.uniform1f(partLoc, part);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Animate only while the section is on screen.
  let raf = 0;
  let visible = false;
  const loop = (now: number) => {
    render(now);
    raf = visible && !reduce ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  new ResizeObserver(() => {
    // Resizing clears the canvas, so redraw straight away rather than flash blank for a frame.
    resize();
    render(performance.now());
    kick();
  }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) kick();
  }).observe(canvas);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    section.classList.remove(readyClass);
  });

  resize();
  render(performance.now());
  section.classList.add(readyClass);

  const clouds: Clouds = {
    setPart(amount) {
      if (amount === part) return;
      part = amount;
      // The draw loop picks this up while animating; draw now when it isn't running.
      if (!raf) render(performance.now());
    },
  };
  running.set(canvas, clouds);
  return clouds;
}
