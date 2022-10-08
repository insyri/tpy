import { StringifiedNumber } from './types/util.d.ts';
// Used for typing annotations
// deno-lint-ignore no-unused-vars
import Tpy from './tpy.ts';

/**
 * Error reporting and other functions may need additional
 * environmental information to execute their procedure as
 * needed, said functions might be able to disect and find
 * this information which would entail jumping through hoops.
 *
 * To fight this issue, one would provide context directly
 * through itself as a parameter to create a more simple
 * practice to dispatch information from one space to the other.
 *
 * The {@linkcode Context} class acts as a standardized
 * construction template of information to provide this information.
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
 * Provides parameter context about the current execution
 * environment to provide error reporting data to generate
 * reports that include said information comprised inside
 * the given `Context`.
 *
 * To follow conventions, it is required to pass this as the
 * first argument in functions; {@linkcode Tpy.httpRaw}, along
 * with other functions that are built on top of this follow this
 * instruction.
 *
 * *Usually, this is only used as a type annotation and shouldn't
 * be instantiated directly as this is already done internally
 * given that one is not interacting with internal functions such,
 * i.e., {@linkcode Tpy.httpRaw}.*
 */
export default class Context {
  /**
   * A deployment ID.
   */
  deploymentID: StringifiedNumber;
  /**
   * A guild ID.
   */
  guildID: StringifiedNumber;
  /**
   * A KV namespace title.
   */
  kvnamespace: string;
  /**
   * A key within a KV namespace.
   */
  key: string;

  /**
   * @param context Provided context within the environment.
   */
  constructor(context: Partial<Context>) {
    this.deploymentID = context.deploymentID || '-1';
    this.guildID = context.guildID || '-1';
    this.kvnamespace = context.kvnamespace || '';
    this.key = context.key || '';
  }
}
