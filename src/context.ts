import { StringifiedNumber } from './types/util.d.ts';

export interface IContext {
  deployment: StringifiedNumber;
  guild: StringifiedNumber;
  namespace: string;
  key: string;
}

export default function Context(c: Partial<IContext>): IContext {
  return {
    deployment: c.deployment || '-1',
    guild: c.guild || '-1',
    namespace: '',
    key: '',
  } as IContext;
}

export const emptyContext = Context({});
