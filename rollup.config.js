import path from "path";
import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

const plugins = [
  resolve(),
  typescript({
    tsconfig: "build.tsconfig.json",
    useTsconfigDeclarationDir: true,
    cacheRoot: "./node_modules/.cache/rpt2",
  }),
];

const external = [];
const umdGlobals = {};

const sourcemapPathTransform = (sourcePath) =>
  path.join("node_modules", pkg.name, "./src", sourcePath);

export default [
  {
    input: "./src/index.ts",
    output: {
      file: "./umd/safity.js",
      format: "umd",
      exports: "named",
      name: "Safity",
      globals: umdGlobals,
    },
    external: Object.keys(umdGlobals),
    plugins: plugins,
  },
  {
    input: "./src/index.ts",
    output: {
      file: "./umd/safity.min.js",
      format: "umd",
      exports: "named",
      name: "Safity",
      globals: umdGlobals,
    },
    external: Object.keys(umdGlobals),
    plugins: [terser(), ...plugins],
  },
  {
    input: {
      interop: "./src/interop.ts",
      maybe: "./src/maybe.ts",
      result: "./src/result.ts",
    },
    output: [
      {
        dir: "module",
        format: "esm",
        exports: "named",
        sourcemap: true,
        sourcemapPathTransform,
      },
      {
        dir: "lib",
        format: "cjs",
        exports: "named",
        sourcemap: true,
        sourcemapPathTransform,
      },
    ],
    plugins,
    external,
  },
];
