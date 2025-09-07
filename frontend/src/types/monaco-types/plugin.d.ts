type PromiseOr<T> = Promise<T> | T;

export type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string) => void;
};

export type PluginArguments<T> = {
  data: T;
  chatId: string;
  logger: Logger;
  model: LlmModel;
  metadata: Record<string, unknown>;
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
