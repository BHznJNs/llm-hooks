import fs from 'node:fs/promises';
import path from 'node:path';
import type { AppConfig } from '../common/types/config.ts';
import { appConfigs } from './db/schema.ts';
import { runtime } from './utils/runtime.ts';

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

async function loadConfigForDocker(): Promise<AppConfig> {
  const { db } = await import('./db/index.ts');
  const result = await db.select().from(appConfigs).limit(1);
  const hasData = result.length > 0;
  if (!hasData) {
    await db.insert(appConfigs).values(DEFAULT_CONFIG);
  }
  return (await db
    .select({
      theme: appConfigs.theme,
      language: appConfigs.language,
      upstream: appConfigs.upstream,
      assistant: appConfigs.assistant,
      plugins: appConfigs.plugins,
    })
    .from(appConfigs)
    .then((rows) => rows[0])) as AppConfig;
}

async function loadConfigForLocal(): Promise<AppConfig> {
  const { default: appData } = await import('./utils/app-data.ts');
  const configPath = path.join(appData, 'config.json');
  try {
    await fs.access(configPath, fs.constants.R_OK);
  } catch {
    // if config file does not exist
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(DEFAULT_CONFIG));
  }
  return fs.readFile(configPath, 'utf8').then(JSON.parse);
}

export default async function loadConfig(): Promise<AppConfig> {
  switch (runtime) {
    case 'docker':
      return await loadConfigForDocker();
    case 'local':
      return await loadConfigForLocal();
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
}
