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

// lazy: false: a from() entrance writes its hidden start the moment it's made. GSAP otherwise holds that first write
// until the end of the frame, and on Home the set-up that follows (the pinned sections) re-rendered the waiting tweens
// first, so the write was lost: Engage, Place, the AI title and the CTA sat fully visible until their entrance played,
// which then hid them and brought them in, as if the text appeared twice.
gsap.defaults({ ease: 'power3.out', duration: 0.9, lazy: false });

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

export const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
export const qa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };
