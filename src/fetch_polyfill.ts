import fetch, {
  Blob,
  blobFrom,
  blobFromSync,
  File,
  fileFrom,
  fileFromSync,
  FormData,
  Headers,
  Request,
  Response,
} from 'node-fetch';

if (!globalThis.fetch) {
  Object.defineProperty(globalThis, 'fetch', fetch);
  Object.defineProperty(globalThis, 'Headers', Headers);
  Object.defineProperty(globalThis, 'Request', Request);
  Object.defineProperty(globalThis, 'Response', Response);
}
