import { type AnthropicProvider, createAnthropic } from '@ai-sdk/anthropic';
import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
} from '@ai-sdk/google';
import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';

export type LlmProvider = 'openai' | 'google' | 'anthropic';
export type LlmClient =
  | AnthropicProvider
  | GoogleGenerativeAIProvider
  | OpenAIProvider;
export type LlmModel = ReturnType<LlmClient['chat']>;

export function llmClientFactory(
  provider: LlmProvider,
  apiKey: string,
  baseUrl?: string
): LlmClient {
  let upstreamEndpoint: string | undefined;
  if (baseUrl === undefined) {
    upstreamEndpoint = undefined;
  } else if (baseUrl.endsWith('/')) {
    upstreamEndpoint = baseUrl;
  } else {
    upstreamEndpoint = `${baseUrl}/`;
  }
  switch (provider) {
    case 'google':
      return createGoogleGenerativeAI({
        apiKey,
        baseURL: upstreamEndpoint,
      });
    case 'anthropic':
      return createAnthropic({
        apiKey,
        baseURL: upstreamEndpoint,
      });
    case 'openai':
      return createOpenAI({
        apiKey,
        baseURL: upstreamEndpoint,
      });
  }
}
