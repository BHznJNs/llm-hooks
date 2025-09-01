import { type Context, Hono } from 'hono';
import type { HookType } from '../../common/types/hook.ts';
import appConfigController from '../controllers/app-config.ts';
import pluginConfigController from '../controllers/plugin-config.ts';

const hooks = new Hono();

hooks.get('/', async (c: Context) => {
  const appConfig = await appConfigController.load();
  if (!appConfig) {
    throw new Error('Failed to load app configuration');
  }
  const pluginNameList = new Set(Object.values(appConfig.plugins).flat());
  const pluginConfigs = await pluginConfigController.loadBatch(
    Array.from(pluginNameList)
  );
  return c.json({
    pluginOrder: appConfig.plugins,
    pluginConfigs,
  });
});

hooks.put('/', async (c: Context) => {
  const { pluginOrder: plugins } = await c.req.json<{
    pluginOrder: Record<HookType, string[]>;
  }>();
  await appConfigController.update({ plugins });
  return c.json(null);
});

export default hooks;
