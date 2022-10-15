# Contributing

Thanks for showing your interest for contributing to Tpy! If you have further
questions on contributing or setup, feel free to contact the author.

Before contributing, ensure that an the appropriate issue has reported (unless
it's very small) and an **active** pull request has not yet picked up the
appropriate issue.

## Setup

You can start a pre-setup remote workspace immediately by opening the project in
GitPod, dismissing this step entirely.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/insyri/tpy)

1. Fork and clone the repository; verify you are on the `main` branch.
2. [Install Deno](https://deno.land/).
3. Code it!
4. If you want to test your changes, you can create a `_playground.*` file and
   optionally a `.env`— both which are Git ignored. Use the `pg` task to run the
   file `_playground.ts` with internet, env, and read permissions. You can
   change the configuration inside the [deno.jsonc](../deno.jsonc) file.
5. Finalize, and document your changes in JSDoc. You can perform formatting
   locally by executing the `precommit` task. This will automatically be done
   via CI through remote pushes.
6. Send in a pull request with a summarized explanation of your changes.

## Node.js

As Tpy is a Deno project, Tpy does not use Deno's built solution
[`dnt`](https://deno.land/x/dnt), instead, Tpy uses a PowerShell Core script
[`node-transform.ps1`](./../node-transform.ps1).

You can use it like this:

```ps1
./node-transform.ps1 -Version vx.x.x
```

Will generate an `npm` folder with contents formatted to ship on npm.
