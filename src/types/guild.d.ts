import { RESTPostAPIGuildsJSONBody } from 'discord-api-types/rest/v8/guild.ts';
import { APIUnavailableGuild } from 'discord-api-types/payloads/v8/guild.ts';
import { StringifiedNumber } from './util.d.ts';
import Deployment from './deployment.d.ts';

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
      /**
       * The guild's ID.
       */
      id: StringifiedNumber;
      /**
       * The guild's username
       */
      name: string;
      /**
       * The guild's icon ID, UUID without hyphens.
       * Null if non set.
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
          Deployment.Structures.Base & {
            /**
             * Unused as of 5/31/2022.
             */
            last_updated_at: null;
            /**
             * Deployment configuration.
             */
            config: Raw extends true ? string : Deployment.Structures.Config;
            disabled: boolean;
          }
        >;
        /**
         * Region of the guild, deprecated because the API uses a deprecated version of the Discord API. (v8)
         */
        region: `deprecated`;
        /**
         * `true` if the guild is unavailable due to an outage.
         */
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
