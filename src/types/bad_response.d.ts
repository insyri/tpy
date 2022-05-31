declare namespace BadResponse {
  export type ErrorMessageBase = {
    description: string;
    status: number;
    message: string;
  };

  /**
   * Unauthorized response in JSON format.
   */
  export type Unauthorized = { message: 'not authorized' };

  /**
   * 404 response for /guilds/:id
   */
  export type LostGuild = `could not find guild`;

  /**
   * 404 response for /deployments/:id
   */
  export type LostDeployment = `could not find deployment`;

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

  export type MissingJsonBody = {
    msg: 'missing json body';
  };

  export type BadStringResponses =
    | OldResourceNotFound
    | LostGuild
    | LostDeployment;
}

export default BadResponse;
