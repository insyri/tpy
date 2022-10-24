// This file is meant to be read by Node.js, Deno stops at line 5.
// If Deno extension enabled, ignore errors.

if (
  'process' in globalThis && // If Node
  Number(globalThis.process.version.substring(1, 3)) < 18
) {
  const fetch = (url: RequestInfo, init?: RequestInit): Promise<Response> =>
    import('node-fetch').then(({ default: fetch }) => fetch(url, init));
  Object.defineProperty(
    globalThis,
    'fetch',
    fetch,
  );
}
