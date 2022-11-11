/**
 * A parameter envoy that provides environmental details.
 *
 * Functions, like building errors, may need additional environmental information to
 * reference details as needed, as these functions could parse and disect whole variables
 * (e.g., URL) to find their required piece. (e.g., resource in URL). However, this introduces
 * code complexity for each kind of value and creating validations for possible invalid or
 * even absent parameters!
 *
 * Instead of relying on the environment, it is turned to the user to rely on forwarding
 * parameter information directly to simplify the process.
 *
 * The {@linkcode Context} class is a parameter forwarder that applies a specific template
 * for other functions to use the information. A great use of this would be provide a `guildID`
 * parameter and pass it on to an error directly without searching for it in the URL. In code,
 * this could look like this:
 *
 * ```ts
 *  async function fetchAndHandleError<T>(ctx: Context, url: string): Promise<T> {
 *   const response = await fetch(url);
 *   if (response.ok) return response.json() as unknown as T;
 *   const text = await response.text();
 *   // Handle other cases...
 *   if (response.status === 404 && text === 'Guild could not be found.') {
 *     if (Context.isNullish(ctx.guildID))
 *       throw 'The guild ID was not populated; could not form error statement.';
 *     throw `The guild ID ${ctx.guildID} could not be found.`;
 *   }
 *   // Default error.
 *   throw 'There was an error, but it could not be identified.';
 * }
 *
 * async function guildName(guildID: StringifiedNumber): Promise<string> {
 *   const response = await fetchAndHandleError<Guild.GET.Guild>(
 *     new Context({ guildID }),
 *     `https://pylon.bot/api/guilds/${guildID}`,
 *   );
 *   return response.name;
 * }
 *
 * const guildID: StringifiedNumber = '0';
 * console.log(await guildName(guildID));
 * ```
 *
 * Here, {@linkcode Context} is leveraged to discover what the `guildID` parameter was
 * without searching through the URL (where, it may possibly return a wrong parsed value,
 * like a regex edge case). It provided environmental parameters directly to eliminate
 * the search of these parameters and validates the parameter was even present.
 *
 * (In essence, this is literally what `Tpy.httpRaw()` does under the hood.)
 *
 * In the case that no context is required for a given function,
 * one can simply instantiate the class like so:
 *
 * ```js
 * new Context({});
 * ```
 *
 * @module
 */

/**
 * Provides parameter context about the current execution environment to provide error reporting
 * data to generate reports that include said information comprised inside the given `Context`.
 *
 * To follow conventions, it is required to pass this as the first argument in functions;
 * `Tpy.httpRaw()`, along with other functions that are built on top of this follow this
 * instruction.
 *
 * *Usually, this is only used as a type annotation and shouldn't be instantiated directly as this
 * is already done internally given that one is not interacting with internal functions.*
 */
export class Context {
  /**
   * A deployment ID.
   */
  deploymentID: string;
  /**
   * A guild ID.
   */
  guildID: string;
  /**
   * A KV namespace title.
   */
  kvnamespace: string;
  /**
   * A key within a KV namespace.
   */
  key: string;

  /**
   * A null context number.
   */
  static nullNumber = '-1';
  /**
   * A null context string.
   */
  static nullString = '<null string>';

  /**
   * Whether the given context matches a nullish context value.
   * @param value The context parameter in question.
   */
  static isNullish(value: string) {
    return value === Context.nullNumber || value === Context.nullString;
  }

  /**
   * @param context Provided context within the environment.
   */
  constructor(context: Partial<Context>) {
    this.deploymentID = context.deploymentID || Context.nullNumber;
    this.guildID = context.guildID || Context.nullNumber;
    this.kvnamespace = context.kvnamespace || Context.nullString;
    this.key = context.key || Context.nullString;
  }
}
