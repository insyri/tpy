import { TpyErr } from '../tpy_err.ts';

type numstrWithDefault<T extends number> = `${T | number}`;
type bigintstrWithDefault<T extends bigint> = `${T | bigint}`;

export type StringifiedNumber = `${number | bigint}`;
export type StringifiedNumberWithDefault<T extends bigint | number> = T extends
  bigint ? bigintstrWithDefault<T>
  : T extends number ? numstrWithDefault<T>
  : never;

export type Unpacked<T> = T extends (infer U)[] ? U : T;
export type TpyTup<T> =
  | [TpyErr.NO_ERR, T]
  | [Exclude<TpyErr, TpyErr.NO_ERR>, unknown];
export type MaybeArr<T> = T | T[];
export type SafeObject = Record<string, unknown>;