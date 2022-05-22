import { TpyErr } from './tpy_err.ts';

export type numstr = `${number}`;
export type PylonVerbs = 'GET' | 'POST';
export type Unpacked<T> = T extends (infer U)[] ? U : T;
export type TpyTup<T> = [TpyErr.NO_ERR, T] | [
  Exclude<TpyErr, TpyErr.NO_ERR>,
  undefined,
];
export type TpyDefaultMsg = { tpy: string };
export type MaybeArr<T> = T | T[];
