import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import url from "@rollup/plugin-url";
import copy from "rollup-plugin-copy";

export default {
  input: "src/main.js",
  output: {
    dir: "dist",
    format: "cjs",
  },
  treeshake: {
    annotations: false,
    moduleSideEffects: false,
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    terser(),
    url({
      include: ["**/*.png", "**/*.html", "**/*.mjs"],
      limit: 2000, // 小于这个大小的文件会被转为 DataURL
      emitFiles: true, // 输出文件到目标目录
    }),
    copy({
      targets: [
        {
          src: "node_modules/node-knife4j/public",
          dest: "dist", // 目标路径
        },
        {
          src: "./run-server.bat",
          dest: "dist",
        },
      ],
    }),
  ],
};
