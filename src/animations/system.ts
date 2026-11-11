import { gsap, q, qa } from './gsap';

/**
 * "Everything recruiters do. Running inside one system."
 *
 * The stage pins while Ditto marks tumble through a deepening blue glow:
 * they fly in from far behind, spin and flip (the back face is a lighter
 * grey, like the reverse of a card), and pass the camera. The largest mark
 * settles face-on in the centre for a beat, then flips away, and the
 * headline lands as the glow peaks.
 */

type Pose = { x: string; y: string; z: number; rx: number; ry: number; rz: number };
type Flight = { from: Pose; to: Pose; at: number; dur: number; hold?: { pose: Pose; at: number; until: number } };

const pose = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): Pose => ({ x: `${x}vw`, y: `${y}vh`, z, rx, ry, rz });

/** One entry per .fly element, in timeline units (the whole pin is 0..1). */
const FLIGHTS: Flight[] = [
  // The big one: arrives face-on in the centre, holds, then flips past the camera.
  {
    from: pose(0, 25, -2600, 70, -160, 12),
    to: pose(4, -14, 900, -40, 200, -18),
    at: 0.12,
    dur: 0.7,
    hold: { pose: pose(0, 0, 0, 0, 0, -6), at: 0.45, until: 0.6 },
  },
  { from: pose(-60, 40, -1200, 120, 0, 30), to: pose(30, -45, 300, -60, 260, -20), at: 0.0, dur: 0.45 },
  { from: pose(55, 35, -1600, -40, 40, -25), to: pose(-45, -30, 200, 80, -300, 15), at: 0.06, dur: 0.5 },
  { from: pose(20, 55, -800, 30, 0, 10), to: pose(-10, -60, -200, -120, 180, 40), at: 0.18, dur: 0.42 },
  { from: pose(-40, -40, -2000, -60, 90, 20), to: pose(45, 30, 500, 140, -200, -30), at: 0.28, dur: 0.44 },
  { from: pose(-15, 60, -600, 50, -40, -15), to: pose(35, -55, -300, -90, 220, 25), at: 0.36, dur: 0.38 },
  { from: pose(60, -20, -2200, 20, -120, 35), to: pose(-55, 35, 400, -70, 240, -20), at: 0.45, dur: 0.38 },
];

/** Where marks rest around the headline when motion is reduced. */
const STATIC: Pose[] = [
  pose(-34, -22, -300, 10, -25, -12),
  pose(36, -30, -500, -15, 30, 14),
  pose(-40, 26, -700, 20, 35, 8),
  pose(30, 28, -400, -10, -40, -10),
  pose(-12, -38, -900, 25, 160, 20),
  pose(14, 40, -800, -20, 150, -15),
  pose(44, 4, -1100, 10, -30, 6),
];

const toVars = (p: Pose) => ({ x: p.x, y: p.y, z: p.z, rotationX: p.rx, rotationY: p.ry, rotationZ: p.rz });

export function initSystem(animate = true) {
  const section = q('.system')!;
  const stage = q('.system__stage', section)!;
  const flies = qa<HTMLElement>('.fly', section);
  const glow = q('.system__glow', section)!;
  const waves = qa<SVGPathElement>('.system__waves path', section);
  const copy = qa<HTMLElement>('.system__line, .system__lead, .system__tags', section);

  if (!animate) {
    section.classList.add('system--static');
    flies.forEach((el, i) => gsap.set(el, { ...toVars(STATIC[i % STATIC.length]), autoAlpha: 1 }));
    return;
  }

  gsap.set(copy, { autoAlpha: 0, y: 40 });
  flies.forEach((el, i) => gsap.set(el, { ...toVars(FLIGHTS[i].from), autoAlpha: 0 }));

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  flies.forEach((el, i) => {
    const f = FLIGHTS[i];
    if (!f) return;
    const fade = f.dur * 0.12;
    tl.to(el, { autoAlpha: 1, duration: fade }, f.at);
    if (f.hold) {
      // Glide in and settle face-on, hold, then flip away past the camera.
      tl.to(el, { ...toVars(f.hold.pose), duration: f.hold.at - f.at, ease: 'power2.out' }, f.at);
      tl.to(el, { ...toVars(f.to), duration: f.at + f.dur - f.hold.until, ease: 'power2.in' }, f.hold.until);
    } else {
      tl.to(el, { ...toVars(f.to), duration: f.dur }, f.at);
    }
    tl.to(el, { autoAlpha: 0, duration: fade }, f.at + f.dur - fade);
  });

  // The glow deepens as the marks pour through, and eases off a little once the headline lands.
  tl.to(glow, { opacity: 1, scale: 1.08, duration: 0.5 }, 0);
  tl.to(glow, { opacity: 0.8, scale: 1, duration: 0.2 }, 0.8);
  waves.forEach((path, i) => tl.to(path, { y: (i % 2 ? -1 : 1) * (30 + i * 12), duration: 1 }, 0));

  // Headline, lead and capability tags land at the end.
  tl.to(copy, { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.03, ease: 'power2.out' }, 0.8);
  tl.to({}, { duration: 0.05 }, 0.95);
}
