import { TpyErr } from './tpy_err.ts';

export type numstr = `${number}`;
export type bigintstr = `${bigint}`;
export type numstrWithDefault<T extends number> = `${T | number}`;
export type bigintstrWithDefault<T extends bigint> = `${T | bigint}`;
export type RawSnowflake = number;
export type PylonVerbs = 'GET' | 'POST';
export type Unpacked<T> = T extends (infer U)[] ? U : T;
export type TpyTup<T> =
  | [TpyErr.NO_ERR, T]
  | [Exclude<TpyErr, TpyErr.NO_ERR>, unknown];
export type MaybeArr<T> = T | T[];
