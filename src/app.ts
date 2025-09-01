import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import openAiApi from './openai-routes/index.ts';
import api from './routes/index.ts';

const app = new Hono();

app.use('/*', cors());
app.use('/*', serveStatic({ root: './dist-frontend' }));
app.get('/', serveStatic({ path: './dist-frontend/index.html' }));

app.route('/api', api);
app.route('/openai', openAiApi);

export default app;
