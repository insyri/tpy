import type Guild from './guild.d.ts';
import type { GatewayDispatchEvents } from 'discord-api-types/gateway/v8.ts';
import type { StringifiedNumber } from '../types/util.d.ts';

/**
 * Typings relevant to deployment interfaces on the Pylon API.
 *
 * @module
 */

/**
 * Request and response structures related to the `/deployments` resource.
 */
declare namespace Deployment {
  /**
   * Not an API resource, this namespace behaves as templates and other
   * base types.
   */
  export namespace Structures {
    /**
     * The type of deployment.
     */
    export enum DeploymentType {
      /**
       * This deployment is a collection of scripts. This is the default.
       *
       * @default
       */
      SCRIPT,
      /**
       * This deployment is an app.
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
       * Deployment is enabled, it runs and is active. This is the default.
       *
       * @default
       */
      ENABLED,
    }

    export type Script<Raw extends boolean = true> = {
      /**
       * Compiled script code in JavaScript.
       */
      contents: string;
      /**
       * The deployment ID.
       */
      id: StringifiedNumber;
      /**
       * The project directory.
       */
      project: Raw extends true ? string : {
        /**
         * File contents and path information.
         */
        files: Array<
          {
            /**
             * Path to the file in formation of `./*.*`, usually ends in `.ts`: `./*.ts`.
             */
            path: string;
            /**
             * File contents.
             */
            content: string;
          }
        >;
      };
    };

    /**
     * Deployment configurations; recieved as a string.
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
         * Cron task specifications. See the {@linkcode https://pylon.bot/docs/pylon-tasks Pylon SDK Documentation} on Crons and Tasks.
         *
         * Identification map:
         * ```ts
         * pylon.tasks.cron('Reminder', '0 0/5 * * * * *', async () => {});
         * //                ^^^^^^^^    ^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^
         * //               Identifier   Cron              Asynchronous Callback
         * ```
         */
        cronTasks: Array<{
          /**
           * The cron identifier; the given name to the cron instructions.
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
      bot_id: StringifiedNumber;
      /**
       * The type of deployment.
       */
      type: DeploymentType;
      /**
       * The application ID.
       */
      app_id: StringifiedNumber | null;
      /**
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
         * }
         * // would be represented as:
         * ['nested_top', 'nested_second', 'nested_third']
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
   * Schemas for `GET /deployments/*`.
   */
  export namespace GET {
    /**
     * Response schema for `GET /deployments/:id`.
     *
     * Returns information about the current running deployment.
     *
     * @template T Boolean of whether the configuration contents are recieved
     * as string of JSON or as actual JSON.
     */
    export type Deployment<Raw extends boolean = true> =
      & Structures.Base
      & {
        /**
         * Deployment configurations.
         */
        config: Raw extends true ? string : Structures.Config;
        /**
         * Pylon Workbench WebSocket URL. Includes a portion the logged in
         * user's authentication token for Pylon.
         */
        workbench_url: `wss://workbench.pylon.bot/ws/${string}`;
        /**
         * Deployment's guild information.
         */
        guild: Guild.Structures.Payload;
        /**
         * The new deployment script information.
         */
        script: Omit<Deployment.Structures.Script<Raw>, 'id'>;
      };
  }

  /**
   * Schemas for `POST /deployments/*`.
   */
  export namespace POST {
    /**
     * Request schema for `POST /deployments/:id`.
     *
     * @template T Boolean of whether the file contents are recieved
     * as string of JSON or as actual JSON.
     */
    export type Request<Raw extends boolean = true> = Omit<
      Deployment.Structures.Script<Raw>,
      'id'
    >;

    /**
     * Response schema for `POST /deployments/:id`.
     *
     * Returns the new deployment's information. If there are errors, the
     * `errors` property length will be more than 0.
     *
     * @template T Boolean of whether the file contents are recieved
     * as string of JSON or as actual JSON.
     */
    export type Response<Raw extends boolean = true> =
      & Deployment.GET.Deployment<Raw>
      & {
        /**
         * FastAPI error.
         */
        errors: Deployment.Structures.FastAPIError;
        /**
         * The new deployment script information.
         */
        script?: Omit<Deployment.Structures.Script<Raw>, 'contents'>;
      };
  }
}

export default Deployment;
