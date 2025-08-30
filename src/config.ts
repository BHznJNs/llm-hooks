import fs from 'node:fs/promises';
import path from 'node:path';
import type { AppConfig, PluginConfig } from '../common/types/config.ts';
import { logger } from './utils/logger.ts';
import { runtime } from './utils/runtime.ts';

const moduleLogger = logger.moduleLogger('config');

let appConfigCache: AppConfig | null = null;
const pluginConfigCache = new Map<string, PluginConfig>();

const DEFAULT_CONFIG = {
  theme: 'system',
  language: 'en',
  upstream: {
    baseUrl: 'https://api.openai.com/v1',
    provider: 'openai',
  },
  assistant: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    provider: 'google',
    model: 'gemini-2.5-flash',
    apiKey: 'sk-123456',
  },
  plugins: {
    beforeUpstreamRequest: [],
    onUpstreamChunk: [],
    afterUpstreamResponse: [],
    onFetchModelList: [],
  },
} satisfies AppConfig;

async function loadAppConfigForDocker(): Promise<AppConfig | null> {
  const { db } = await import('./db/index.ts');
  const { appConfigs } = await import('./db/schema.ts');

  try {
    // only inserts default config when there is no existing config
    await db
      .insert(appConfigs)
      .values({ id: 1, ...DEFAULT_CONFIG })
      .onConflictDoNothing({ target: appConfigs.id });

    const result = await db
      .select({
        upstream: appConfigs.upstream,
        assistant: appConfigs.assistant,
        plugins: appConfigs.plugins,
      } as const)
      .from(appConfigs)
      .limit(1);
    if (result.length === 0) {
      throw new Error('Failed to load or create app configuration');
    }
    return result[0] as AppConfig;
  } catch (error) {
    moduleLogger.error(error);
    return null;
  }
}

async function loadAppConfigForLocal(): Promise<AppConfig | null> {
  const { default: appData } = await import('./utils/app-data.ts');
  const configPath = path.join(appData, 'config.json');
  try {
    await fs.access(configPath, fs.constants.R_OK);
  } catch {
    // if config file does not exist
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(DEFAULT_CONFIG));
  }
  try {
    return fs.readFile(configPath, 'utf8').then(JSON.parse);
  } catch (error) {
    moduleLogger.error(error);
    return null;
  }
}

async function loadPluginConfigsForLocal(
  pluginNames: string[]
): Promise<Record<string, PluginConfig>> {
  const { default: appData } = await import('./utils/app-data.ts');
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

async function loadPluginConfigsForDocker(
  pluginNames: string[]
): Promise<Record<string, PluginConfig>> {
  const { inArray } = await import('drizzle-orm');
  const { db } = await import('./db/index.ts');
  const { pluginConfigs } = await import('./db/schema.ts');
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

export async function loadPluginConfigs(
  pluginNames: string[]
): Promise<Record<string, PluginConfig>> {
  const pluginsNotInCache = pluginNames.filter(
    (k) => !pluginConfigCache.has(k)
  );

  if (pluginsNotInCache.length > 0) {
    let newConfigs: Record<string, PluginConfig> = {};
    switch (runtime) {
      case 'local':
        newConfigs = await loadPluginConfigsForLocal(pluginsNotInCache);
        break;
      case 'docker':
        newConfigs = await loadPluginConfigsForDocker(pluginsNotInCache);
        break;
    }
    for (const [k, v] of Object.entries(newConfigs)) {
      pluginConfigCache.set(k, v);
    }
  }

  return pluginNames.reduce(
    (acc, k) => {
      if (!pluginConfigCache.has(k)) {
        return acc;
      }
      acc[k] = pluginConfigCache.get(k)!;
      return acc;
    },
    {} as Record<string, PluginConfig>
  );
}

export async function loadAppConfig(): Promise<AppConfig | null> {
  if (appConfigCache) {
    return appConfigCache;
  }

  switch (runtime) {
    case 'docker':
      appConfigCache = await loadAppConfigForDocker();
      break;
    case 'local':
      appConfigCache = await loadAppConfigForLocal();
      break;
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
  return appConfigCache;
}

// --- --- --- --- --- ---

async function saveAppConfigForDocker(config: AppConfig): Promise<void> {
  const { eq } = await import('drizzle-orm');
  const { db } = await import('./db/index.ts');
  const { appConfigs } = await import('./db/schema.ts');
  await db.update(appConfigs).set(config).where(eq(appConfigs.id, 1));
}

async function saveAppConfigForLocal(config: AppConfig): Promise<void> {
  const { default: appData } = await import('./utils/app-data.ts');
  const configPath = path.join(appData, 'config.json');
  try {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config));
  } catch (error) {
    moduleLogger.warn(`Save config failed: ${error}`);
  }
}

async function savePluginConfigsForLocal(
  pluginConfigs: Record<string, PluginConfig>
): Promise<void> {
  const { default: appData } = await import('./utils/app-data.ts');
  const writeTasks: Promise<void>[] = [];
  await fs.mkdir(path.join(appData, 'plugins'), { recursive: true });
  for (const [name, config] of Object.entries(pluginConfigs)) {
    const configPath = path.join(appData, 'plugins', `${name}.config.json`);
    writeTasks.push(
      fs.writeFile(configPath, JSON.stringify(config)).catch((error) => {
        moduleLogger.warn(`Save config failed: ${error}`);
      })
    );
  }
  await Promise.allSettled(writeTasks);
}

async function savePluginConfigsForDocker(
  pluginConfigs: Record<string, PluginConfig>
): Promise<void> {
  const { sql } = await import('drizzle-orm');
  const { db } = await import('./db/index.ts');
  const { pluginConfigs: pluginConfigsTable } = await import('./db/schema.ts');
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

export async function savePluginConfigs(
  pluginConfigs: Record<string, PluginConfig>
): Promise<void> {
  switch (runtime) {
    case 'docker':
      await savePluginConfigsForDocker(pluginConfigs);
      break;
    case 'local':
      await savePluginConfigsForLocal(pluginConfigs);
      break;
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
  for (const [name, config] of Object.entries(pluginConfigs)) {
    pluginConfigCache.set(name, config);
  }
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
  switch (runtime) {
    case 'docker':
      await saveAppConfigForDocker(config);
      break;
    case 'local':
      await saveAppConfigForLocal(config);
      break;
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
  appConfigCache = config;
}
