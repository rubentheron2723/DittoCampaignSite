import '../styles/base.css';
import '../styles/home.css';

import { boot } from '../shared/boot';
import { renderHome } from './home-render';
import { initHero } from '../animations/hero';
import { initSystem } from '../animations/system';
import { initFlow } from '../animations/flow';
import { initAI, initCTA, initPricing, initTrust } from '../animations/reveals';
import { gsap } from '../animations/gsap';

boot({
  page: 'home',
  render: renderHome,
  init: ({ reduce, revealed }) => {
    initPricing(!reduce);
    initTrust(!reduce);
    initAI(!reduce);
    initCTA(!reduce);

    if (reduce) {
      initHero().progress(1);
      initSystem(false);
      initFlow(false, false);
      return;
    }

    gsap.matchMedia().add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)' }, (ctx) => {
      const { desktop } = ctx.conditions as { desktop: boolean };
      const cleanupFlow = initFlow(desktop);
      initSystem();
      return cleanupFlow;
    });

    const heroTl = initHero();
    revealed.then(() => heroTl.play());
  },
});
