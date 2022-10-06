import { StringifiedNumber } from './types/util.d.ts';

/**
 * Provides parameter context about the current execution
 * environment to provide error reporting data to
 * generate reports that include said information
 * comprised inside the given `Context`.
 *
 * To follow conventions, it is required to pass a `Context`
 * parameter as the first argument in functions including it;
 * {@linkcode Tpy#httpRaw} along with other functions that
 * are built on top of this follow this instruction.
 *
 * *Usually, this is only used as a type annotation and shouldn't
 * be instantiated directly as this is already done internally.*
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
   * @param c Provided context within the environment.
   */
  constructor(c: Partial<Context>) {
    this.deploymentID = c.deploymentID || '-1';
    this.guildID = c.guildID || '-1';
    this.kvnamespace = c.kvnamespace || '';
    this.key = c.key || '';
  }
}
