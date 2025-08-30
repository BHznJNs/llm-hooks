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
    beforeUpstreamRequest: string[];
    onUpstreamChunk: string[];
    afterUpstreamResponse: string[];
    onFetchModelList: string[];
  };
};

export type PluginConfig = {
  enabled: boolean;
  dependencies: string[] | null;
  params: Record<string, unknown>;
};
