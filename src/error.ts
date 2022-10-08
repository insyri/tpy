/**
 * Tpy's library specific error interface, provides more specific
 * and helpful messages along with direct context with what caused
 * the error. It is made to be disected and verifiable, as it only
 * comes with set possible outcomes derived from {@linkcode TpyErrors}.
 *
 * ### Example Error
 *
 * ```ts
 * try {
 * // ...
 * } catch (e) {
 *   if (e instanceof TpyError)
 *     console.error(`There was an error: ${e.name} ${e.message()}`);
 *
 *   // Handle if e suits other Error interfaces.
 * }
 * ```
 *
 * *Type casting `e` implied `e` will only ever return a `TpyError`.
 * `TpyError` does not catch all errors, it should catch most errors
 * regarding the request, though.*
 *
 * @module
 */

/**
 * As {@linkcode TpyErrors} is a asserted as a
 * {@linkcode https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions const}
 * type, it cannot be directly typed out. This is an interface to what
 * shape it takes.
 */
export interface ITpyErrors {
  [name: string]: ITpyErrorsProperty;
}

export interface ITpyErrorsProperty {
  /**
   * A function that returns a string with an input regarding environment
   * contextual details.
   */
  message: (s: string) => string;
  /**
   * An explanation of what might have happened.
   */
  description: string;
}

/**
 * An error wrapper of {@linkcode TpyErrors} that provides specific
 * context of the environment to explain why it was thrown.
 *
 * @template T The type of {@linkcode rawInfo}.
 */
class TpyError<T> extends Error implements Omit<ITpyErrorsProperty, 'message'> {
  /**
   * A short description of the Tpy error.
   */
  name: keyof typeof TpyErrors;
  /**
   * An explanation of what might have happened.
   */
  description: string;
  /**
   * The determining factor of throwing this error. The cause.
   */
  determination: string;
  /**
   * Context passed into the `.message()` method of the matching
   * name index of {@linkcode TpyErrors}.
   */
  messageContext: string;
  /**
   * Raw information collected that was used to formulate the error.
   */
  rawInfo: T;

  /**
   * @param name A short description of the Tpy error.
   * @param determination An explanation of what might have happened.
   * @param rawinfo Raw information collected that was used to formulate the error.
   */
  constructor(
    name: keyof typeof TpyErrors,
    determination: string,
    /**
     * Context passed into the `.message()` method of the matching
     * name index of {@linkcode TpyErrors}.
     */
    messageContext: string,
    rawinfo: T,
  ) {
    super(TpyErrors[name].message(messageContext));
    this.name = name;
    this.description = TpyErrors[name].description;
    this.messageContext = messageContext;
    this.determination = determination;
    this.rawInfo = rawinfo;
  }
}

/**
 * The set of errors returned by {@linkcode TpyError} that describes a
 * dictionary based on the name as the index/key which consists of two
 * values: a {@linkcode ITpyErrorsProperty.description description} string
 * and a {@linkcode ITpyErrorsProperty.message message} method to create a
 * description with specific context information.
 */
export const TpyErrors = {
  'Internal Server Error': {
    message: (s: string) => serverRespondedWith(s),
    description:
      `Sometimes this happens when a request is made with the authorization header but it is invalid.`,
  },
  'Missing or Unexpected Value in Response': {
    message: (s: string) => `Response structure validation failed: ${s}.`,
    description:
      'This has to do with verifying an API response \'s structure. If a given value is missing or has unexpected behavior, this is thrown.',
  },
  'Missing or Invalid JSON in Request Body': {
    message: (s: string) =>
      `With given field(s) ${s} were unsatisfactory; contains invalid JSON.`,
    description:
      `The fetch contents sent were did not have the required JSON body.`,
  },
  'Guild Could Not be Found': {
    message: (s: string) => couldNotBeFound('Guild ID', s),
    description: `The guild specified was not found.`,
  },
  'Deployment Could Not be Found': {
    message: (s: string) => couldNotBeFound('Deployment ID', s),
    description: `The deployment specified was not found.`,
  },
  'HTTP Method Not Allowed': {
    message: (s: string) => serverRespondedWith(s),
    description: 'The HTTP method is not allowed.',
  },
  'Unidentifiable Error': {
    message: (s: string) =>
      `Unidentifiable error caught, deterministic via fields: ${s}`,
    description:
      'The error was unidentifiable, see the raw information via <TpyError>.rawInfo.',
  },
  'URL Resource Not Found': {
    message: (s: string) => serverRespondedWith(s),
    description: 'The URL resource on the web server was not found.',
  },
  'Unauthorized': {
    message: (s: string) => serverRespondedWith(s),
    description:
      'Authentication credentials in the request were not populated.',
  },
  'Forbidden': {
    message: (s: string) => serverRespondedWith(s),
    description:
      'Access to the resource with the given authentication credentials is denied.',
  },
  'Missing or Invalid Required Parameter': {
    message: (s: string) =>
      `Required parameter(s) ${s} were not populated or is incompatible.`,
    description:
      'Parameter(s) were not populated where required or are incompatible.',
  },
};

// Localized util template functions

function serverRespondedWith(s: string) {
  return `Server responded with HTTP status code ${s}.`;
}

function couldNotBeFound(sub: string, s: string) {
  return `${sub} ${s} could not be found.`;
}

// General util template functions

/**
 * Clarifies that the parameter `s` is the response body.
 * @param s The response body information as a string.
 */
export function responseBody(s: string) {
  return `Response Body: "${s}"`;
}

/**
 * Creates a string that describes the parameter(s) are
 * either missing or incompatible.
 * @param issue The issue with the parameters.
 * @param params The parameter(s) in this context.
 */
export function parametersPrompt(
  issue: 'missing' | 'incompatible',
  params: string | string[],
) {
  return `Parameter(s) are ${issue}: ${
    Array.isArray(params) ? params.join(', ') : params
  }`;
}

/**
 * Clarifies that the parameter `s` is the HTTP response code.
 * @param s The HTTP response code information as a string.
 */
export function responseHTTP(s: string) {
  return `Response HTTP status code: ${s}`;
}

export default TpyError;
