import { eq, inArray, sql } from 'drizzle-orm';
import type { AppConfig, PluginConfig } from '../../common/types/config.ts';
import { logger } from '../utils/logger.ts';
import { undefinedToNull } from '../utils/type-utils.ts';
import { type Database, db } from './index.ts';
import { appConfigs, pluginConfigs, pluginScripts } from './schema.ts';

class DatabaseOperator {
  private readonly db: Database;

  constructor(db_: Database) {
    this.db = db_;
  }

  /**
   * Script operations start
   */

  async fetchScript(name: string): Promise<string | null> {
    const result = await this.db
      .select({ content: pluginScripts.content })
      .from(pluginScripts)
      .where(eq(pluginScripts.id, name))
      .limit(1);

    if (!result[0]?.content) {
      return null;
    }
    return result[0].content;
  }

  async saveScript(name: string, content: string): Promise<void> {
    await this.db
      .insert(pluginScripts)
      .values({ id: name, content })
      .onConflictDoUpdate({
        target: pluginScripts.id,
        set: { content },
      });
  }

  async deleteScript(name: string): Promise<void> {
    await this.db.delete(pluginScripts).where(eq(pluginScripts.id, name));
  }

  /**
   * Script operations end
   */

  /**
   * Plugin config operations start
   */

  async fetchPluginConfigBatch(
    pluginNames: string[]
  ): Promise<(PluginConfig & { name: string })[]> {
    const result = await this.db
      .select({
        name: pluginConfigs.name,
        enabled: pluginConfigs.enabled,
        params: pluginConfigs.params,
      } as const)
      .from(pluginConfigs)
      .where(inArray(pluginConfigs.name, pluginNames));
    return result as (PluginConfig & { name: string })[];
  }

  async savePluginConfigBatch(pluginConfigPairs: Record<string, PluginConfig>) {
    const dataToSave = Object.entries(pluginConfigPairs).map(
      ([name, config]) => ({
        name,
        ...config,
      })
    );
    await this.db.insert(pluginConfigs).values(dataToSave);
  }

  async updatePluginConfig(name: string, partialConfig: Partial<PluginConfig>) {
    await this.db
      .update(pluginConfigs)
      .set(partialConfig)
      .where(eq(pluginConfigs.name, name));
  }

  async deletePluginConfig(name: string) {
    await this.db.delete(pluginConfigs).where(eq(pluginConfigs.name, name));
  }

  /**
   * Plugin config operations end
   */

  /**
   * App config operations start
   */

  async fetchAppConfig(defaultConfig: AppConfig): Promise<AppConfig | null> {
    const [row] = await this.db
      .insert(appConfigs)
      .values({
        id: 1,
        ...defaultConfig,
      })
      .onConflictDoUpdate({
        target: appConfigs.id,
        set: { id: appConfigs.id },
      })
      .returning({
        upstream: appConfigs.upstream,
        assistant: appConfigs.assistant,
        plugins: appConfigs.plugins,
      });

    return undefinedToNull(row);
  }

  async saveAppConfig(config: AppConfig) {
    await this.db
      .insert(appConfigs)
      .values({
        id: 1,
        ...config,
      })
      .onConflictDoUpdate({
        target: appConfigs.id,
        set: {
          upstream: sql`EXCLUDED.upstream`,
          assistant: sql`EXCLUDED.assistant`,
          plugins: sql`EXCLUDED.plugins`,
        },
      });
  }

  /**
   * App config operations end
   */
}

const operatorInstance = new DatabaseOperator(db);
const moduleLogger = logger.moduleLogger('db-operator');
const proxy = new Proxy(operatorInstance, {
  get(target, prop, receiver) {
    const orig = Reflect.get(target, prop, receiver);
    if (typeof orig !== 'function') {
      return orig;
    }
    return async (...args: unknown[]) => {
      const start = performance.now();
      try {
        const result = await orig.apply(target, args);
        return result;
      } catch (error) {
        throw error;
      } finally {
        const end = performance.now();
        const duration = (end - start).toFixed(2);
        moduleLogger.debug(
          `operation: "${String(prop)}", duration: ${duration}ms`
        );
      }
    };
  },
});
export default proxy;
