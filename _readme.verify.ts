const file = new TextDecoder('utf-8').decode(Deno.readFileSync('_readme.ts'));

const readme_run = Deno.run({
  cmd: ['deno', 'run', '--allow-net', '_readme.ts'],
  stderr: 'piped',
});

const status = (await readme_run.status()).success;

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

const formatted_readme = new_file.join('\n');

Deno.writeFile('_test.ts', new TextEncoder().encode(formatted_readme));

// find places in the codeblock

// https://stackoverflow.com/a/274094/15325967
function regexIndexOf(string: string, regex: RegExp, startpos = 0) {
  const indexOf = string.substring(startpos).search(regex);
  return (indexOf >= 0) ? (indexOf + startpos) : indexOf;
}

const s = file.match(/```ts\n(.|\n)+```/g);
if (s === null) throw "Can't find codeblock"

const current_codeblock = file.substring(regexIndexOf(file, /```ts\n(.|\n)+```/g), s[0].length);
Deno.writeFile('new.README.md', file.replace(current_codeblock, new TextEncoder().encode(formatted_readme)));

console.log(file.substring(current_codeblock));
// const codeblock_index_start = file.indexOf('```ts\n') + '```ts\n'.length;
// const codeblock_index_end = file.indexOf('```',) - '```'.length;

if (!status) throw new TextDecoder().decode(await readme_run.stderrOutput());
