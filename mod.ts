/**
 * Tpy, a strongly typed Pylon API client.
 *
 * ## Example Instantiation
 *
 * Users can optionally bind a client to a specific deployment ID,
 * this is used as default values for methods that take in that parameter.
 *
 * ```ts
 * const client = new Tpy({
 *   token: 'PYLON_TOKEN',
 * });
 * client.KV('NAMESPACE', 'DEPLOYMENT_ID');
 * client.getDeployment('DEPLOYMENT_ID');
 * client.publishDeployment(
 *   {} as Deployment.POST.Request<false>,
 *   'DEPLOYMENT_ID',
 * );
 *
 * // or
 *
 * const client = new Tpy({
 *   token: 'PYLON_TOKEN',
 *   deploymentID: 'DEPLOYMENT_ID',
 * });
 * client.KV('NAMESPACE');
 * client.getDeployment();
 * client.publishDeployment({} as Deployment.POST.Request<false>);
 * ```
 *
 * Even if a default deployment ID is set, it can be overridden.
 *
 * ```ts
 * client.publishDeployment(
 *   {} as Deployment.POST.Request<false>,
 *   'ANOTHER_DEPLOYMENT_ID',
 * );
 * ```
 *
 * ## `fetch` API in Node.js
 *
 * As of [Node.js 18+](https://nodejs.org/en/blog/announcements/v18-release-announce/#fetch-experimental),
 * the runtime has a native implementation of the WHATWG {@linkcode fetch}
 * specification. Tpy allows users to optionally use this feature via setting the
 * `useNodeFetch` parameter to false inside instantiation. (True by default.)
 *
 * For versions below, environments will require installing the
 * [`node-fetch`](https://github.com/node-fetch/node-fetch) package
 * for Tpy to make requests. By default, it uses this package.
 *
 * ```ts
 * const client = new Tpy({
 *   token: 'PYLON_TOKEN',
 *   useNodeFetch: false,
 * });
 * ```
 *
 * @module
 */

// Used for docs.
// deno-lint-ignore no-unused-vars
import { type Tpy } from "./src/tpy.ts";

export { Tpy as default } from "./src/tpy.ts";
export { TpyWs } from "./src/ws.ts";
export { TpyKV } from "./src/kv.ts";
export { TpyError, TpyErrors } from "./src/error.ts";
export { Context } from "./src/context.ts";

import type * as Guild from "./src/types/guild.d.ts";
import type * as Deployment from "./src/types/deployment.d.ts";
import type * as User from "./src/types/user.d.ts";
import type * as Pylon from "./src/types/pylon.d.ts";

export type { Deployment, Guild, Pylon, User };
