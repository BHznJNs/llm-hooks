import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParams,
  ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';
import type { Model } from 'openai/resources/models';

type ErrorChunk = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: [
    {
      index: 0;
      // biome-ignore lint/complexity/noBannedTypes: here is a fixed empty object
      delta: {};
      finish_reason: 'stop';
    },
  ];
  error: {
    message: string;
    type: string;
  };
};

declare global {
  // biome-ignore lint/style/noNamespace: Exposes the OpenAI type definitions to the global
  namespace OpenAI {
    type ChatCompletionRequest = ChatCompletionCreateParams;
    type ChatCompletionResponse = ChatCompletion;
    type ChatCompletionResponseChunk = ChatCompletionChunk;
    type ChatCompletionResponseErrorChunk = ErrorChunk;
    type ChatCompletionResponseToolCall = ChatCompletionMessageToolCall;
    type ChatCompletionFinishReason =
      | 'stop'
      | 'length'
      | 'tool_calls'
      | 'content_filter'
      | 'function_call'
      | null;

    type ModelListResponse = {
      data: Model[];
    };
  }
}
