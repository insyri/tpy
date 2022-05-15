export type numstr = `${number}`;
export type PylonVerbs = 'GET' | 'POST';
export type Unpacked<T> = T extends (infer U)[] ? U : T;
