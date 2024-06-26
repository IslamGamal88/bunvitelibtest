/// <reference types="vite/client" />
/// <reference types="vitest" />
import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // https://github.com/vitejs/vite/issues/1579#issuecomment-1483756199
    libInjectCss(),
    dts({ exclude: ['**/*.stories.ts', 'src/test', '**/*.test.tsx'] }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      // https://rollupjs.org/configuration-options/#input
      input: Object.fromEntries(
        globSync(['src/components/**/index.tsx', 'src/main.ts']).map((file) => {
          const entryName = path.relative(
            'src',
            file.slice(0, file.length - path.extname(file).length)
          )
          const entryUrl = fileURLToPath(new URL(file, import.meta.url))
          return [entryName, entryUrl]
        })
      ),
      output: [
        {
          format: 'es',
          entryFileNames: '[name].es.js',
          assetFileNames: 'assets/[name][extname]',
          globals: {
            react: 'React',
            'react-dom': 'React-dom',
            'react/jsx-runtime': 'react/jsx-runtime',
          },
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs.js',
          assetFileNames: 'assets/[name][extname]',
          globals: {
            react: 'React',
            'react-dom': 'React-dom',
            'react/jsx-runtime': 'react/jsx-runtime',
          },
        },
      ], // Modify this section
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      include: ['src/components'],
      exclude: ['**/*.stories.ts'],
    },
  },
})
