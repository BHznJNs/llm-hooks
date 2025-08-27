import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { chatCompletionsRoute } from './routes/chat-completions.ts';
import { modelsRoute } from './routes/models.ts';

const app = new Hono();

app.use('/*', cors());

app.get('/', (c) => {
  return c.html('Hello World!');
});

app.get('/v1/models', modelsRoute);
app.post('/v1/chat/completions', chatCompletionsRoute);

export default app;
