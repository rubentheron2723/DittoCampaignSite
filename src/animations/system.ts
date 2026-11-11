import { gsap, q, qa, ScrollTrigger, SplitText } from './gsap';
import { createStripesRenderer, SHAPE_MARK, type StripesRenderer, type StripesState } from './system-stripes';

/**
 * "Everything recruiters do. Running inside one system."
 *
 * The stage pins while the visitor scrolls through six capabilities. Each step
 * lights up its item in the list, wires a new label into the centre, and
 * morphs the striped shape (circle -> triangle -> square -> pentagon ->
 * hexagon) until it settles into the Ditto mark with every label connected.
 */

/** Shape per step: circle, then polygons, then the Ditto mark. */
const SHAPES = [0, 3, 4, 5, 6, SHAPE_MARK];
/** Extra scroll held on the final state, in steps. */
const HOLD = 0.6;

/**
 * Where each label's inner end sits around the shape, in the visual's -1..1 units (y up).
 * Labels on the left grow leftwards from that point; labels on the right grow rightwards.
 */
const ANCHORS: Array<{ x: number; y: number; side: 'left' | 'right' }> = [
  { x: -0.5, y: 0.74, side: 'left' },
  { x: 0.58, y: 0.66, side: 'right' },
  { x: -0.7, y: -0.06, side: 'left' },
  { x: 0.74, y: 0.06, side: 'right' },
  { x: -0.46, y: -0.8, side: 'left' },
  { x: 0.56, y: -0.76, side: 'right' },
];

let renderer: StripesRenderer | null | undefined;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Shape state for a scroll position measured in steps (0 .. steps + HOLD). */
function shapeAt(p: number): Omit<StripesState, 'rotation'> {
  const last = SHAPES.length - 1;
  const seg = Math.min(last, Math.max(0, Math.floor(p)));
  if (seg >= last) return { shapeA: SHAPES[last], shapeB: SHAPES[last], mix: 0 };
  return { shapeA: SHAPES[seg], shapeB: SHAPES[seg + 1], mix: smoothstep(0.55, 1, p - seg) };
}

export function initSystem(animate = true) {
  const section = q('.system')!;
  const stage = q('.system__stage', section)!;
  const visual = q('.system__visual', section)!;
  const canvas = q<HTMLCanvasElement>('.system__canvas', section)!;
  const chips = qa<HTMLElement>('.system__chip', section);
  const wires = qa<SVGLineElement>('.system__wire', section);
  const steps = qa<HTMLElement>('.system__step', section);
  const count = steps.length;

  // Place labels around the shape; CSS handles their entrance.
  chips.forEach((chip, i) => {
    const a = ANCHORS[i % ANCHORS.length];
    chip.style.left = `${((a.x + 1) / 2) * 100}%`;
    chip.style.top = `${((1 - a.y) / 2) * 100}%`;
    chip.classList.add(`system__chip--${a.side}`);
  });

  /** Wires run from the centre to each label's anchor, in pixels so the 1px stroke and draw-in length stay exact. */
  const wiresSvg = q<SVGSVGElement>('.system__wires', section)!;
  const layoutWires = () => {
    const w = visual.clientWidth;
    const h = visual.clientHeight;
    wiresSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    wires.forEach((line, i) => {
      const anchor = chips[i];
      const x2 = anchor.offsetLeft;
      const y2 = anchor.offsetTop;
      line.setAttribute('x1', String(w / 2));
      line.setAttribute('y1', String(h / 2));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      const len = Math.hypot(x2 - w / 2, y2 - h / 2);
      line.style.strokeDasharray = String(len);
      line.style.setProperty('--len', String(len));
    });
  };
  layoutWires();

  if (renderer === undefined) renderer = createStripesRenderer(canvas);
  section.classList.toggle('system--gl', !!renderer);

  let progress = animate ? 0 : count - 1 + HOLD;

  const setActive = (active: number) => {
    steps.forEach((el, i) => el.classList.toggle('is-active', i === active));
    chips.forEach((el, i) => {
      el.classList.toggle('is-on', i <= active);
      el.classList.toggle('is-current', i === active);
    });
    wires.forEach((el, i) => {
      el.classList.toggle('is-on', i <= active);
      el.classList.toggle('is-current', i === active);
    });
  };

  const start = performance.now();
  const draw = (now: number) => {
    if (!renderer) return;
    const t = animate ? (now - start) / 1000 : 0;
    renderer.render({ ...shapeAt(progress), rotation: 0.12 * t + progress * 0.35 }, t);
  };

  const onResize = () => {
    layoutWires();
    renderer?.resize();
    draw(performance.now());
  };
  window.addEventListener('resize', onResize);

  if (!animate) {
    section.classList.add('system--static');
    setActive(count - 1);
    draw(performance.now());
    return () => window.removeEventListener('resize', onResize);
  }

  // Headline reveal as the section arrives.
  const split = SplitText.create('.system__line', { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });
  gsap.from(split.words, {
    yPercent: 110,
    autoAlpha: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.05,
    scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
  });
  gsap.from('.system__lead', {
    y: 30,
    autoAlpha: 0,
    duration: 1,
    scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' },
  });

  setActive(0);
  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => `+=${(count + HOLD) * window.innerHeight * 0.55}`,
    pin: true,
    scrub: true,
    anticipatePin: 1,
    // Measure this pin first, so triggers on the section (headline, nav colour) include its scroll length.
    refreshPriority: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      progress = self.progress * (count - 1 + HOLD);
      setActive(Math.min(count - 1, Math.floor(progress + 0.0001)));
    },
  });

  // Animate (the gentle wobble) only while the visual is on screen.
  let raf = 0;
  let visible = false;
  const loop = (now: number) => {
    draw(now);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  });
  io.observe(visual);
  draw(performance.now());

  return () => {
    window.removeEventListener('resize', onResize);
    io.disconnect();
    cancelAnimationFrame(raf);
    raf = 0;
    trigger.kill();
    split.revert();
  };
}
