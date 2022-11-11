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
