import { GatewayDispatchEvents } from "https://deno.land/x/discord_api_types@0.32.1/v8.ts";
import { Guild } from "./guild.d.ts";
import { numstr } from "./minitypes.d.ts";

// TODO: Find pylon's cron specification and document it Deployments.Structures.CronTask.

/**
 * `/deployments`
 * 
 * Deployment related resources.
 */
export namespace Deployments {
  /**
   * Not an API resource, this namespace behaves as templates and other base types.
   */
  export namespace Structures {
    /**
     * Deployment configurations. Recieved stringified.
     */
    export interface Config {
      enabled: boolean;
      /**
       * Undocumented.
       */
      events: GatewayDispatchEvents[];
      /**
       * Undocumented.
       */
      tasks: {
        cronTasks: CronTask[];
      };
    }

    /**
     * Cron task specifications. Recieved stringified.
     * 
     * > Note: The current minimum interval cron tasks can run at are once every 5 minutes. You may schedule up to 5 cron handlers.
     * @link https://pylon.bot/docs/pylon-tasks
     * @link https://pylon.bot/docs/reference/modules/pylon.tasks.html#cron
     */
    export interface CronTask {
      /**
       * Cron identifier. Identified like so:
       * ```ts
       * pylon.tasks.cron('cron_identifier', '0 0/5 * * * * *', () => {});
       * ```
       */
      name: string;
      /**
       * Follows cron specification [to be documented].
       */
      cronString: string;
    }

    export interface Base {
      /**
       * Deployment ID.
       */
      id: numstr;
      /**
       * Undocumented.
       */
      bot_id: numstr;
      /**
       * Undocumented.
       */
      type: number;
      /**
       * Undocumented.
       */
      app_id: numstr | null;
       /**
        * Undocumented.
        */
      name: string;
      /**
       * Undocumented.
       */
      status: number;
      /**
       * Script revision number. Increments every time a script is published.
       */
      revision: number;
    }
  }

  /**
   * `GET /deployments`
   */
  export namespace GET {
    /**
     * `GET /deployments/:deploymentId`
     * 
     * Returns deployment information via ID.
     */
    export interface Info extends Structures.Base {
      /**
       * Stringified `Deployments.Structures.Config` object.
       */
      config: string & Deployments.Structures.Config;
      /**
       * Pylon Workbench WebSocket URL. Includes the logged in user's authentication token for Pylon.
       */
      workbench_url: `wss://workbench.pylon.bot/ws/${string}`;
      /**
       * Deployment's guild information.
       */
      guild: Guild.Structures.Payload;
    }
  }

  export namespace POST {}
}