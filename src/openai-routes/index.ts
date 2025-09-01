import { Hono } from 'hono';
import { chatCompletionsRoute } from './chat-completions.ts';
import { modelsRoute } from './models.ts';

const api = new Hono();
api.post('/chat/completions', chatCompletionsRoute);
api.get('/models', modelsRoute);

export default api;
