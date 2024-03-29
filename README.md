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

## CommonJS/ESModule Support

It was considered for Tpy to become an ESModule project for Node.js, however,
many projects are still built on CommonJS, a module system specific to Node.

To combat this, Tpy now ships an `*-esm` version of the package, allowing users
to install the desired module system without downloading the other that will not
be used. For example: `1.0.0-RC-2` ships CommonJS, `1.0.0-RC-2-esm` ships
ESModules.

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
const client = new Tpy({ token: "PYLON_TOKEN" });
const { displayName, id } = await client.getUser();

console.log(`Logged in as ${displayName} (<@${id}>).`);
```

#### Listen to a deployment's console output.

```ts
const client = new Tpy({ token: "PYLON_TOKEN" });
const ws = client.connectSocket(
  await client.getDeploymentIDfromGuild("GUILD_ID")),
);

ws.on("open", (_) => console.log("WebSocket Opened"));
ws.on("error", (_) => _);
// The array matches the console log parameter types.
ws.on<[string, string, number]>(
  "message",
  ({ data }) =>
    console.log(`${data[0]} said "${data[1]}" and sent ${data[2]} attachment(s).`),
);

// Remember this!
await ws.connect();
```

With the following Pylon code:

```ts
discord.on("MESSAGE_CREATE", async (message) => {
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
const client = new Tpy({ token: "PYLON_TOKEN" });
const guildStats = await client.getGuildStats("GUILD_ID");
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
const client = new Tpy({
  token: "PYLON_TOKEN",
  deploymentID: "DEPLOYMENT_ID",
});
const { config } = await client.getDeployment();
const { cronTasks } = config.tasks;
const { events } = config;
const cronTasksFormatted = cronTasks.map(({ cronString, name }) =>
  `    ${name} (${cronString})`
);

console.log(
  `Listening to ${events.length} discord event(s):
  ${events.join(", ")}\n`,
  `Running ${cronTasks.length} cron job(s):\n${cronTasksFormatted.join("\n")}`,
);
```

#### Get the keys in a KV namespace.

```ts
const client = new Tpy({ token: "PYLON_TOKEN" });
const kvnamespace = "tags";
const kv = client.KV(
  kvnamespace,
  await client.getDeploymentIDfromGuild("GUILD_ID"),
);

const keys = await kv.list({ limit: 10 });
const amountOfKeys = await kv.count();

console.log(
  `There are ${amountOfKeys} key(s) within the ${kvnamespace} KV namespace, these are the first 10 (or less).
  ${keys.join(", ")}`,
);
```

#### Get and modify values within a KV namespace.

```ts
const client = new Tpy({ token: "PYLON_TOKEN" });
const kvnamespace = "NAMESPACE";
const kv = client.KV(
  kvnamespace,
  await client.getDeploymentIDfromGuild("GUILD_ID"),
);

const key = "cool_lang";

console.log(`Value of key "${key}":`, await kv.get(key));

await kv.put(key, "rust");
console.log(`Value of key "${key}":`, await kv.get(key));

await kv.delete(key);
console.log(`Value of key "${key}":`, await kv.get(key));
```

#### Increment a key in a KV namespace.

```ts
// This is NOT an atomic mutation.

const client = new Tpy({ token: "PYLON_TOKEN" });
const kvnamespace = "NAMESPACE";
const kv = client.KV(
  kvnamespace,
  await client.getDeploymentIDfromGuild("GUILD_ID"),
);
const upto = 10;

for (let i = 0; i < upto; i++) {
  await kv.transact("counter", (p) => {
    p ||= 0;
    p++;
    return p;
  });
}
```

## Contributing

If you'd like to contribute, please read the
[contributing guide](.github/CONTRIBUTING.md) before you start working. You can
start a pre-setup remote workspace immediately by opening the project in Gitpod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/insyri/tpy)

## Legal

Pylon is a copyright (c) of Uplol Inc., all rights reserved to Uplol.

Tpy is licensed under the MIT License.
