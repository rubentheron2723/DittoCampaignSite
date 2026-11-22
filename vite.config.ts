import { defineConfig, loadEnv, type Plugin } from 'vite';
import { resolve } from 'path';

const pages = ['index', 'product', 'ai-assistant', 'pricing', 'about', 'faq', 'contact', 'sign-in', 'reset-password', 'register', 'privacy', 'terms', 'type'];
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

/**
 * Dev-only: run the Vercel function api/contact.ts at POST /api/contact, so the contact form sends from `npm run dev`
 * too. Reads RESEND_API_KEY, CONTACT_TO and CONTACT_FROM from .env.local (never committed).
 */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      for (const k of ['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM']) if (env[k]) process.env[k] = env[k];
      server.middlewares.use('/api/contact', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const mod = await server.ssrLoadModule('/api/contact.ts');
          const out: Response = await mod.POST(
            new Request('http://localhost/api/contact', {
              method: 'POST',
              headers: { 'content-type': req.headers['content-type'] || 'application/json' },
              body: Buffer.concat(chunks),
            }),
          );
          res.statusCode = out.status;
          out.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(await out.text());
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [cleanUrls(), devApi()],
  server: { port: 5173, host: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])),
    },
  },
});
