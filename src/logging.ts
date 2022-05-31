import { TpyErr } from './tpy_err.ts';

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
export default function TpyErrToString(
  err: TpyErr,
): TpyErrAsStrings {
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
