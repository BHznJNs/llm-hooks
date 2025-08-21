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

  hooks: HooksConfig;
};

// Use hooks config to store the order of hooks
export type HooksConfig = {
  beforeUpstreamRequest: string[];
  onUpstreamChunk: string[];
  beforeDownstreamResponse: string[];

  onFetchModelList: string[];
  onError: string[];
};
