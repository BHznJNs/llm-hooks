import childProcess from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PluginManager } from 'live-plugin-manager';
import type { AppConfig, PluginConfig } from '../common/types/config.ts';
import type { Plugin } from '../common/types/plugin.ts';
import { cache } from './cache.ts';
import { loadConfig, saveConfig } from './config.ts';
import { pluginScripts } from './db/schema.ts';
import compile from './utils/compile.ts';
import { logger } from './utils/logger.ts';
import { runtime } from './utils/runtime.ts';

const moduleLogger = logger.moduleLogger('plugin');
const pluginManager = await (async () => {
  switch (runtime) {
    case 'docker':
      return new PluginManager();
    case 'local': {
      const { default: appData } = await import('./utils/app-data.ts');
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
      const { default: appData } = await import('./utils/app-data.ts');
      return path.join(appData, 'plugins');
    }
  }
})();

function isPluginAnNpmPackage(name: string): boolean {
  return !name.includes('.');
}

// --- --- --- --- --- ---

async function loadNpmPlugin(name: string): Promise<Plugin | null> {
  const isInstalled = pluginManager.alreadyInstalled(name);
  try {
    if (!isInstalled) {
      await pluginManager.install(name);
    }
    return pluginManager.require(name) as Plugin;
  } catch (error) {
    moduleLogger.error(`Failed to load npm plugin: ${error}`);
    return null;
  }
}

async function fetchPluginScriptFromDatabase(
  pluginName: string
): Promise<string | null> {
  if (runtime !== 'docker') {
    moduleLogger.error(
      `Method not supported for runtime "${runtime}": "fetchPluginScriptFromDatabase"`
    );
    return null;
  }

  const { db } = await import('./db/index.ts');
  const { eq } = await import('drizzle-orm');
  const result = await db
    .select({ content: pluginScripts.content })
    .from(pluginScripts)
    .where(eq(pluginScripts.id, pluginName))
    .limit(1);

  if (!result[0]?.content) {
    moduleLogger.error(`Plugin not found: ${pluginName}`);
    return null;
  }
  return result[0].content;
}

async function _loadPlugin(pluginName: string): Promise<Plugin | null> {
  if (isPluginAnNpmPackage(pluginName)) {
    return await loadNpmPlugin(pluginName);
  }

  const pluginModulePath = path.join(scriptPluginDirectory, pluginName);
  try {
    await fs.access(pluginModulePath, fs.constants.R_OK);
  } catch {
    if (runtime !== 'docker') {
      moduleLogger.error(`Plugin not found: ${pluginName}`);
      return null;
    }
    const pluginScriptContent = await fetchPluginScriptFromDatabase(pluginName);
    if (!pluginScriptContent) {
      return null;
    }
    try {
      await fs.writeFile(pluginModulePath, pluginScriptContent);
    } catch (error) {
      moduleLogger.error(`Failed to write plugin: ${error}`);
      return null;
    }
  }

  let compiledFilePath: string | null = null;
  if (pluginName.endsWith('.ts')) {
    compiledFilePath = await compile(pluginModulePath);
    if (!compiledFilePath) {
      return null;
    }
  }
  const targetPluginModulePath = pluginName.endsWith('.ts')
    ? compiledFilePath!
    : pluginModulePath;
  const module = await import(pathToFileURL(targetPluginModulePath).href);
  return module.default;
}

export async function loadPlugin(pluginName: string): Promise<Plugin | null> {
  if (cache.has(pluginName)) {
    return cache.get(pluginName);
  }
  const plugin = await _loadPlugin(pluginName);
  if (plugin === null) {
    return null;
  }
  cache.set(pluginName, plugin);
  return plugin;
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
    await fs.writeFile(packageJsonPath, '{"type": "module"}');
  }
  await fs.writeFile(scriptPluginPath, content);
  childProcess.execSync(`npm install --silent ${dependencies.join(' ')}`, {
    cwd: scriptPluginDirectory,
    stdio: 'inherit',
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
  const { db } = await import('./db/index.ts');
  await db
    .insert(pluginScripts)
    .values({ id: name, content })
    .onConflictDoUpdate({ target: pluginScripts.id, set: { content } });
}

async function updatePluginConfig(
  name: string,
  plugin: Plugin,
  dependencies?: string[],
  params?: Record<string, unknown>
): Promise<void> {
  const config = (await loadConfig())!;
  for (const key of Object.keys(
    config.plugins
  ) as (keyof AppConfig['plugins'])[]) {
    if (key in plugin) {
      config.plugins[key][name] = {
        enabled: true,
        dependencies: dependencies ?? [],
        params: params ?? {},
      } satisfies PluginConfig;
    }
  }
  await saveConfig(config);
}

export async function savePlugin(
  name: string,
  params: Record<string, unknown>,
  content?: string,
  dependencies?: string[]
): Promise<void> {
  if (isPluginAnNpmPackage(name)) {
    try {
      await pluginManager.install(name);
    } catch (error) {
      moduleLogger.error(`Failed to save npm plugin: ${error}`);
      return;
    }
  } else {
    try {
      await Promise.all([
        runtime === 'docker' && savePluginScriptIntoDatabase(name, content!),
        installPluginScript(name, content!, dependencies!),
      ]);
    } catch (error) {
      moduleLogger.error(`Failed to save script plugin: ${error}`);
      return;
    }
  }

  const plugin = await loadPlugin(name);
  if (plugin === null) {
    moduleLogger.error(`Failed to load plugin after save: ${name}`);
    return;
  }
  await updatePluginConfig(name, plugin, dependencies, params);
  cache.set(name, plugin);
}
