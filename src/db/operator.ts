import { eq, inArray } from 'drizzle-orm';
import type { AppConfig, PluginConfig } from '../../common/types/config.ts';
import { type Database, db } from './index.ts';
import { appConfigs, pluginConfigs, pluginScripts } from './schema.ts';

class DatabaseOperator {
  private readonly db: Database;
  // private readonly logger = logger.moduleLogger('database-operator');

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
      .onConflictDoUpdate({ target: pluginScripts.id, set: { content } });
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
    await this.db
      .insert(pluginConfigs)
      .values(dataToSave)
      .onConflictDoUpdate({
        target: pluginConfigs.name,
        set: {
          enabled: eq(pluginConfigs.enabled, true),
          params: pluginConfigs.params,
        },
      });
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
        upstream: defaultConfig.upstream,
        assistant: defaultConfig.assistant,
        plugins: defaultConfig.plugins,
      })
      .onConflictDoNothing()
      .returning({
        upstream: appConfigs.upstream,
        assistant: appConfigs.assistant,
        plugins: appConfigs.plugins,
      });
    if (row) {
      return row;
    }
    return (
      (await this.db
        .select({
          upstream: appConfigs.upstream,
          assistant: appConfigs.assistant,
          plugins: appConfigs.plugins,
        })
        .from(appConfigs)
        .limit(1)
        .then((r) => r[0])) ?? null
    );
  }

  async saveAppConfig(config: AppConfig) {
    await this.db
      .insert(appConfigs)
      .values(config)
      .onConflictDoUpdate({
        target: appConfigs.id,
        set: {
          upstream: appConfigs.upstream,
          assistant: appConfigs.assistant,
          plugins: appConfigs.plugins,
        },
      });
  }

  /**
   * App config operations end
   */
}

export default new DatabaseOperator(db);
