import app from './app.ts';
import warmup from './controllers/warmup.ts';
import { logger } from './utils/logger.ts';

const DEFAULT_PORT = 5126;
const moduleLogger = logger.moduleLogger('main');

async function main() {
  await warmup();

  const honoNodeAdapter = await import('@hono/node-server');
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
