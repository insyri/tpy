// const file = new TextDecoder('utf-8').decode(Deno.readFileSync('_readme.ts'));

const readme_run = Deno.run({
  cmd: ['deno', 'run', '--allow-net', '_readme.ts'],
  stdout: 'piped',
  stderr: 'piped',
});

const status = (await readme_run.status()).success;

console.log(status);

// find places in the codeblock
// const codeblock_index = file.indexOf('```ts');

// if (!status) {
//   Deno.writeFileSync()
// }
