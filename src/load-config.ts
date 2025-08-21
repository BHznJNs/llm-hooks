import type { AppConfig } from '../common/types/config.ts';
import { runtime } from './utils/runtime.ts';

function loadConfigForCfWorker(): Promise<AppConfig> {
  throw new Error('Not implemented');
}

function loadConfigForDocker(): Promise<AppConfig> {
  throw new Error('Not implemented');
}

async function loadConfigForLocal(): Promise<AppConfig> {
  const { default: appData } = await import('./utils/app-data.ts');
  const pathModule = await import('node:path');
  const fsModule = await import('node:fs/promises');
  const configPath = pathModule.join(await appData, 'config.json');
  try {
    await fsModule.access(configPath, fsModule.constants.R_OK);
  } catch {
    // if config file does not exist
    await fsModule.mkdir(pathModule.dirname(configPath), { recursive: true });
    await fsModule.writeFile(configPath, JSON.stringify({}));
  }
  return fsModule.readFile(configPath, 'utf8').then(JSON.parse);
}

export async function loadConfig(): Promise<AppConfig> {
  switch (runtime) {
    case 'cf-worker':
      return await loadConfigForCfWorker();
    case 'docker':
      return await loadConfigForDocker();
    case 'local':
      return await loadConfigForLocal();
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
}
