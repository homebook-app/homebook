import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      'packages/api-client/src/generated/**',
      // Copied unchanged from the Blazor frontend, stand-alone pages inside an iframe
      'apps/web/public/wallpaper/**',
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/component-api-style': ['error', ['script-setup']],
    },
  },

  {
    files: ['**/*.config.{js,ts}', 'vitest.shared.ts', 'packages/ui/vite/**'],
    languageOptions: { globals: globals.node },
  },

  {
    files: ['**/*.spec.ts', '**/src/test/**', 'packages/test-utils/src/**'],
    languageOptions: { globals: globals.vitest },
  },

  // Formatting is Prettier's job, keep this last
  prettier,
);
