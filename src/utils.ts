import TpyErr from "./tpy_err.d.ts";

export type numstr = `${number}`;
export type PylonVerbs = 'GET' | 'POST';
export type Unpacked<T> = T extends (infer U)[] ? U : T;
export type TpyExpectType<T> = [T, TpyErr];