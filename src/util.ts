import type { SafeObject } from './types/util.d.ts';
export const isMissingJsonBody = (res: SafeObject) =>
  'msg' in res && res['msg'] === 'missing json body';

export const isNotAuthorized = (res: SafeObject) =>
  'message' in res && res['message'] === 'not authorized';

export const deploymentNotFound = (res: string) =>
  res === 'could not find deployment';

export const resourceNotFound = (res: string) => res.startsWith('\u26A0\uFE0F');
export const guildNotFound = (res: string) => res === 'could not find guild';
