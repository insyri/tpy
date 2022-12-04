/**
 * Utility types.
 *
 * @module
 */

/**
 * Extracts objects inside an array (if it is one) and forms a union for each of
 * those elements.
 *
 * @template T The type to be extracted from an array.
 */
export type Unpacked<T> = T extends (infer U)[] ? U : T;

export type Cases = Array<{
  /**
   * Determines if case is applicable; number for HTTP status code, or
   * a function that takes the response object and returns the validity.
   *
   * @param r The {@linkcode Response} object
   */
  case: number | ((r: Response) => Promise<boolean> | boolean);
  /**
   * Function to run if `case` matches the response's HTTP status code or is true.
   */
  fn: () => void | never;
}>;
