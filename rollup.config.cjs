import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(), 
      commonjs(), 
      typescript({
        exclude: ['**/__tests__/**', '**/*.test.ts', '**/testcases/**']
      })
    ],
    external: ['eslint', '@typescript-eslint/types'],
  },
];
