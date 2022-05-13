import { build, emptyDir } from "https://deno.land/x/dnt@0.23.0/mod.ts";

await Deno.remove("npm", { recursive: true }).catch((_) =>
  console.error("Failed to remove npm folder")
);

await emptyDir("npm");

await build({
  outDir: "./npm",
  declaration: true,
  packageManager: "npm",
  typeCheck: true,
  scriptModule: false,
  entryPoints: ["mod.ts"],
  package: {
    name: "tpy",
    version: "0.0.1",
    description: "A strongly typed Pylon API client. https://pylon.bot/",
    license: "MIT",
    keywords: ["pylon", "pylonbot"],
    repository: {
      type: "git",
      url: "git+https://github.com/insyri/tpy.git",
    },
    bugs: {
      url: "https://github.com/insyri/tpy/issues",
    },
  },
  shims: {
    custom: [
      {
        package: {
          name: "node-fetch",
          version: "^3.2.4",
        },
        globalNames: [
          {
            name: "fetch",
            exportName: "default",
          },
          {
            name: "RequestInit",
            exportName: "default",
            typeOnly: true,
          },
        ],
      },
      {
        package: {
          name: "@pylonbot/runtime",
          version: "^1.0.0",
        },
        globalNames: [
          {
            name: "pylon",
            exportName: "default",
            typeOnly: false,
          },
        ],
      },
    ],
  },
});

await Deno.copyFile("LICENSE", "npm/LICENSE");
await Deno.copyFile("README.md", "npm/README.md");
