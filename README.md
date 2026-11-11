# Ditto — GSAP site prototype

A motion-first take on the Ditto campaign site, built with
[GSAP 3.15](https://gsap.com) (ScrollTrigger, ScrollSmoother, SplitText,
DrawSVG, MorphSVG, MotionPath, Flip, Draggable) on a plain Vite + TypeScript
multi-page setup. No framework.

All copy is lifted from the production campaign site so the words are real.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  (clean URLs: /product, /pricing, …)
npm run build      # typecheck + production build into dist/
npm run preview    # serve the build
```

Deploys as a static site. `vercel.json` turns on clean URLs so `/product`
serves `product.html`; the Vite config does the same in dev and preview.

## Pages

| Page | Concept |
| --- | --- |
| `/` Home | One continuous flowing line. Intro curtain where the mark assembles and flies into the nav; SplitText hero with a DrawSVG line and MotionPath travellers; a pinned section where capability chips orbit the mark and converge into it; pinned horizontal Source → Engage → Place with a line drawing in lockstep with the scroll; counters, velocity-reactive ticker, tilt cards, Flip pricing toggle. |
| `/product` | Feature decks. Each act pins and deals its features as a stack of cards: the next card slides in from below as the previous one recedes, while a sticky index tracks the active capability. A floating act bar follows you through all three acts. |
| `/pricing` | A draggable recruiter-count slider (GSAP Draggable) drives the quote card: tier, per-licence rate, monthly or annual total and savings all roll to their new values. ZAR/USD and billing toggles slide with animated pills. The five-step timeline draws itself as it enters. |
| `/about` | Hero routes drawn tangled, then morphed (MorphSVG) into clean straight lines: committee-built → first principles. A pinned Builders stage crossfades four panels with a segmented progress bar. Principles reveal along a line that fills with scroll. The team mark's two halves lock together as the section arrives. |
| `/faq` | Live search and topic filtering reflow the whole list with Flip. Accordion panels animate height with GSAP. The topic rail tracks the category under the viewport centre and supports deep links like `/faq#integrations`. |
| `/contact` | Validated form with focus lines, shake-on-error, and a simulated send that ends with the mark locking together. Nothing is submitted; the production form's backend is out of scope for the prototype. |

Every page shares the fixed nav (theme flips over `data-theme="light"`
sections), a full-screen mobile menu, magnetic buttons, page transitions
(the curtain covers the page, then lifts on the next), and
`prefers-reduced-motion` handling that skips decorative motion and renders
final states.

## Layout

```
*.html                  one shell per page; body[data-page] + <main id="main">
src/content/            copy per page (home, product, pricing, about, faq, contact, shared)
src/shared/
  chrome.ts             nav, mobile menu, curtain, rail, CTA band, footer
  boot.ts               boot order: chrome → render → curtain → fonts → smoother → page init → nav theming
  curtain.ts            home intro, inner-page reveal, cover-and-navigate transition
  motion.ts             splitReveal / fadeUp / rollNumber helpers
  mark.ts               the Ditto mark as SVG
src/pages/<page>.ts     render + animations for that page
src/animations/         GSAP registration + the home page's section animations
src/styles/             base.css (tokens, chrome, buttons) + one stylesheet per page
```
