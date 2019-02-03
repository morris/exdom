import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: {
    file: "dist/exdom.js",
    name: "XD",
    format: "umd",
    sourcemap: true
  },
  plugins: [
    resolve(),
    babel({
      exclude: "node_modules/**"
    })
  ]
};
