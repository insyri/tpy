declare namespace BadResponse {
  export interface ErrorMessageBase {
    description: string;
    status: number;
    message: string;
  }

  /**
   * Unauthorized response in JSON format.
   */
  export type Unauthorized = { message: 'not authorized' };

  /**
   * 404 response for /guilds/:id
   */
  export type LostGuild = `could not find guild`;

  /**
   * General 404 response, where ${string} is the resource.
   *
   * ```txt
   * /nonexistent => ...Requested URL /nonexistent not found
   * /            => ...Requested URL  not found
   *     notice the double space     ^^
   * ```
   */
  export type OldResourceNotFound =
    `⚠️ 404 — Not Found\n==================\nRequested URL ${string} not found`;

  export interface MissingJsonBody {
    msg: 'missing json body';
  }

  // found this when doing /user/guilds/available/{input} or
  // found this when doing /user/guilds/{input}
  // found this when doing /user/{input}
  // found this when doing /n (nonexistent)
  export interface ResourceNotFound extends ErrorMessageBase {
    description: 'Not Found';
    status: 404;
    message: `Requested URL /${string} not found`;
  }

  export interface MethodNotAllowed extends ErrorMessageBase {
    description: 'Method Not Allowed';
    status: 405;
    message: `Method ${string} not allowed for URL /${string}`;
  }
}

export default BadResponse;
