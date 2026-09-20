import { defineConfig, mergeConfig } from 'vitest/config';

import { sharedTest } from '../../vitest.shared.ts';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      ...sharedTest,
      setupFiles: ['./src/test/setup.ts'],
    },
  }),
);
