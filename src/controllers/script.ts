import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'llm-hooks-sdk';
import compile from '../utils/compile.ts';
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
      fs.access(scriptPath, fs.constants.R_OK);
    } catch {
      throw new Error('Target script not found.');
    }

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
}

export default new ScriptController();
