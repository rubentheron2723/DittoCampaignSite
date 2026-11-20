import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';

const pages = ['index', 'product', 'pricing', 'about', 'faq', 'contact', 'sign-in', 'privacy', 'terms', 'type'];
/** Ready-made pages served as they are from public/ (not built): /mcp is a coworker's MCP marketing page and /story their product vision story, both for review. */
const staticPages = ['mcp', 'story'];

/** Dev-only: serve /product as /product.html so links match the Vercel cleanUrls deploy. */
function cleanUrls(): Plugin {
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url || '').split('?')[0];
        const name = url.replace(/^\//, '').replace(/\/$/, '');
        if (name && (pages.includes(name) || staticPages.includes(name))) req.url = `/${name}.html`;
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url || '').split('?')[0];
        const name = url.replace(/^\//, '').replace(/\/$/, '');
        if (name && (pages.includes(name) || staticPages.includes(name))) req.url = `/${name}.html`;
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [cleanUrls()],
  server: { port: 5173, host: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])),
    },
  },
});
