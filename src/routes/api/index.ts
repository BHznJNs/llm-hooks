import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { cookieToBearer } from '../../middlewares/cookieToBearer.ts';
import { getAuthToken } from '../utils/authToken.ts';
import { verifySid } from '../utils/sessions.ts';
import hooks from './hooks.ts';
import plugins from './plugins.ts';
import settings from './settings.ts';

const api = new Hono();

api.use('*', cookieToBearer);
api.use(
  '*',
  bearerAuth({
    async verifyToken(sid: string, _) {
      return await verifySid(sid, getAuthToken());
    },
  })
);

api.route('/hooks', hooks);
api.route('/plugins', plugins);
api.route('/settings', settings);

export default api;
