import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

/*
 * Only the plugins every page uses are loaded here (this file is in every page's shared bundle). The rest are
 * registered where they're needed, so other pages don't download them: DrawSVG in flow.ts and team-logo.ts,
 * Draggable in pricing.ts.
 */
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

gsap.defaults({ ease: 'power3.out', duration: 0.9 });

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

export const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
export const qa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };
