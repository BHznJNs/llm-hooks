import type { Logger } from 'pino';
import type { LlmModel } from '../utils/llm-client-factory.ts';

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
      providerOptions: Record<string, unknown>;
    }>
  ) => {
    requestParams: OpenAI.ChatCompletionRequest;
    providerOptions?: Record<string, unknown>;
  };
  onUpstreamChunk: (
    args: PluginArguments<OpenAI.ChatCompletionResponseChunk>
  ) => OpenAI.ChatCompletionResponseChunk | null;
  afterUpstreamResponse: (
    args: PluginArguments<OpenAI.ChatCompletionResponse | string>,
    isStream: boolean
  ) =>
    | OpenAI.ChatCompletionResponse
    | ReadableStream<
        | OpenAI.ChatCompletionResponseChunk
        | OpenAI.ChatCompletionResponseErrorChunk
      >;
  onFetchModelList: (
    args: PluginArguments<OpenAI.ModelListResponse>
  ) => OpenAI.ModelListResponse;
}>;
