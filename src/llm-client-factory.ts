import { type AnthropicProvider, createAnthropic } from '@ai-sdk/anthropic';
import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
} from '@ai-sdk/google';
import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';

export type LlmProvider = 'openai' | 'google' | 'anthropic';

export function llmClientFactory(
  provider: LlmProvider,
  apiKey: string,
  baseURL?: string
): AnthropicProvider | GoogleGenerativeAIProvider | OpenAIProvider {
  switch (provider) {
    case 'google':
      return createGoogleGenerativeAI({
        apiKey,
        baseURL,
      });
    case 'anthropic':
      return createAnthropic({
        apiKey,
        baseURL,
      });
    case 'openai':
      return createOpenAI({
        apiKey,
        baseURL,
      });
  }
}
