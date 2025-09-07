import type { Context } from 'hono';
import type { OpenAI } from 'llm-hooks-sdk';
import appConfigController from '../controllers/app-config.ts';
import HooksHandler from '../hooks.ts';

export async function modelsRoute(c: Context) {
  const config = await appConfigController.load();
  if (!config) {
    throw new Error(
      'Failed to load app configuration, please check database connection.'
    );
  }

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
}
