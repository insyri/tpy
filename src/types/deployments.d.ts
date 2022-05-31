import { GatewayDispatchEvents } from 'https://deno.land/x/discord_api_types@0.33.0/gateway/v8.ts';
import Guild from './guild.d.ts';
import { bigintstrWithDefault, numstr } from '../utils.ts';

// TODO: Find pylon's cron specification and document it Deployments.Structures.CronTask.

/**
 * `/deployments`
 *
 * Deployment related resources.
 */
declare namespace Deployments {
  /**
   * Not an API resource, this namespace behaves as templates and other base types.
   */
  export namespace Structures {
    /**
     * The type of deployment.
     */
    export enum DeploymentType {
      /**
       * @default
       */
      SCRIPT,
      APP,
    }

    /**
     * A deployment's 'up' status.
     */
    export enum DeploymentStatus {
      /**
       * Can only be disabled by the Pylon admins.
       */
      DISABLED,
      /**
       * @default
       */
      ENABLED,
    }

    /**
     * Deployment configurations. Recieved stringified.
     */
    export type Config = {
      /**
       * This is only false if a deployment is disabled if a Pylon admin disabled it.
       */
      enabled: boolean;
      /**
       * Script specific discord gateway events it listens to.
       */
      events: GatewayDispatchEvents[];
      /**
       * Cron tasks.
       */
      tasks: {
        cronTasks: CronTask[];
      };
    };

    /**
     * Cron task specifications. Recieved stringified.
     *
     * > Note: The current minimum interval cron tasks can run at are once every 5 minutes. You may schedule up to 5 cron handlers.
     * @link https://pylon.bot/docs/pylon-tasks
     * @link https://pylon.bot/docs/reference/modules/pylon.tasks.html#cron
     */
    export type CronTask = {
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
    };

    export type Base = {
      /**
       * Deployment and script ID.
       */
      id: numstr;
      /**
       * Bot ID the script exists for. Used in BYOB.
       */
      bot_id: bigintstrWithDefault<270148059269300224n>;
      /**
       * Unused as of 5/31/2022.
       */
      type: DeploymentType;
      /**
       * Unused as of 5/31/2022.
       */
      app_id: numstr | null;
      /**
       * Unused as of 5/31/2022.
       *
       * Name of the script/app.
       */
      name: string;
      status: DeploymentStatus;
      /**
       * Script revision number. Increments every time a script is published.
       */
      revision: number;
    };

    /**
     * Path to file, usually `.ts`.
     * @param Extension Default `"ts"`, can override via generic string.
     */
    export type File<Extension extends string = 'ts'> =
      `/${string}.${Extension}`;

    export type DeploymentFiles = {
      path: File;
      /**
       * File contents.
       */
      content: string;
    };

    /**
     * Return when a deployment POST body is invalid.
     */
    export type Missing = {
      msg: 'missing json body';
    };

    /**
     * Pylon uses FastAPI, this is a FastAPI error.
     */
    export type Error = {
      type: string;
      errors: Array<{
        /**
         * Array that incrementally traverses the keys of the given object to the source of the error.
         * @example ['nested_top', 'nested_second', 'nested_third'];
         */
        loc: string[];
        /**
         * Error message in english.
         */
        msg: string;
        type: `${string}.${string}`;
      }>;
    };
  }

  /**
   * `GET /deployments`
   */
  export namespace GET {
    /**
     * `GET /deployments/:id`
     *
     * Returns deployment information via ID.
     */
    export type Deployments<Raw extends boolean = true> = Structures.Base & {
      config: Raw extends true ? string : Structures.Config;
      /**
       * Pylon Workbench WebSocket URL. Includes a portion the logged in user's authentication token for Pylon.
       */
      workbench_url: `wss://workbench.pylon.bot/ws/${string}`;
      /**
       * Deployment's guild information.
       */
      guild: Guild.Structures.Payload;
    };
  }

  /**
   * `POST /deployments/:id`
   */
  export namespace POST {
    export type Request<Raw extends boolean = true> = {
      script: {
        /**
         * Compiled script code in JavaScript.
         */
        contents: string;
        project: {
          /**
           * File contents in displayable format.
           */
          files: Raw extends true ? string : Structures.DeploymentFiles[];
        };
      };
    };

    export type Response<Raw extends boolean = true> = (
      & Deployments.GET.Deployments
      & {
        /**
         * Fast API error.
         */
        errors: [
          {
            loc: string[];
            msg: string;
            type: string;
          },
        ];
        script?: {
          id: numstr;
          projects: {
            files: Raw extends true ? string : Structures.DeploymentFiles[];
          };
        };
      }
    );
  }
}

export default Deployments;
