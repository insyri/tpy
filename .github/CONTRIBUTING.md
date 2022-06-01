# Contributing

Thanks for showing your interest for contributing to tpy! If you have further
questions on contributing or setup, contact insyri directly on Discord.

Before contributing, ensure that an the appropriate issue has reported (unless
it's very small) and an **active** pull request has not yet picked up the
appropriate issue.

## Setup

1. Fork and clone the repository; verify you are on the `main` branch.
2. Code it!
3. Finalize, and document your changes in JSDoc. You can perform formatting
   locally by executing the `precommit` task.

```bash
deno task precommit
# This will automatically be done via CI through remote pushes.
```

4. Send in a pull request with a summarized explanation of your changes.

## Testing

You can test your changes locally by creating a `_playground.ts` file and
running the `pg` task to run the file.

```bash
deno task pg
```

## Node.js

Tpy uses [`dnt`](https://deno.land/x/dnt) for transforming Deno projects to
Node.js. By doing the following:

```bash
deno task dnt vx.x.x # Script requires bumped version
```

Will generate an `npm` folder with contents formatted to ship on npm.

## Notes

When using the
[Deno VSCode Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno),
it is encouraged to manually disable the
[TypeScript VSCode Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript)
as the language server standards are different and often break each other.
