import type { PluginConfig } from '../../../common/types/config';
import type { HookType } from '../../../common/types/hook';

const API_BASE = '/api';
const TIMEOUT = 5000;

type HooksData = {
  pluginOrder: Record<HookType, string[]>;
  pluginConfigs: Record<string, PluginConfig>;
};

export const hooksApi = {
  async getHooks(): Promise<HooksData> {
    const response = await fetch(`${API_BASE}/hooks`, {
      signal: AbortSignal.timeout(TIMEOUT),
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  async updateHooks(pluginOrder: HooksData['pluginOrder']): Promise<void> {
    const response = await fetch(`${API_BASE}/hooks`, {
      method: 'PUT',
      signal: AbortSignal.timeout(TIMEOUT),
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
