import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import onrampHandler from './api/onramp/sessions.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.CIRCLE_API_KEY) {
    process.env.CIRCLE_API_KEY = env.CIRCLE_API_KEY;
  }
  return {
  plugins: [
    react(),
    {
      name: 'onramp-api-middleware',
      configureServer(server) {
        server.middlewares.use('/api/onramp/sessions', async (req, res) => {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch (_) {
              req.body = {};
            }
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
            await onrampHandler(req, res);
          });
        });
      },
    },
  ],
  };
});
