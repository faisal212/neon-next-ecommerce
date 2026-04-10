import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.ts'],
    testTimeout: 15000,
    pool: 'forks',
    fileParallelism: false,
    env: { NODE_ENV: 'test' },
    // @neondatabase/auth does an unextensioned `import "next/headers"` that
    // Node's native ESM resolver can't follow. Inlining the package forces it
    // through vite's transformer, which respects Next's package exports.
    server: {
      deps: {
        inline: ['@neondatabase/auth'],
      },
    },
  },
});
