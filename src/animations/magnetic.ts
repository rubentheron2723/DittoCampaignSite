import { finePointer, gsap, qa } from './gsap';

/** Buttons lean toward the pointer and spring back. Fine pointers only. */
export function initMagnetic(root: ParentNode = document) {
  if (!finePointer()) return;
  qa<HTMLElement>('[data-magnetic]', root).forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    const strength = 0.32;

    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

/** 3D tilt for cards. */
export function initTilt(root: ParentNode = document) {
  if (!finePointer()) return;
  qa<HTMLElement>('[data-tilt]', root).forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const shine = card.querySelector<HTMLElement>('.aicard__shine');
    const sx = shine ? gsap.quickTo(shine, 'x', { duration: 0.6 }) : null;
    const sy = shine ? gsap.quickTo(shine, 'y', { duration: 0.6 }) : null;
    gsap.set(card, { transformPerspective: 900 });

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * 10);
      ry(px * 12);
      sx?.(px * r.width * 0.6);
      sy?.(py * r.height * 0.6);
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
    });
  });
}
