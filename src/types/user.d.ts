/**
 * Request and response structures related to the `/user` resource.
 *
 * Typings relevant to user interfaces on the Pylon API.
 *
 * @module
 */

import type { Unpacked } from "./util.d.ts";
import type { GuildStructures } from "./guild.d.ts";

/**
 * Schemas for `GET /user`.
 */
export namespace GET {
  /**
   * Response schema for `GET /user`.
   *
   * Returns information based on the currently authenticated user.
   */
  export type User = {
    /**
     * The user's Discord ID.
     */
    id: string;
    /**
     * The user's join date of the Pylon Discord Server.
     *
     * Follows the ISO 8601 / RFC 3339 specification.
     */
    lastSeenAt: string;
    /**
     * The user's avatar ID. Null if none set.
     *
     * `https://cdn.discordapp.com/avatars/{userId}/{avatar}.webp`
     */
    avatar: string | null;
    /**
     * The user's name.
     */
    displayName: string;
    /**
     * If user can use Pylon; if user is in the Pylon discord.
     */
    hasAccess: boolean;
  };

  /**
   * Response schema for `GET /user/guilds`.
   *
   * User's guild related resources.
   */
  export namespace Guilds {
    /**
     * Response schema for `GET /user/guilds`.
     *
     * Returns all guilds where the user can edit with Pylon. More specifically, all
     * guilds which the user is an administrator.
     *
     */
    export type Allowed = Array<
      Unpacked<Available> & {
        /**
         * The user's nickname in the guild.
         */
        nick: string | null;
      }
    >;

    /**
     * Response schema for `GET /user/guilds/available`.
     *
     * Returns all guilds the user is in.
     */
    export type Available = Array<
      GuildStructures.Payload & {
        /**
         * The {@linkcode https://discord.com/developers/docs/topics/permissions Discord permissions number} of the user.
         */
        permissions: number;
      }
    >;
  }
}
