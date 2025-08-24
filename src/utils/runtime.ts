export type Runtime = 'docker' | 'local';

export const runtime: Runtime = (() => {
  if (process.env.RUNTIME === 'docker') {
    return 'docker';
  }
  return 'local';
})();
