import { terser } from "rollup-plugin-terser";
import pluginTypescript from "@rollup/plugin-typescript";
import pluginCommonjs from "@rollup/plugin-commonjs";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import * as path from "path";
import pkg from "./package.json";

const moduleName = pkg.name.replace(/^@.*\//, "");
const inputFileName = "src/index.ts";
const author = pkg.author;
const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`;

export default [
  {
    input: inputFileName,
    output: [
      {
        name: `lazyfy`,
        file: 'dist/browser/lazyfy.js',
        format: "iife",
        sourcemap: "inline",
        banner,
      },
      {
        name: `lazyfy`,
        file: 'dist/browser/lazyfy.js'.replace(".js", ".min.js"),
        format: "iife",
        // sourcemap: "inline",
        banner,
        plugins: [terser()],
      },
    ],
    plugins: [
      pluginTypescript({ compilerOptions: { module: 'esnext', target: 'esnext' }}),
      pluginCommonjs({
        extensions: [".js", ".ts"],
      }),
      babel({
        babelHelpers: "bundled",
        configFile: path.resolve(__dirname, ".babelrc.js"),
      }),
      pluginNodeResolve({
        browser: true,
      }),
    ],
  }
];
