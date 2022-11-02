/**
 * Tpy, a strongly typed Pylon API client.
 *
 * The center of Tpy starts at the default {@linkcode Tpy} class,
 * defining the Pylon token and optionally a global deployment ID.
 *
 * ```ts
 * const client = new Tpy({
 *   token: 'PYLON_TOKEN',
 *   deploymentID: 'DEPLOYMENT_ID'
 * });
 * client.KV('NAMESPACE');
 * client.getDeployment();
 * client.publishDeployment({} as Deployment.POST.Request<false>);
 *
 * // or
 *
 * const client2 = new Tpy({
 *   token: 'PYLON_TOKEN',
 * });
 * client2.KV('NAMESPACE', 'DEPLOYMENT_ID');
 * client2.getDeployment('DEPLOYMENT_ID');
 * client2.publishDeployment(
 *   {} as Deployment.POST.Request<false>,
 *   'DEPLOYMENT_ID',
 * );
 * ```
 *
 * Even if a default is set, it can be overridden.
 *
 * ```ts
 * client2.publishDeployment(
 *   {} as Deployment.POST.Request<false>,
 *   'ANOTHER_DEPLOYMENT_ID',
 * );
 * ```
 *
 * ## `fetch` API in Node.js
 *
 * Node.js v18 has a native browser-like fetch interface. Versions
 * below are normally using [`node-fetch`](https://github.com/node-fetch/node-fetch)
 * to circumvent this issue. Users can specify the usage of this by simply using the
 * `useNodeFetch` parameter when instantiating Tpy. Verify the package is downloaded.
 *
 * @module
 */

// Used for docs.
// deno-lint-ignore no-unused-vars
import { type Tpy } from './src/tpy.ts';

export { Tpy as default } from './src/tpy.ts';
export { TpyWs } from './src/ws.ts';
export { TpyKV } from './src/kv.ts';
export { TpyError, TpyErrors } from './src/error.ts';
export { Context } from './src/context.ts';

import type * as Guild from './src/types/guild.d.ts';
import type * as Deployment from './src/types/deployment.d.ts';
import type * as User from './src/types/user.d.ts';
import type * as Pylon from './src/types/pylon.d.ts';

export type { Deployment, Guild, Pylon, User };
