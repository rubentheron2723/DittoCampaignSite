import { finePointer, gsap, prefersReducedMotion, q, SplitText } from './gsap';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';

/** How strong the hero's bubbles are compared with the Figma effect (1 = as designed). */
const BUBBLE_INTENSITY = 0.35;

/**
 * "Looking up at the sky": as the pointer moves, the sky pans and tilts the other way, slowly, like
 * turning your head. Nearer layers move by smaller amounts at their own pace, so it reads as depth:
 * the glow drifts with the sky and the copy floats a few pixels toward the pointer.
 */
const SKY_FOLLOW = { x: -10, y: -7, angle: -1.5, lag: 1.4 };
const GLOW_SHIFT = { x: -36, y: -24 };
const COPY_SHIFT = { x: 10, y: 6 };

/**
 * Starts the hero sky and builds the hero entrance timeline (paused; the page
 * plays it once the intro curtain lifts).
 *
 * The sky is the Figma frame's Clouds fill, played slowly on its timeline, with
 * a parallax response to the pointer (see SKY_FOLLOW) and the Moving blobs
 * "bubbles" run over it at a fraction of their Figma strength.
 */
export function initHero() {
  const reduce = prefersReducedMotion();
  const hero = q('.hero')!;
  const sky = q<HTMLCanvasElement>('.hero__sky', hero)!;

  initClouds(hero, sky, 'hero--sky', reduce, SKY_HERO, {
    bubbles: { params: HERO_BUBBLES, intensity: BUBBLE_INTENSITY },
    follow: finePointer() ? SKY_FOLLOW : undefined,
  });

  if (finePointer() && !reduce) {
    const glow = q('.hero__glow', hero)!;
    const copy = q('.hero__inner', hero)!;
    const ease = { duration: 2.2, ease: 'power3.out' };
    const glowX = gsap.quickTo(glow, 'x', ease);
    const glowY = gsap.quickTo(glow, 'y', ease);
    const copyX = gsap.quickTo(copy, 'x', { duration: 1.6, ease: 'power3.out' });
    const copyY = gsap.quickTo(copy, 'y', { duration: 1.6, ease: 'power3.out' });
    const aimAt = (nx: number, ny: number) => {
      glowX(nx * GLOW_SHIFT.x);
      glowY(ny * GLOW_SHIFT.y);
      copyX(nx * COPY_SHIFT.x);
      copyY(ny * COPY_SHIFT.y);
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      aimAt((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
    });
    hero.addEventListener('pointerleave', () => aimAt(0, 0));
  }

  // Headline rises word by word inside masked lines.
  const split = SplitText.create('.hero__title .hero__line', { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  tl.from(split.words, { yPercent: 110, autoAlpha: 0, duration: 1.1, stagger: 0.07 }, 0.05)
    .from('.hero__subhead', { y: 30, autoAlpha: 0, duration: 1 }, 0.45)
    .from('.hero__support', { y: 24, autoAlpha: 0, duration: 1 }, 0.55)
    .from('.hero__actions .btn', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.7);

  // Scroll: the copy sinks and fades as the next section arrives; the sky eases back a touch.
  gsap.to('.hero__inner', {
    yPercent: 18,
    autoAlpha: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__bg', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });

  return tl;
}
