import type { HookType } from './hook.ts';

export type LlmProvider = 'openai' | 'google' | 'anthropic';
export type AppTheme = 'dark' | 'light' | 'system';

export type AppConfig = {
  theme: AppTheme;
  language: string;

  upstream: {
    baseUrl: string;
    provider: LlmProvider;
  };

  assistant: {
    baseUrl: string;
    provider: LlmProvider;
    model: string;
    apiKey: string;
  };

  plugins: Record<HookType, string[]>;
};

export type PluginConfig = {
  enabled: boolean;
  params: Record<string, unknown>;
};
