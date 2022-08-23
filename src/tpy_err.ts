import type { SafeObject } from './types/util.d.ts';

/**
 * A library specific enum for describing errors.
 */
enum TpyErr {
  /**
   * Not an error, used for determining if the value is a non 0 value.
   */
  NO_ERR,
  /**
   * Tpy could not figure out what the error was, there is an error, but it isn't known.
   * Make an issue on the Tpy repository so we can catch this error.
   */
  UNIDENTIFIABLE,
  /**
   * This happens on two occasions:
   * 1. A request is made without an authorization header. (403)
   * 2. A request is made with the authorization header but it is invalid. (500)
   *
   * | Input                 | Response |
   * |-----------------------|----------|
   * | (No Input)            | 403      |
   * | Incorrect Credentials | 500      |
   * | Correct Input         | 200      |
   *
   * The API specifies this exactly like this:
   * ```js
   * {
   *  "msg": "missing json body",
   * }
   * ```
   * @see TpyErr.INTERNAL_SERVER_ERROR
   */
  UNAUTHORIZED,
  /**
   * The URL resource returns a 404, this shouldn't happen on built in functions unless the API was updated.
   * Make an issue on the Tpy repository so we can catch this error.
   */
  RESOURCE_NOT_FOUND,
  /**
   * The fetch contents sent were did not have the required JSON body.
   * The API specifies this exactly like this:
   * ```js
   * {
   *  "msg": "missing json body",
   * }
   * ```
   */
  MISSING_JSON_BODY,
  /**
   * The fetch method is not allowed.
   * @see Pylon.Verbs for allowed HTTP verbs.
   */
  METHOD_NOT_ALLOWED,
  /**
   * The guild specified was not found.
   * The API specifies this exactly like this:
   * ```
   * could not find guild
   * ```
   */
  GUILD_NOT_FOUND,
  /**
   * The deployment specified was not found.
   * The API specifies this exactly like this:
   * ```
   * could not find deployment
   * ```
   */
  DEPLOYMENT_NOT_FOUND,
  /**
   * Sometimes this happens when a request is made with the authorization header but it is invalid.
   *
   * | Input                 | Response |
   * |-----------------------|----------|
   * | (No Input)            | 403      |
   * | Incorrect Credentials | 500      |
   * | Correct Input         | 200      |
   *
   * @see TpyErr.UNAUTHORIZED
   */
  INTERNAL_SERVER_ERROR,
}

export type TpyErrAsStrings =
  | ''
  | 'Unidentifiable error'
  | 'Unauthorized'
  | 'Resource not found'
  | 'Missing or invalid JSON body'
  | 'Method not allowed'
  | 'Guild not found'
  | 'Deployment not found'
  | 'Internal server error'
  | 'Not of type TpyErr';

/**
 * @param err The error to convert to a string.
 * @returns An english version of the error.
 */
export function TpyErrToString(
  err: TpyErr | Response,
): TpyErrAsStrings {
  if (err instanceof Response) {
    return 'Unidentifiable error';
  }

  switch (err) {
    case TpyErr.NO_ERR:
      return '';
    case TpyErr.UNIDENTIFIABLE:
      return 'Unidentifiable error';
    case TpyErr.UNAUTHORIZED:
      return 'Unauthorized';
    case TpyErr.RESOURCE_NOT_FOUND:
      return 'Resource not found';
    case TpyErr.MISSING_JSON_BODY:
      return 'Missing or invalid JSON body';
    case TpyErr.METHOD_NOT_ALLOWED:
      return 'Method not allowed';
    case TpyErr.GUILD_NOT_FOUND:
      return 'Guild not found';
    case TpyErr.DEPLOYMENT_NOT_FOUND:
      return 'Deployment not found';
    case TpyErr.INTERNAL_SERVER_ERROR:
      return 'Internal server error';
    default:
      return 'Not of type TpyErr';
  }
}

/**
 * Checks if the API errors with `missing json body`.
 * @param res The HTTP response
 */
export const isMissingJsonBody = (res: SafeObject) =>
  'msg' in res && res['msg'] === 'missing json body';

/**
 * Checks if the API errors with an unauthorization.
 * @param res The HTTP response
 */
export const isNotAuthorized = (res: SafeObject) =>
  'message' in res && res['message'] === 'not authorized';

/**
 * Checks if the API errors with `could not find deployment`.
 * @param res The HTTP response
 */
export const deploymentNotFound = (res: string) =>
  res === 'could not find deployment';

/**
 * Checks if the API errors with `could not find guild`.
 * @param res The HTTP response
 */
export const guildNotFound = (res: string) => res === 'could not find guild';

/**
 * Checks if the API errors with a resource not found, but only checks the
 * first two characters as this is a unique response.
 * @param res The HTTP response
 */
export const resourceNotFound = (res: string) => res.startsWith('\u26A0\uFE0F');

export default TpyErr;
