import { type Context, Hono } from 'hono';
import type { LlmProvider } from '../../common/types/config.ts';
import appConfigController from '../controllers/app-config.ts';

const settings = new Hono();

settings.get('/', async (c: Context) => {
  const appConfig = await appConfigController.load();
  if (!appConfig) {
    throw new Error('Failed to load app configuration');
  }
  return c.json({
    upstream: appConfig.upstream,
    assistant: appConfig.assistant,
  });
});

settings.put('/', async (c: Context) => {
  const { upstream, assistant } = await c.req.json<{
    upstream: { baseUrl: string; provider: LlmProvider };
    assistant: {
      baseUrl: string;
      provider: LlmProvider;
      model: string;
      apiKey: string;
    };
  }>();
  await appConfigController.update({ upstream, assistant });
  return c.json(null);
});

export default settings;
