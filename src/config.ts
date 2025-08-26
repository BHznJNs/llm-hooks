import fs from 'node:fs/promises';
import path from 'node:path';
import type { AppConfig } from '../common/types/config.ts';
import { appConfigs } from './db/schema.ts';
import { logger } from './utils/logger.ts';
import { runtime } from './utils/runtime.ts';

const moduleLogger = logger.moduleLogger('config');

let configCache: AppConfig | null = null;

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
    beforeUpstreamRequest: {},
    onUpstreamChunk: {},
    afterUpstreamResponse: {},
    onFetchModelList: {},
  },
} satisfies AppConfig;

async function loadConfigForDocker(): Promise<AppConfig | null> {
  const { db } = await import('./db/index.ts');

  try {
    // only inserts default config when there is no existing config
    await db
      .insert(appConfigs)
      .values({ id: 1, ...DEFAULT_CONFIG })
      .onConflictDoNothing({ target: appConfigs.id });

    const result = await db
      .select({
        theme: appConfigs.theme,
        language: appConfigs.language,
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

async function loadConfigForLocal(): Promise<AppConfig | null> {
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

export async function loadConfig(): Promise<AppConfig | null> {
  if (configCache) {
    return configCache;
  }

  switch (runtime) {
    case 'docker':
      configCache = await loadConfigForDocker();
      break;
    case 'local':
      configCache = await loadConfigForLocal();
      break;
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
  return configCache;
}

// --- --- --- --- --- ---

async function saveConfigForDocker(config: AppConfig): Promise<void> {
  const { db } = await import('./db/index.ts');
  const { eq } = await import('drizzle-orm');
  await db.update(appConfigs).set(config).where(eq(appConfigs.id, 1));
}

async function saveConfigForLocal(config: AppConfig): Promise<void> {
  const { default: appData } = await import('./utils/app-data.ts');
  const configPath = path.join(appData, 'config.json');
  try {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config));
  } catch (error) {
    moduleLogger.warn(`Save config failed: ${error}`);
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  switch (runtime) {
    case 'docker':
      await saveConfigForDocker(config);
      break;
    case 'local':
      await saveConfigForLocal(config);
      break;
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
  configCache = config;
}
