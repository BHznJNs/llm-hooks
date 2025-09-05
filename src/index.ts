import app from './app.ts';
import { logger } from './utils/logger.ts';
import { runtime } from './utils/runtime.ts';

const moduleLogger = logger.moduleLogger('main');

async function main() {
  if (runtime === 'docker') {
    // ensure database connected
    await import('./db/index.ts');
  }

  const honoNodeAdapter = await import('@hono/node-server');
  const DEFAULT_PORT = 5126;
  const port = process.env.PORT ?? DEFAULT_PORT;
  honoNodeAdapter.serve(
    {
      fetch: app.fetch,
      hostname: '0.0.0.0',
      port: Number(port),
    },
    (info) => {
      moduleLogger.info(`Listening on http://localhost:${info.port}`);
    }
  );
}

await main();
