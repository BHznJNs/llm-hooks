import { runtime as _runtime } from 'std-env';

export type Runtime = 'cf-worker' | 'docker' | 'local';

export const runtime: Runtime = (() => {
  if (_runtime === 'workerd') {
    return 'cf-worker';
  }
  if (process.env.RUNTIME === 'docker') {
    return 'docker';
  }
  return 'local';
})();
