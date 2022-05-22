const file = new TextDecoder('utf-8').decode(Deno.readFileSync('_readme.ts'));

const readme_run = Deno.run({
  cmd: ['/home/gitpod/.deno/bin/deno', 'run', '--allow-net', '_readme.ts'],
  stderr: 'piped',
});

const status = (await readme_run.status()).success;

const new_file: string[] = [];
let skip_next_line = false;

for (const v of file.split('\n')) {
  if (v === '// deno-fmt-ignore') continue;
  if (skip_next_line) {
    skip_next_line = false;
    continue;
  }
  if (!v.includes('REPLACE')) {
    new_file.push(v);
    continue;
  }
  const line = (v.match(/^(	|  +)/g) ? '  ' : '') +
    v.substring(
      (v.match(/^(	|  +)/g) ? 2 : 0) + '// '.length,
      v.length - ' // REPLACE'.length,
    );
  new_file.push(line);
  skip_next_line = true;
}

Deno.writeFile('_test.ts', new TextEncoder().encode(new_file.join('\n')));

// find places in the codeblock
// const codeblock_index_start = file.indexOf('```ts') + '```ts'.length;
// const codeblock_index_end = file.indexOf('```',) - '```'.length;

if (!status) throw new TextDecoder().decode(await readme_run.stderrOutput());
