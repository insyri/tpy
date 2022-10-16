<img align="right" width="150" alt="pylon" src="https://raw.githubusercontent.com/insyri/tpy/main/.github/assets/pylon.svg">

# Tpy [![GitHub CI](https://github.com/insyri/tpy/actions/workflows/ci.yml/badge.svg)](https://github.com/insyri/tpy/actions/workflows/ci.yml)

A strongly typed Pylon API client. https://pylon.bot/

[![](https://shields.io/badge/deno.land/x-05122A?logo=deno&style=for-the-badge)](https://deno.land/x/tpy)
[![](https://shields.io/badge/npmjs.com-05122A?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/tpy)

Tpy is a small and simplistic [Deno](https://deno.land/) module that provides an
easier way to interact with the [Pylon](https://pylon.bot/) API. It provides the
following qualities:

- 🧬 Cross runtime support.
- 🔑 Fully typed APIs.
- 🗺 Developer-friendly error interface.
- 📄 Extensive documentation.
- 📞 Keep-alive WebSocket client.

The API documentation can be viewed on the
[Deno website](https://deno.land/x/tpy/mod.ts/).

## Installation

```bash
npm install tpy
yarn add tpy
pnpm add tpy
```

If you would like to use Tpy in the browser, considering
[vendoring dependencies](https://deno.land/manual@v1.26.1/tools/vendor) to
download the type dependencies locally.

## Examples

#### Get the token's matching user.

```ts
const client = new Tpy('PYLON_TOKEN');
const user = await client.getUser();

console.log(`Logged in as ${user.displayName} (<@${user.id}>).`);
```

#### Listen to a deployment's console output.

```ts
const client = new Tpy('PYLON_TOKEN');
const ws = client.connectSocket(
  await client.getDeploymentfromGuild('GUILD_ID')).id,
);

ws.on('open', (_) => console.log('WebSocket Opened'));
ws.on('error', (_) => _);
// The array matches the console log parameter types.
ws.on<[string, string, number]>(
  'message',
  ({ data }) =>
    console.log(`${data[0]} said "${data[1]}" and sent ${data[2]} attachments`),
);

// Remember this!
await ws.connect();
```

With the following Pylon code:

```ts
discord.on('MESSAGE_CREATE', async (message) => {
  console.log(
    // string
    message.author.username,
    // string
    message.content,
    // number
    message.attachments.length,
  );
});
```

<!--

const client = new Tpy(Deno.env.get('PYLON_TOKEN')!);
const guildStats = await client.getGuildStats('759174794968301569');
const mostRecent = guildStats.find((e) =>
  e.date === Math.min(...guildStats.map((e) => e.date))
);
if (!mostRecent) throw '???';
const mostRecentDateFormatted = new Date(mostRecent.date).getMilliseconds();
console.log(mostRecentDateFormatted);

 -->

<!-- TODO: add more examples; ws, kv, post deployment, other get stuff -->

## Contributing

If you'd like to contribute, please read the
[contributing guide](.github/CONTRIBUTING.md) before you start working. You can
start a pre-setup remote workspace immediately by opening the project in GitPod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/insyri/tpy)

## Legal

Pylon is a copyright (c) of Uplol Inc., all rights reserved to Uplol.

Tpy is licensed under the MIT License.
