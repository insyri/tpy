<img align="right" width="150" src=".github/assets/pylon.svg">

# tpy

A strongly typed Pylon API client. https://pylon.bot/

[![CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml)

The Pylon API does not have a standardized response, meaning there are alot of
edge cases and can result sometimes in unexpected responses. Tpy aims to resolve
this by providing type safe interaction along with optional specification if you
know what to expect. Tpy also provides a predictable interface with
documentation on almost all used endpoints.

```bash
npm install tpy
```

[![](https://shields.io/badge/deno-05122A?logo=deno&style=for-the-badge)](https://deno.land/)
[![](https://shields.io/badge/node.js-05122A?logo=node.js&style=for-the-badge)](https://nodejs.org/)
[![](https://shields.io/badge/typescript-05122A?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)

```ts
import Tpy, {
  TpyErrToString,
  TypeUtil,
} from 'https://deno.land/x/tpy@v1.0.0/mod.ts';
// Or use Node
// import Tpy, { TpyErrToString, TypeUtil } from 'tpy';

const client = new Tpy('My.pYl0N_tOKEn');
const user = await client.getUser().catch((r) => {
  throw 'There was an error while fetching the user: ' + TpyErrToString(r);
});

console.log(`User logged in: ${user.displayName}`);

const ws = await client.connectSocket.fromGuildID(
  <TypeUtil.StringifiedNumber> '530557949098065930',
).catch((r) => {
  throw 'There was an error while trying to create a WebSocket: ' +
    TpyErrToString(r);
});

// Dynamically finds the workbench URL to connect to.
await ws.connect();

ws.on('open', (_) => console.log('The Socket has been opened!'));

// Messages are recieved on console events.
ws.on('message', (payload) => console.log(payload.data));

// Typing out the message data is also allowed.
// See expansion below this codeblock to see code that can provide this log format.
const MessageLogTypes = ['Create', 'Delete'] as const;
ws.on<[typeof MessageLogTypes[number], string | null]>(
  'message',
  (payload) => {
    const LogType = payload.data[0];
    const Message = payload.data[1];
    console.log(
      `Message Event: ${LogType} -> ${
        Message || '(The message did not have text content)'
      }`,
    );
  },
);
```

<details>
  <summary>Pylon Code</summary>

```ts
const MessageLogTypes = ['Create', 'Delete'];

discord.on(
  'MESSAGE_CREATE',
  async (m) => console.log(MessageLogTypes[0], m.content),
);

discord.on(
  'MESSAGE_DELETE',
  async (_, m) => console.log(MessageLogTypes[1], m!.content),
);
```

</details>

## Contributing

Currently, the library is missing some documentation and has some dirty code. If
you'd like to contribute, please read the
[contributing guide](.github/CONTRIBUTING.md) before you start working.

## Legal

Pylon is a copyright (c) of Uplol Inc., all rights reserved to Uplol.

Tpy is licensed under the MIT License.
