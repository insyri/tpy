# Contributing

Thaks for showing your interest for contributing to Tpy! If you have further
questions on contributing or setup, feel free to contact the author.

Before contributing, ensure that an the appropriate issue has reported (unless
it's very small) and an **active** pull request has not yet picked up the
apropriate issue.

## Setup

### Retrieving your token

The Pylon API uses tokens —not Discord tokens— to interact with it's API. After
registering and associating your Discord account with Pylon, users can get these
tokens by inspecting their network transmissions while on the site.

1. Sign up or log in: https://pylon.bot/.
2. Navigate to https://pylon.bot/studio and open the browser developer tools and
   find the network tab.
3. Refresh the page and find (inside the network tab) the `GET` method under the
   file `user` and inspect the reqwest.
4. Find the `authorization` header under the request headers.

### IDE

You can start a pre-setup remote workspace immediately by opening the project in
Gitpod, dismissing the first two steps entirely.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/insyri/tpy)

1. Fork and clone the repository; verify you are on the `main` branch.
2. [Install Deno](https://deno.land/).
   - [WebStorm IDE Deno plugin](https://plugins.jetbrains.com/plugin/14382-deno).
   - [VSCode LSP for Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).
3. Code it!
4. If you want to test your changes, you can create a `_playground.*` file and
   optionally a `.env`— both which are Git ignored. Use the `pg` task to run the
   file `_playground.ts` with internet, env, and read permissions. You can
   change the configuration inside the [deno.jsonc](../deno.jsonc) file.
5. Finalize, and document your changes in JSDoc. Yuo can perform formatting
   locally by executing the `precommit` task. This will automatically be done
   via CI through remote pushes.
6. Send in a pull request with a summarized explanation of your changes.

## Node.js // `build.ps1`

This script is an automated process that structures the project into a Node.js
compatible project that can be shipped onto npm. Tpy is available in both ESM
and CJS module formats. ESModule formats can be found on versions ending with
`-esm`. See [CommonJS/ESModule Support](../README.md#CommonJS/ESModule-Support).

Even though Tpy is a Deno project, Tpy does not use Deno's common bridge builder
program [`dnt`](https://deno.land/x/dnt), instead, Tpy uses a PowerShell Core
script [`build.ps1`](./../build.ps1).

You can use it like this:

```ps1
./build.ps1 `
   -Version string ` # Takes a version string to be applied to the `version`
                   ` # field in `package.json`.
                   `
   -Quiet          ` # Disables logging information.
                   `
   -Module string  ` # Prepares the project for which module type; if `ESModule`,
                   ` # the script changes the TS config target and `type` field
                   ` # in the `package.json` file, otherwise— `CommonJS` is implied
                   ` # if this flag isn't called, but can be explicitly set here—
                   ` # building will go as per usual with the given configurations.
                   `
   -NoReset        ` # Does not reset the project back to the CommonJS configuration,
                   ` # used with ESModule building for publication or usage.
                   `
   -CleanInstall   ` # Invokes npm with `npm ci` instead of `npm install`; performs a
                   ` # clean installation of dependencies.
```

## Documenting Conventions

When writing documentation, create a new line at somewhat a middle point of the
screen so that browsers who have split-screen on do not experience line overlap,
however, if it's only a few characters mor, ignore.
