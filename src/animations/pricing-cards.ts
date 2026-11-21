import { gsap, q, qa } from './gsap';
import { createPaperCards, type CardPose } from '../shared/paper-cards';
import { ACCENT_STOPS } from './ai';
import { guarantees } from '../content/pricing';

/**
 * The four tilted cards around "From first call to first placement" (Figma 2378:1018), as paper sheets in WebGL,
 * like the Practical AI cards on the home page: each one flies up from below, curling and flipping over, as its spot
 * scrolls into view, then sticks at its place and tilt in the frame and floats there gently. Scrolling back up
 * sends it back the way it came.
 *
 * Only on screens wide enough for the cards beside the steps (1360px and up, as in pricing.css). Below that, with
 * reduced motion, or without WebGL, the HTML cards show instead.
 */

/** Faces are drawn at 3× the Figma card (344 wide; 20 padding, 24/28 bold title, 20 gap, 20/24 copy). */
const K = 3;
const CARD_W = 344;
/** The blue cards (No minimums, Full suite). */
const ACCENT = new Set(['minimums', 'suite']);

/**
 * Where each card rests in the 1440 frame: the centre of its rotated box, measured from the section's top and from
 * the nearer side (right-hand cards are mirrored from the right edge), and its tilt (CSS degrees, clockwise).
 */
const REST: Record<string, { x: number; fromRight: boolean; y: number; tilt: number }> = {
  month: { x: 211.7, fromRight: false, y: 347.2, tilt: -15 },
  minimums: { x: 218, fromRight: true, y: 406.9, tilt: 30 },
  start: { x: 212, fromRight: true, y: 941.3, tilt: -30 },
  suite: { x: 195, fromRight: false, y: 953.9, tilt: 30 },
};

/** DM Sans: ascender 0.992em, descender 0.31em. Baseline offset of a line box of height `lh` for a `size` font. */
const baseline = (size: number, lh: number) => (lh - size * 1.302) / 2 + size * 0.992;

function drawFace(id: string, title: string, copy: string) {
  // Laid out in Figma pixels on a canvas scaled K×, so the fonts are set at their real sizes: DM Sans picks its
  // optical size from the font size, and at 3× it would switch to the tighter display cut.
  const pad = 20;
  const family = "'DM Sans', sans-serif";
  const spacing = (ctx: CanvasRenderingContext2D, size: number) => {
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${-0.04 * size}px`;
  };
  // Wrap the copy (its own line breaks kept) to the card's inner width.
  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = `400 20px ${family}`;
  spacing(measure, 20);
  const lines: string[] = [];
  for (const para of copy.split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const next = line ? `${line} ${w}` : w;
      if (measure.measureText(next).width > CARD_W - pad * 2 && line) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    lines.push(line);
  }
  const W = CARD_W;
  const H = pad + 28 + 20 + lines.length * 24 + pad;

  const c = document.createElement('canvas');
  c.width = W * K;
  c.height = H * K;
  const ctx = c.getContext('2d')!;
  ctx.scale(K, K);
  const accent = ACCENT.has(id);
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 24);
  if (accent) {
    // Figma's angle (234.79deg) with the AI section's softened blue stops, laid out as CSS does.
    const ang = (234.79 * Math.PI) / 180;
    const dx = Math.sin(ang);
    const dy = -Math.cos(ang);
    const half = (Math.abs(W * dx) + Math.abs(H * dy)) / 2;
    const g = ctx.createLinearGradient(W / 2 - dx * half, H / 2 - dy * half, W / 2 + dx * half, H / 2 + dy * half);
    ACCENT_STOPS.forEach(([at, colour]) => g.addColorStop(at, colour));
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fill();

  ctx.fillStyle = accent ? '#ffffff' : '#171717';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 24px ${family}`;
  spacing(ctx, 24);
  ctx.fillText(title, pad, pad + baseline(24, 28));
  ctx.font = `400 20px ${family}`;
  spacing(ctx, 20);
  const top = pad + 28 + 20;
  lines.forEach((l, i) => ctx.fillText(l, pad, top + i * 24 + baseline(20, 24)));
  return c;
}

export async function initPricingCards(animate: boolean) {
  if (!animate) return;
  const section = q('.pnext');
  const canvas = q<HTMLCanvasElement>('.pnext__canvas');
  if (!section || !canvas) return;
  await document.fonts.ready;

  const faces = guarantees.map((g) => drawFace(g.id, g.title, g.copy));
  // The card size follows the layout: Figma's size at 1440 and up, in step with the screen below it.
  const scale = () => Math.min(1, section.clientWidth / 1440);
  // World units follow the canvas, which runs past the section's foot (see .pnext__canvas).
  const unit = (px: number) => (2 * px) / Math.max(1, canvas.clientHeight);
  let cards: ReturnType<typeof createPaperCards> = null;

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1360px)', () => {
    section.classList.add('pnext--3d');
    cards ??= createPaperCards(canvas, faces, () => ({ w: unit(CARD_W * scale()), h: unit((CARD_W * scale() * faces[0].height) / faces[0].width) }));
    if (!cards) {
      section.classList.remove('pnext--3d');
      return;
    }
    const c = cards;

    /** Each card's resting pose, re-measured on every refresh (the section's size changes the world units). */
    const rest = (id: string): Partial<CardPose> => {
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const s = scale();
      const r = REST[id];
      const px = r.fromRight ? W - r.x * s : r.x * s;
      return { x: ((px - W / 2) * 2) / H, y: 1 - (2 * r.y) / H, z: 0, rx: 0, ry: 0, rz: -r.tilt, bend: 0.05, curl: 0.03, shadow: 1 };
    };
    const KEYS = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'bend', 'curl', 'shadow'] as const;
    const live = (pose: () => Partial<CardPose>) => Object.fromEntries(KEYS.map((k) => [k, () => pose()[k] ?? 0]));

    guarantees.forEach((g, i) => {
      const p = c.poses[i];
      const side = REST[g.id].fromRight ? 1 : -1;
      // From far below and behind, tumbling and curled tight, back side up; then rushing past nearer the camera,
      // mid-flip and edge-on; then down onto its spot.
      const start = () => {
        const r = rest(g.id);
        return { ...r, x: (r.x ?? 0) - side * 0.25, y: (r.y ?? 0) - 1.6, z: -2.2, rx: -75, ry: 200 - i * 40, rz: (r.rz ?? 0) + side * 35, bend: 2.4, curl: 1.6, shadow: 0 };
      };
      const mid = () => {
        const r = rest(g.id);
        return { ...r, x: (r.x ?? 0) + side * 0.12, y: (r.y ?? 0) - 0.4, z: 0.8, rx: 18, ry: 95 - i * 10, rz: (r.rz ?? 0) - side * 14, bend: 1.1, curl: 0.8, shadow: 0 };
      };
      Object.assign(p, start(), { alpha: 1 });
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            // From when its spot is just below the screen to when it reaches 45% of the way down.
            start: () => `top+=${REST[g.id].y} bottom+=${section.clientHeight * 0.1}`,
            end: () => `top+=${REST[g.id].y} 45%`,
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(p, live(start), { ...live(mid), duration: 0.45, ease: 'power1.in' })
        .to(p, { ...live(() => rest(g.id)), duration: 0.55, ease: 'power3.out' });
    });

    return () => section.classList.remove('pnext--3d');
  });
}
