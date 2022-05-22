<img align="right" width="150" src="https://pylon.bot/docs/img/pylon-icon.svg" />

# tpy

A strongly typed Pylon API client. https://pylon.bot/

[![CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml)
[![README Integrity](https://github.com/insyri/tpy/actions/workflows/readme.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/readme.yml)
[![CD](https://github.com/insyri/tpy/actions/workflows/cd.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/cd.yml)

[![](https://shields.io/badge/deno-05122A?logo=deno&style=for-the-badge)](https://deno.land/)
[![](https://shields.io/badge/node.js-05122A?logo=node.js&style=for-the-badge)](https://nodejs.org/)
[![](https://shields.io/badge/typescript-05122A?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)

```ts
import Tpy, { TpyErrToString } from 'https://deno.land/x/tpy@0.0.1/mod.ts';
// Or use Node
// import Tpy from 'tpy';

const client = new Tpy('My.pYl0N_tOKEn');
const [err, user] = await client.getUser();

// Tpy has strongly typed error handling so there are no need for type gaurds.
// See type TpyTup for how union types are avoided.
// deno-fmt-ignore
if (err)
  throw `There was an error while fetching the user: ${TpyErrToString(err)}.`;
else console.log(`User logged in: ${user?.displayName}`);
```

## Contributing

Currently, the library is in early development with a list of TODOs. If you'd
like to contribute please read the
[contributing guide](.github/CONTRIBUTING.md).
