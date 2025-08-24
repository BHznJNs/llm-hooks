import app from './app.ts';
import { logger } from './utils/logger.ts';

const moduleLogger = logger.moduleLogger('main');

async function main() {
  const honoNodeAdapter = await import('@hono/node-server');
  const DEFAULT_PORT = 5126;
  const port = process.env.PORT ?? DEFAULT_PORT;
  honoNodeAdapter.serve(
    {
      fetch: app.fetch,
      port: Number(port),
    },
    (info) => {
      moduleLogger.info(`Listening on http://localhost:${info.port}`);
    }
  );
}

await main();
