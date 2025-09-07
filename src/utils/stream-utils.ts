import type { SSEStreamingApi } from 'hono/streaming';
import { type OpenAI, openAiErrorChunkFactory } from 'llm-hooks-sdk';
import type { AppConfig } from '../../common/types/config.ts';
import HooksHandler from '../hooks.ts';

export async function responseStreamProcessor(
  config: AppConfig,
  chatId: string,
  readStream: ReadableStream<
    OpenAI.ChatCompletionResponseChunk | OpenAI.ChatCompletionResponseErrorChunk
  >,
  writeStream: SSEStreamingApi
): Promise<{
  finishChunk: OpenAI.ChatCompletionResponseChunk | null;
  collectedResponse: string;
} | null> {
  const reader = readStream.getReader();
  let collectedResponse = '';
  let finishChunk: OpenAI.ChatCompletionResponseChunk | null = null;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      const chunk = await HooksHandler.onUpstreamChunk(config, chatId, value);
      if (chunk === null) {
        continue;
      }
      if ('error' in value) {
        await writeStream.writeSSE({ data: JSON.stringify(value) });
        return null;
      }
      if (value.choices[0]?.finish_reason) {
        finishChunk = chunk;
        break;
      }
      if (value.choices[0]?.delta.content) {
        collectedResponse += value.choices[0].delta.content;
      }
      await writeStream.writeSSE({ data: JSON.stringify(value) });
    }
  } catch (error) {
    const errorChunk = openAiErrorChunkFactory(chatId, '', error);
    await writeStream.writeSSE({ data: JSON.stringify(errorChunk) });
    return null;
  } finally {
    reader.releaseLock();
  }

  return { finishChunk, collectedResponse };
}
