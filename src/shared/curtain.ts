import { gsap, q } from '../animations/gsap';

/** The curtain covers the page until boot hands over to the entry animation (shared/intro.ts). */

export function hideCurtain() {
  const curtain = q('#curtain');
  if (curtain) curtain.style.display = 'none';
  gsap.set('.mark--nav', { autoAlpha: 1 });
}
