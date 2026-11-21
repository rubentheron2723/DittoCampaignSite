import '../styles/base.css';
import '../styles/screens.css';
import '../styles/ai-points.css';
import '../styles/home.css';

import { boot } from '../shared/boot';
import { renderHome } from './home-render';
import { initHero } from '../animations/hero';
import { initCTA } from '../animations/reveals';
import { q, qa } from '../animations/gsap';
import { fadeUp } from '../shared/motion';
import { initBlobBackdrop } from '../shared/blob-backdrop';
import { FOOTER_BLOBS } from '../shared/footer-blobs';

boot({
  page: 'home',
  render: renderHome,
  init: ({ reduce, revealed }) => {
    initCTA(!reduce);
    initBlobBackdrop(q('.assist')!, q<HTMLCanvasElement>('.assist__fx')!, 'assist--fx', FOOTER_BLOBS, [253, 253, 253], reduce, 0.5, 30);

    if (reduce) {
      initHero().progress(1);
      return;
    }

    const heroTl = initHero();
    revealed.then(() => {
      heroTl.play();
      // Never leave the copy hidden if frames are starved.
      window.setTimeout(() => heroTl.progress() < 1 && heroTl.progress(1), 3500);
    });

    // One short rise per block as it comes into view; nothing pins or holds the page.
    fadeUp('.system__head > *', '.system');
    qa<HTMLElement>('.act').forEach((a) => {
      fadeUp(q('.act__copy', a)!.children, a);
      fadeUp(q('.act__screen', a)!, a, { y: 48, delay: 0.1 });
    });
    fadeUp('.assist__copy > *, .minichat', '.assist');
    fadeUp('.assist__points .aipoint', '.assist__points');
    fadeUp('.ai__head > *', '.ai');
    fadeUp('.aicard', '.ai__cards');
    fadeUp('.proof__wrap > *', '.proof');
  },
});
