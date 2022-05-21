# Contributing

Thanks for showing your interest for contributing to tpy! If you have further
questions on contributing or setup, contact insyri directly on Discord.

Before contributing, ensure that an the appropriate issue has reported (unless
it's very small) and an **active** pull request has not yet picked up the
appropriate issue.

## Setup

1. Fork and clone the repository; verify you are on the `main` branch.
2. Code it!
3. Finalize, format, and document your changes in JSDoc.

```bash
deno task precommit
```

5. Send in a pull request with a summarized explanation of your changes.

### Node.js

Tpy uses [`dnt`](https://deno.land/x/dnt) for transforming Deno projects to
Node.js. By doing the following:

```bash
deno run -A _npm.ts "x.x.x" # Script requires bumped version
```

Will generate an `npm` folder with contents in it ready to ship on npm.

### Notes

When using the
[Deno VSCode Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno),
it is encouraged to manually disable the
[TypeScript VSCode Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript)
as the language server standards are different and often break each other.
