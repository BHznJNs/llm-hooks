import { AISDKError, type APICallError, generateText, streamText } from 'ai';
import type { Context } from 'hono';
import { type SSEStreamingApi, streamSSE } from 'hono/streaming';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { chatIdFactory, llmClientFactory, type OpenAI } from 'llm-hooks-sdk';
import type { AppConfig } from '../../common/types/config.ts';
import appConfigController from '../controllers/app-config.ts';
import HooksHandler from '../hooks.ts';
import { AI_SDK_UTILS } from '../utils/ai-sdk-utils.ts';
import { extractAuthToken } from '../utils/header-utils.ts';
import { REQUEST_FAILED, UNAUTHORIZED } from '../utils/response-code.ts';
import { responseStreamProcessor } from '../utils/stream-utils.ts';

type RequestUpstreamConfig = {
  chatId: string;
  isStream: boolean;
  model: string;
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  requestParams: AI_SDK_UTILS.ChatCompletionRequest<{}>;
};

async function requestUpstream(
  c: Context,
  appConfig: AppConfig,
  requestConfig: RequestUpstreamConfig
): Promise<Response> {
  const { chatId, isStream, model, requestParams } = requestConfig;
  if (!isStream) {
    const result = await generateText({ ...requestParams, maxRetries: 0 });
    let chatCompletionResponse =
      AI_SDK_UTILS.chatCompletionNonStreamResponseFactory(
        model,
        result,
        chatId
      );
    chatCompletionResponse = (await HooksHandler.afterUpstreamResponse(
      appConfig,
      chatId,
      chatCompletionResponse,
      isStream
    )) as OpenAI.ChatCompletionResponse;
    return c.json(chatCompletionResponse);
  }

  return new Promise((resolve, reject) => {
    let streamTextError: APICallError | null = null;
    const result = streamText({
      ...requestParams,
      maxRetries: 0,
      onError({ error }) {
        streamTextError = error as APICallError;
        /** do nothing to prevent the error message logging */
      },
    });
    const chatCompletionStream =
      AI_SDK_UTILS.chatCompletionStreamResponseFactory(model, result, chatId);
    const resultStream = streamSSE(c, async (stream: SSEStreamingApi) => {
      const processed = await responseStreamProcessor(
        appConfig,
        chatId,
        chatCompletionStream,
        stream
      );

      if (processed !== null) {
        await HooksHandler.afterUpstreamResponse(
          appConfig,
          chatId,
          {
            collectedResponse: processed.collectedResponse,
            stream,
          },
          isStream
        );
        await stream.writeSSE({ data: JSON.stringify(processed.finishChunk) });
      }
      await stream.writeSSE({ data: '[DONE]' });
    });
    result.text
      .then(() => resolve(resultStream))
      .catch(() => reject(streamTextError));
  });
}

export async function chatCompletionsRoute(c: Context) {
  const config = await appConfigController.load();
  if (!config) {
    throw new Error(
      'Failed to load app configuration, please check database connection.'
    );
  }

  const authToken = extractAuthToken(c);
  if (!authToken) {
    return c.json({ error: 'Unauthorized' }, UNAUTHORIZED);
  }

  const chatId = chatIdFactory();
  const client = llmClientFactory(
    config.upstream.provider,
    authToken,
    config.upstream.baseUrl
  );
  const body = await c.req.json<OpenAI.ChatCompletionRequest>();
  const { requestParams: openAiRequestParams, providerOptions } =
    await HooksHandler.beforeUpstreamRequest(config, chatId, body);

  const [isStream, requestParams] =
    AI_SDK_UTILS.chatCompletionRequestParamsFactory(
      client,
      openAiRequestParams,
      providerOptions
    );

  try {
    const response = await requestUpstream(c, config, {
      chatId,
      isStream,
      model: body.model,
      requestParams,
    });
    return response;
  } catch (error) {
    if (error instanceof AISDKError) {
      const statusCode =
        'statusCode' in error
          ? (error.statusCode as ContentfulStatusCode)
          : REQUEST_FAILED;
      return c.json(error.message, statusCode);
    }
    return c.json(
      { error: 'Upstream request failed after retries' },
      REQUEST_FAILED
    );
  }
}
