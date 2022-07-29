import { build, emptyDir } from 'https://deno.land/x/dnt@0.25.3/mod.ts';

async function npm() {
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
      // This project uses ws event types, this only exports the default WebSocket.
      // webSocket: true,
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
          typesPackage: {
            name: '@types/ws',
            version: '8.5.3',
          },
          package: {
            name: 'ws',
            version: '8.5',
          },
          globalNames: [
            {
              name: 'WebSocket',
              exportName: 'default',
            },
            {
              name: 'CloseEvent',
              typeOnly: true,
            },
            {
              name: 'Event',
              typeOnly: true,
            },
            {
              name: 'ErrorEvent',
              typeOnly: true,
            },
            {
              name: 'MessageEvent',
              typeOnly: true,
            },
          ],
        },
        // {
        //   package: {
        //     name: '@types/ws',
        //     version: '8.5.3',
        //   },
        //   globalNames: [{
        //     name: 'WebSocket',
        //     exportName: 'default',
        //     typeOnly: true,
        //   }],
        // },
      ],
    },
  });

  await Deno.copyFile('LICENSE', 'npm/LICENSE');
  await Deno.copyFile('README.md', 'npm/README.md');
}

npm();
