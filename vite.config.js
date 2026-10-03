import { defineConfig } from "vite";
import { resolve } from "node:path";
import fs from "node:fs";

function getHtmlInputs(dir, inputs = {}) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git', '.vercel', '.wrangler', 'public'].includes(entry.name)) {
        getHtmlInputs(full, inputs);
      }
    } else if (entry.name.endsWith('.html')) {
      const rel = full.replace(__dirname, '').replace(/^[\\\/]/, '').replace(/\.html$/, '').replace(/[\\\/]/g, '_');
      inputs[rel] = full;
    }
  }
  return inputs;
}

export default defineConfig({
  plugins: [
    {
      name: 'penguinpay-routes',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = (req.url || '/').split('?')[0];
          if (url === '/admin' || url === '/admin/') {
            res.statusCode = 302;
            res.setHeader('Location', '/admin-app/pages/login.html');
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: getHtmlInputs(__dirname)
    }
  }
});
