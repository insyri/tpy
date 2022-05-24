import { build, emptyDir } from 'https://deno.land/x/dnt@0.22.0/mod.ts';

async function npm() {
  if (!(Deno.args[0]) || !(Deno.args[0].match(/v\d\.\d\.\d.+/g))) {
    throw 'arg either undefined or does not match expression';
  }

  await emptyDir('npm');

  await build({
    entryPoints: ['./mod.ts'],
    outDir: './npm',
    package: {
      name: 'tpy',
      version: Deno.args[0],
      description: 'A strongly typed Pylon API client. https://pylon.bot/',
      license: 'MIT',
      keywords: ['pylon', 'pylonbot'],
      repository: {
        type: 'git',
        url: 'git+https://github.com/insyri/tpy.git',
      },
      bugs: {
        url: 'https://github.com/insyri/tpy/issues',
      },
    },
    shims: {
      custom: [
        {
          package: {
            name: 'node-fetch',
            version: '^3.2.4',
          },
          globalNames: [
            {
              name: 'fetch',
              exportName: 'default',
            },
            {
              name: 'RequestInit',
              typeOnly: true,
            },
          ],
        },
        {
          package: {
            name: '@types/node',
            version: '17.0.35',
          },
          globalNames: [],
        },
      ],
    },
  });

  await Deno.copyFile('LICENSE', 'npm/LICENSE');
  await Deno.copyFile('README.md', 'npm/README.md');
}

npm();
