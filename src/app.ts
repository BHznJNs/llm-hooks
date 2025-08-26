import { generateText, streamText } from 'ai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { stream } from 'hono/streaming';
import { loadConfig } from './config.ts';
import HooksHandler from './hooks.ts';
import { llmClientFactory } from './llm-client-factory.ts';
import { AI_SDK_UTILS } from './utils/ai-sdk-utils.ts';
import { extractAuthToken } from './utils/field-utils.ts';
import { UNAUTHORIZED } from './utils/response-code.ts';

const app = new Hono();
const config = await loadConfig();

if (!config) {
  throw new Error(
    'Failed to load app configuration, please check database connection.'
  );
}

app.use('/*', cors());

app.get('/', (c) => {
  return c.html('Hello World!');
});

app.get('/v1/models', async (c) => {
  const upstreamEndpoint = config.upstream.baseUrl.endsWith('/')
    ? config.upstream.baseUrl
    : `${config.upstream.baseUrl}/`;
  const upstream = new URL('models', upstreamEndpoint);
  const proxyHeaders = new Headers(c.req.raw.headers);
  for (const key of [
    'Host',
    'Connection',
    'Accept-Encoding',
    'Content-Length',
    'Content-Type',
  ]) {
    proxyHeaders.delete(key);
  }
  const upstreamResponse = await fetch(upstream, {
    method: 'GET',
    headers: proxyHeaders,
  });
  let modelList = (await upstreamResponse.json()) as OpenAI.ModelListResponse;
  modelList = await HooksHandler.onFetchModelList(config, modelList);
  return c.json(modelList);
});

app.post('/v1/chat/completions', async (c) => {
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
  const [isStream, requestParams] =
    AI_SDK_UTILS.chatCompletionRequestParamsFactory(client, body);

  if (isStream) {
    const result = streamText(requestParams);
    const chatCompletionStream =
      AI_SDK_UTILS.chatCompletionStreamResponseFactory(result);
    return stream(c, async (s) => {
      const reader = chatCompletionStream.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        await s.write(AI_SDK_UTILS.encodeChunk(value));
        await s.write(AI_SDK_UTILS.encodeChunk('[DONE]'));
      }
    });
  }
  const result = await generateText(requestParams);
  const chatCompletionResponse =
    AI_SDK_UTILS.chatCompletionNonStreamResponseFactory(body, result);
  return c.json(chatCompletionResponse);
});

export default app;
