# Contributing

Thanks for showing your interest for contributing to Tpy! If you have further
questions on contributing or setup, contact insyri directly on Discord.

Before contributing, ensure that an the appropriate issue has reported (unless
it's very small) and an **active** pull request has not yet picked up the
appropriate issue.

## Setup

1. Fork and clone the repository; verify you are on the `main` branch.
2. Code it!
3. Finalize, and document your changes in JSDoc. You can perform formatting
   locally by executing the `precommit` task. This will automatically be done
   via CI through remote pushes.

```bash
deno task precommit
```

4. Send in a pull request with a summarized explanation of your changes.

## Testing

You can test your changes locally by creating a `_playground.ts` file and
running the `pg` task to run the file.

```bash
deno task pg
```

## Node.js

As Tpy is a Deno project, Tpy does not use Deno's built solution
[`dnt`](https://deno.land/x/dnt), instead, Tpy uses a PowerShell Core script
[`node-transform.ps1`](./../node-transform.ps1).

You can use it like this:

```ps1
./node-transform.ps1 -Version vx.x.x
```

Will generate an `npm` folder with contents formatted to ship on npm.
