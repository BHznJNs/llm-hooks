/**
 * biome-ignore-all lint/complexity/noBannedTypes: For conveniently pass TOOLS type parameter into the AI SDK methods
 */

import {
  type CallSettings,
  type JSONValue,
  jsonSchema,
  type LanguageModel,
  type ModelMessage,
  type Prompt,
  type StopCondition,
  type ToolChoice,
  type ToolSet,
  tool,
} from 'ai';
import {
  aiSdkChunkToOpenAI,
  aiSdkNonStreamResponseToOpenAI,
  aiSdkStreamToOpenAI,
  type LlmClient,
  type OpenAI,
} from 'llm-hooks-sdk';
import { nullToUndefined } from './type-utils.ts';

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
    client: LlmClient,
    openAiRequestParams: OpenAI.ChatCompletionRequest,
    providerOptions: AI_SDK_UTILS.ProviderOptions
  ): [boolean, AI_SDK_UTILS.ChatCompletionRequest<{}>] {
    function convertToolsDefinitions(
      tools: OpenAI.ChatCompletionTool[]
    ): ToolSet {
      const result: Record<string, ReturnType<typeof tool>> = {};
      for (const openAiTool of tools) {
        if (openAiTool.type !== 'function') {
          continue;
        }
        result[openAiTool.function.name] = tool({
          description: openAiTool.function.description ?? '',
          inputSchema: jsonSchema(openAiTool.function.parameters),
        });
      }
      return result;
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

  static chatCompletionChunkProcessor = aiSdkChunkToOpenAI;
  static chatCompletionStreamResponseFactory = aiSdkStreamToOpenAI;
  static chatCompletionNonStreamResponseFactory =
    aiSdkNonStreamResponseToOpenAI;
}
