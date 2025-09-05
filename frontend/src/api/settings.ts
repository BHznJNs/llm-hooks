import { API_BASE, API_TIMEOUT_MS } from './index.ts';
import type { LlmProvider } from '../../../common/types/config.ts';

export type UpstreamConfig = {
  baseUrl: string;
  provider: LlmProvider;
};

export type AssistantConfig = {
  baseUrl: string;
  provider: LlmProvider;
  model: string;
  apiKey: string;
};

export type SettingsResponse = {
  upstream: UpstreamConfig;
  assistant: AssistantConfig;
};

const settingsApiBase = `${API_BASE}/settings`;

export const settingsApi = {
  async getSettings(): Promise<SettingsResponse> {
    const response = await fetch(settingsApiBase, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  async updateSettings(settings: SettingsResponse): Promise<void> {
    const response = await fetch(settingsApiBase, {
      method: 'PUT',
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },
};
