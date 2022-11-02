/**
 * Utility types.
 *
 * @module
 */

/**
 * A string containing numerical values.
 */
export type StringifiedNumber = `${number | bigint}`;

/**
 * Extracts objects inside an array (if it is one) and forms a union for each of
 * those elements.
 *
 * @template T The type to be extracted from an array.
 */
export type Unpacked<T> = T extends (infer U)[] ? U : T;
