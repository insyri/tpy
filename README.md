<picture>
  <source media="(prefers-color-scheme: light)" srcset="./.github/assets/pylon-logo-dark.svg" />
  <img align="right" width="150" src="./github/assets/pylon-logo-light.svg" />
</picture>

# tpy

A strongly typed Pylon API client. https://pylon.bot/

[![CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml)
[![CD](https://github.com/insyri/tpy/actions/workflows/cd.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/cd.yml)

[![](https://shields.io/badge/deno-05122A?logo=deno&style=for-the-badge)](https://deno.land/)
[![](https://shields.io/badge/node.js-05122A?logo=node.js&style=for-the-badge)](https://nodejs.org/)
[![](https://shields.io/badge/typescript-05122A?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)

<!-- DO NOT EDIT, edit in ./_readme.ts -->

```ts
import Tpy from 'https://deno.land/x/tpy@0.0.1/mod.ts';
// Or use Node
// import Tpy from 'tpy';

const client = new Tpy('My.pYl0N_tOKEn');
const [err, user] = await client.getUser();

// Tpy has strongly typed error handling so there are no need for type guards.
// If there's an error, the response will return undefined,
// Otherwise, the response will the requested type as expected.
if (err) {
  throw `There was an error while fetching the user: ${TpyErrToString(err)}.`;
  // user is now !undefined.
} else console.log(`User logged in: ${user.displayName}`);

// README integrity: passing
```

## Contributing

Currently, the library is in early development with a list of TODOs. If you'd
like to contribute please read the
[contributing guide](.github/CONTRIBUTING.md).
