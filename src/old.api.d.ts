import { numstr } from './types/minitypes.d.ts';

import {
  // GatewayDispatchEvents,
  RESTPostAPIGuildsJSONBody,
} from 'https://deno.land/x/discord_api_types@0.32.1/v8.ts';

/**
 * Guild related resources.
 */
export namespace Guild {
  /**
   * Base guild payload.
   */
  export interface Payload {
    id: numstr;
    name: string;
    /**
     * UUID without hypens.
     */
    icon: string | null;
  }

  // /**
  //  * ```http
  //  * GET /user/guilds/available
  //  * ```
  //  * Returns all guilds the user is in.
  //  */
  // export interface Available extends Payload {
  //   /**
  //    * Discord permissions integer.
  //    *
  //    * @link https://discord.com/developers/docs/topics/permissions
  //    */
  //   permissions: number;
  // }

  /**
   * ```http
   * GET /users/guilds/
   * ```
   * Returns all the guilds a user can edit
   */
  // export type Editable = Payload[];

  /**
   * ```http
   * GET /guilds/:guildId
   * ```
   * Returns some guild info (everything Discord API normally gives you) as well as a list of deployments.
   */
  export interface Info extends RESTPostAPIGuildsJSONBody {
    deployments: Deployment.GuildSpecific[];
    reigon: `deprecated`;
  }

  /**
   * ```http
   * GET /guilds/:guildId/stats
   * ```
   * Return some statistics of a script container.
   */
  export interface Stats {
    date: number;
    cpuMs?: number;
    executionMs?: number;
    hostFunctionCalls?: number;
    discordCacheRequests?: number;
    discordApiRequests?: number;
    events?: number;
    cpuMsAvg?: number;
    executionMsAvg?: number;
    kvOperations?: number;
  }
}

export namespace Deployment {
  /**
   * This is an internal type where no API endpoint or resource returns this in total.
   */
  export interface Base {
    app_id: string | null;
    bot_id: numstr;
    type: number;
    status: number;
    name: string;
    /**
     * Stringified `Config` object.
     */
    config: string;
    revision: number;
  }

  /**
   * ```http
   * GET /deployments/:deploymentId
   * ```
   * Returns some deployment info
   */
  export interface Get<Raw extends boolean> extends Base {
    script_id: numstr;
    id: numstr;
    status: number;
    workbench_url: `wss://workbench.pylon.bot/ws/${string}`;
    script: {
      id: numstr;
      /**
       * Stringified `File[]` object.
       */
      project: Raw extends true ? string : File[];
    };
    guild: Guild.Payload;
  }

  /**
   * Specific to `Guild.Info.deployments`
   */
  export interface GuildSpecific extends Base {
    script_id: numstr;
    last_updated_at: numstr /*i think numstr*/ | null;
    disabled: boolean;
    guild_id: numstr;
  }

  export namespace Post {
    /**
     * ```http
     * POST /deployments/:deploymentId
     * ```
     * Publishes a script, body needs to be a stringified `File[]` object.
     */
    export interface Request<Raw extends boolean> extends Get<true> {
      contents: string;
      project: {
        files: Raw extends true ? string : File[];
      };
    }

    export interface Missing {
      msg: 'missing json body';
    }

    // export type Response
  }

  // /**
  //  * Deployment configurations.
  //  */
  // export interface Config {
  //   enabled: boolean;
  //   events: GatewayDispatchEvents[];
  //   tasks: {
  //     /**
  //      * > Note: The current minimum interval cron tasks can run at are once every 5 minutes. You may schedule up to 5 cron handlers.
  //      *
  //      * Meaning, the max this array size can be is 5.
  //      * @link https://pylon.bot/docs/pylon-tasks
  //      */
  //     cronTasks: CronTask[];
  //   };
  // }

  // /**
  //  * > Note: The current minimum interval cron tasks can run at are once every 5 minutes. You may schedule up to 5 cron handlers.
  //  * @link https://pylon.bot/docs/pylon-tasks
  //  */
  // export interface CronTask {
  //   name: string;
  //   /**
  //    * Cron string.
  //    */
  //   cronString: string;
  // }

  /**
   * The Pylon API returns this in a stringified form.
   */
  export interface File {
    path: `/${string}.ts`;
    content: string;
  }
}
