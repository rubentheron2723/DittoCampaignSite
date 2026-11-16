import '../styles/base.css';
import '../styles/home.css';

import { boot } from '../shared/boot';
import { renderHome } from './home-render';
import { initHero } from '../animations/hero';
import { initFlow } from '../animations/flow';
import { initCTA } from '../animations/reveals';
import { initAI } from '../animations/ai';
import { initSystem } from '../animations/system';

boot({
  page: 'home',
  render: renderHome,
  init: ({ reduce, revealed }) => {
    // Top to bottom, so each trigger is measured after the pinned sections above it.
    initSystem(!reduce);
    initFlow(!reduce);
    initAI(!reduce);
    initCTA(!reduce);

    if (reduce) {
      initHero().progress(1);
      return;
    }

    const heroTl = initHero();
    revealed.then(() => heroTl.play());
  },
});
