import { TpyErr } from './tpy_err.ts';

export type numstr = `${number}`;
export type PylonVerbs = 'GET' | 'POST';
export type Unpacked<T> = T extends (infer U)[] ? U : T;
export type TpyTup<T> = [TpyErr.NO_ERR, T] | [
  Exclude<TpyErr, TpyErr.NO_ERR>,
  undefined,
];
export type MaybeArr<T> = T | T[];
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?:
    & Required<Pick<T, K>>
    & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];
