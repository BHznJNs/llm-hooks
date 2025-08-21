import type { LlmProvider } from './provider.ts';

export type AppConfig = {
  theme: string;
  language: string;

  upstream: {
    base_url: string;
    provider: LlmProvider;
  };

  assistant: {
    base_url?: string;
    provider?: LlmProvider;
    model: string;
  };
};

// export type HooksConfig = {
//   placeholder: any;
// };
