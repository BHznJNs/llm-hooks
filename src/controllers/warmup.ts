import { runtime } from '../utils/runtime.ts';
import appConfigController from './app-config.ts';
import pluginConfigController from './plugin-config.ts';
import pluginInstanceController from './plugin-instance.ts';

/**
 * Warmup controllers by accessing datas,
 * so that controllers will store data in cache.
 */
export default async function () {
  if (runtime === 'docker') {
    // ensure database connected
    await import('../db/index.ts');
  }

  const appConfig = await appConfigController.load();
  if (!appConfig) {
    throw new Error('Failed to load app configuration');
  }
  const pluginNames = Object.values(appConfig.plugins).flat();
  await pluginConfigController.loadBatch(pluginNames);

  const uniquePluginNames = Array.from(new Set(pluginNames));
  for (const name of uniquePluginNames) {
    await pluginInstanceController.load(name);
  }
}
