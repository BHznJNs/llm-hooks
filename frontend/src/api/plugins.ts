import type { PluginConfig } from '../../../common/types/config.ts';
import { API_BASE, API_TIMEOUT_MS } from './index.ts';

const pluginsApiBase = `${API_BASE}/plugins`;

// since the `npm install` command requires time, we need to give it extra timeout here.
const NPM_INSTALL_EXTRA_TIMEOUT_MS = 60_000;
const NPM_INSTALL_TIMEOUT = API_TIMEOUT_MS + NPM_INSTALL_EXTRA_TIMEOUT_MS;

export const pluginsApi = {
  async fetchAll(): Promise<Record<string, PluginConfig>> {
    const response = await fetch(pluginsApiBase, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.plugins;
  },

  async fetchContent(pluginName: string): Promise<string> {
    const response = await fetch(
      `${pluginsApiBase}/content/${encodeURIComponent(pluginName)}`,
      {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
        cache: 'no-store',
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.content;
  },

  async create(data: {
    name: string;
    params: Record<string, unknown>;
    content?: string;
  }): Promise<void> {
    const response = await fetch(`${pluginsApiBase}`, {
      method: 'POST',
      signal: AbortSignal.timeout(NPM_INSTALL_TIMEOUT),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },

  async update(data: {
    name: string;
    params: Record<string, unknown>;
    content?: string;
  }): Promise<void> {
    const response = await fetch(`${pluginsApiBase}`, {
      method: 'PUT',
      signal: AbortSignal.timeout(NPM_INSTALL_TIMEOUT),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },

  async toggle(name: string, enabled: boolean): Promise<void> {
    const response = await fetch(
      `${pluginsApiBase}/toggle/${encodeURIComponent(name)}?enabled=${enabled}`,
      {
        method: 'PUT',
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },

  async has(pluginName: string): Promise<boolean> {
    const response = await fetch(
      `${pluginsApiBase}/has/${encodeURIComponent(pluginName)}`,
      {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
        cache: 'no-store',
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.has;
  },

  async delete(name: string): Promise<void> {
    const response = await fetch(`${pluginsApiBase}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },
};
