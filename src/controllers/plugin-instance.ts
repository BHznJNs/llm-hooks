import childProcess from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PluginManager } from 'live-plugin-manager';
import type { Plugin } from '../../common/types/plugin.ts';
import { pluginScripts } from '../db/schema.ts';
import compile from '../utils/compile.ts';
import { logger } from '../utils/logger.ts';
import { runtime } from '../utils/runtime.ts';
import pluginConfigController from './plugin-config.ts';

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
const scriptPluginDirectory = await (async () => {
  switch (runtime) {
    case 'docker':
      return '/tmp/plugins/';
    case 'local': {
      const { default: appData } = await import('../utils/app-data.ts');
      return path.join(appData, 'plugins');
    }
  }
})();

function isPluginAnNpmPackage(name: string): boolean {
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

async function loadScriptPlugin(scriptPath: string): Promise<Plugin | null> {
  let compiledFilePath: string | null = null;
  if (scriptPath.endsWith('.ts')) {
    compiledFilePath = await compile(scriptPath);
    if (!compiledFilePath) {
      return null;
    }
  }
  const targetPluginModulePath = scriptPath.endsWith('.ts')
    ? compiledFilePath!
    : scriptPath;
  const module = await import(pathToFileURL(targetPluginModulePath).href);
  return module.default;
}

async function fetchPluginScriptFromDatabase(
  pluginName: string
): Promise<string | null> {
  if (runtime !== 'docker') {
    throw new Error(
      `Method not supported for runtime "${runtime}": "fetchPluginScriptFromDatabase"`
    );
  }

  const { db } = await import('../db/index.ts');
  const { eq } = await import('drizzle-orm');
  const result = await db
    .select({ content: pluginScripts.content })
    .from(pluginScripts)
    .where(eq(pluginScripts.id, pluginName))
    .limit(1);

  if (!result[0]?.content) {
    return null;
  }
  return result[0].content;
}

// --- --- --- --- --- ---

async function installPluginScript(
  name: string,
  content: string,
  dependencies: string[]
): Promise<void> {
  const packageJsonPath = path.join(scriptPluginDirectory, 'package.json');
  const scriptPluginPath = path.join(scriptPluginDirectory, name);
  await fs.mkdir(scriptPluginDirectory, { recursive: true });
  try {
    await fs.access(packageJsonPath, fs.constants.R_OK);
  } catch {
    // create package.json if not exist
    await fs.writeFile(packageJsonPath, '{"type": "module"}');
  }
  await fs.writeFile(scriptPluginPath, content);
  return new Promise((resolve, reject) => {
    const npmExecTimeout = 20_000;
    setTimeout(
      () => reject(new Error('Timeout waiting for npm install')),
      npmExecTimeout
    );
    childProcess.exec(
      `npm install --silent ${dependencies.join(' ')}`,
      {
        cwd: scriptPluginDirectory,
      },
      (error, _stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          reject(new Error(stderr));
          return;
        }
        resolve();
      }
    );
  });
}

async function savePluginScriptIntoDatabase(
  name: string,
  content: string
): Promise<void> {
  if (runtime !== 'docker') {
    throw new Error(
      `Method not supported for runtime "${runtime}": "savePluginScriptIntoDatabase"`
    );
  }
  const { db } = await import('../db/index.ts');
  await db
    .insert(pluginScripts)
    .values({ id: name, content })
    .onConflictDoUpdate({ target: pluginScripts.id, set: { content } });
}

class PluginInstanceController {
  private readonly logger = logger.moduleLogger('plugin-instance');
  private readonly cache = new Map<string, Plugin>();

  private async loadForDocker(name: string): Promise<Plugin | null> {
    if (isPluginAnNpmPackage(name)) {
      return await loadNpmPlugin(name);
    }
    const pluginModulePath = path.join(scriptPluginDirectory, name);
    try {
      await fs.access(pluginModulePath, fs.constants.R_OK);
    } catch {
      const [pluginScriptContent, pluginConfigMap] = await Promise.all([
        fetchPluginScriptFromDatabase(name),
        pluginConfigController.loadBatch([name]),
      ]);
      if (!pluginScriptContent || pluginConfigMap[name] === undefined) {
        return null;
      }
      const pluginConfig = pluginConfigMap[name];
      await installPluginScript(
        name,
        pluginScriptContent,
        pluginConfig.dependencies
      );
    }
    return await loadScriptPlugin(pluginModulePath);
  }

  private async loadForLocal(name: string): Promise<Plugin | null> {
    if (isPluginAnNpmPackage(name)) {
      return await loadNpmPlugin(name);
    }

    const pluginModulePath = path.join(scriptPluginDirectory, name);
    try {
      await fs.access(pluginModulePath, fs.constants.R_OK);
    } catch {
      this.logger.error(`Plugin not found: ${name}`);
      return null;
    }
    return await loadScriptPlugin(pluginModulePath);
  }

  private async saveForDocker(
    name: string,
    dependencies: string[],
    content?: string
  ): Promise<void> {
    if (isPluginAnNpmPackage(name)) {
      await pluginManager.install(name);
    } else {
      await Promise.all([
        installPluginScript(name, content!, dependencies!),
        savePluginScriptIntoDatabase(name, content!),
      ]);
    }
  }

  private async saveForLocal(
    name: string,
    dependencies: string[],
    content?: string
  ): Promise<void> {
    if (isPluginAnNpmPackage(name)) {
      await pluginManager.install(name);
    } else {
      await installPluginScript(name, content!, dependencies!);
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
    dependencies: string[],
    content?: string // only for script plugin
  ): Promise<void> {
    try {
      switch (runtime) {
        case 'docker':
          await this.saveForDocker(name, dependencies, content);
          break;
        case 'local':
          await this.saveForLocal(name, dependencies, content);
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
      const pluginModulePath = path.join(scriptPluginDirectory, name);
      await fs.unlink(pluginModulePath).catch((error) => {
        this.logger.warn(`Delete plugin failed: ${error}`);
      });
    }
  }
}
export default new PluginInstanceController();
