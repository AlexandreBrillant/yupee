import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import inject from '@rollup/plugin-inject';

export default [
  // Version ESM
  {
    input: 'dist/yupee.js',
    output: {
      file: 'dist/yupee.mjs',
      format: 'esm',
      exports: 'default'
    },
    plugins: [
      nodeResolve(), 
      commonjs(),
      inject( { $$: '$$' } )
    ]
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