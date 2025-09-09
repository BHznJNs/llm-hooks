import path from 'node:path';
import { PluginManager } from 'live-plugin-manager';
import type { Plugin } from 'llm-hooks-sdk';
import { logger } from '../utils/logger.ts';
import { runtime } from '../utils/runtime.ts';
import scriptController from './script.ts';

const pluginManager = await (async () => {
  switch (runtime) {
    case 'docker':
      return new PluginManager();
    case 'local': {
      const { default: appData } = await import('../utils/app-data.ts');
      return new PluginManager({
        pluginsPath: path.join(appData, 'node_modules/plugins'),
        versionsPath: path.join(appData, 'node_modules/versions'),
      });
    }
  }
})();

export function isPluginAnNpmPackage(name: string): boolean {
  return !name.includes('.');
}

// --- --- --- --- --- ---

async function loadNpmPlugin(npmPackageName: string): Promise<Plugin | null> {
  const isInstalled = pluginManager.alreadyInstalled(npmPackageName);
  try {
    if (!isInstalled) {
      await pluginManager.install(npmPackageName);
    }
    return pluginManager.require(npmPackageName) as Plugin;
  } catch {
    return null;
  }
}

// --- --- --- --- --- ---

class PluginInstanceController {
  private readonly logger = logger.moduleLogger('plugin-instance');
  private readonly cache = new Map<string, Plugin>();

  private async loadForDocker(name: string): Promise<Plugin | null> {
    if (isPluginAnNpmPackage(name)) {
      return await loadNpmPlugin(name);
    }
    const { default: dbOperator } = await import('../db/operator.ts');
    const isPluginScriptExist = await scriptController.exists(name);
    if (!isPluginScriptExist) {
      const pluginScriptContent = await dbOperator.fetchScript(name);
      if (!pluginScriptContent) {
        return null;
      }
      await scriptController.install(name, pluginScriptContent);
    }
    return await scriptController.load(name);
  }

  private async loadForLocal(name: string): Promise<Plugin | null> {
    if (isPluginAnNpmPackage(name)) {
      return await loadNpmPlugin(name);
    }

    const isPluginScriptExist = await scriptController.exists(name);
    if (!isPluginScriptExist) {
      return null;
    }
    return await scriptController.load(name);
  }

  private async saveForDocker(name: string, content?: string): Promise<void> {
    if (isPluginAnNpmPackage(name)) {
      await pluginManager.install(name);
    } else {
      const { default: dbOperator } = await import('../db/operator.ts');
      await Promise.all([
        scriptController.install(name, content!),
        dbOperator.saveScript(name, content!),
      ]);
    }
  }

  private async saveForLocal(name: string, content?: string): Promise<void> {
    if (isPluginAnNpmPackage(name)) {
      await pluginManager.install(name);
    } else {
      await scriptController.install(name, content!);
    }
  }

  async load(name: string): Promise<Plugin | null> {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }
    let plugin: Plugin | null = null;
    try {
      switch (runtime) {
        case 'docker':
          plugin = await this.loadForDocker(name);
          break;
        case 'local':
          plugin = await this.loadForLocal(name);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to load plugin: ${error}`);
      return null;
    }

    if (plugin === null) {
      return null;
    }
    this.cache.set(name, plugin);
    return plugin;
  }

  async save(
    name: string,
    content?: string // only for script plugin
  ): Promise<void> {
    // force to clear the plugin instance in cache and the plugin script files
    await this.delete(name);
    try {
      switch (runtime) {
        case 'docker':
          await this.saveForDocker(name, content);
          break;
        case 'local':
          await this.saveForLocal(name, content);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to save plugin: ${error}`);
      return;
    }

    const plugin = await this.load(name);
    if (plugin === null) {
      this.logger.error(`Failed to load plugin after save: ${name}`);
      return;
    }
    this.cache.set(name, plugin);
  }

  async delete(name: string): Promise<void> {
    if (isPluginAnNpmPackage(name)) {
      await pluginManager.uninstall(name);
    } else {
      await scriptController.delete(name);
    }
    this.cache.delete(name);
  }
}
export default new PluginInstanceController();
