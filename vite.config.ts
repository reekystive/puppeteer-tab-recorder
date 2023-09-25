import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// https://vitest.dev/config/
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    testTimeout: 60 * 1000,
    coverage: {
      provider: 'v8',
    },
  },
  plugins: [tsconfigPaths()],
});
