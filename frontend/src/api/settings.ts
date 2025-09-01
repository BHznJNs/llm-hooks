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

const API_BASE = '/api';
const TIMEOUT = 5000;

export const settingsApi = {
  async getSettings(): Promise<SettingsResponse> {
    const response = await fetch(`${API_BASE}/settings`, {
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  async updateSettings(settings: SettingsResponse): Promise<void> {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      signal: AbortSignal.timeout(TIMEOUT),
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
