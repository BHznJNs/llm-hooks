import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'llm-hooks-sdk';
import compile from '../utils/compile.ts';
import { logger } from '../utils/logger.ts';
import { npmInstall } from '../utils/npm.ts';
import { runtime } from '../utils/runtime.ts';

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
const packageJsonPath = path.join(scriptPluginDirectory, 'package.json');
const scriptPluginPathFactory = (name: string) =>
  path.join(scriptPluginDirectory, name);

function collectDeps(scriptContent: string): string[] {
  const RE_STATIC =
    /(?:^|\s)import\s+(?:type\s+)?(?:[\s\S]*?)\bfrom\s+['"]([^'"]+)['"]\s*;?/gm;
  const deps = new Set<string>();
  for (const m of scriptContent.matchAll(RE_STATIC)) {
    deps.add(m[1]!);
  }
  return [...deps];
}

class ScriptController {
  private readonly logger = logger.moduleLogger('script-controller');

  /**
   * @description
   * Use this function when the script file exists.
   *
   * Receives the name of script (TypeScript or JavaScript),
   * automatically compiles TypeScript to JavaScript if necessary,
   * and returns the loaded module as a Plugin.
   */
  async load(name: string): Promise<Plugin | null> {
    const scriptPath = scriptPluginPathFactory(name);
    try {
      await fs.access(scriptPath, fs.constants.R_OK);
    } catch {
      throw new Error('Target script not found.');
    }

    let targetPluginModulePath: string;
    if (scriptPath.endsWith('.js')) {
      targetPluginModulePath = scriptPath;
    } else {
      const compiledFilePath = await compile(scriptPath);
      if (!compiledFilePath) {
        return null;
      }
      targetPluginModulePath = compiledFilePath;
    }

    // For ES modules, we need to invalidate the import cache
    // by appending a query parameter with timestamp
    const moduleUrl = pathToFileURL(targetPluginModulePath).href;
    const cacheBustUrl = `${moduleUrl}?t=${Date.now()}`;

    const module = await import(cacheBustUrl);
    return module.default;
  }

  async loadContent(name: string): Promise<string | null> {
    const pluginModulePath = scriptPluginPathFactory(name);
    try {
      await fs.access(pluginModulePath, fs.constants.R_OK);
    } catch {
      if (runtime !== 'docker') {
        this.logger.warn(`Plugin not found: ${name}`);
        return null;
      }
      const { default: dbOperator } = await import('../db/operator.ts');
      const pluginScriptContent = await dbOperator.fetchScript(name);
      if (pluginScriptContent) {
        await fs.writeFile(pluginModulePath, pluginScriptContent);
      }
    }
    return await fs.readFile(pluginModulePath, 'utf8');
  }

  async install(name: string, content: string): Promise<void> {
    const scriptPluginPath = scriptPluginPathFactory(name);
    await fs.mkdir(scriptPluginDirectory, { recursive: true });
    try {
      await fs.access(packageJsonPath, fs.constants.R_OK);
    } catch {
      // create package.json if not exist
      await fs.writeFile(packageJsonPath, '{"type": "module"}');
    }
    await fs.writeFile(scriptPluginPath, content);
    const dependencies = collectDeps(content);
    await npmInstall(dependencies, scriptPluginDirectory);
  }

  async exists(name: string): Promise<boolean> {
    const pluginModulePath = scriptPluginPathFactory(name);
    try {
      await fs.access(pluginModulePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  async delete(name: string): Promise<void> {
    const pluginModulePath = scriptPluginPathFactory(name);
    if (pluginModulePath.endsWith('.ts')) {
      // if is a typescript plugin, delete the compiled javascript file.
      const jsFileName = `${path.basename(name, '.ts')}.js`;
      const jsFilePath = scriptPluginPathFactory(jsFileName);
      await fs.unlink(jsFilePath).catch((_) => {
        /** Do not care the javascript script file unlink error here */
      });
    }
    await fs.unlink(pluginModulePath).catch((error) => {
      this.logger.warn(`Delete plugin failed: ${error}`);
    });
  }
}

export default new ScriptController();
