import type { ViteUserConfig } from 'vitest/config';

/**
 * Test settings shared by every workspace that tests Vue code.
 * `@homebook/api-client` keeps its own node-based configuration.
 */
export const sharedTest: NonNullable<ViteUserConfig['test']> = {
  environment: 'happy-dom',
  globals: true,
  include: ['src/**/*.spec.ts'],
  coverage: {
    provider: 'v8',
    // lcov is what SonarCloud consumes, do not drop it
    reporter: ['text', 'lcov'],
    reportsDirectory: 'coverage',
    include: ['src/**/*.{ts,vue}'],
    exclude: ['src/**/*.spec.ts', 'src/test/**', 'src/main.ts', 'src/**/*.d.ts'],
  },
};
