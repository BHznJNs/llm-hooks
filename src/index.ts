// biome-ignore lint/style/noExportedImports: exports cloudflare worker app
import app from './app.ts';
// export hono app for cloudflare worker
export default app;

import pino from 'pino';

const isCloudflareWorkerEnv = process.env.NODE_ENV === 'production-cf';
if (!isCloudflareWorkerEnv) {
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
