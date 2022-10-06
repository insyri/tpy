interface TpyErrorBase {
  name: keyof ParseTpyErrors<typeof TpyErrors>;
  description: string;
}

/**
 * @template T The type of the {@link rawInfo raw information}
 */
class TpyError<T> extends Error implements TpyErrorBase {
  /**
   * The name of the Tpy error.
   */
  name: keyof ParseTpyErrors<typeof TpyErrors>;
  /**
   * An explanation of what might have happened.
   */
  description: string;
  /**
   * Context passed into the `.message()` method of the matching
   * index of {@link TpyErrors}.
   */
  messageContext: string;
  /**
   * The determining factor of creating this error. The cause.
   */
  determination: string;
  /**
   * Raw information collected that was used to formulate the error.
   */
  rawInfo: T;

  constructor(
    /**
     * The name of the Tpy error.
     */
    name: TpyErrorBase['name'],
    /**
     * The determinating factor of why this error was thrown.
     */
    determination: string,
    /**
     * Context passed into the `.message()` method of the matching
     * index of {@link TpyErrors}.
     */
    messageContext: string,
    /**
     * Raw information used to formulate the error.
     */
    rawinfo: T,
  ) {
    super(TpyErrorsAsObjects[name].message(messageContext));
    this.name = name;
    this.description = TpyErrorsAsObjects[name].description;
    this.messageContext = messageContext;
    this.determination = determination;
    this.rawInfo = rawinfo;
  }
}

const serverRespondedWith = (s: string) =>
  `Server responded with HTTP status code ${s}.`;
const couldNotBeFound = (sub: string, s: string) =>
  `${sub} ${s} could not be found.`;

export const TpyErrors = [{
  name: 'Internal Server Error',
  message: (s: string) => serverRespondedWith(s),
  description:
    `Sometimes this happens when a request is made with the authorization header but it is invalid.`,
}, {
  name: 'Missing or Unexpected Value in Response',
  message: (s: string) => `Response structure validation failed: ${s}.`,
  description:
    'This has to do with verifying an API response \'s structure. If a given value is missing or has unexpected behavior, this is thrown.',
}, {
  name: 'Missing or Invalid JSON in Request Body',
  message: (s: string) =>
    `With given field(s) ${s} were unsatisfactory; contains invalid JSON.`,
  description:
    `The fetch contents sent were did not have the required JSON body.`,
}, {
  name: 'Guild Could Not be Found',
  message: (s: string) => couldNotBeFound('Guild ID', s),
  description: `The guild specified was not found.`,
}, {
  name: 'Deployment Could Not be Found',
  message: (s: string) => couldNotBeFound('Deployment ID', s),
  description: `The deployment specified was not found.`,
}, {
  name: 'HTTP Method Not Allowed',
  message: (s: string) => serverRespondedWith(s),
  description: 'The HTTP method is not allowed.',
}, {
  name: 'Unidentifiable Error',
  message: (s: string) =>
    `Unidentifiable error caught, deterministic via fields: ${s}`,
  description:
    'The error was unidentifiable, see the raw information via <TpyError>.rawInfo.',
}, {
  name: 'URL Resource Not Found',
  message: (s: string) => serverRespondedWith(s),
  description: 'The URL resource on the web server was not found.',
}, {
  name: 'Unauthorized',
  message: (s: string) => serverRespondedWith(s),
  description: 'Authentication credentials in the request were not populated.',
}, {
  name: 'Forbidden',
  message: (s: string) => serverRespondedWith(s),
  description:
    'Access to the resource with the given authentication credentials is denied.',
}, {
  name: 'Missing or Invalid Required Parameter',
  message: (s: string) =>
    `Required parameter(s) ${s} were not populated or is incompatible.`,
  description:
    'Parameter(s) were not populated where required or are incompatible.',
}] as const;

type ParseTpyErrors<T extends ReadonlyArray<TpyErrorBase>> = {
  [P in keyof T as P extends number ? T[P]['name'] : never]: P extends number
    ? {
      message(context: string): string;
      description: T[P]['description'];
    }
    : never;
};

export const TpyErrorsAsObjects: ParseTpyErrors<typeof TpyErrors> = Object
  .assign(
    {},
    ...TpyErrors.map(
      function (v) {
        return {
          [v.name]: {
            description: v.description,
            message: v.message,
          },
        };
      },
    ),
  );

export function parametersPrompt(
  issue: 'missing' | 'incompatible',
  params: string | string[],
) {
  return `Parameter(s) are ${issue}: ${
    Array.isArray(params) ? params.join(', ') : params
  }`;
}

export function responseBody(s: string) {
  return `Response Body: "${s}"`;
}

export function responseHTTP(s: string) {
  return `Response HTTP status code: ${s}`;
}

export default TpyError;
