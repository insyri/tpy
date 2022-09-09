import type { SafeObject } from './types/util.d.ts';

interface TpyErrorBase {
  ok: boolean;
  name: string;
  message: string;
}

export function noErrorTpyError<T>(rawinfo: T): TpyError<T> {
  return new TpyError<T>(true, new Error(), rawinfo);
}

class TpyError<T> implements TpyErrorBase {
  ok: boolean;
  name: string;
  message: string;
  stack?: string;
  rawinfo: T;

  constructor(ok: boolean, err: Error, rawinfo: T) {
    this.ok = ok;
    this.name = err.name;
    this.message = err.message;
    this.stack = err.stack;
    this.rawinfo = rawinfo;
  }
}

const api_tells = 'The API will directly tell you this.';
const auth_graph = [
  '| Input                 | Response |',
  '|-----------------------|----------|',
  '| (No Input)            | 403      |',
  '| Incorrect Credentials | 500      |',
  '| Correct Input         | 200      |',
].join('\n');

export const TpyErrors: TpyErrorBase[] = [{
  ok: false,
  name: 'Internal Server Error',
  message:
    `Sometimes this happens when a request is made with the authorization header but it is invalid.\n${auth_graph}`,
}, {
  ok: false,
  name: 'Unexpected or Missing Value in Response',
  message:
    'This has to do with verifying an API request\'s structure. If a given value is missing or has unexpected behavior, this is thrown.',
}, {
  ok: false,
  name: 'Missing or Invalid JSON in Request Body',
  message:
    `The fetch contents sent were did not have the required JSON body. ${api_tells}`,
}, {
  ok: false,
  name: 'Guild Could Not be Found',
  message: `The guild specified was not found. ${api_tells}`,
}, {
  ok: false,
  name: 'Deployment Could Not be Found',
  message: `The deployment specified was not found. ${api_tells}`,
}, {
  ok: false,
  name: 'HTTP Method Not Allowed',
  message: 'The HTTP method is not allowed.',
}, {
  ok: false,
  name: 'Unidentifiable Error',
  message: 'The error was unidentifiable, see the raw information.',
}];

type TpyErrsAsObjectsType = {
  [index: typeof TpyErrors[number]['name']]: {
    ok: typeof TpyErrors[number]['ok'];
    message: typeof TpyErrors[number]['message'];
  };
};

export const TpyErrsAsObjects: TpyErrsAsObjectsType = Object.assign(
  {},
  ...TpyErrors.map(
    function (v) {
      const o: TpyErrsAsObjectsType = {};
      o[v.name] = {
        ok: v.ok,
        message: v.message,
      };
      return o;
    },
  ),
);

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

export default TpyError;
