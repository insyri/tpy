<img align="right" width="150" alt="pylon" src="https://raw.githubusercontent.com/insyri/tpy/main/.github/assets/pylon.svg">

# tpy [![GitHub CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml)

A strongly typed Pylon API client. https://pylon.bot/

[![](https://shields.io/badge/deno.land/x-05122A?logo=deno&style=for-the-badge)](https://deno.land/x/tpy)
[![](https://shields.io/badge/npmjs.com-05122A?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/tpy)

Tpy is a small and simplistic [Deno](https://deno.land/) module that provides an
easier way to interact with the [Pylon](https://pylon.bot/) API. It provides the
following qualities:

- 🧬 Cross runtime support.
- 🔑 Fully Typed APIs.
- 🗺 Custom error interface.
- 📄 Fully documented.
- 📞 WebSocket support.

The API documentation can be viewed on the
[Deno website](https://deno.land/x/tpy/mod.ts/).

```bash
npm install tpy
yarn add tpy
pnpm add tpy
```

## Examples

Get the token's matching user.

```ts
const client = new Tpy('PYLON_TOKEN');

console.log(`Logged in as ${await client.getUser()}.`);
```

<!-- TODO: add more examples; ws, kv, post deployment, other get stuff -->

## Contributing

If you'd like to contribute, please read the
[contributing guide](.github/CONTRIBUTING.md) before you start working. You can
start a remote workspace immediately by opening the project in GitPod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/insyri/tpy)

## Legal

Pylon is a copyright (c) of Uplol Inc., all rights reserved to Uplol.

Tpy is licensed under the MIT License.
