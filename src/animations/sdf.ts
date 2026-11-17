/**
 * Signed distance fields of drawn text, for the About stage (think-zoom.ts): plain maths on alpha values, so it can run
 * in a worker (sdf-worker.ts) and keep the main thread free.
 */

/**
 * Squared distances to the nearest "on" cell, in place (Felzenszwalb & Huttenlocher's exact transform, as Mapbox's
 * tiny-sdf does it): along each column, then each row.
 */
function edt(grid: Float64Array, width: number, height: number) {
  const n = Math.max(width, height);
  const f = new Float64Array(n);
  const v = new Uint16Array(n);
  const z = new Float64Array(n + 1);
  const pass = (offset: number, stride: number, length: number) => {
    v[0] = 0;
    z[0] = -Infinity;
    z[1] = Infinity;
    f[0] = grid[offset];
    for (let q = 1, k = 0, s = 0; q < length; q++) {
      f[q] = grid[offset + q * stride];
      const q2 = q * q;
      do {
        const r = v[k];
        s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
      } while (s <= z[k] && --k > -1);
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = Infinity;
    }
    for (let q = 0, k = 0; q < length; q++) {
      while (z[k + 1] < q) k++;
      const r = v[k];
      const qr = q - r;
      grid[offset + q * stride] = f[r] + qr * qr;
    }
  };
  for (let x = 0; x < width; x++) pass(x, width, height);
  for (let y = 0; y < height; y++) pass(y * width, 1, width);
}

/**
 * Two parts' coverage (alpha, 0-255, one byte per pixel) as one RG8 distance field: the first part in R, the second in
 * G, 0.5 on the edges, \`spread\` px either side.
 */
export function sdfField(title: Uint8Array, body: Uint8Array, w: number, h: number, spread: number): Uint8Array {
  const out = new Uint8Array(w * h * 2);
  const outer = new Float64Array(w * h);
  const inner = new Float64Array(w * h);
  [title, body].forEach((alpha, channel) => {
    for (let i = 0; i < w * h; i++) {
      const a = alpha[i] / 255;
      if (a === 0) {
        outer[i] = 1e20;
        inner[i] = 0;
      } else if (a === 1) {
        outer[i] = 0;
        inner[i] = 1e20;
      } else {
        // Partly covered: the edge passes through this pixel, at a distance set by how much it covers.
        const d = 0.5 - a;
        outer[i] = d > 0 ? d * d : 0;
        inner[i] = d < 0 ? d * d : 0;
      }
    }
    edt(outer, w, h);
    edt(inner, w, h);
    for (let i = 0; i < w * h; i++) {
      const d = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);
      out[i * 2 + channel] = Math.max(0, Math.min(255, Math.round((0.5 - d / (2 * spread)) * 255)));
    }
  });
  return out;
}
