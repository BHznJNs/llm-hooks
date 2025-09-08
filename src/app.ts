import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import openAiApi from './openai-routes/index.ts';
import api from './routes/api/index.ts';

const app = new Hono();

app.use('/*', cors());
app.use('/*', serveStatic({ root: './dist-frontend' }));

const serveIndexHtml = serveStatic({ path: './dist-frontend/index.html' });
app
  .get('/', serveIndexHtml)
  .get('/hooks', serveIndexHtml)
  .get('/plugins', serveIndexHtml)
  .get('/logs', serveIndexHtml)
  .get('/settings', serveIndexHtml);

app.route('/api', api);
app.route('/v1', openAiApi);

export default app;
