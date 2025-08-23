import { runtime } from './utils/runtime.ts';

export const cache = (() => {
  const cache_ = new Map();
  switch (runtime) {
    case 'docker':
    case 'local':
      return cache_;
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
})();
