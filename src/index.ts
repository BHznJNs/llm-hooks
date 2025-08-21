// biome-ignore lint/style/noExportedImports: exports app for cloudflare worker
import app from './app.ts';
export default app;

import pino from 'pino';
import { runtime } from './utils/runtime.ts';

async function nonWorkerMain() {
  const honoNodeAdapter = await import('@hono/node-server');
  const DEFAULT_PORT = 5126;
  const logger = pino();
  const port = process.env.PORT ?? DEFAULT_PORT;
  honoNodeAdapter.serve(
    {
      fetch: app.fetch,
      port: Number(port),
    },
    (info) => {
      logger.info(`Listening on http://localhost:${info.port}`);
    }
  );
}

if (runtime !== 'cf-worker') {
  nonWorkerMain();
}
