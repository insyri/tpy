import { RESTPostAPIGuildsJSONBody } from 'https://deno.land/x/discord_api_types@0.33.0/rest/v8/guild.ts';
import { APIUnavailableGuild } from 'https://deno.land/x/discord_api_types@0.33.0/payloads/v8/guild.ts';
import { numstr } from '../utils.ts';
import Deployments from './deployments.d.ts';

/**
 * `/guilds`
 *
 * Guild related resources.
 */
declare namespace Guild {
  /**
   * Not an API resource, this namespace behaves as templates and other base types.
   */
  export namespace Structures {
    /**
     * Base guild payload.
     */
    export type Payload = {
      id: numstr;
      name: string;
      /**
       * UUID without hyphens.
       */
      icon: string | null;
    };
  }

  /**
   * GET /guilds
   *
   * Returns guilds of the respective user.
   */
  export namespace GET {
    /**
     * `GET /guilds/:id`
     *
     * Returns some guild info (everything the v8 Discord API normally gives you) as well as a list of deployments.
     */
    export type Guild<Raw extends boolean = true> =
      & RESTPostAPIGuildsJSONBody
      & {
        deployments: Array<
          Deployments.Structures.Base & {
            /**
             * Unused as of 5/31/2022.
             */
            last_updated_at: null;
            config: Raw extends true ? string : Deployments.Structures.Config;
            disabled: boolean;
          }
        >;
        region: `deprecated`;
        unavailable: APIUnavailableGuild['unavailable'];
      };

    /**
     * `GET /guilds/:id/stats`
     *
     * Return some statistics of a script container. Some values are undefined when information is not available.
     */
    export type Stats = Array<{
      /**
       * Date (Unix timestamp) of when statistics were captured.
       */
      date: number;
      /**
       * Milliseconds of used cpu time.
       */
      cpuMs?: number;
      /**
       * Milliseconds of script execution time.
       */
      executionMs?: number;
      /**
       * Function calls across all scripts.
       */
      hostFunctionCalls?: number;
      /**
       * Discord API caches across all scripts.
       */
      discordCacheRequests?: number;
      /**
       * Discord API requests across all scripts.
       */
      discordApiRequests?: number;
      /**
       * Events followed across all scripts.
       */
      events?: number;
      /**
       * Calculated average of cpuMs.
       */
      cpuMsAvg?: number;
      /**
       * Calculated average of executionMs.
       */
      executionMsAvg?: number;
      /**
       * Total KV store requests across all scripts.
       */
      kvOperations?: number;
    }>;
  }
}

export default Guild;
