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

## Documentation

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
const { displayName, id } = await client.getUser();

console.log(`Logged in as ${displayName} (<@${id}>).`);
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
    console.log(`${data[0]} said "${data[1]}" and sent ${data[2]} attachment(s).`),
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

#### Get a guild's statistics.

```ts
const client = new Tpy('PYLON_TOKEN');
const guildStats = await client.getGuildStats('GUILD_ID');
const mostRecent = guildStats.find((e) =>
  e.date === Math.min(...guildStats.map((e) => e.date))
)!;
const { date, events, executionMsAvg } = mostRecent;

const mostRecentDateFormatted = new Date(date * 1000).toDateString();
console.log(
  `On ${mostRecentDateFormatted}, there was a total of ${events} events with an average execution time of ${executionMsAvg} (in ms).`,
);
```

#### Get a deployment's listening events and cron tasks.

```ts
const client = new Tpy('PYLON_TOKEN');
const { config } = await client.getDeploymentfromGuild('GUILD_ID');
const { cronTasks } = config.tasks;
const { events } = config;
const cronTasksFormatted = cronTasks.map(({ cronString, name }) =>
  `    ${name} (${cronString})`
);

console.log(
  `Listening to ${events.length} discord event(s):
  ${events.join(', ')}\n`,
  `Running ${cronTasks.length} cron job(s):\n${cronTasksFormatted.join('\n')}`,
);
```

#### Get the keys in a KV namespace.

```ts
const client = new Tpy('PYLON_TOKEN');
const kvnamespace = 'tags';
const kv = client.KV(
  kvnamespace,
  (await client.getDeploymentfromGuild('GUILD_ID')).id,
);

const keys = await kv.list({ limit: 10 });
const amountOfKeys = await kv.count();

console.log(
  `There are ${amountOfKeys} key(s) within the ${kvnamespace} KV namespace, these are the first 10 (or less).
  ${keys.join(', ')}`,
);
```

#### Get and modify values within a KV namespace.

```ts
const client = new Tpy('PYLON_TOKEN');
const kvnamespace = 'NAMESPACE';
const kv = client.KV(
  kvnamespace,
  (await client.getDeploymentfromGuild('GUILD_ID')).id,
);

const key = 'cool_lang';

console.log(`Value of key "${key}":`, await kv.get(key));

await kv.put(key, 'rust');
console.log(`Value of key "${key}":`, await kv.get(key));

await kv.delete(key);
console.log(`Value of key "${key}":`, await kv.get(key));
```

## Contributing

If you'd like to contribute, please read the
[contributing guide](.github/CONTRIBUTING.md) before you start working. You can
start a pre-setup remote workspace immediately by opening the project in GitPod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/insyri/tpy)

## Legal

Pylon is a copyright (c) of Uplol Inc., all rights reserved to Uplol.

Tpy is licensed under the MIT License.
