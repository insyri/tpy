# Contributing

Thanks for showing your interest for contributing to tpy! If you have further
questions on contributing or setup, contact insyri directly on Discord.

Before contributing, ensure that an the appropriate issue has reported (unless
it's very small) and an **active** pull request has not yet picked up the
appropriate issue.

## Setup

1. Fork and clone the repository; verify you are on the `main` branch.
2. Code it!
3. Setup a Discord Server for tests and invite the bot. Preferably a new server.
4. Run basic checks.

```ps1
deno check
deno lint
```

6. Test it to ensure offline checks pass.

```ps1
deno test ./tests/ --allow-read -- --offline
```

7. (Optional) Test online tasks.

```ps1
deno test ./tests/ --allow-net --allow-read -- --online
# Or run all
deno test ./tests/ -A -- --both
```

8. Finalize, format, and document your changes in JSDoc.
9. Send in a pull request with a summarized explanation of your changes.

### Node.js

Tpy uses [`dnt`](https://deno.land/x/dnt) for transforming Deno projects to Node.js. By doing the following:

```ps1
deno run -A _npm.ts "x.x.x" # Script requires bumped version
```

Will generate an `npm` folder with contents in it ready to ship on npm.

### Pylon

TODO

### Notes

---

Running tasks with permission flags can be tedious, using the `-A` flag gives all permissions.

```ps1
deno task --allow-write --allow-read --allow-net analyze:online
# Turns into
deno task -A analyze:offline
```

It is encouraged to read through the code every time you grant all permissions to potentially malicous code.

---

When using the [Deno VSCode Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno), it is encouraged to manually disable the [TypeScript VSCode Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript) as the language server standards are different and often break each other.
