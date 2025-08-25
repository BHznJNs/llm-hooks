import type { Logger } from 'pino';
import type { LlmModel } from '../../src/llm-client-factory.ts';

export type PluginArguments<T> = {
  data: T;
  logger: Logger;
  model: LlmModel;
  config: Record<string, unknown>;
};

export type Plugin = {
  fields?: string[];

  beforeUpstreamRequest?: (
    args: PluginArguments<OpenAI.ChatCompletionRequest>
  ) => {
    requestBody: OpenAI.ChatCompletionRequest;
    providerOptions: Record<string, unknown>;
  };
  onUpstreamChunk?: (
    args: PluginArguments<OpenAI.ChatCompletionResponseChunk>
  ) => OpenAI.ChatCompletionResponseChunk | null;
  afterUpstreamResponse?: (
    args: PluginArguments<
      OpenAI.ChatCompletionResponse | { collectedResponse: string }
    >,
    isStream: boolean
  ) =>
    | OpenAI.ChatCompletionResponse
    | ReadableStream<
        | OpenAI.ChatCompletionResponseChunk
        | OpenAI.ChatCompletionResponseErrorChunk
      >;
  onFetchModelList?: (
    args: PluginArguments<OpenAI.ModelListResponse>
  ) => OpenAI.ModelListResponse;
};
