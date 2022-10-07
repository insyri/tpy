/**
 * A strongly typed Pylon API client.
 *
 * Tpy works on all JavaScript runtimes, including Node.js.
 * (See {@link README.md README.md} for the NPM link.)
 * As it's only dependencies are type-based and rather small,
 * Tpy is extremely portable and easy to look through.
 * These parts that make up Tpy are components that are
 * specific to their functional use; Tpy is modular.
 * @module
 */

import type Guild from './src/types/guild.d.ts';
import type Deployment from './src/types/deployment.d.ts';
import type User from './src/types/user.d.ts';
import TpyError, { TpyErrors } from './src/error.ts';
import TpyWs from './src/ws.ts';
import Tpy from './src/tpy.ts';
import KVNamespace from './src/kv.ts';
import Context from './src/context.ts';

export default Tpy;
export type { Deployment, Guild, User };
export { Context, KVNamespace, TpyError, TpyErrors, TpyWs };
