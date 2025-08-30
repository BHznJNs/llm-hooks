import { generateText, streamText } from 'ai';
import type { Context } from 'hono';
import { type SSEStreamingApi, streamSSE } from 'hono/streaming';
import { loadAppConfig } from '../config.ts';
import HooksHandler from '../hooks.ts';
import { llmClientFactory } from '../llm-client-factory.ts';
import { AI_SDK_UTILS } from '../utils/ai-sdk-utils.ts';
import { extractAuthToken } from '../utils/field-utils.ts';
import { UNAUTHORIZED } from '../utils/response-code.ts';
import { responseStreamProcessor } from '../utils/stream-utils.ts';

export async function chatCompletionsRoute(c: Context) {
  const config = await loadAppConfig();
  if (!config) {
    throw new Error(
      'Failed to load app configuration, please check database connection.'
    );
  }

  const authToken = extractAuthToken(c);
  if (!authToken) {
    return c.json({ error: 'Unauthorized' }, UNAUTHORIZED);
  }

  const client = llmClientFactory(
    config.upstream.provider,
    authToken,
    config.upstream.baseUrl
  );
  const body = await c.req.json<OpenAI.ChatCompletionRequest>();
  const { requestParams: openAiRequestParams, providerOptions } =
    await HooksHandler.beforeUpstreamRequest(config, body);

  const [isStream, requestParams] =
    AI_SDK_UTILS.chatCompletionRequestParamsFactory(
      client,
      openAiRequestParams,
      providerOptions
    );

  if (!isStream) {
    const result = await generateText(requestParams);
    let chatCompletionResponse =
      AI_SDK_UTILS.chatCompletionNonStreamResponseFactory(body, result);
    chatCompletionResponse = (await HooksHandler.afterUpstreamResponse(
      config,
      chatCompletionResponse,
      isStream
    )) as OpenAI.ChatCompletionResponse;
    return c.json(chatCompletionResponse);
  }

  const result = streamText(requestParams);
  const chatCompletionStream = AI_SDK_UTILS.chatCompletionStreamResponseFactory(
    body,
    result
  );
  return streamSSE(c, async (stream: SSEStreamingApi) => {
    const processed = await responseStreamProcessor(
      config,
      chatCompletionStream,
      stream
    );

    if (processed?.collectedResponse) {
      await HooksHandler.afterUpstreamResponse(
        config,
        {
          collectedResponse: processed.collectedResponse,
          stream,
        },
        isStream
      );
    }

    if (processed?.finishChunk) {
      await stream.writeSSE({ data: JSON.stringify(processed.finishChunk) });
    }
    await stream.writeSSE({ data: '[DONE]' });
  });
}
