import fs from 'node:fs/promises';
import path from 'node:path';
import type { PluginConfig } from '../../common/types/config.ts';
import { logger } from '../utils/logger.ts';
import { runtime } from '../utils/runtime.ts';

const configPathFactory = async (name: string) => {
  const { default: appData } = await import('../utils/app-data.ts');
  return path.join(appData, 'plugins', `${name}.config.json`);
};

class PluginConfigController {
  private readonly logger = logger.moduleLogger('plugin-config');
  private readonly cache = new Map<string, PluginConfig>();

  private async loadForLocal(
    pluginNames: string[]
  ): Promise<Record<string, PluginConfig>> {
    const readTasks: Promise<PluginConfig>[] = [];
    for (const pluginName of pluginNames) {
      const configPath = await configPathFactory(pluginName);
      readTasks.push(fs.readFile(configPath, 'utf8').then(JSON.parse));
    }
    const results = await Promise.allSettled(readTasks);
    const result: Record<string, PluginConfig> = {};
    for (const [index, resultValue] of results.entries()) {
      if (resultValue.status === 'fulfilled') {
        result[pluginNames[index]!] = resultValue.value as PluginConfig;
      }
    }
    return result;
  }

  private async loadForDocker(
    pluginNames: string[]
  ): Promise<Record<string, PluginConfig>> {
    if (pluginNames.length === 0) {
      return {};
    }
    const { default: dbOperator } = await import('../db/operator.ts');
    const rows = await dbOperator.fetchPluginConfigBatch(pluginNames);
    const result: Record<string, PluginConfig> = {};
    for (const row of rows) {
      result[row.name] = {
        enabled: row.enabled,
        params: row.params as Record<string, unknown>,
      };
    }
    return result;
  }

  private async saveForDocker(
    pluginConfigs: Record<string, PluginConfig>
  ): Promise<void> {
    const { default: dbOperator } = await import('../db/operator.ts');
    await dbOperator.savePluginConfigBatch(pluginConfigs);
  }

  private async saveForLocal(
    pluginConfigs: Record<string, PluginConfig>
  ): Promise<void> {
    const { default: appData } = await import('../utils/app-data.ts');
    const writeTasks: Promise<void>[] = [];
    await fs.mkdir(path.join(appData, 'plugins'), { recursive: true });
    for (const [name, config] of Object.entries(pluginConfigs)) {
      const configPath = await configPathFactory(name);
      writeTasks.push(
        fs.writeFile(configPath, JSON.stringify(config)).catch((error) => {
          this.logger.warn(`Save config failed: ${error}`);
        })
      );
    }
    await Promise.allSettled(writeTasks);
  }

  private async hasForDocker(pluginName: string): Promise<boolean> {
    const { default: dbOperator } = await import('../db/operator.ts');
    return (await dbOperator.fetchPluginConfigBatch([pluginName])).length > 0;
  }

  private async hasForLocal(pluginName: string): Promise<boolean> {
    const configPath = await configPathFactory(pluginName);
    try {
      await fs.access(configPath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  private async deleteForLocal(pluginName: string): Promise<void> {
    const configPath = await configPathFactory(pluginName);
    await fs.unlink(configPath).catch((error) => {
      this.logger.warn(`Delete config failed: ${error}`);
    });
  }

  private async deleteForDocker(pluginName: string): Promise<void> {
    const { default: dbOperator } = await import('../db/operator.ts');
    await dbOperator.deletePluginConfig(pluginName);
  }

  async loadBatch(
    pluginNames: string[]
  ): Promise<Record<string, PluginConfig>> {
    const pluginsNotInCache = pluginNames.filter((k) => !this.cache.has(k));

    if (pluginsNotInCache.length > 0) {
      let newConfigs: Record<string, PluginConfig> = {};
      switch (runtime) {
        case 'local':
          newConfigs = await this.loadForLocal(pluginsNotInCache);
          break;
        case 'docker':
          newConfigs = await this.loadForDocker(pluginsNotInCache);
          break;
      }
      for (const [k, v] of Object.entries(newConfigs)) {
        this.cache.set(k, v);
      }
    }

    return pluginNames.reduce(
      (acc, k) => {
        if (!this.cache.has(k)) {
          return acc;
        }
        acc[k] = this.cache.get(k)!;
        return acc;
      },
      {} as Record<string, PluginConfig>
    );
  }

  async saveBatch(pluginConfigs: Record<string, PluginConfig>): Promise<void> {
    // remove duplicated items of pluginConfigs
    const pluginNames = Object.keys(pluginConfigs);
    const uniquePluginNames = new Set(pluginNames).keys();
    const filteredPluginConfigs: Record<string, PluginConfig> = {};
    for (const name of uniquePluginNames) {
      filteredPluginConfigs[name] = pluginConfigs[name]!;
    }

    try {
      switch (runtime) {
        case 'docker':
          await this.saveForDocker(pluginConfigs);
          break;
        case 'local':
          await this.saveForLocal(pluginConfigs);
          break;
        default:
          throw new Error(`Unsupported runtime: ${runtime}`);
      }
    } catch (error) {
      this.logger.error(`Failed to save plugin configs: ${error}`);
      return;
    }
    for (const [name, config] of Object.entries(pluginConfigs)) {
      this.cache.set(name, config);
    }
  }

  async has(name: string): Promise<boolean> {
    if (this.cache.has(name)) {
      return true;
    }
    switch (runtime) {
      case 'docker':
        return await this.hasForDocker(name);
      case 'local':
        return await this.hasForLocal(name);
      default:
        throw new Error(`Unsupported runtime: ${runtime}`);
    }
  }

  async update(
    name: string,
    partialConfig: Partial<PluginConfig>
  ): Promise<void> {
    const config = await this.loadBatch([name]);
    if (!config[name]) {
      this.logger.error(`Failed to load plugin config: ${name}`);
      return;
    }
    await this.saveBatch({ [name]: { ...config[name]!, ...partialConfig } });
  }

  async delete(name: string): Promise<void> {
    try {
      switch (runtime) {
        case 'docker':
          await this.deleteForDocker(name);
          break;
        case 'local':
          await this.deleteForLocal(name);
          break;
        default:
          throw new Error(`Unsupported runtime: ${runtime}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete plugin config: ${error}`);
      return;
    }
    this.cache.delete(name);
  }
}
export default new PluginConfigController();
