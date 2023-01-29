import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  minify: true,
  minifyWhitespace: true,
  clean: true,
  dts: true,
})
