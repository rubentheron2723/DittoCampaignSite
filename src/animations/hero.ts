import { finePointer, gsap, prefersReducedMotion, q, SplitText } from './gsap';
import { HERO_BUBBLES, initClouds, SKY_HERO } from '../shared/cta-clouds';

/** How strong the hero's bubbles are compared with the Figma effect (1 = as designed). */
const BUBBLE_INTENSITY = 0.35;

/**
 * Starts the hero sky and builds the hero entrance timeline (paused; the page
 * plays it once the intro curtain lifts).
 *
 * The sky is the Figma frame's Clouds fill, played with its timeline (as calmly
 * as the closing CTA), leaning toward the pointer, with the Moving blobs
 * "bubbles" run over it at a fraction of their Figma strength.
 */
export function initHero() {
  const reduce = prefersReducedMotion();
  const hero = q('.hero')!;
  const sky = q<HTMLCanvasElement>('.hero__sky', hero)!;

  initClouds(hero, sky, 'hero--sky', reduce, SKY_HERO, {
    bubbles: { params: HERO_BUBBLES, intensity: BUBBLE_INTENSITY },
    followPointer: finePointer(),
  });

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
