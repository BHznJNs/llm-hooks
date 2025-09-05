import type { Logger } from 'pino';
import type { AI_SDK_UTILS } from '../utils/ai-sdk-utils.ts';
import type { LlmModel } from '../utils/llm-client-factory.ts';

export type PromiseOr<T> = Promise<T> | T;

export type PluginArguments<T> = {
  data: T;
  logger: Logger;
  model: LlmModel;
  config: Record<string, unknown>;
};

export type Plugin = Partial<{
  beforeUpstreamRequest: (
    args: PluginArguments<{
      requestParams: OpenAI.ChatCompletionRequest;
      providerOptions: AI_SDK_UTILS.ProviderOptions;
    }>
  ) => PromiseOr<{
    requestParams: OpenAI.ChatCompletionRequest;
    providerOptions?: AI_SDK_UTILS.ProviderOptions;
  } | null>;
  onUpstreamChunk: (
    args: PluginArguments<OpenAI.ChatCompletionResponseChunk>
  ) => PromiseOr<OpenAI.ChatCompletionResponseChunk | null>;
  afterUpstreamResponse: (
    args: PluginArguments<OpenAI.ChatCompletionResponse | string>,
    isStream: boolean
  ) => PromiseOr<
    | OpenAI.ChatCompletionResponse
    | ReadableStream<
        | OpenAI.ChatCompletionResponseChunk
        | OpenAI.ChatCompletionResponseErrorChunk
      >
    | null
  >;
  onFetchModelList: (
    args: PluginArguments<OpenAI.ModelListResponse>
  ) => PromiseOr<OpenAI.ModelListResponse | null>;
}>;
