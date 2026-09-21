import vue from '@vitejs/plugin-vue';
import { defaultClientConditions, defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

import { sharedTest } from '../../vitest.shared.ts';

export default defineConfig({
  plugins: [vue()],
  resolve: { conditions: ['homebook:source', ...defaultClientConditions] },
  ssr: { resolve: { conditions: ['homebook:source', ...defaultServerConditions] } },
  test: {
    ...sharedTest,
    setupFiles: ['./src/test/setup.ts'],
  },
});
