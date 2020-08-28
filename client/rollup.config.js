import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import minify from 'rollup-plugin-minify-es';
import json from 'rollup-plugin-json';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    resolve(),
    commonjs({ include: 'node_modules/**' }),
    postcss(),
    json(),
    (process.env.NODE_ENV === 'production' && minify())
  ]
};
