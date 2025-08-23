import type { LlmProvider } from './provider.ts';

export type AppConfig = {
  theme: string;
  language: string;

  upstream: {
    baseUrl: string;
    provider: LlmProvider;
  };

  assistant: {
    baseUrl?: string;
    provider?: LlmProvider;
    model: string;
  };

  plugins: PluginConfig[];
};

export type PluginConfig = {
  name: string;
  enabled: boolean;
  dependencies: string[];
  arguments: Record<string, unknown>;
};
