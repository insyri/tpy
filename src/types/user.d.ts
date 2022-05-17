import { numstr, Unpacked } from '../utils.ts';
import Guild from './guild.d.ts';

/**
 * `/user`
 *
 * User related resources.
 */
declare namespace User {
  /**
   * `GET /user`
   *
   * Returns information based on the currently authenticated user.
   */
  export namespace GET {
    /**
     * `GET /user`
     *
     * Gets basic user information.
     */
    export interface User {
      id: numstr;
      /**
       * ISO 8601 / RFC 3339.
       */
      lastSeenAt: string;
      /**
       * UUID without hypens.
       */
      avatar: string | null;
      displayName: string;
      hasAccess: boolean;
    }

    /**
     * `GET /user/guilds`
     *
     * User's guild related resources.
     */
    export namespace Guilds {
      /**
       * `GET /user/guilds`
       *
       * Returns all guilds the respective user can edit with Pylon.
       * More specifically, the list of guilds the user is in where the user has `manage server` permissions or above.
       */
      export type Guilds = Array<
        Unpacked<Available> & {
          /**
           * The user's nickname in the guild.
           */
          nick: string | null;
        }
      >;

      /**
       * `GET /user/guilds/available`
       *
       * Returns all guilds a user can edit with Pylon.
       * More specifically, the list of guilds the user is in where the user has `manage server` permissions.
       */
      export type Available = Array<
        Guild.Structures.Payload & {
          /**
           * Discord permissions number.
           * @link https://discord.com/developers/docs/topics/permissions
           */
          permissions: number;
        }
      >;
    }
  }
}

export default User;
