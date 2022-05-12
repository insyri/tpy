<img align="right" width="150" src="https://pylon.bot/docs/img/pylon-icon.svg" />

# tpy

A strongly typed Pylon API client. https://pylon.bot/

[![CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml) [![CD](https://github.com/insyri/tpy/actions/workflows/cd.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/cd.yml)

[![](https://shields.io/badge/deno-05122A?logo=deno&style=for-the-badge)](https://deno.land/) [![](https://shields.io/badge/node.js-05122A?logo=node.js&style=for-the-badge)](https://nodejs.org/) [![](https://shields.io/badge/TypeScript-05122A?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)

<!-- Add Node & Deno-->

```ts
import Tpy from 'tpy';
// Or use Deno (future)
// import Tpy from 'https://deno.land/x/tpy@x.x.x/mod.ts';

const client = new Tpy('my_pylon_token');

let guildInfo = await client.getGuildInfo('759174794968301569');
console.log(guildInfo.name);
```

## Contributing

Currently, the library is in early development with a list of TODOs. If you'd like to contribute please read the [contributing guide](.github/CONTRIBUTING.md).

### Issues
- [Roadmap](https://github.com/insyri/tpy/issues/2)
- [OSS Todo](https://github.com/insyri/tpy/issues/1)

## Project Structure

```
src
├── deno  (deno std fetch)
├── pylon (node-fetch like)
└── node  (npm node-fetch)
```
