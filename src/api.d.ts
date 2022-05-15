// import { numstr } from "./types/minitypes.d.ts";

// import {
//   GatewayDispatchEvents,
//   RESTPostAPIGuildsJSONBody,
// } from "https://deno.land/x/discord_api_types@0.32.1/v8.ts";

// Types corrospond API resource excluding the Structures namespace
// /user/guilds/available
// maps to...
// User.Guilds.Available

export namespace Guilds {}

export namespace Deployment {}

export namespace Unspecific {
  /**
   * Unauthorized response in JSON format.
   */
  export type Unauthorized = { message: 'not authorized' };

  /**
   * General 404 response, where ${string} is the resource.
   *
   * ```txt
   * /nonexistent => ...Requested URL /nonexistent not found
   * /            => ...Requested URL  not found
   *     notice the double space     ^^
   * ```
   */
  export type ResourceNotFoundStr =
    `⚠️ 404 — Not Found\n==================\nRequested URL ${string} not found`;
}
