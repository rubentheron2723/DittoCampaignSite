import '../styles/base.css';
import '../styles/home.css';

import { boot } from '../shared/boot';
import { renderHome } from './home-render';
import { initHero } from '../animations/hero';
import { initFlow } from '../animations/flow';
import { initCTA, initPricing, initTrust } from '../animations/reveals';
import { initAI } from '../animations/ai';
import { gsap } from '../animations/gsap';

boot({
  page: 'home',
  render: renderHome,
  init: ({ reduce, revealed }) => {
    // Top to bottom, so each trigger is measured after the pinned sections above it.
    initAI(!reduce);
    initTrust(!reduce);
    initPricing(!reduce);
    initCTA(!reduce);

    if (reduce) {
      initHero().progress(1);
      initFlow(false, false);
      return;
    }

    gsap.matchMedia().add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)' }, (ctx) => {
      const { desktop } = ctx.conditions as { desktop: boolean };
      const cleanupFlow = initFlow(desktop);
      return cleanupFlow;
    });

    const heroTl = initHero();
    revealed.then(() => heroTl.play());
  },
});
