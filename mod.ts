/**
 * Tpy, a strongly typed Pylon API client.
 *
 * The center of Tpy starts at the default {@linkcode Tpy} class,
 * defining the Pylon token and optionally a global deployment ID.
 *
 * ```ts
 * const client = new Tpy('PYLON_TOKEN', 'DEPLOYMENT_ID');
 * client.KV('NAMESPACE');
 * client.getDeployment();
 * client.publishDeployment({} as Deployment.POST.Request<false>);
 *
 * // or
 *
 * const client2 = new Tpy('PYLON_TOKEN');
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
 * @module
 */

import type Guild from './src/types/guild.d.ts';
import type Deployment from './src/types/deployment.d.ts';
import type User from './src/types/user.d.ts';
import TpyError, { TpyErrors } from './src/error.ts';
import TpyWs from './src/ws.ts';
import Tpy from './src/tpy.ts';
import TpyKV from './src/kv.ts';
import Context from './src/context.ts';

export default Tpy;
export type { Deployment, Guild, User };
export { Context, TpyError, TpyErrors, TpyKV, TpyWs };
