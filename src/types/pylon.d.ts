import { SafeObject } from './util.d.ts';

/**
 * Typings relevant to the Pylon API.
 * For official typings, see {@link https://github.com/pylonbot/pylon-sdk-types}.
 *
 * Based on runtime typings commit `eb0100c`.
 */
declare namespace Pylon {
  /**
   * HTTP Verbs supported by the Pylon API.
   */
  export type HTTPVerbs = 'GET' | 'POST' | 'PUT' | 'DELETE';
  /**
   * Types parsable by ES5's `JSON.parse` function.
   */
  export type Json =
    | string
    | number
    | boolean
    | null
    | SafeObject
    | JsonArray[];
  /**
   * An array of types parsable by ES5's `JSON.parse` function.
   */
  export type JsonArray = Json[];
  /**
   * Structures regarding Pylon KV operations.
   */
  export namespace KV {
    /**
     * `GET /deployments/{id}/kv/namespaces/{namespace}`
     */
    export namespace GET {
      /**
       * `GET /deployments/{id}/kv/namespaces`
       */
      export type Namespace = Array<{
        namespace: string;
        count: number;
      }>;

      /**
       * `GET /deployments/{id}/kv/namespaces/{namespace}/items`
       */
      export type Items<T = unknown, Raw extends boolean = true> = Array<{
        key: string;
        value: {
          string?: Raw extends true ? string : T;
          bytes?: Raw extends true ? string : T;
          expiresAt?: string;
        };
      }>;

      export type ItemsFlattened<T = unknown> = Array<{
        key: string;
        value: T;
        expiresAt?: string;
      }>;
    }

    export namespace DELETE {
      export type Namespace = {
        keys_deleted: number;
      };
    }

    export namespace PUT {
      export type Item = {
        string: string;
        expires_at?: number;
      };
    }

    export namespace OperationOptions {
      export interface Put {
        /**
         * The duration in milliseconds until the key should expire. Mutually exclusive with `ttlEpoch`.
         */
        ttl?: number;
        /**
         * The `Date` in which the key will expire.
         */
        ttlEpoch?: Date;
        /**
         * Only put the key if it does not already exist, otherwise throw an error.
         */
        ifNotExists?: boolean;
      }

      export interface Items {
        /**
         * Returns keys after `from`. Meaning, if you had the keys `["a", "b", "c"]` in the namespace, calling `kv.items({from: "a"})` would return the items for the keys `["b", "c"]`.
         */
        from?: string;
        /**
         * The number of keys to return in the list call.
         *
         * Default and maximum is `100`. Minimum is `1`.
         */
        limit?: number;
      }

      export interface List {
        /**
         * Returns keys after `from`. Meaning, if you had the keys `["a", "b", "c"]` in the namespace, calling `kv.list({from: "a"})` would return `["b", "c"]`.
         */
        from?: string;
        /**
         * The number of keys to return in the list call.
         *
         * Default and maximum is `1000`. Minimum is `1`.
         */
        limit?: number;
      }

      export interface Delete {
        /**
         * Deletes the value, but only if it equals the provided value.
         */
        prevValue?: Json | Uint8Array;
      }
    }
  }

  /**
   * Structures regarding the Pylon WebSocket interface.
   */
  export namespace WebSocket {
    /**
     * A WebSocket Response from a workbench URL.
     * Implementing a generic provides type sense for the `data` object.
     */
    export type Response<T extends unknown[] = unknown[]> = [
      {
        /**
         * The logged information. The data is returned from a console
         * log or runtime error, when an error is returned, the method
         * will simply be `error`.
         *
         * The data is encapsulated inside an array that follows the how
         * arguments are passed inside a Console method. All Console methods
         * retain same input values:
         * ```ts
         *   method(message?: any, ...optionalParams: any[]): void;
         * ```
         * [See Reference](
         * https://github.com/pylonbot/pylon-sdk-types/blob/eb0100c9c8f95a07d95fd511e5afc2923786e95b/runtime/pylon-runtime.d.ts#L3-L14)
         *
         * However arguments are passed into these methods will reflect here as an array.
         * @example ```ts
         *   console.log("Log test", 27, { Obj: true })
         * ```
         * Would return as:
         * ```json
         * [{ "method": "log", "data": ["Log test", 27, { "Obj": true }] }]
         * ```
         */
        data: [...T];
        /**
         * The method of logging this was caused by. Follows the Console
         * interface methods supported on the Pylon SDK as of 7/24/2022.
         */
        method: ConsoleMethods;
      },
    ];

    /**
     * The method of logging this was caused by. Follows the Console
     * interface methods supported on the Pylon SDK as of 7/24/2022.
     */
    export type ConsoleMethods = 'error' | 'debug' | 'info' | 'warn' | 'log';
  }
}

export default Pylon;
