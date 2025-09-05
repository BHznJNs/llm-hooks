import { API_BASE, API_TIMEOUT_MS } from './index.ts';
import type { PluginConfig } from '../../../common/types/config.ts';
import type { HookType } from '../../../common/types/hook.ts';

type HooksData = {
  pluginOrder: Record<HookType, string[]>;
  pluginConfigs: Record<string, PluginConfig>;
};

const hooksApiBase = `${API_BASE}/hooks`;

export const hooksApi = {
  async getHooks(): Promise<HooksData> {
    const response = await fetch(hooksApiBase, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  async updateHooks(pluginOrder: HooksData['pluginOrder']): Promise<void> {
    const response = await fetch(hooksApiBase, {
      method: 'PUT',
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pluginOrder }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },
};
