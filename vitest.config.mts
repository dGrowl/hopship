import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts']
  },
  plugins: [tsconfigPaths()]
})
