import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ChatCompletionRequest } from '../common/types/index.ts';
import { loadConfig } from './load-config.ts';

const app = new Hono();
const config = await loadConfig();
app.use('/*', cors());

app.get('/', (c) => {
  return c.html('Hello World!');
});

app.get('/v1/models', async (c) => {
  const upstream = new URL('/v1/models', config.upstream.baseUrl);
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
  const upstreamResp = await fetch(upstream, {
    method: 'GET',
    headers: proxyHeaders,
  });
  return c.json(await upstreamResp.json());
});

app.post('/v1/chat/completions', async (c) => {
  const body = await c.req.json<ChatCompletionRequest>();
  return c.json(body);
});

export default app;
