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
const FACE_H = 780;

/** Draws one card face (2D canvas → WebGL texture) in the site's type. */
function drawFace(index: number, title: string, copy: string) {
  const c = document.createElement('canvas');
  c.width = FACE_W;
  c.height = FACE_H;
  const ctx = c.getContext('2d')!;
  const accent = index === 0;
  const r = 40;
  ctx.beginPath();
  ctx.roundRect(0, 0, FACE_W, FACE_H, r);
  if (accent) {
    const g = ctx.createLinearGradient(0, 0, FACE_W, FACE_H);
    g.addColorStop(0, '#1e6ef3');
    g.addColorStop(1, '#00b0ff');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = '#f7f9fc';
  }
  ctx.fill();
  // A soft diagonal sheen, like light across printed card stock.
  const sheen = ctx.createLinearGradient(0, FACE_H, FACE_W, 0);
  sheen.addColorStop(0.35, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.55, accent ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.7)');
  sheen.addColorStop(0.75, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fill();

  const ink = accent ? '#ffffff' : '#0f141d';
  const soft = accent ? 'rgba(255,255,255,0.86)' : '#4d596b';
  const family = "'DM Sans', sans-serif";
  const pad = 72;
  ctx.textBaseline = 'alphabetic';
  // Big index, top left.
  ctx.fillStyle = accent ? '#ffffff' : '#0f8ecf';
  ctx.font = `700 230px ${family}`;
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-9px';
  ctx.fillText(String(index + 1).padStart(2, '0'), pad - 8, pad + 170);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-1.5px';

  // Title and copy, bottom left, wrapped.
  const wrap = (text: string, font: string, maxW: number) => {
    ctx.font = font;
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
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
  const copyLines = wrap(copy, `400 44px ${family}`, maxW);
  const titleLines = wrap(title, `600 74px ${family}`, maxW);
  let y = FACE_H - pad - (copyLines.length - 1) * 58;
  ctx.fillStyle = soft;
  ctx.font = `400 44px ${family}`;
  copyLines.forEach((l, i) => ctx.fillText(l, pad, y + i * 58));
  y -= 58 + 26 + (titleLines.length - 1) * 82;
  ctx.fillStyle = ink;
  ctx.font = `600 74px ${family}`;
  titleLines.forEach((l, i) => ctx.fillText(l, pad, y + i * 82));
  return c;
}

/** Card size in world units for a screen aspect (the screen is 2 units tall). */
const cardSize = (aspect: number) => {
  const w = aspect >= 1.1 ? Math.min(1.0, (aspect * 2 * 0.86) / 3.2) : Math.min(0.62, aspect * 2 * 0.68);
  return { w, h: w * (FACE_H / FACE_W) };
};

/** Where each card comes to rest, by screen aspect. */
function restPoses(aspect: number, w: number): Partial<CardPose>[] {
  if (aspect >= 1.1) {
    const gap = w * 1.1;
    return [
      { x: -gap, y: -0.36, z: 0.02, rx: -6, ry: 14, rz: 2.5, bend: 0.35, curl: 0.25 },
      { x: 0, y: -0.42, z: 0.06, rx: -8, ry: -4, rz: -1.5, bend: 0.3, curl: 0.2 },
      { x: gap, y: -0.34, z: 0, rx: -6, ry: -14, rz: -3, bend: 0.4, curl: 0.25 },
    ];
  }
  // Narrow screens: a fanned stack under the copy, each card nearer than the last so they never cut into each other.
  return [
    { x: -0.06, y: -0.34, z: 0, rx: -6, ry: 6, rz: 3, bend: 0.3, curl: 0.2 },
    { x: 0.06, y: -0.58, z: 0.16, rx: -6, ry: -5, rz: -2.5, bend: 0.3, curl: 0.2 },
    { x: -0.04, y: -0.82, z: 0.32, rx: -6, ry: 5, rz: 2, bend: 0.32, curl: 0.2 },
  ];
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
    gsap.from('.ai__head .eyebrow, .ai__desc', {
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
  const cards = createPaperCards(canvas, faces, cardSize);
  if (!cards) {
    section.classList.remove('ai--3d');
    return () => {};
  }
  if (import.meta.env.DEV) (window as unknown as { __aiCards: typeof cards }).__aiCards = cards; // for checking frames in dev

  cards.poses.forEach((p, i) => Object.assign(p, startPose(i)));
  // Resting spots are recomputed on refresh (resize), so the row always fits the screen.
  const restFor = (i: number) => {
    const keys = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'bend', 'curl'] as const;
    return Object.fromEntries(keys.map((k) => [k, () => restPoses(cards.aspect(), cards.size.w)[i][k] ?? 0]));
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
