/**
 * Paper cards: flat cards drawn as bendable sheets in WebGL, so they can curl,
 * flip and catch the light like paper (after the stat cards on tibdigital.com).
 *
 * Each card is a grid mesh. The vertex shader bends it along its width: the
 * sheet's angle at distance x from its centre is bend·x + curl·x·|x|, and the
 * shape is that angle integrated along x, so it stays the same length however
 * far it curls. Seen from behind, the face shows through mirrored, like a
 * printed sheet held up to the light.
 *
 * World units: the screen is 2 units tall at z = 0 (y from -1 to 1) and
 * `aspect` × 2 wide. Poses are plain objects so GSAP can tween them.
 */

export type CardPose = {
  x: number;
  y: number;
  z: number;
  /** Rotations in degrees. */
  rx: number;
  ry: number;
  rz: number;
  /** Even bend across the card (radians per unit of width). */
  bend: number;
  /** Extra curl that grows toward both ends. */
  curl: number;
  /** 0..1 */
  alpha: number;
  /** 0..1: the soft drop shadow under the card (faded out while it tumbles). */
  shadow: number;
};

export type PaperCards = {
  poses: CardPose[];
  /** Card size in world units (shared by all cards). */
  size: { w: number; h: number };
  aspect: () => number;
  /** Redraws now (the loop also redraws while the canvas is on screen). */
  draw: () => void;
};

const FOV = 30; // degrees, vertical
const EYE = 1 / Math.tan(((FOV / 2) * Math.PI) / 180);
const SEG_X = 48;
const SEG_Y = 6;

const VERTEX = `#version 300 es
precision highp float;
in vec2 aPos;   // -0.5..0.5 across the card
uniform mat4 uViewProj;
uniform mat4 uModel;
uniform vec2 uSize;
uniform float uBend;
uniform float uCurl;
out vec2 vUv;
out vec3 vNormal;
out vec3 vWorld;

float angleAt(float x) { return uBend * x + uCurl * x * abs(x); }

void main() {
  float x = aPos.x * uSize.x;
  // Integrate the sheet's direction along x so its length is preserved as it bends.
  vec2 p = vec2(0.0);
  const int STEPS = 14;
  float ds = x / float(STEPS);
  for (int i = 0; i < STEPS; i++) {
    float a = angleAt((float(i) + 0.5) * ds);
    p += vec2(cos(a), sin(a)) * ds;
  }
  float a = angleAt(x);
  vec3 local = vec3(p.x, aPos.y * uSize.y, p.y);
  vec3 n = vec3(-sin(a), 0.0, cos(a));
  vec4 world = uModel * vec4(local, 1.0);
  vWorld = world.xyz;
  vNormal = mat3(uModel) * n;
  vUv = vec2(aPos.x + 0.5, 0.5 - aPos.y);
  gl_Position = uViewProj * world;
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
in vec3 vNormal;
in vec3 vWorld;
uniform sampler2D uTex;
uniform float uAlpha;
uniform vec3 uEye;
uniform float uFlat; // 1 = draw the texture as is (the shadow), no lighting
out vec4 outColor;

void main() {
  vec4 tex = texture(uTex, vUv);
  if (uFlat > 0.5) {
    outColor = tex * uAlpha;
    return;
  }
  if (tex.a < 0.02) discard;
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 toEye = normalize(uEye - vWorld);
  vec3 light = normalize(vec3(-0.35, 0.6, 1.0));
  float diffuse = max(dot(n, light), 0.0);
  float sheen = pow(max(dot(reflect(-light, n), toEye), 0.0), 24.0);
  // Paper: mostly lit, darker as it turns away; the back reads a little greyer, like the reverse of a print.
  float shade = mix(0.72, 1.04, diffuse);
  if (!gl_FrontFacing) shade *= 0.9;
  vec3 color = tex.rgb / max(tex.a, 0.0001);
  color = color * shade + vec3(sheen * 0.18);
  float a = tex.a * uAlpha;
  outColor = vec4(color * a, a);
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

/* Minimal column-major mat4 helpers. */
type M4 = Float32Array<ArrayBuffer>;
const mul = (a: M4, b: M4): M4 => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
};
const ident = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const translate = (x: number, y: number, z: number) => {
  const m = ident();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
};
const rot = (axis: 'x' | 'y' | 'z', deg: number) => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const m = ident();
  if (axis === 'x') {
    m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
  } else if (axis === 'y') {
    m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
  } else {
    m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
  }
  return m;
};
const perspective = (fovDeg: number, aspect: number, near: number, far: number) => {
  const f = 1 / Math.tan(((fovDeg / 2) * Math.PI) / 180);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
};

/** Drop shadow in the CSS sense (0 8px 100px rgba(0,0,0,.25) on a 500 × 326 card), drawn around the card with room for the blur. */
const SHADOW = { cardW: 500, cardH: 326, radius: 24, blur: 100, y: 8, alpha: 0.25, margin: 160 };
function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = SHADOW.cardW + SHADOW.margin * 2;
  c.height = SHADOW.cardH + SHADOW.margin * 2;
  const ctx = c.getContext('2d')!;
  // Draw the card far off-canvas and keep only its shadow.
  const off = 10000;
  ctx.shadowColor = `rgba(0,0,0,${SHADOW.alpha})`;
  ctx.shadowBlur = SHADOW.blur;
  ctx.shadowOffsetX = off;
  ctx.shadowOffsetY = SHADOW.y;
  ctx.beginPath();
  ctx.roundRect(SHADOW.margin - off, SHADOW.margin, SHADOW.cardW, SHADOW.cardH, SHADOW.radius);
  ctx.fill();
  return c;
}

/**
 * Starts the renderer on `canvas` with one card per texture source. Returns null
 * without WebGL2. `size` is the card size in world units for a given aspect.
 */
export function createPaperCards(
  canvas: HTMLCanvasElement,
  faces: HTMLCanvasElement[],
  size: (aspect: number) => { w: number; h: number },
  idle = true,
): PaperCards | null {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return null;
  let program: WebGLProgram;
  try {
    program = compile(gl);
  } catch (err) {
    console.warn('Paper cards disabled:', err);
    return null;
  }

  // One shared grid mesh.
  const verts: number[] = [];
  for (let j = 0; j <= SEG_Y; j++) for (let i = 0; i <= SEG_X; i++) verts.push(i / SEG_X - 0.5, 0.5 - j / SEG_Y);
  const idx: number[] = [];
  for (let j = 0; j < SEG_Y; j++)
    for (let i = 0; i < SEG_X; i++) {
      const a = j * (SEG_X + 1) + i;
      const b = a + 1;
      const c = a + SEG_X + 1;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  const upload = (face: HTMLCanvasElement) => {
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, face);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return t;
  };
  const textures = faces.map(upload);
  const shadowTex = upload(shadowTexture());
  const shadowScale = {
    x: (SHADOW.cardW + SHADOW.margin * 2) / SHADOW.cardW,
    y: (SHADOW.cardH + SHADOW.margin * 2) / SHADOW.cardH,
  };

  const u = (n: string) => gl.getUniformLocation(program, n);
  const loc = {
    viewProj: u('uViewProj'),
    model: u('uModel'),
    size: u('uSize'),
    bend: u('uBend'),
    curl: u('uCurl'),
    tex: u('uTex'),
    alpha: u('uAlpha'),
    eye: u('uEye'),
    flat: u('uFlat'),
  };

  const poses: CardPose[] = faces.map(() => ({ x: 0, y: -3, z: 0, rx: 0, ry: 0, rz: 0, bend: 0, curl: 0, alpha: 1, shadow: 0 }));
  const cards: PaperCards = {
    poses,
    size: { w: 1, h: 0.62 },
    aspect: () => {
      // Fall back to the parent's box if the canvas hasn't been laid out yet.
      const box = canvas.clientWidth ? canvas : (canvas.parentElement ?? canvas);
      return box.clientWidth / Math.max(1, box.clientHeight) || 16 / 9;
    },
    draw: () => render(performance.now()),
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w !== canvas.width || h !== canvas.height) {
      canvas.width = w;
      canvas.height = h;
    }
    Object.assign(cards.size, size(cards.aspect()));
  };

  const start = performance.now();
  const render = (now: number) => {
    const t = (now - start) / 1000;
    const aspect = cards.aspect();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    const viewProj = mul(perspective(FOV, aspect, 0.1, 40), translate(0, 0, -EYE));
    gl.uniformMatrix4fv(loc.viewProj, false, viewProj);
    gl.uniform3f(loc.eye, 0, 0, EYE);
    gl.uniform1i(loc.tex, 0);
    gl.activeTexture(gl.TEXTURE0);

    const model = (p: CardPose, i: number) => {
      // A gentle idle float so resting cards still feel like paper in the air.
      const bob = idle ? Math.sin(t * 0.6 + i * 1.7) * 0.012 : 0;
      const sway = idle ? Math.sin(t * 0.45 + i * 2.3) * 1.2 : 0;
      let m = translate(p.x, p.y + bob, p.z);
      m = mul(m, rot('z', p.rz));
      m = mul(m, rot('y', p.ry + sway));
      return mul(m, rot('x', p.rx));
    };
    const drawCard = (p: CardPose, i: number, tex: WebGLTexture, sx: number, sy: number, alpha: number) => {
      gl.uniformMatrix4fv(loc.model, false, model(p, i));
      gl.uniform2f(loc.size, cards.size.w * sx, cards.size.h * sy);
      gl.uniform1f(loc.bend, p.bend);
      gl.uniform1f(loc.curl, p.curl);
      gl.uniform1f(loc.alpha, alpha);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    };

    // Shadows first, under every card, without writing depth.
    gl.depthMask(false);
    gl.uniform1f(loc.flat, 1);
    poses.forEach((p, i) => {
      const a = p.alpha * p.shadow;
      if (a > 0.001) drawCard(p, i, shadowTex, shadowScale.x, shadowScale.y, a);
    });
    gl.depthMask(true);
    gl.uniform1f(loc.flat, 0);

    // Back to front so the translucent moments blend over the cards behind them.
    const order = poses.map((p, i) => i).sort((a, b) => poses[a].z - poses[b].z);
    for (const i of order) {
      const p = poses[i];
      if (p.alpha > 0.001) drawCard(p, i, textures[i], 1, 1, p.alpha);
    }
  };

  // Draw only while on screen.
  let raf = 0;
  let visible = false;
  const loop = (now: number) => {
    render(now);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  }).observe(canvas);
  new ResizeObserver(() => {
    resize();
    render(performance.now());
  }).observe(canvas);

  resize();
  return cards;
}
