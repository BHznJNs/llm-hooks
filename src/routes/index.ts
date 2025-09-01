import { Hono } from 'hono';
import hooks from './hooks.ts';
import plugins from './plugins.ts';
import settings from './settings.ts';

const api = new Hono();
api.route('/hooks', hooks);
api.route('/plugins', plugins);
api.route('/settings', settings);

export default api;
