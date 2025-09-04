import type { PluginConfig } from '../../../common/types/config.ts';

const API_BASE = '/api/plugins';
const TIMEOUT = 5000;

export const pluginsApi = {
  async getAll(): Promise<Record<string, PluginConfig>> {
    const response = await fetch(`${API_BASE}`, {
      signal: AbortSignal.timeout(TIMEOUT),
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.plugins;
  },

  async getContent(pluginName: string): Promise<string> {
    const response = await fetch(
      `${API_BASE}/content/${encodeURIComponent(pluginName)}`,
      {
        signal: AbortSignal.timeout(TIMEOUT),
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
    dependencies: string[];
    content?: string;
  }): Promise<void> {
    const response = await fetch(`${API_BASE}`, {
      method: 'POST',
      signal: AbortSignal.timeout(TIMEOUT),
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
    dependencies: string[];
    content?: string;
  }): Promise<void> {
    const response = await fetch(`${API_BASE}`, {
      method: 'PUT',
      signal: AbortSignal.timeout(TIMEOUT),
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
      `${API_BASE}/toggle/${encodeURIComponent(name)}?enabled=${enabled}`,
      {
        method: 'PUT',
        signal: AbortSignal.timeout(TIMEOUT),
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },

  async has(pluginName: string): Promise<boolean> {
    const response = await fetch(
      `${API_BASE}/has/${encodeURIComponent(pluginName)}`,
      {
        signal: AbortSignal.timeout(TIMEOUT),
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
    const response = await fetch(`${API_BASE}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(TIMEOUT),
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
