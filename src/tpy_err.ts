export enum TpyErr {
  NO_ERR,
  UNIDENTIFIABLE,
  /**
   * This happens on two occasions:
   * 1. A request is made without an authentication header. (403)
   * 2. A request is made with the authentication header but it is invalid. (500)
   */
  UNAUTHORIZED,
  RESOURCE_NOT_FOUND,
  MISSING_JSON_BODY,
  METHOD_NOT_ALLOWED,
  GUILD_NOT_FOUND,
  DEPLOYMENT_NOT_FOUND,
  /**
   * Sometimes this happens when a request is made with the authentication header but it is invalid.
   *
   * @see TpyErr.UNAUTHORIZED
   */
  INTERNAL_SERVER_ERROR,
}
