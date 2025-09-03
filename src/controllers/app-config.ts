import fs from 'node:fs/promises';
import path from 'node:path';
import type { AppConfig } from '../../common/types/config.ts';
import type { HookType } from '../../common/types/hook.ts';
import { logger } from '../utils/logger.ts';
import { runtime } from '../utils/runtime.ts';

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

class AppConfigController {
  private cache: AppConfig | null = null;
  private readonly logger = logger.moduleLogger('app-config');

  private async loadForDocker(): Promise<AppConfig | null> {
    const { default: dbOperator } = await import('../db/operator.ts');
    const result = await dbOperator.fetchAppConfig();
    if (result === null) {
      throw new Error('Failed to load or create app configuration');
    }
    return result;
  }

  private async loadForLocal(): Promise<AppConfig | null> {
    const { default: appData } = await import('../utils/app-data.ts');
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
      this.logger.error(error);
      return null;
    }
  }

  private async saveForDocker(config: AppConfig): Promise<void> {
    const { default: dbOperator } = await import('../db/operator.ts');
    await dbOperator.saveAppConfig(config);
  }

  private async saveForLocal(config: AppConfig): Promise<void> {
    const { default: appData } = await import('../utils/app-data.ts');
    const configPath = path.join(appData, 'config.json');
    try {
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.writeFile(configPath, JSON.stringify(config));
    } catch (error) {
      this.logger.warn(`Save config failed: ${error}`);
    }
  }

  async load(): Promise<AppConfig | null> {
    if (this.cache) {
      return this.cache;
    }

    switch (runtime) {
      case 'docker':
        this.cache = await this.loadForDocker();
        break;
      case 'local':
        this.cache = await this.loadForLocal();
        break;
      default:
        throw new Error(`Unsupported runtime: ${runtime}`);
    }
    return this.cache;
  }

  async save(config: AppConfig): Promise<void> {
    switch (runtime) {
      case 'docker':
        await this.saveForDocker(config);
        break;
      case 'local':
        await this.saveForLocal(config);
        break;
      default:
        throw new Error(`Unsupported runtime: ${runtime}`);
    }
    this.cache = config;
  }

  async update(partialConfig: Partial<AppConfig>): Promise<void> {
    const config = await this.load();
    if (!config) {
      this.logger.error('Failed to load app configuration');
      return;
    }
    await this.save({ ...config, ...partialConfig });
  }

  async deletePluginRecord(pluginName: string): Promise<void> {
    const config = await this.load();
    if (!config) {
      this.logger.error('Failed to load app configuration');
      return;
    }
    for (const hookName of Object.keys(config.plugins) as HookType[]) {
      config.plugins[hookName] = config.plugins[hookName].filter(
        (name) => name !== pluginName
      );
    }
    await this.save(config);
  }
}
export default new AppConfigController();
