// This file is meant to be read by Node.js, Deno stops at line 5.
// If Deno extension enabled, ignore errors.

if (
  'process' in globalThis && // If Node
  Number(globalThis.process.version.substring(1, 3)) < 18
) {
  Object.defineProperty(
    globalThis,
    'fetch',
    require('node-fetch'),
  );
}
