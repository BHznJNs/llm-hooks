import fs from 'node:fs/promises';
import path from 'node:path';
import type { PluginConfig } from '../../common/types/config.ts';
import { logger } from '../utils/logger.ts';
import { runtime } from '../utils/runtime.ts';

class PluginConfigController {
  private readonly logger = logger.moduleLogger('plugin-config');
  private readonly cache = new Map<string, PluginConfig>();

  private async loadForLocal(
    pluginNames: string[]
  ): Promise<Record<string, PluginConfig>> {
    const { default: appData } = await import('../utils/app-data.ts');
    const readTasks: Promise<PluginConfig>[] = [];
    for (const pluginName of pluginNames) {
      const configPath = path.join(
        appData,
        'plugins',
        `${pluginName}.config.json`
      );
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
    const { inArray } = await import('drizzle-orm');
    const { db } = await import('../db/index.ts');
    const { pluginConfigs } = await import('../db/schema.ts');
    const rows = await db
      .select({
        name: pluginConfigs.name,
        enabled: pluginConfigs.enabled,
        dependencies: pluginConfigs.dependencies,
        params: pluginConfigs.params,
      } as const)
      .from(pluginConfigs)
      .where(inArray(pluginConfigs.name, pluginNames));
    const result: Record<string, PluginConfig> = {};
    for (const row of rows) {
      result[row.name] = {
        enabled: row.enabled,
        dependencies: row.dependencies,
        params: row.params as Record<string, unknown>,
      };
    }
    return result;
  }

  private async saveForDocker(
    pluginConfigs: Record<string, PluginConfig>
  ): Promise<void> {
    const { sql } = await import('drizzle-orm');
    const { db } = await import('../db/index.ts');
    const { pluginConfigs: pluginConfigsTable } = await import(
      '../db/schema.ts'
    );
    const dataToSave = Object.entries(pluginConfigs).map(([name, config]) => ({
      name,
      ...config,
    }));
    await db
      .insert(pluginConfigsTable)
      .values(dataToSave)
      .onConflictDoUpdate({
        target: pluginConfigsTable.name,
        set: {
          enabled: sql`excluded.enabled`,
          dependencies: sql`excluded.dependencies`,
          params: sql`excluded.params`,
        },
      });
  }

  private async saveForLocal(
    pluginConfigs: Record<string, PluginConfig>
  ): Promise<void> {
    const { default: appData } = await import('../utils/app-data.ts');
    const writeTasks: Promise<void>[] = [];
    await fs.mkdir(path.join(appData, 'plugins'), { recursive: true });
    for (const [name, config] of Object.entries(pluginConfigs)) {
      const configPath = path.join(appData, 'plugins', `${name}.config.json`);
      writeTasks.push(
        fs.writeFile(configPath, JSON.stringify(config)).catch((error) => {
          this.logger.warn(`Save config failed: ${error}`);
        })
      );
    }
    await Promise.allSettled(writeTasks);
  }

  private async deleteForLocal(pluginName: string): Promise<void> {
    const { default: appData } = await import('../utils/app-data.ts');
    const configPath = path.join(
      appData,
      'plugins',
      `${pluginName}.config.json`
    );
    await fs.unlink(configPath).catch((error) => {
      this.logger.warn(`Delete config failed: ${error}`);
    });
  }

  private async deleteForDocker(pluginName: string): Promise<void> {
    const { eq } = await import('drizzle-orm');
    const { db } = await import('../db/index.ts');
    const { pluginConfigs } = await import('../db/schema.ts');
    await db.delete(pluginConfigs).where(eq(pluginConfigs.name, pluginName));
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
