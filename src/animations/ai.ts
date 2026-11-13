import { gsap, q, SplitText } from './gsap';
import { createPaperCards, type CardPose } from '../shared/paper-cards';
import { ai } from '../content/home';

/**
 * "Practical AI that recruiters can trust", second on the home page.
 *
 * The three capability cards are paper sheets in WebGL (see paper-cards.ts),
 * after the stat cards on tibdigital.com. The stage pins and, as you scroll,
 * the cards fly up from below the fold, curling and flipping over (their
 * printed faces show through mirrored from behind), then settle in a loose row
 * under the headline and keep floating gently.
 *
 * Without WebGL, or with reduced motion, the plain HTML cards show instead.
 */

const FACE_W = 1200;
const FACE_H = 782;
/** Faces are drawn at 2.4× the Figma card (500 × 326). */
const K = FACE_W / 500;
const ACCENT = 1; // the blue card

/** DM Sans: ascender 0.992em, descender 0.31em. Baseline offset of a line box of height `lh` for a `size` font. */
const baseline = (size: number, lh: number) => (lh - size * 1.302) / 2 + size * 0.992;

/** Draws one card face (2D canvas → WebGL texture), set as in the Figma section (node 2364:692). */
function drawFace(index: number, title: string, copy: string) {
  const c = document.createElement('canvas');
  c.width = FACE_W;
  c.height = FACE_H;
  const ctx = c.getContext('2d')!;
  const accent = index === ACCENT;
  ctx.beginPath();
  ctx.roundRect(0, 0, FACE_W, FACE_H, 24 * K);
  if (accent) {
    // CSS linear-gradient(246.83deg, #1e6ef3 17.552%, #00b0ff 22.294%, #1e6ef3 100%), laid out as CSS does.
    const ang = (246.83 * Math.PI) / 180;
    const dx = Math.sin(ang);
    const dy = -Math.cos(ang);
    const half = (Math.abs(FACE_W * dx) + Math.abs(FACE_H * dy)) / 2;
    const g = ctx.createLinearGradient(FACE_W / 2 - dx * half, FACE_H / 2 - dy * half, FACE_W / 2 + dx * half, FACE_H / 2 + dy * half);
    g.addColorStop(0.17552, '#1e6ef3');
    g.addColorStop(0.22294, '#00b0ff');
    g.addColorStop(1, '#1e6ef3');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fill();

  const ink = accent ? '#ffffff' : '#171717';
  const family = "'DM Sans', sans-serif";
  const pad = 40 * K;
  const spacing = (em: number, size: number) => {
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${em * size}px`;
  };
  ctx.textBaseline = 'alphabetic';

  // Big index, top left: 84/88 bold.
  const num = 84 * K;
  ctx.fillStyle = accent ? '#ffffff' : '#00b0ff';
  ctx.font = `700 ${num}px ${family}`;
  spacing(-0.04, num);
  ctx.fillText(String(index + 1).padStart(2, '0'), pad, pad + baseline(num, 88 * K));

  // Title (24/28 bold) and copy (20/24 regular), 20 apart, set against the bottom padding.
  const wrap = (text: string, maxW: number) => {
    const lines: string[] = [];
    let line = '';
    for (const w of text.split(' ')) {
      const next = line ? `${line} ${w}` : w;
      if (ctx.measureText(next).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };
  const maxW = FACE_W - pad * 2;
  const tSize = 24 * K;
  const tLh = 28 * K;
  const cSize = 20 * K;
  const cLh = 24 * K;
  ctx.font = `400 ${cSize}px ${family}`;
  spacing(-0.04, cSize);
  const copyLines = wrap(copy, maxW);
  const copyTop = FACE_H - pad - copyLines.length * cLh;
  ctx.fillStyle = ink;
  copyLines.forEach((l, i) => ctx.fillText(l, pad, copyTop + i * cLh + baseline(cSize, cLh)));
  ctx.font = `700 ${tSize}px ${family}`;
  spacing(-0.04, tSize);
  const titleLines = wrap(title, maxW);
  const titleTop = copyTop - 20 * K - titleLines.length * tLh;
  titleLines.forEach((l, i) => ctx.fillText(l, pad, titleTop + i * tLh + baseline(tSize, tLh)));
  return c;
}

/**
 * Lays the resting cards out in the space under the headline and copy, so they never cover them.
 * Measures in CSS pixels and converts to world units (the screen is 2 units tall at z = 0, y up).
 * Wide screens: as in Figma, a row from the left margin, 500 px cards 16 px apart on a 1440 frame,
 * 100 px under the copy, running off the right edge; smaller if the screen is too short to fit them.
 * Narrow screens: a fanned stack, each card nearer than the last so they never cut into each other.
 */
function layout(canvas: HTMLCanvasElement, head: HTMLElement) {
  const box = canvas.getBoundingClientRect();
  const W = Math.max(1, box.width);
  const H = Math.max(1, box.height);
  const aspect = W / H;
  const toX = (px: number) => ((px - W / 2) * 2) / H;
  const toY = (px: number) => 1 - (2 * px) / H;
  const unit = (px: number) => (2 * px) / H;
  const hb = head.getBoundingClientRect();
  const ratio = FACE_H / FACE_W;
  const bottomPad = Math.max(32, H * 0.06);

  if (aspect >= 1.1) {
    const s = W / 1440;
    const top = hb.bottom - box.top + Math.min(100, Math.max(40, 100 * s));
    // Tilts and bends make a card read a little taller than its face.
    const cw = Math.min(500 * s, (H - bottomPad - top) / (ratio * 1.06));
    const ch = cw * ratio;
    const gap = 16 * s;
    const left = hb.left - box.left;
    const y = toY(top + ch / 2);
    const tilt = [
      { ry: 5, rz: 1, bend: 0.18, curl: 0.12 },
      { ry: -2, rz: -0.6, bend: 0.14, curl: 0.1 },
      { ry: -6, rz: -1.2, bend: 0.2, curl: 0.14 },
    ];
    const poses: Partial<CardPose>[] = tilt.map((t, i) => ({ x: toX(left + cw / 2 + i * (cw + gap)), y, z: 0, rx: -4, ...t, shadow: 1 }));
    return { size: { w: unit(cw), h: unit(ch) }, poses };
  }
  // The stack spans one card plus two steps of 0.6 card heights; the nearest card looks ~10% larger.
  const top = toY(hb.bottom - box.top + Math.max(24, H * 0.04));
  const free = Math.max(0.2, top - toY(H - bottomPad));
  const w = Math.min(0.62, aspect * 2 * 0.68, free / (ratio * 2.4));
  const h = w * ratio;
  const step = h * 0.6;
  const first = top - h * 0.55;
  const poses: Partial<CardPose>[] = [
    { x: -0.06, y: first, z: 0, rx: -6, ry: 6, rz: 3, bend: 0.3, curl: 0.2, shadow: 1 },
    { x: 0.06, y: first - step, z: 0.16, rx: -6, ry: -5, rz: -2.5, bend: 0.3, curl: 0.2, shadow: 1 },
    { x: -0.04, y: first - step * 2, z: 0.32, rx: -6, ry: 5, rz: 2, bend: 0.32, curl: 0.2, shadow: 1 },
  ];
  return { size: { w, h }, poses };
}

/** Where each card starts: far below and behind, tumbling, curled tight, back-side up. */
const startPose = (i: number): Partial<CardPose> => ({
  x: (i - 1) * 0.7,
  y: -2.6,
  z: -2.2 - i * 0.4,
  rx: -75,
  ry: 200 - i * 50,
  rz: (i - 1) * 35,
  bend: 2.4,
  curl: 1.6,
  alpha: 1,
  shadow: 0,
});

/** Mid-flight: rushing past nearer the camera, mid-flip and edge-on. */
const midPose = (i: number): Partial<CardPose> => ({
  x: (1 - i) * 0.35,
  y: -0.55 + i * 0.05,
  z: 0.9 - i * 0.15,
  rx: 18,
  ry: 95 - i * 15,
  rz: (1 - i) * 14,
  bend: 1.1,
  curl: 0.8,
  shadow: 0,
});

export function initAI(animate: boolean) {
  const section = q('.ai')!;
  const stage = q('.ai__stage', section)!;
  const canvas = q<HTMLCanvasElement>('.ai__canvas', section)!;
  const stepsPath = q<SVGPathElement>('.steps__path', section)!;

  if (animate) {
    const split = SplitText.create('.ai__title', { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.words, {
      yPercent: 110,
      autoAlpha: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.05,
      scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
    gsap.from('.ai__desc', {
      y: 24,
      autoAlpha: 0,
      stagger: 0.1,
      scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' },
    });

    // Steps and note below the cards.
    const steps = q('.steps', section)!;
    gsap
      .timeline({ scrollTrigger: { trigger: steps, start: 'top 80%', end: 'bottom 55%', scrub: 0.5 } })
      .fromTo(stepsPath, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none' }, 0)
      .from('.step__dot', { scale: 0, autoAlpha: 0, stagger: 0.3, ease: 'back.out(2)', duration: 0.3 }, 0)
      .from('.step p', { y: 20, autoAlpha: 0, stagger: 0.3, duration: 0.3 }, 0.05);
    gsap.from('.ai__note', { x: -20, autoAlpha: 0, scrollTrigger: { trigger: '.ai__note', start: 'top 90%' } });
  }

  if (!animate) return () => {};

  const faces = ai.cards.map((c, i) => drawFace(i, c.title, c.copy));
  // Show the canvas first so the renderer measures its real size.
  section.classList.add('ai--3d');
  const head = q('.ai__head', section)!;
  const cards = createPaperCards(canvas, faces, () => layout(canvas, head).size);
  if (!cards) {
    section.classList.remove('ai--3d');
    return () => {};
  }
  if (import.meta.env.DEV) (window as unknown as { __aiCards: typeof cards }).__aiCards = cards; // for checking frames in dev

  cards.poses.forEach((p, i) => Object.assign(p, startPose(i)));
  // Resting spots (and the card size) are recomputed on refresh, so the cards always fit under the copy.
  const restFor = (i: number) => {
    const keys = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'bend', 'curl', 'shadow'] as const;
    return Object.fromEntries(
      keys.map((k) => [
        k,
        () => {
          const l = layout(canvas, head);
          Object.assign(cards.size, l.size);
          return l.poses[i][k] ?? 0;
        },
      ]),
    );
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: '+=180%',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Measure this pin before the triggers that use the whole section (nav theme, reveals) measure it.
      refreshPriority: 1,
    },
  });
  cards.poses.forEach((p, i) => {
    const at = i * 0.12;
    tl.to(p, { ...midPose(i), duration: 0.4, ease: 'power1.in' }, at).to(p, { ...restFor(i), duration: 0.45, ease: 'power3.out' }, at + 0.4);
  });
  tl.to({}, { duration: 0.12 }, 0.85);

  return () => {
    section.classList.remove('ai--3d');
  };
}
