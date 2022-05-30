import { TpyErr } from './tpy_err.ts';

export type numstr = `${number}`;
export type RawSnowflake = number;
export type PylonVerbs = 'GET' | 'POST';
export type Unpacked<T> = T extends (infer U)[] ? U : T;
export type TpyTup<T> =
  | [TpyErr.NO_ERR, T]
  | [Exclude<TpyErr, TpyErr.NO_ERR>, unknown];
export type MaybeArr<T> = T | T[];

const DISCORD_EPOCH = 1420070400000;
export const extractSnowFlakeTime = (sf: RawSnowflake): RawSnowflake =>
  (sf >> 22) + DISCORD_EPOCH;
