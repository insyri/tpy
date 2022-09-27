import type { SafeObject } from './types/util.d.ts';

interface TpyErrorBase {
  name: keyof ParseTpyErrors<typeof TpyErrors>;
  message: string;
}

class TpyError<T> extends Error implements TpyErrorBase {
  name: keyof ParseTpyErrors<typeof TpyErrors>;
  rawInfo: T;

  constructor(
    name: keyof ParseTpyErrors<typeof TpyErrors>,
    rawinfo: T,
    ...errorOptions: ErrorOptions[]
  ) {
    super(TpyErrorsAsObjects[name].message, ...errorOptions);
    this.name = name;
    this.rawInfo = rawinfo;
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

export const TpyErrors = [{
  name: 'Internal Server Error',
  message:
    `Sometimes this happens when a request is made with the authorization header but it is invalid.\n${auth_graph}`,
}, {
  name: 'Unexpected or Missing Value in Response',
  message:
    'This has to do with verifying an API request\'s structure. If a given value is missing or has unexpected behavior, this is thrown.',
}, {
  name: 'Missing or Invalid JSON in Request Body',
  message:
    `The fetch contents sent were did not have the required JSON body. ${api_tells}`,
}, {
  name: 'Guild Could Not be Found',
  message: `The guild specified was not found. ${api_tells}`,
}, {
  name: 'Deployment Could Not be Found',
  message: `The deployment specified was not found. ${api_tells}`,
}, {
  name: 'HTTP Method Not Allowed',
  message: 'The HTTP method is not allowed.',
}, {
  name: 'Unidentifiable Error',
  message:
    'The error was unidentifiable, see the raw information via <TpyError>.rawInfo.',
}, {
  name: 'URL Resource Not Found',
  message: 'The URL resource on the web server was not found.',
}, {
  name: 'Unauthorized',
  message: 'Authentication credentials in the request were not populated.',
}, {
  name: 'Forbidden',
  message:
    'Access to the resource with the given authentication credentials is denied.',
}] as const;

// Thanks Arcs/Clancy/Mina (all same person btw)
type ParseTpyErrors<T extends ReadonlyArray<TpyErrorBase>> = {
  [P in keyof T as P extends number ? T[P]['name'] : never]: P extends number
    ? { message: T[P]['message'] }
    : never;
};

export const TpyErrorsAsObjects: ParseTpyErrors<typeof TpyErrors> = Object
  .assign(
    {},
    ...TpyErrors.map(
      function (v) {
        return {
          [v.name]: {
            message: v.message,
          },
        };
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

export default TpyError;
