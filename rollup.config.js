import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // Version ESM
  {
    input: 'dist/yupee.js',
    output: {
      file: 'dist/yupee.mjs',
      format: 'esm'
    },
    plugins: [nodeResolve(), commonjs()]
  },
  // Version CommonJS
  {
    input: 'dist/yupee.js',
    output: {
      file: 'dist/yupee.cjs',
      format: 'cjs'
    },
    plugins: [nodeResolve(), commonjs()]
  }
];