import { cache } from './cache.ts';
import { runtime } from './utils/runtime.ts';

function isPluginAnNpmPackage(name: string): boolean {
  return !name.includes('.');
}

function loadPluginForCfWorker(name: string): Promise<Plugin | null> {
  throw new Error('Not implemented');
}

async function loadPluginForDocker(name: string): Promise<Plugin | null> {
  if (isPluginAnNpmPackage(name)) {
    const pluginModule = await import(name);
    return pluginModule.default;
  }
  // .js or .ts module
  if (name.endsWith('.ts')) {
    // return import(`../plugins/${name}`);
  }
  return await import(`../plugins/${name}`);
}

async function loadPluginForLocal(name: string): Promise<Plugin | null> {
  const { default: appData } = await import('./utils/app-data.ts');
  const pathModule = await import('node:path');
  const { pathToFileURL } = await import('node:url');
  const { default: compile } = await import('./utils/compile.ts');
  if (isPluginAnNpmPackage(name)) {
    // for npm plugin
    const packagePath = pathModule.join(appData, 'node_modules', name);
    const module = await import(pathToFileURL(packagePath).href);
    return module.default;
  }
  let pluginModulePath = pathModule.join(appData, 'plugins', name);
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
  if (runtime === 'cf-worker') {
    return await loadPluginForCfWorker(name);
  }
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
