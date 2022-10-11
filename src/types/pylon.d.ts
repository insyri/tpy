// deno-lint-ignore no-unused-vars
import type TpyKV from '../kv.ts';

/**
 * Typings based on and related to the Pylon API/SDK interfaces, such as
 * KV, WebSocket, SDK KV function options, and more.
 *
 * SDK relevant typings are formulated on commit hash
 * {@linkcode https://github.com/pylonbot/pylon-sdk-types/tree/eb0100c9c8f95a07d95fd511e5afc2923786e95b eb0100c}.
 *
 * @module
 */

/**
 * Typings relevant to Pylon. For official typings,
 * see https://github.com/pylonbot/pylon-sdk-types.
 */
declare namespace Pylon {
  /**
   * HTTP Verbs supported by the Pylon API.
   */
  export type HTTPVerbs = 'GET' | 'POST' | 'PUT' | 'DELETE';
  /**
   * Types parsable by ES5's {@linkcode JSON.parse} function.
   */
  export type Json =
    | string
    | number
    | boolean
    | null
    | Record<string, unknown>
    | JsonArray[];
  /**
   * An array of types parsable by ES5's {@linkcode JSON.parse} function.
   */
  export type JsonArray = Json[];
  /**
   * Structures regarding Pylon KV operations.
   */
  export namespace KV {
    /**
     * Schemas for `GET /deployments/:id/kv/namespaces/*`.
     */
    export namespace GET {
      /**
       * Response schema for `GET /deployments/:id/kv/namespaces`.
       *
       * Returns an array of namespace titles and their key count.
       */
      export type Namespace = Array<{
        namespace: string;
        count: number;
      }>;

      /**
       * Response schema for `GET /deployments/:id/kv/namespaces/:namespace/items`.
       *
       * Returns an array of key and value objects along with other metadata.
       *
       * @template T The type of the value.
       */
      export type Items<T = unknown, Raw extends boolean = true> = Array<{
        /**
         * The key name.
         */
        key: string;
        /**
         * The key's value.
         */
        value:
          & ({
            /**
             * The key represented as a string. JSON parsable.
             */
            string?: Raw extends true ? string : T;
            bytes: never;
          } | {
            /**
             * The key represented as bytes. Comes from
             * {@linkcode TpyKV.putArrayBuffer}.
             */
            bytes?: Raw extends true ? string : T;
            string: never;
          })
          & {
            /**
             * KV pair expiration date/time.
             */
            expiresAt?: string;
          };
      }>;

      /**
       * Surfaces {@linkcode Items}.
       */
      export type ItemsFlattened<T = unknown> = Array<{
        /**
         * The key name.
         */
        key: string;
        /**
         * The key's value.
         */
        value: T;
        /**
         * KV pair expiration date/time.
         */
        expiresAt?: string;
      }>;
    }

    /**
     * Schemas for `DELETE /deployments/:id/kv/namespaces/*`.
     */
    export namespace DELETE {
      /**
       * Response schema for `DELETE /deployments/:id/kv/namespaces/:namespace`.
       *
       * Returns the number of deleted keys after deleting the whole namespace.
       */
      export type Namespace = {
        /**
         * The number of deleted keys in the deleted namespace.
         */
        keys_deleted: number;
      };
    }

    /**
     * Schemas for `PUT /deployments/:id/kv/namespaces/*`.
     */
    export namespace PUT {
      /**
       * Response schema for `PUT /deployments/:id/kv/namespaces/:namespace/items/:key`.
       */
      export type Item = {
        /**
         * The key represented as a string. JSON parsable.
         */
        string: string;
        bytes: never;
        /**
         * KV pair expiration date/time.
         */
        expires_at?: number;
      } | {
        string: never;
        /**
         * The key represented as bytes. Comes from
         * {@linkcode TpyKV.putArrayBuffer}.
         */
        bytes: string;
        /**
         * KV pair expiration date/time.
         */
        expires_at?: number;
      };
    }

    /**
     * Function options for operations matching HTTP methods.
     */
    export namespace OperationOptions {
      /**
       * Operation options for {@linkcode TpyKV.put}.
       */
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
         * Only put the key if it does not already exist.
         */
        ifNotExists?: boolean;
      }

      /**
       * Operation options for {@linkcode TpyKV.items}.
       */
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

      /**
       * Operation options for {@linkcode TpyKV.list}.
       */
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

      /**
       * Operation options for {@linkcode TpyKV.delete}.
       */
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
     *
     * @template T The type of the `data` object.
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
         * {@link https://github.com/pylonbot/pylon-sdk-types/blob/eb0100c9c8f95a07d95fd511e5afc2923786e95b/runtime/pylon-runtime.d.ts#L3-L14 See Reference}
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
