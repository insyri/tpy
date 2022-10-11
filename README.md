<img align="right" width="150" alt="pylon" src="https://raw.githubusercontent.com/insyri/tpy/main/.github/assets/pylon.svg">

# tpy

A strongly typed Pylon API client. https://pylon.bot/

[![GitHub CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml)

[![](https://shields.io/badge/deno.land/x-05122A?logo=deno&style=for-the-badge)](https://deno.land/x/tpy)
[![](https://shields.io/badge/npmjs.com-05122A?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/tpy)

<!-- The Pylon API does not have a standardized response, meaning there are alot of
edge cases and can result sometimes in unexpected responses. Tpy aims to resolve
this by providing type safe interaction along with optional specification if you
know what to expect. Tpy also provides a predictable interface with
documentation on almost all used endpoints. -->

Tpy is a small and simplistic [Deno](https://deno.land/) module that provides an
easier way to interact with the [Pylon](https://pylon.bot/) API. It provides the
following qualities:

- Cross runtime support; browser, Node.js, even the Pylon runtime!
- Only type-dependant; the only dependancies are type-based.
- Made in TypeScript; types everywhere!
- Provides predictable abstractions.
- Built-in error handler.
- WebSocket support.
- Fully documented.

[Documentation can be viewed on the Deno website.](https://deno.land/x/tpy/mod.ts/)

```bash
npm install tpy
yarn add tpy
pnpm add tpy
```

```ts
import Tpy, {
  TpyErrToString,
  TypeUtil,
} from 'https://deno.land/x/tpy@v1.0.0-pre-release/mod.ts';
// Or use Node
// import Tpy, { TpyErrToString, TypeUtil } from 'tpy';

const client = new Tpy('My.pYl0N_tOKEn');
const user = await client.getUser().catch((r) => {
  throw 'There was an error while fetching the user: ' + TpyErrToString(r);
});

console.log(`User logged in: ${user.displayName}`);

const ws = client.connectSocket(
  <TypeUtil.StringifiedNumber> (await client.getGuildInfo('530557949098065930'))
    .deployments[0].id,
);

// Dynamically finds the workbench URL to connect to.
await ws.connect();

ws.on('open', (_) => console.log('The Socket has been opened!'));

// Messages are recieved on console events.
ws.on('message', (payload) => console.log(payload.data));

// Typing out the message data is also allowed.
// See expansion below this codeblock to see code that can provide this log format.
type Attachments = {
  name: string;
  url: string;
}[];

ws.on<[
  string,
  Attachments,
]>(
  'message',
  (payload) => {
    const Content = payload.data[0];
    const Attachments = payload.data[1];
    console.log(
      `New Message: "${Content}"\n`,
      `Attachments:\n`,
      ...Attachments.map((a) => `${a.name} (${a.url})\n`),
    );
  },
);
```

<details>
  <summary>Pylon Code</summary>

```ts
type Attachments = {
  name: string;
  url: string;
}[];

discord.on('MESSAGE_CREATE', async (m) => {
  let attachments: Attachments = m.attachments.map((v) => {
    return { name: v.filename, url: v.proxyUrl };
  });
  console.log(m.content, attachments);
});
```

</details>

## Contributing

If you'd like to contribute, please read the
[contributing guide](.github/CONTRIBUTING.md) before you start working. You can
start a remote workspace immediately by opening the project in GitPod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/insyri/tpy)

## Legal

Pylon is a copyright (c) of Uplol Inc., all rights reserved to Uplol.

Tpy is licensed under the MIT License.
