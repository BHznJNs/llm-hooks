import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from '../common/types/plugin.ts';
import { cache } from './cache.ts';
import { runtime } from './utils/runtime.ts';

function isPluginAnNpmPackage(name: string): boolean {
  return !name.includes('.');
}

async function createPlugin(name: string) {
  if (isPluginAnNpmPackage(name)) {
    const tempInstallDir = path.join('/tmp', `npm-dynamic-${uuidv4()}`);
    return await import(name);
  }
}

async function loadPluginForDocker(name: string): Promise<Plugin | null> {
  if (isPluginAnNpmPackage(name)) {
    const pluginModule = await import(name);
    return pluginModule.default;
  }
  throw new Error('Not implemented');
}

async function loadPluginForLocal(name: string): Promise<Plugin | null> {
  const { default: appData } = await import('./utils/app-data.ts');
  const { default: compile } = await import('./utils/compile.ts');
  if (isPluginAnNpmPackage(name)) {
    // for npm plugin
    const packagePath = path.join(appData, 'node_modules', name);
    const module = await import(pathToFileURL(packagePath).href);
    return module.default;
  }
  let pluginModulePath = path.join(appData, 'plugins', name);
  if (name.endsWith('.ts')) {
    const jsFilePath = await compile(pluginModulePath);
    if (!jsFilePath) {
      return null;
    }
    pluginModulePath = jsFilePath;
  }
  const module = await import(pathToFileURL(pluginModulePath).href);
  return module.default;
}

export default async function loadPlugin(name: string): Promise<Plugin | null> {
  if (cache.has(name)) {
    return cache.get(name);
  }
  let plugin: Plugin | null;
  if (runtime === 'docker') {
    plugin = await loadPluginForDocker(name);
  } else if (runtime === 'local') {
    plugin = await loadPluginForLocal(name);
  } else {
    throw new Error(`Unsupported runtime: ${runtime}`);
  }
  cache.set(name, plugin);
  return plugin;
}
