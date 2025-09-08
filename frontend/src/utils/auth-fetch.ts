import router from '../routes.tsx';

const UNAUTHORIZED = 401;
const originalFetch = globalThis.fetch;

/**
 * @description
 * # Auth Fetch
 * Navigate to the login page when the api call starts with `/api` and is unauthorized.
 */
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const res = await originalFetch(input, init);

  if (
    res.status === UNAUTHORIZED &&
    typeof input === 'string' &&
    input.startsWith('/api')
  ) {
    router.navigate({ to: '/login', replace: true });
  }
  return res;
};
