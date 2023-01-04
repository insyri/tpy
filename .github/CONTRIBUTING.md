# Contributing

Thanks for showing your interest for contributing to Tpy! If you have further
questions on contributing or setup, feel free to contact the author.

Before contributing, ensure that an the appropriate issue has reported (unless
it's very small) and an **active** pull request has not yet picked up the
appropriate issue.

## Setup

### Retrieving your token

The Pylon API uses tokens —not Discord tokens— to interact with it's API. After
registering and associating your Discord account with Pylon, users can get these
tokens by inspecting their network transmissions while on the site.

1. Sign up or log in: https://pylon.bot/.
2. Navigate to https://pylon.bot/studio and open the browser developer tools and
   find the network tab.
3. Refresh the page and find (inside the network tab) the `GET` method under the
   file `user` and inspect the request.
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
5. Finalize, and document your changes in JSDoc. You can perform formatting
   locally by executing the `precommit` task. This will automatically be done
   via CI through remote pushes.
6. Send in a pull request with a summarized explanation of your changes.

## Node.js

Even though Tpy is a Deno project, Tpy does not use Deno's common bridge builder
program [`dnt`](https://deno.land/x/dnt), instead, Tpy uses a PowerShell Core
script [`build.ps1`](./../build.ps1).

You can use it like this:

```ps1
./build.ps1 -Version vx.x.x # Version parameter is not required.
```

This will generate a `node` folder with contents structured to ship on npm.

## Documenting Conventions

When writing documentation, create a new line at somewhat a middle point of the
screen so that browsers who have split-screen on do not experience line overlap,
however, if it's only a few characters more, ignore.
