/**
 * Request and response structures related to the `/guilds` resource.
 *
 * Typings relevant to guild interfaces on the Pylon API.
 *
 * @module
 */

import { RESTPostAPIGuildsJSONBody } from 'discord-api-types/rest/v8/guild.ts';
import { APIUnavailableGuild } from 'discord-api-types/payloads/v8/guild.ts';
import { DeploymentStructures } from './deployment.d.ts';

/**
 * Not an API resource, this namespace behaves as a set of templates and other
 * base types.
 */
export namespace GuildStructures {
  /**
   * Base guild payload.
   */
  export type Payload = {
    /**
     * The guild's ID.
     */
    id: string;
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
 * Schemas for `GET /guilds`.
 */
export namespace GET {
  /**
   * Response schema for `GET /guilds/:id`.
   *
   * Returns some guild info (everything the v8 Discord API normally gives you) as well as a list of deployments.
   */
  export type Guild<Raw extends boolean = true> = RESTPostAPIGuildsJSONBody & {
    deployments: Array<
      DeploymentStructures.Base & {
        /**
         * Unused.
         */
        last_updated_at: null;
        /**
         * Deployment configurations.
         */
        config: Raw extends true ? string : DeploymentStructures.Config;
        /**
         * A boolean version of {@linkcode Deployment.Structures.DeploymentStatus}.
         */
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
   * Response schema for `GET /guilds/:id/stats`.
   *
   * Return some statistics of a script container. Some values are undefined when information is not available.
   */
  export type Stats = Array<{
    /**
     * Date (Unix timestamp) in seconds of when statistics were captured.
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
