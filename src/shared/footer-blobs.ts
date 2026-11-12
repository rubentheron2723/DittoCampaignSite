import { FOOTER_ART_FILL, FOOTER_LOGOMARK, FOOTER_WORDMARK, type FooterArt } from './footer-art';

/**
 * The footer's "Moving blobs" effect.
 *
 * A WebGL2 port of Figma's first-party "Moving blobs" shader effect (version
 * b1aeb3c1), run with the settings from the Figma footer. Figma's own runtime
 * needs WebGPU plus the experimental HTML-in-Canvas API, which public browsers
 * don't ship yet, so instead the footer's artwork (gradient, logomark, wordmark)
 * is drawn into a 2D canvas and that canvas is the effect's input layer. The
 * link text stays as real HTML on top.
 *
 * If WebGL2 or float render targets are unavailable, nothing changes: the
 * footer keeps its CSS gradient and inline SVG artwork.
 */

export type BlobParams = {
  mode: string;
  region: string;
  strength: number;
  scale: number;
  detail: number;
  threshold: number;
  softness: number;
  shadow: number;
  chromaticAberration: number;
  speed: number;
};

/** Settings from the Figma footer's Moving blobs effect. */
const PARAMS: BlobParams = {
  mode: 'Displacement',
  region: 'Edges Only',
  strength: 11,
  scale: 300,
  detail: 0,
  threshold: 27.5,
  softness: 0,
  shadow: 9,
  chromaticAberration: 59.1, // "Dispersion" in Figma
  speed: 61.7,
};

/** Background gradient from the Figma frame: an ellipse centred on the bottom edge. */
const GRADIENT = {
  radiusX: 830.55 / 1440,
  radiusY: 404 / 760,
  stops: [
    [0, '#1e6ef3'],
    [0.5, '#108ff9'],
    [1, '#01b0ff'],
  ] as const,
};

const MAX_DPR = 2;

/** Pointer ripple slots, and how fast a ring spreads (shader units = footer heights per second). */
const RIPPLES = 16;
const RIPPLE_SPEED = 0.32;
const RIPPLE_LIFE = 1.8;

const DEFINES = `#define RIPPLES ${RIPPLES}\n`;

const VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 positions[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vec2 p = positions[gl_VertexID];
  // Top-left origin, like the original WGSL.
  vUv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const UNIFORMS = `
uniform float uFrequency;
uniform float uThreshold;
uniform float uSoftness;
uniform float uRenderScale;
uniform float uStrength;
uniform float uChromaticAberration;
uniform float uDetail;
uniform float uEdgeOnly;
uniform vec2 uOutputSize;
uniform float uShadow;
uniform float uMode;
uniform vec2 uLoop;
uniform vec2 uHue;
uniform vec4 uRipples[RIPPLES];
`;

/**
 * Pointer ripples. Each slot is a ring spreading out from where the pointer
 * passed: xy is the centre in the shader's aspect-corrected space, z its age in
 * seconds and w its strength (0 = empty). Returns a signed wave height.
 */
const RIPPLE = `
float ripple(vec2 p) {
  float sum = 0.0;
  for (int i = 0; i < RIPPLES; i++) {
    vec4 r = uRipples[i];
    if (r.w <= 0.0) continue;
    float x = length(p - r.xy) - r.z * ${RIPPLE_SPEED.toFixed(3)};
    float envelope = exp(-x * x / 0.0035) * exp(-r.z * 2.2) * r.w;
    sum += sin(x * 58.0) * envelope;
  }
  return sum;
}
`;

const FIELD_FRAGMENT = `#version 300 es
${DEFINES}precision highp float;
precision highp int;
${UNIFORMS}
${RIPPLE}
in vec2 vUv;
out vec4 outColor;

uint hashBits4(ivec4 p) {
  uint h = uint(p.x) * 0x8da6b343u;
  h = h ^ (uint(p.y) * 0xd8163841u);
  h = h ^ (uint(p.z) * 0xcb1ab31fu);
  h = h ^ (uint(p.w) * 0x165667b1u);
  h = (h ^ (h >> 16u)) * 0x7feb352du;
  h = (h ^ (h >> 15u)) * 0x846ca68bu;
  return h ^ (h >> 16u);
}

vec4 gradient4(ivec4 cell) {
  uint h = hashBits4(cell);
  uvec4 channels = uvec4(h & 255u, (h >> 8u) & 255u, (h >> 16u) & 255u, (h >> 24u) & 255u);
  vec4 g = vec4(channels) * (2.0 / 255.0) - 1.0;
  return normalize(g + vec4(0.0001));
}

float simplexCorner(ivec4 cell, vec4 offset) {
  float falloff = 0.6 - dot(offset, offset);
  if (falloff <= 0.0) return 0.0;
  float falloff2 = falloff * falloff;
  return falloff2 * falloff2 * dot(gradient4(cell), offset);
}

float noise4(vec4 p) {
  const float F4 = 0.30901699437494745;
  const float G4 = 0.1381966011250105;
  ivec4 cell = ivec4(floor(p + dot(p, vec4(F4))));
  vec4 cellf = vec4(cell);
  vec4 x0 = p - cellf + dot(cellf, vec4(G4));

  ivec4 rank = ivec4(0);
  if (x0.x > x0.y) { rank.x += 1; } else { rank.y += 1; }
  if (x0.x > x0.z) { rank.x += 1; } else { rank.z += 1; }
  if (x0.x > x0.w) { rank.x += 1; } else { rank.w += 1; }
  if (x0.y > x0.z) { rank.y += 1; } else { rank.z += 1; }
  if (x0.y > x0.w) { rank.y += 1; } else { rank.w += 1; }
  if (x0.z > x0.w) { rank.z += 1; } else { rank.w += 1; }

  ivec4 i1 = ivec4(greaterThanEqual(rank, ivec4(3)));
  ivec4 i2 = ivec4(greaterThanEqual(rank, ivec4(2)));
  ivec4 i3 = ivec4(greaterThanEqual(rank, ivec4(1)));

  vec4 x1 = x0 - vec4(i1) + vec4(G4);
  vec4 x2 = x0 - vec4(i2) + vec4(2.0 * G4);
  vec4 x3 = x0 - vec4(i3) + vec4(3.0 * G4);
  vec4 x4 = x0 - 1.0 + vec4(4.0 * G4);

  float sum =
    simplexCorner(cell, x0) +
    simplexCorner(cell + i1, x1) +
    simplexCorner(cell + i2, x2) +
    simplexCorner(cell + i3, x3) +
    simplexCorner(cell + ivec4(1), x4);
  return clamp(0.5 + 13.5 * sum, 0.0, 1.0);
}

float liquidField(vec2 p, vec2 loopA, vec2 loopB, float frequency) {
  float warpX = noise4(vec4(p * frequency * 0.58 + vec2(5.3, 1.7), loopB * 0.72));
  float warpY = noise4(vec4(p * frequency * 0.58 + vec2(-2.1, 8.4), loopA * 0.72));
  vec2 warped = p + (vec2(warpX, warpY) - 0.5) * 0.52;
  float value = noise4(vec4(warped * frequency, loopA * 0.88));
  if (uDetail > 0.0001) {
    float fine = noise4(vec4(warped * frequency * 1.92 + 11.0, loopB * 1.18));
    value = mix(value, fine, uDetail);
  }
  return value;
}

void main() {
  vec2 uv = clamp(vUv, 0.0, 1.0);
  float aspect = uOutputSize.x / uOutputSize.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 loopA = uLoop;
  vec2 loopB = vec2(-loopA.y, loopA.x);
  // Ripples only nudge the noise field, so just the blob edges near the pointer
  // wobble; the gradient and logos between blobs stay still.
  const float rippleLift = 0.015;
  float n = liquidField(p, loopA, loopB, uFrequency) + ripple(p) * rippleLift;
  const float e = 0.008;
  vec2 gradient = vec2(
    liquidField(p + vec2(e, 0.0), loopA, loopB, uFrequency) + ripple(p + vec2(e, 0.0)) * rippleLift - n,
    liquidField(p + vec2(0.0, e), loopA, loopB, uFrequency) + ripple(p + vec2(0.0, e)) * rippleLift - n
  ) / e;
  outColor = vec4(n, gradient, 1.0);
}`;

const COMPOSITE_FRAGMENT = `#version 300 es
${DEFINES}precision highp float;
precision highp int;
${UNIFORMS}
uniform sampler2D uInput;
uniform sampler2D uField;
// 1 when the input is a framebuffer texture (bottom-up rows), 0 for an uploaded canvas.
uniform float uFlipInput;
in vec2 vUv;
out vec4 outColor;

float hashPixel(uvec2 p) {
  uint h = (p.x * 0x8da6b343u) ^ (p.y * 0xd8163841u);
  h = (h ^ (h >> 16u)) * 0x7feb352du;
  h = (h ^ (h >> 15u)) * 0x846ca68bu;
  h = h ^ (h >> 16u);
  return float(h) * (1.0 / 4294967295.0);
}

vec3 rotateHue(vec3 color, float cosine, float sine) {
  vec3 axis = normalize(vec3(1.0));
  return color * cosine + cross(axis, color) * sine + axis * dot(axis, color) * (1.0 - cosine);
}

vec4 sampleInput(vec2 uv) {
  uv.y = mix(uv.y, 1.0 - uv.y, uFlipInput);
  vec2 halfPixel = 0.5 / vec2(textureSize(uInput, 0));
  return textureLod(uInput, clamp(uv, halfPixel, 1.0 - halfPixel), 0.0);
}

// The field target is drawn bottom-up, so flip v when reading it.
vec4 sampleField(vec2 uv) {
  return textureLod(uField, vec2(uv.x, 1.0 - uv.y), 0.0);
}

vec2 fieldMetrics(float n) {
  float blob = smoothstep(uThreshold - uSoftness, uThreshold + uSoftness, n);
  float rim = exp(-abs(n - uThreshold) / max(uSoftness * 0.72, 0.002));
  float edgeBand = pow(rim, 0.72);
  float displacementMask = mix(blob, edgeBand, clamp(uEdgeOnly, 0.0, 1.0));
  return vec2(rim, displacementMask);
}

vec4 shadeAt(vec2 uv, vec4 field, float rim, float displacementMask) {
  vec2 gradient = field.gb;
  float strength = clamp(uStrength, -1.0, 1.0);
  float magnitude = abs(strength);

  vec2 sampleUv = uv;
  if (uMode < 0.5) {
    vec2 tangent = normalize(vec2(-gradient.y, gradient.x) + vec2(0.0001));
    vec2 opticalOffset = gradient * displacementMask + tangent * rim * 0.14;
    sampleUv = uv + opticalOffset * (0.075 * strength);
  } else if (uMode < 1.5) {
    sampleUv = uv + vec2(1.0, -0.18) * (0.075 * strength * displacementMask);
  } else if (uMode > 1.5 && uMode < 2.5) {
    float aspect = uOutputSize.x / uOutputSize.y;
    vec2 normalUv = normalize(gradient * vec2(aspect, 1.0) + vec2(0.0001));
    sampleUv = uv + normalUv * (0.065 * strength * displacementMask);
  }

  vec4 middle = sampleInput(sampleUv);
  float alpha = middle.a;
  vec3 color = middle.rgb / max(middle.a, 0.00001);
  if (uChromaticAberration > 0.000001) {
    vec2 split = gradient * uChromaticAberration * rim;
    vec4 left = sampleInput(sampleUv - split);
    vec4 right = sampleInput(sampleUv + split);
    vec3 channelAlpha = vec3(left.a, middle.a, right.a);
    alpha = max(channelAlpha.r, max(channelAlpha.g, channelAlpha.b));
    vec3 channelPremultiplied = vec3(left.r, middle.g, right.b);
    color = (channelPremultiplied + vec3(alpha) - channelAlpha) / max(alpha, 0.00001);
  }

  float highlight = 0.0;
  if (uMode < 0.5 || uShadow > 0.0) {
    vec2 lightDirection = normalize(vec2(-0.7, -1.0));
    highlight = pow(max(dot(normalize(gradient + vec2(0.0001)), -lightDirection), 0.0), 7.0);
  }
  if (uMode < 0.5) {
    color = mix(color, vec3(1.0), rim * highlight * 0.34 * magnitude);
  } else if (uMode > 2.5 && uMode < 3.5) {
    color = mix(color, rotateHue(color, uHue.x, uHue.y), displacementMask);
  } else if (uMode > 3.5 && uMode < 4.5) {
    color = mix(color, vec3(1.0) - color, magnitude * displacementMask);
  }

  float tonalShadow = clamp(rim * (1.0 - highlight) * uShadow, 0.0, 1.0);
  color = clamp(mix(color, vec3(0.0), tonalShadow), 0.0, 1.0);
  return vec4(color * alpha, alpha);
}

vec4 sampleShaded(vec2 uvRaw) {
  vec2 uv = clamp(uvRaw, 0.0, 1.0);
  vec4 field = sampleField(uv);
  vec2 metrics = fieldMetrics(field.r);
  return shadeAt(uv, field, metrics.x, metrics.y);
}

void main() {
  vec2 uv = clamp(vUv, 0.0, 1.0);
  vec4 field = sampleField(uv);
  vec2 metrics = fieldMetrics(field.r);
  float rim = metrics.x;
  float displacementMask = metrics.y;
  float distortionInfluence = max(displacementMask, rim);
  float magnitude = abs(clamp(uStrength, -1.0, 1.0));
  bool spatialMode = uMode < 2.5;
  vec4 center = shadeAt(uv, field, rim, displacementMask);
  float centerLuma = dot(center.rgb, vec3(0.2126, 0.7152, 0.0722));
  float edgeContrast = fwidth(centerLuma) + fwidth(center.a);
  bool supersample = spatialMode && magnitude > 0.2 && distortionInfluence > 0.01 && edgeContrast > 0.015;

  vec4 result = center;
  if (supersample) {
    vec2 pixel = 1.0 / uOutputSize;
    result = (
      sampleShaded(uv + pixel * vec2(-0.4375, 0.0625)) +
      sampleShaded(uv + pixel * vec2(-0.3125, -0.3125)) +
      sampleShaded(uv + pixel * vec2(-0.0625, -0.1875)) +
      sampleShaded(uv + pixel * vec2(0.1875, -0.4375)) +
      sampleShaded(uv + pixel * vec2(0.3125, -0.0625)) +
      sampleShaded(uv + pixel * vec2(0.4375, 0.3125)) +
      sampleShaded(uv + pixel * vec2(0.0625, 0.4375)) +
      sampleShaded(uv + pixel * vec2(-0.1875, 0.1875))
    ) * 0.125;
  }

  // gl_FragCoord is bottom-up; flip so the grain pattern matches top-down pixel rows.
  vec2 px = vec2(gl_FragCoord.x, uOutputSize.y - gl_FragCoord.y);
  float grain = (hashPixel(uvec2(floor(px / uRenderScale))) - 0.5) * 0.018;
  outColor = vec4(clamp(result.rgb + grain * result.a, vec3(0.0), vec3(result.a)), result.a);
  // The input layer is fully opaque, so Figma's cast-shadow pass (which only
  // adds alpha behind transparent areas) has no visible effect and is skipped.
}`;

/** Turns the Figma control values into shader uniforms, exactly as Figma's render() does. */
function deriveUniforms(p: BlobParams) {
  const strength = Math.max(-1, Math.min(1, p.strength / 100));
  return {
    loopLength: 90 - (p.speed / 100) * 78,
    mode: p.mode === 'Displacement' ? 1 : p.mode === 'Bulge / Pinch' ? 2 : p.mode === 'Hue Shift' ? 3 : p.mode === 'Invert' ? 4 : 0,
    edgeOnly: p.region === 'Edges Only' ? 1 : 0,
    strength,
    frequency: (3.33 * 100) / Math.max(30, Math.min(300, p.scale)),
    detail: (p.detail / 100) * 0.45,
    softness: 0.001 + (p.softness / 100) * (0.12 - 0.001),
    threshold: 0.25 + (p.threshold / 100) * 0.5,
    chromaticAberration: (p.chromaticAberration / 100) * 0.024,
    shadow: (p.shadow / 100) * 0.6,
    hue: [Math.cos(strength * Math.PI), Math.sin(strength * Math.PI)] as const,
  };
}

function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
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

function drawArt(ctx: CanvasRenderingContext2D, art: FooterArt, el: Element, origin: DOMRect, dpr: number) {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  ctx.save();
  ctx.translate((r.left - origin.left) * dpr, (r.top - origin.top) * dpr);
  ctx.scale((r.width / art.width) * dpr, (r.height / art.height) * dpr);
  ctx.fillStyle = FOOTER_ART_FILL;
  for (const d of art.paths) ctx.fill(new Path2D(d), art.rule);
  ctx.restore();
}

export function initFooterBlobs(reduce: boolean) {
  const footer = document.querySelector<HTMLElement>('.footer');
  const canvas = footer?.querySelector<HTMLCanvasElement>('.footer__fx');
  const logomark = footer?.querySelector('.footer__logomark svg');
  const wordmark = footer?.querySelector('.footer__wordmark');
  if (!footer || !canvas || !logomark || !wordmark) return;

  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: true });
  if (!gl || !(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'))) return;

  let fieldProgram: WebGLProgram;
  let compositeProgram: WebGLProgram;
  try {
    fieldProgram = compile(gl, VERTEX, FIELD_FRAGMENT);
    compositeProgram = compile(gl, VERTEX, COMPOSITE_FRAGMENT);
  } catch (err) {
    console.warn('Footer effect disabled:', err);
    return;
  }

  const u = deriveUniforms(PARAMS);
  const vao = gl.createVertexArray();
  const layer = document.createElement('canvas');
  const layerCtx = layer.getContext('2d')!;
  const inputTex = gl.createTexture()!;
  const fieldTex = gl.createTexture()!;
  const fieldFbo = gl.createFramebuffer()!;
  let width = 0;
  let height = 0;
  let dpr = 1;

  // Ripple slots: centre (shader space), birth time (ms), strength.
  const ripples = Array.from({ length: RIPPLES }, () => ({ x: 0, y: 0, born: 0, strength: 0 }));
  const rippleData = new Float32Array(RIPPLES * 4);
  let nextSlot = 0;
  let last: { x: number; y: number; t: number } | null = null;

  const setUniforms = (program: WebGLProgram, loop: [number, number]) => {
    const loc = (n: string) => gl.getUniformLocation(program, n);
    gl.uniform1f(loc('uFrequency'), u.frequency);
    gl.uniform1f(loc('uThreshold'), u.threshold);
    gl.uniform1f(loc('uSoftness'), u.softness);
    gl.uniform1f(loc('uRenderScale'), dpr);
    gl.uniform1f(loc('uStrength'), u.strength);
    gl.uniform1f(loc('uChromaticAberration'), u.chromaticAberration);
    gl.uniform1f(loc('uDetail'), u.detail);
    gl.uniform1f(loc('uEdgeOnly'), u.edgeOnly);
    gl.uniform2f(loc('uOutputSize'), width, height);
    gl.uniform1f(loc('uShadow'), u.shadow);
    gl.uniform1f(loc('uMode'), u.mode);
    gl.uniform2f(loc('uLoop'), loop[0], loop[1]);
    gl.uniform2f(loc('uHue'), u.hue[0], u.hue[1]);
    gl.uniform4fv(loc('uRipples'), rippleData);
  };

  /** Draws the footer's artwork (gradient + logos) into the input layer, matching the live layout. */
  const paintLayer = () => {
    const origin = footer.getBoundingClientRect();
    layer.width = width;
    layer.height = height;
    const ctx = layerCtx;
    ctx.save();
    ctx.translate(width / 2, height);
    ctx.scale(GRADIENT.radiusX * width, GRADIENT.radiusY * height);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    for (const [at, color] of GRADIENT.stops) grad.addColorStop(at, color);
    ctx.fillStyle = grad;
    ctx.fillRect(-width, -height * 4, width * 4, height * 8);
    ctx.restore();
    drawArt(ctx, FOOTER_LOGOMARK, logomark, origin, dpr);
    drawArt(ctx, FOOTER_WORDMARK, wordmark, origin, dpr);

    gl.bindTexture(gl.TEXTURE_2D, inputTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  const resize = () => {
    const rect = footer.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = Math.max(1, Math.round(rect.width * dpr));
    height = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = width;
    canvas.height = height;

    // Like Figma, the noise field runs at half resolution.
    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, Math.ceil(width / 2), Math.ceil(height / 2), 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fieldFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fieldTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    paintLayer();
  };

  const start = performance.now();
  const render = (now: number) => {
    // Speed 0 (or reduced motion) holds Figma's starting phase.
    let phase = 0.45;
    if (!reduce && PARAMS.speed > 0) {
      phase = (now - start) / 1000 / u.loopLength + 0.45;
      phase -= Math.floor(phase);
    }
    const angle = phase * Math.PI * 2;
    const loop: [number, number] = [Math.cos(angle), Math.sin(angle)];

    ripples.forEach((r, i) => {
      const age = (now - r.born) / 1000;
      if (r.strength > 0 && age > RIPPLE_LIFE) r.strength = 0;
      rippleData.set([r.x, r.y, age, r.strength], i * 4);
    });

    gl.bindVertexArray(vao);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fieldFbo);
    gl.viewport(0, 0, Math.ceil(width / 2), Math.ceil(height / 2));
    gl.useProgram(fieldProgram);
    setUniforms(fieldProgram, loop);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.useProgram(compositeProgram);
    setUniforms(compositeProgram, loop);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTex);
    gl.uniform1i(gl.getUniformLocation(compositeProgram, 'uInput'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.uniform1i(gl.getUniformLocation(compositeProgram, 'uField'), 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Animate only while the footer is on screen.
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
    resize();
    kick();
  }).observe(footer);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) kick();
  }).observe(footer);

  // Drop a ripple wherever the pointer travels; faster strokes ripple harder.
  if (!reduce) {
    const onMove = (e: PointerEvent) => {
      const rect = footer.getBoundingClientRect();
      if (!rect.height) return;
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * (rect.width / rect.height);
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const t = performance.now();
      if (last && e.type === 'pointermove') {
        const dist = Math.hypot(x - last.x, y - last.y);
        if (dist < 0.045 && t - last.t < 140) return;
        if (dist < 0.004) return;
        const speed = dist / Math.max((t - last.t) / 1000, 0.016);
        ripples[nextSlot] = { x, y, born: t, strength: Math.min(0.8, 0.3 + speed * 0.15) };
      } else {
        ripples[nextSlot] = { x, y, born: t, strength: 0.45 };
      }
      nextSlot = (nextSlot + 1) % RIPPLES;
      last = { x, y, t };
    };
    footer.addEventListener('pointermove', onMove, { passive: true });
    footer.addEventListener('pointerdown', onMove, { passive: true });
    footer.addEventListener('pointerleave', () => (last = null));
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    footer.classList.remove('footer--fx');
  });

  resize();
  render(performance.now());
  footer.classList.add('footer--fx');
}

/**
 * The Moving blobs effect as a reusable pass over any texture in an existing
 * WebGL2 context (the hero runs it over its cloud sky). `intensity` scales the
 * displacement, dispersion and rim shading to make the bubbles subtler than
 * in Figma. Returns null if the context can't render the float field target.
 */
export function createBlobsPass(gl: WebGL2RenderingContext, params: BlobParams, intensity = 1) {
  if (!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'))) return null;
  let fieldProgram: WebGLProgram;
  let compositeProgram: WebGLProgram;
  try {
    fieldProgram = compile(gl, VERTEX, FIELD_FRAGMENT);
    compositeProgram = compile(gl, VERTEX, COMPOSITE_FRAGMENT);
  } catch (err) {
    console.warn('Bubbles disabled:', err);
    return null;
  }
  const u = deriveUniforms(params);
  const vao = gl.createVertexArray();
  const fieldTex = gl.createTexture()!;
  const fieldFbo = gl.createFramebuffer()!;
  const noRipples = new Float32Array(RIPPLES * 4);
  let width = 1;
  let height = 1;
  const start = performance.now();

  const setUniforms = (program: WebGLProgram, loop: [number, number]) => {
    const loc = (n: string) => gl.getUniformLocation(program, n);
    gl.uniform1f(loc('uFrequency'), u.frequency);
    gl.uniform1f(loc('uThreshold'), u.threshold);
    gl.uniform1f(loc('uSoftness'), u.softness);
    gl.uniform1f(loc('uRenderScale'), 1);
    gl.uniform1f(loc('uStrength'), u.strength * intensity);
    gl.uniform1f(loc('uChromaticAberration'), u.chromaticAberration * intensity);
    gl.uniform1f(loc('uDetail'), u.detail);
    gl.uniform1f(loc('uEdgeOnly'), u.edgeOnly);
    gl.uniform2f(loc('uOutputSize'), width, height);
    gl.uniform1f(loc('uShadow'), u.shadow * intensity);
    gl.uniform1f(loc('uMode'), u.mode);
    gl.uniform2f(loc('uLoop'), loop[0], loop[1]);
    gl.uniform2f(loc('uHue'), u.hue[0], u.hue[1]);
    gl.uniform4fv(loc('uRipples'), noRipples);
  };

  return {
    resize(w: number, h: number) {
      width = w;
      height = h;
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, Math.ceil(w / 2), Math.ceil(h / 2), 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fieldFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fieldTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    /** Draws `input` (a framebuffer texture, so rows are bottom-up) through the effect to the screen. */
    draw(input: WebGLTexture, now: number, still: boolean) {
      let phase = 0.45;
      if (!still && params.speed > 0) {
        phase = (now - start) / 1000 / u.loopLength + 0.45;
        phase -= Math.floor(phase);
      }
      const angle = phase * Math.PI * 2;
      const loop: [number, number] = [Math.cos(angle), Math.sin(angle)];
      gl.bindVertexArray(vao);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fieldFbo);
      gl.viewport(0, 0, Math.ceil(width / 2), Math.ceil(height / 2));
      gl.useProgram(fieldProgram);
      setUniforms(fieldProgram, loop);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(compositeProgram);
      setUniforms(compositeProgram, loop);
      gl.uniform1f(gl.getUniformLocation(compositeProgram, 'uFlipInput'), 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, input);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, 'uInput'), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, 'uField'), 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.activeTexture(gl.TEXTURE0);
    },
  };
}
