const decode = (stream: Uint8Array) => new TextDecoder('utf-8').decode(stream);
const encode = (stream: string) => new TextEncoder().encode(stream);

const file = decode(Deno.readFileSync('_readme.ts'));

const new_file: string[] = [];
let skip_next_line = false;

for (const v of file.split('\n')) {
  if (v.includes('// deno-fmt-ignore')) continue;
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

const READMEmd = decode(Deno.readFileSync('README.md'));
Deno.writeFileSync(
  'README.md',
  encode(
    READMEmd.replace(
      /\`\`\`ts\n(.|\n)+\`\`\`/g,
      `\`\`\`ts\n${new_file.join('\n')}\`\`\``,
    ),
  ),
);

const readme_run = Deno.run({
  cmd: ['deno', 'run', '--allow-net', '_readme.ts'],
  stderr: 'piped',
});

if (!(await readme_run.status()).success) {
  throw decode(await readme_run.stderrOutput());
}
