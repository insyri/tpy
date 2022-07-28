import type Guild from './guild.d.ts';
import type { GatewayDispatchEvents } from 'https://deno.land/x/discord_api_types@0.33.0/gateway/v8.ts';
import type {
  StringifiedNumber,
  StringifiedNumberWithDefault,
} from '../types/util.d.ts';

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
       * This deployment is a collection of scripts.
       *
       * @default
       */
      SCRIPT,
      /**
       * This deployment is an app.
       *
       * Currently not used in the API.
       */
      APP,
    }

    /**
     * A deployment's 'up' status. Altered by Pylon administrators.
     */
    export enum DeploymentStatus {
      /**
       * Deployment is disabled, it doesn't run and is not active.
       */
      DISABLED,
      /**
       * Deployment is enabled, it runs and is active.
       *
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
       * Array of cron tasks.
       */
      tasks: {
        /**
         * Cron task specifications.
         *
         * > Note: The current minimum interval cron tasks can run at are once every 5 minutes. You may schedule up to 5 cron handlers.
         * @link https://pylon.bot/docs/pylon-tasks
         * @link https://pylon.bot/docs/reference/modules/pylon.tasks.html#cron
         */
        cronTasks: Array<{
          /**
           * Cron identifier. Identified like so:
           * ```ts
           * pylon.tasks.cron('cron_identifier', '0 0/5 * * * * *', () => {});
           * ```
           */
          name: string;
          /**
           * The cron instructions.
           */
          cronString: string;
        }>;
      };
    };

    /**
     * The base structure of some deployment related responses.
     */
    export type Base = {
      /**
       * Deployment and script ID.
       */
      id: StringifiedNumber;
      /**
       * Bot ID the script exists for. Used in BYOB.
       */
      bot_id: StringifiedNumberWithDefault<270148059269300224n>;
      /**
       * Unused as of 5/31/2022.
       */
      type: DeploymentType;
      /**
       * Unused as of 5/31/2022.
       */
      app_id: StringifiedNumber | null;
      /**
       * Unused as of 5/31/2022.
       *
       * Name of the script/app.
       */
      name: string;
      /**
       * A deployment's 'up' status. Altered by Pylon administrators.
       */
      status: DeploymentStatus;
      /**
       * Script revision number. Increments every time a script is published.
       */
      revision: number;
    };

    /**
     * The current project's files and information.
     */
    export type DeploymentFiles = {
      /**
       * Path to the file, probably ends in `.ts`.
       * Follows pattern: `/*.*`.
       */
      path: string;
      /**
       * File contents.
       */
      content: string;
    };

    /**
     * Pylon uses FastAPI, this is a FastAPI error.
     */
    export type FastAPIError = {
      /**
       * The type of error in general, like `validation`.
       */
      type: string;
      /**
       * The reported errors.
       */
      errors: Array<{
        /**
         * Array that incrementally traverses the keys of the given object to the source of the error.
         * @example
         * ```json
         * {
         *   "nested_top": {
         *     "nested_second": {
         *       "nested_third": ...
         *     }
         *   }
         * };
         * // would be represented as:
         * ['nested_top', 'nested_second', 'nested_third'];
         * ```
         */
        loc: string[];
        /**
         * Error message in english.
         */
        msg: string;
        /**
         * An identifiable token of the kind of error, like `value_error`.
         */
        type: string;
      }>;
    };
  }

  /**
   * `GET /deployments/*`
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
   * `POST /deployments/*`
   */
  export namespace POST {
    /**
     * `POST /deployments/:id` Request
     *
     * The request schema for the POST deployment resource.
     */
    export type Request<Raw extends boolean = true> = {
      script: {
        /**
         * Compiled script code in JavaScript.
         */
        contents: string;
        /**
         * The Pylon project.
         */
        project: {
          /**
           * File contents in displayable format.
           */
          files: Raw extends true ? string : Structures.DeploymentFiles[];
        };
      };
    };

    /**
     * `POST /deployments/:id` Response
     *
     * The response schema for the POST deployment resource.
     */
    export type Response<Raw extends boolean = true> =
      & Deployments.GET.Deployments
      & {
        /**
         * FastAPI error.
         */
        errors: Deployments.Structures.FastAPIError;
        script?: {
          /**
           * The Deployment ID.
           */
          id: StringifiedNumber;
          /**
           * The Pylon project.
           */
          project: {
            /**
             * File contents in displayable format.
             */
            files: Raw extends true ? string : Structures.DeploymentFiles[];
          };
        };
      };
  }
}

export default Deployments;
