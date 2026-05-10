import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['tests/e2e/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/index.js',
        'src/loaders/menuHandler.js'
      ]
    }
  }
});
