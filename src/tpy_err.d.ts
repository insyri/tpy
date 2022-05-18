declare enum TpyErr {
  /**
   * Used internally.
   */
  NOT_SET,
  NO_ERR,
  UNAUTHORIZED,
  MISSING_JSON_BODY,
  METHOD_NOT_ALLOWED,
  GUILD_NOT_FOUND,
  DEPLOYMENT_NOT_FOUND,
}

export default TpyErr;
