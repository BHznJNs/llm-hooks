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

  plugins: {
    beforeUpstreamRequest: Record<string, PluginConfig>;
    onUpstreamChunk: Record<string, PluginConfig>;
    afterUpstreamResponse: Record<string, PluginConfig>;
    onFetchModelList: Record<string, PluginConfig>;
  };
};

export type PluginConfig = {
  enabled: boolean;
  dependencies: string[];
  params: Record<string, unknown>;
};
