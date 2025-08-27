import { generateText, streamText } from 'ai';
import type { Context } from 'hono';
import { stream } from 'hono/streaming';
import { loadConfig } from '../config.ts';
import HooksHandler from '../hooks.ts';
import { llmClientFactory } from '../llm-client-factory.ts';
import { AI_SDK_UTILS } from '../utils/ai-sdk-utils.ts';
import { extractAuthToken } from '../utils/field-utils.ts';
import { UNAUTHORIZED } from '../utils/response-code.ts';

export async function chatCompletionsRoute(c: Context) {
  const config = await loadConfig();
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

  if (isStream) {
    const result = streamText(requestParams);
    const chatCompletionStream =
      AI_SDK_UTILS.chatCompletionStreamResponseFactory(body, result);
    return stream(c, async (s) => {
      const reader = chatCompletionStream.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        await s.write(AI_SDK_UTILS.encodeChunk(value));
      }
      await s.write(AI_SDK_UTILS.encodeChunk('[DONE]'));
    });
  }
  const result = await generateText(requestParams);
  const chatCompletionResponse =
    AI_SDK_UTILS.chatCompletionNonStreamResponseFactory(body, result);
  return c.json(chatCompletionResponse);
}
