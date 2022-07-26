<img align="right" width="150" src=".github/assets/pylon.svg">

# tpy

A strongly typed Pylon API client. https://pylon.bot/

[![CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml)

The Pylon API does not have a standardized response, meaning there are alot of
edge cases and can result sometimes in unexpected responses. Tpy aims to resolve
this by providing type safe interaction along with a provided Go-like error
handler. Tpy also provides a predictable interface with documentation on almost
all used endpoints.

```bash
npm install tpy
```

[![](https://shields.io/badge/deno-05122A?logo=deno&style=for-the-badge)](https://deno.land/)
[![](https://shields.io/badge/node.js-05122A?logo=node.js&style=for-the-badge)](https://nodejs.org/)
[![](https://shields.io/badge/typescript-05122A?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)

<!-- DO NOT EDIT, edit in ./_readme.ts -->

```ts
import Tpy, { TpyErrToString } from 'https://deno.land/x/tpy@v0.1.2/mod.ts';
// Or use Node
// import Tpy, { TpyErrToString } from 'tpy';
// 

const client = new Tpy('My.pYl0N_tOKEn');
const [user_err, user] = await client.getUser();

// Tpy has strongly typed error handling so there are no need for type guards.
// If there's an error, the response will return undefined,
// Otherwise, the response will the requested type as expected.
if (user_err) {
  throw `There was an error while fetching the user: ${
    TpyErrToString(user_err)
  }.`;
}
// user is now for sure our expected type, so we can safely access it.
console.log(`User logged in: ${user.displayName}`);

const [ws_err, ws] = await client.connectSocket.fromGuildID('123456789012345');
  <`${bigint | number}`> Deno.env.get('DISCORD_SERVER_ID')!,
);
if (ws_err) {
  throw `There was an error while fetching the guild: ${
    TpyErrToString(ws_err)
  }.`;
}

ws.on('open', (_) => console.log('The Socket has been opened!'));
ws.on('message', (payload) => console.log(payload));
// 

// Integrity: passing
```

## Contributing

Currently, the library is missing some documentation and has some dirty code. If
you'd like to contribute, please read the
[contributing guide](.github/CONTRIBUTING.md) before you start working.

## Legal

Pylon is a copyright (c) of Uplol Inc., all rights reserved to Uplol.

Tpy is licensed under the MIT License.
