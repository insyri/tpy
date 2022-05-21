import { RESTPostAPIGuildsJSONBody } from 'https://deno.land/x/discord_api_types@0.32.1/v8.ts';
import { numstr } from '../utils.ts';
import Deployments from './deployments.d.ts';

// TODO: specify Guild.GET.Info["deployments"]["last_updated_at"] type.

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
     * Returns some guild info (everything Discord API normally gives you) as well as a list of deployments.
     */
    export type Guild = RESTPostAPIGuildsJSONBody & {
      deployments: Deployments.Structures.Base & {
        last_updated_at: null;
        config: Deployments.Structures.Config;
        disabled: boolean;
      };
      reigon: `deprecated`;
    };

    /**
     * `GET /guilds/:id/stats`
     *
     * Return some statistics of a script container. Some values are undefined when information is not available.
     *
     * Undocumented.
     */
    export type Stats = Array<{
      date: number;
      /**
       * undefined if no information
       */
      cpuMs?: number;
      executionMs?: number;
      hostFunctionCalls?: number;
      discordCacheRequests?: number;
      discordApiRequests?: number;
      events?: number;
      /**
       * Float
       */
      cpuMsAvg?: number;
      /**
       * Float
       */
      executionMsAvg?: number;
      /**
       * Float
       */
      kvOperations?: number;
    }>;
  }
}

export default Guild;
