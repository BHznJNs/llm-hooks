import { type Context, Hono } from 'hono';
import type { HookType } from '../../common/types/hook.ts';
import appConfigController from '../controllers/app-config.ts';
import pluginConfigController from '../controllers/plugin-config.ts';
import pluginInstanceController from '../controllers/plugin-instance.ts';

const plugins = new Hono();

plugins.get('/', async (c: Context) => {
  const appConfig = await appConfigController.load();
  if (!appConfig) {
    throw new Error('Failed to load app configuration');
  }
  const pluginNameList = new Set(Object.values(appConfig.plugins).flat());
  const plugins_ = await pluginConfigController.loadBatch(
    Array.from(pluginNameList)
  );
  return c.json({ plugins: plugins_ });
});

plugins.get('/content/:plugin_name', async (c: Context) => {
  const pluginName = c.req.param('plugin_name');
  const pluginContent = await pluginInstanceController.load(pluginName);
  return c.json({ content: pluginContent });
});

plugins.post('/', async (c: Context) => {
  const { name, params, dependencies, content } = await c.req.json<{
    name: string;
    params: Record<string, unknown>;
    dependencies: string[];
    content?: string;
  }>();
  try {
    await Promise.all([
      pluginConfigController.saveBatch({
        [name]: { enabled: true, dependencies, params },
      }),
      pluginInstanceController.save(name, dependencies, content),
    ]);
  } catch (_error) {
    throw new Error('Failed to save plugin');
  }

  const [appConfig, plugin] = await Promise.allSettled([
    appConfigController.load(),
    pluginInstanceController.load(name),
  ]);
  if (appConfig.status === 'rejected' || plugin.status === 'rejected') {
    throw new Error('Failed to load app config or plugin');
  }

  const pluginOrderData = appConfig.value!.plugins;
  for (const hookName of Object.keys(plugin) as HookType[]) {
    if (name in pluginOrderData[hookName]) {
      continue;
    }
    pluginOrderData[hookName].push(name);
  }
  await appConfigController.update({ plugins: pluginOrderData });
  return c.json(null);
});

plugins.put('/', async (c: Context) => {
  const { name, params, dependencies, content } = await c.req.json<{
    name: string;
    params: Record<string, unknown>;
    dependencies: string[];
    content?: string;
  }>();
  await Promise.all([
    pluginConfigController.update(name, { params, dependencies }),
    pluginInstanceController.save(name, dependencies, content),
  ]);
  return c.json(null);
});

plugins.delete('/', async (c: Context) => {
  const { name } = await c.req.json<{ name: string }>();
  await Promise.all([
    appConfigController.deletePluginRecord(name),
    pluginConfigController.delete(name),
    pluginInstanceController.delete(name),
  ]);
  return c.json(null);
});

export default plugins;
