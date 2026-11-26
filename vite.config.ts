import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';

const pages = ['index', 'product', 'pricing', 'about', 'faq', 'contact', 'sign-in', 'reset-password', 'register', 'privacy', 'terms', 'designsystem'];

/** Dev-only: serve /product as /product.html so links match the Vercel cleanUrls deploy. */
function cleanUrls(): Plugin {
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url || '').split('?')[0];
        const name = url.replace(/^\//, '').replace(/\/$/, '');
        // /type moved into the design system (vercel.json redirects it the same way).
        if (name === 'type') {
          _res.writeHead(302, { Location: '/designsystem#typography' });
          return void _res.end();
        }
        if (name && pages.includes(name)) req.url = `/${name}.html`;
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url || '').split('?')[0];
        const name = url.replace(/^\//, '').replace(/\/$/, '');
        if (name && pages.includes(name)) req.url = `/${name}.html`;
        next();
      });
    },
  };
}

/**
 * Each page's script holds the page's first paint until it has run (blocking="render", Chrome and Edge): between pages,
 * the browser keeps the last frame of the page left (its clouds mid-sweep) on screen until then, and the new page's
 * first frame already shows the clouds carrying on (page-transition.ts), so there is no flash of white in between.
 */
function renderBlockingEntry(): Plugin {
  return {
    name: 'render-blocking-entry',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) => html.replace(/<script type="module" crossorigin src=/g, '<script type="module" crossorigin blocking="render" src='),
    },
  };
}

export default defineConfig({
  plugins: [cleanUrls(), renderBlockingEntry()],
  server: { port: 5173, host: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])),
    },
  },
});
