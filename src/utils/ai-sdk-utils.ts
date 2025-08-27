/**
 * biome-ignore-all lint/complexity/noBannedTypes: For conveniently pass TOOLS type parameter into the AI SDK methods
 */

import { randomUUID } from 'node:crypto';
import type {
  CallSettings,
  FinishReason,
  GenerateTextResult,
  JSONValue,
  LanguageModel,
  ModelMessage,
  Prompt,
  StopCondition,
  StreamTextResult,
  TextStreamPart,
  ToolChoice,
  ToolSet,
} from 'ai';
import type { llmClientFactory } from '../llm-client-factory.ts';
import { nullToUndefined } from './type-utils.ts';

const finishReasonMap = new Map<
  FinishReason,
  OpenAI.ChatCompletionFinishReason
>([
  ['stop', 'stop'],
  ['length', 'length'],
  ['content-filter', 'content_filter'],
  ['tool-calls', 'tool_calls'],
  ['error', null],
  ['other', null],
  ['unknown', null],
]);

// biome-ignore lint/style/noNamespace: <explanation>
export declare namespace AI_SDK_UTILS {
  type ProviderOptions = Record<string, Record<string, JSONValue>>;
  type ChatCompletionRequest<TOOLS extends ToolSet> = CallSettings &
    Prompt & {
      model: LanguageModel;
      tools?: TOOLS;
      toolChoice?: ToolChoice<NoInfer<TOOLS>>;
      stopWhen?:
        | StopCondition<NoInfer<TOOLS>>
        | StopCondition<NoInfer<TOOLS>>[];
      providerOptions?: ProviderOptions;
      activeTools?: Array<keyof NoInfer<TOOLS>>;
    };
}

// biome-ignore lint/complexity/noStaticOnlyClass: simulate a namespace with utils functions
export class AI_SDK_UTILS {
  static encodeChunk(
    chunkData:
      | string
      | OpenAI.ChatCompletionResponseChunk
      | OpenAI.ChatCompletionResponseErrorChunk
  ): Uint8Array {
    if (typeof chunkData === 'string') {
      return new TextEncoder().encode(`data: ${chunkData}\n\n`);
    }
    return new TextEncoder().encode(`data: ${JSON.stringify(chunkData)}\n\n`);
  }

  static extractOpenaiProviderOptions(
    openAiRequestParams: OpenAI.ChatCompletionRequest
  ): AI_SDK_UTILS.ProviderOptions {
    return {
      openai: {
        user: openAiRequestParams.safety_identifier as JSONValue,
        logitBias: openAiRequestParams.logit_bias as JSONValue,
        logprobs: openAiRequestParams.logprobs as JSONValue,
        parallelToolCalls: openAiRequestParams.parallel_tool_calls as JSONValue,
        textVerbosity: openAiRequestParams.verbosity as JSONValue,
      },
    };
  }

  static chatCompletionRequestParamsFactory(
    client: ReturnType<typeof llmClientFactory>,
    openAiRequestParams: OpenAI.ChatCompletionRequest,
    providerOptions: AI_SDK_UTILS.ProviderOptions
  ): [boolean, AI_SDK_UTILS.ChatCompletionRequest<{}>] {
    function convertToolsDefinitions(
      tools: OpenAI.ChatCompletionTool[]
    ): ToolSet {
      const result: Record<
        string,
        { description?: string; inputSchema?: unknown }
      > = {};
      for (const tool of tools) {
        if (tool.type !== 'function') {
          continue;
        }
        result[tool.function.name] = {
          description: tool.function.description,
          inputSchema: tool.function.parameters,
        };
      }
      return result as ToolSet;
    }
    const aiSdkTools =
      openAiRequestParams.tools !== undefined
        ? convertToolsDefinitions(openAiRequestParams.tools)
        : undefined;
    return [
      Boolean(openAiRequestParams.stream),
      {
        model: client.chat(openAiRequestParams.model),
        messages: openAiRequestParams.messages as ModelMessage[],

        temperature: nullToUndefined(openAiRequestParams.temperature),
        maxOutputTokens: nullToUndefined(
          openAiRequestParams.max_completion_tokens
        ),
        topP: nullToUndefined(openAiRequestParams.top_p),
        frequencyPenalty: nullToUndefined(
          openAiRequestParams.frequency_penalty
        ),
        presencePenalty: nullToUndefined(openAiRequestParams.presence_penalty),
        stopSequences:
          typeof openAiRequestParams.stop === 'string'
            ? [openAiRequestParams.stop]
            : nullToUndefined(openAiRequestParams.stop),
        seed: nullToUndefined(openAiRequestParams.seed),

        tools: aiSdkTools,
        toolChoice: nullToUndefined(
          openAiRequestParams.tool_choice
        ) as ToolChoice<{}>,

        providerOptions,
      },
    ];
  }

  static chatCompletionChunkProcessor(
    chunk: TextStreamPart<{}>,
    chatId: string,
    model: string
  ):
    | OpenAI.ChatCompletionResponseChunk
    | OpenAI.ChatCompletionResponseErrorChunk
    | null {
    const SECOND = 1000;
    const created = Math.floor(Date.now() / SECOND);
    const chunkBase = {
      id: chatId,
      created,
      model,
      object: 'chat.completion.chunk',
    } satisfies Partial<
      | OpenAI.ChatCompletionResponseChunk
      | OpenAI.ChatCompletionResponseErrorChunk
    >;
    switch (chunk.type) {
      case 'reasoning-start': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: {
                reasoning: {
                  type: 'start',
                  id: chunk.id,
                  metadata: chunk.providerMetadata,
                },
              },
              finish_reason: null,
            },
          ],
        };
      }
      case 'reasoning-delta': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: {
                reasoning: {
                  type: 'delta',
                  id: chunk.id,
                  content: chunk.text,
                  metadata: chunk.providerMetadata,
                },
              },
              finish_reason: null,
            },
          ],
        };
      }
      case 'reasoning-end': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: { reasoning: {} },
              finish_reason: null,
            },
          ],
        };
      }
      case 'text-start': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: { role: 'assistant', content: null },
              finish_reason: null,
            },
          ],
        };
      }
      case 'text-delta': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: { content: chunk.text },
              finish_reason: null,
            },
          ],
        };
      }
      case 'text-end': {
        return {
          ...chunkBase,
          choices: [{ index: 0 as const, delta: {}, finish_reason: 'stop' }],
        };
      }
      case 'tool-input-start': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: {
                role: 'assistant',
                content: null,
                tool_calls: [
                  {
                    index: 0,
                    type: 'function',
                    id: chunk.id,
                    function: {
                      name: chunk.toolName,
                    },
                  },
                ],
              },
              finish_reason: null,
            },
          ],
        };
      }
      case 'tool-input-delta': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    function: {
                      arguments: chunk.delta,
                    },
                  },
                ],
              },
              finish_reason: null,
            },
          ],
        };
      }
      case 'tool-input-end': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: {},
              finish_reason: null,
            },
          ],
        };
      }
      case 'tool-call': {
        return {
          ...chunkBase,
          choices: [
            {
              index: 0 as const,
              delta: {
                tool_calls: [
                  {
                    index: 0,
                    type: 'function',
                    id: chunk.toolCallId,
                    function: {
                      name: chunk.toolName,
                      arguments: chunk.input as string,
                    },
                  },
                ],
              },
              finish_reason: null,
            },
          ],
        };
      }
      case 'error': {
        return {
          ...chunkBase,
          choices: [{ index: 0 as const, delta: {}, finish_reason: 'stop' }],
          error: {
            message: JSON.stringify(chunk.error),
            type: 'upstream_error',
          },
        };
      }
      case 'finish': {
        const aiSdkUsageData = chunk.totalUsage;
        return {
          ...chunkBase,
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: finishReasonMap.get(chunk.finishReason) ?? null,
            },
          ],
          usage: {
            prompt_tokens: aiSdkUsageData.inputTokens ?? 0,
            completion_tokens: aiSdkUsageData.outputTokens ?? 0,
            total_tokens: aiSdkUsageData.totalTokens ?? 0,
          },
        };
      }
    }
    return null;
  }

  static chatCompletionStreamResponseFactory(
    body: OpenAI.ChatCompletionRequest,
    result: StreamTextResult<{}, string>
  ): ReadableStream<OpenAI.ChatCompletionResponseChunk> {
    const stream = new ReadableStream({
      async start(controller) {
        const chatId = `chatcmpl-${randomUUID()}`;
        try {
          for await (const chunk of result.fullStream) {
            const openaiChunk = AI_SDK_UTILS.chatCompletionChunkProcessor(
              chunk,
              chatId,
              body.model
            );
            if (openaiChunk === null) {
              continue;
            }
            controller.enqueue(openaiChunk);
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });
    return stream;
  }

  static chatCompletionNonStreamResponseFactory(
    reqBody: OpenAI.ChatCompletionRequest,
    result: GenerateTextResult<{}, string>
  ): OpenAI.ChatCompletionResponse {
    const SECOND = 1000;
    const created = Math.floor(Date.now() / SECOND);
    return {
      id: `chatcmpl-${created}`,
      object: 'chat.completion',
      created,
      model: reqBody.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: result.text,
            refusal: null,
            tool_calls: result.toolCalls.map(
              (toolCall) =>
                ({
                  id: toolCall.toolCallId,
                  type: 'function',
                  function: {
                    name: toolCall.toolName,
                    arguments: String(toolCall.input),
                  },
                }) satisfies OpenAI.ChatCompletionResponseToolCall
            ),
          },
          finish_reason: finishReasonMap.get(result.finishReason) ?? 'stop',
          logprobs: null,
        },
      ],
      usage: {
        prompt_tokens: result.usage?.inputTokens || 0,
        completion_tokens: result.usage?.outputTokens || 0,
        total_tokens: result.usage?.totalTokens || 0,
      },
    };
  }
}
