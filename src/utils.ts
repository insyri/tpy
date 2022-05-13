// export function dotNoationfinder<T>(
//   source: Record<string, unknown>,
//   where: string
// ): T | undefined {
//   if (!where.match(/(.+\..+)+/g)) return;
//   const parts = where.split(".");
//   // Starting at the top level.
//   let level: typeof source = source;
//   for (const part of parts) {
//     if (part in level) level = level[part];
//   }
// }
