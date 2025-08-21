import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ChatCompletionRequest } from '../common/types/index.ts';

const app = new Hono();
app.use('/*', cors());

app.get('/', (c) => {
  return c.html('Hello World!');
});

app.get('/v1/models', async (c) => {
  const upstream = new URL('/v1/models').toString();
  return await fetch(upstream, {
    method: 'GET',
    headers: c.req.raw.headers,
  });
});

app.post('/v1/chat/completions', async (c) => {
  const body = await c.req.json<ChatCompletionRequest>();
  return c.json(body);
});

export default app;
