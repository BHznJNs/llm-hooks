import { type Context, Hono } from 'hono';
import appConfigController from '../../controllers/app-config.ts';
import pluginConfigController from '../../controllers/plugin-config.ts';
import pluginInstanceController from '../../controllers/plugin-instance.ts';
import { logger } from '../../utils/logger.ts';

const plugins = new Hono();
const moduleLogger = logger.moduleLogger('plugins');

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

plugins.get('/has/:plugin_name', async (c: Context) => {
  const pluginName = c.req.param('plugin_name');
  const has = await pluginConfigController.has(pluginName);
  return c.json({ has });
});

plugins.get('/content/:plugin_name', async (c: Context) => {
  const pluginName = c.req.param('plugin_name');
  const pluginContent = await pluginInstanceController.loadContent(pluginName);
  if (!pluginContent) {
    throw new Error('Failed to load plugin content');
  }
  moduleLogger.info(`Loaded plugin content: ${pluginName}`);
  return c.json({ content: pluginContent });
});

plugins.post('/', async (c: Context) => {
  const { name, params, content } = await c.req.json<{
    name: string;
    params: Record<string, unknown>;
    content?: string;
  }>();
  moduleLogger.info(`Creating plugin: "${name}"`);
  try {
    await Promise.all([
      pluginConfigController.saveBatch({
        [name]: { enabled: true, params },
      }),
      pluginInstanceController.save(name, content),
    ]);
  } catch (_error) {
    throw new Error('Failed to save plugin');
  }

  const plugin = await pluginInstanceController.load(name);
  if (!plugin) {
    throw new Error('Failed to load plugin after save');
  }
  await appConfigController.appendPluginRecord(name, plugin);
  return c.json(null);
});

plugins.put('/toggle/:plugin_name', async (c: Context) => {
  const pluginName = c.req.param('plugin_name');
  const enabled = c.req.query('enabled') === 'true';
  await pluginConfigController.update(pluginName, { enabled });
  return c.json(null);
});

plugins.put('/', async (c: Context) => {
  const { name, params, content } = await c.req.json<{
    name: string;
    params: Record<string, unknown>;
    content?: string;
  }>();
  await Promise.all([
    pluginConfigController.update(name, { params }),
    pluginInstanceController.save(name, content),
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
