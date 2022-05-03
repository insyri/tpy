<img align="right" width="150" src="https://pylon.bot/docs/img/pylon-icon.svg" />

# tpy

A strongly typed Pylon API client. https://pylon.bot/

[![CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml)

[![](https://shields.io/badge/TypeScript-05122A?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)

```ts
import Tpy from 'tpy';

const client = new Tpy('my_pylon_token');

let guildInfo = await client.getGuildInfo('759174794968301569');
console.log(guildInfo.name);
```
