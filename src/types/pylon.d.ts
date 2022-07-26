/**
 * Typings relevant to Pylon.
 * For official typings, see {@link https://github.com/pylonbot/pylon-sdk-types}.
 *
 * Based on runtime typings commit `eb0100c`.
 */
declare namespace Pylon {
  /**
   * The method of logging this was caused by. Follows the Console
   * interface methods supported on the Pylon SDK as of 7/24/2022.
   */
  export type ConsoleMethods = 'error' | 'debug' | 'info' | 'warn' | 'log';
  /**
   * HTTP Verbs supported by the Pylon API.
   */
  export type Verbs = 'GET' | 'POST';
  /**
   * A WebSocket Response from a workbench URL.
   * Implementing a generic provides type sense for the `data` object.
   */
  export type WebSocketResponse<T extends unknown[] = unknown[]> = [
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
       * ```ts
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
}

export default Pylon;
