import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defaultClientConditions, defaultServerConditions, defineConfig, type ProxyOptions } from 'vite';

import { homebookIconSprites } from '../../packages/ui/vite/index.ts';

// The backend maps its endpoints at the root. nginx strips the /api prefix in production
// (`proxy_pass http://127.0.0.1:5000/;`), the dev proxy has to do the same.
const apiProxy: Record<string, ProxyOptions> = {
  '/api': {
    target: 'http://localhost:5032',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
};

export default defineConfig({
  plugins: [vue(), homebookIconSprites()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    // Workspace packages are consumed from source, no build step in between
    conditions: ['homebook:source', ...defaultClientConditions],
    dedupe: ['vue', 'vue-router', 'pinia', 'vue-i18n', 'primevue'],
  },
  ssr: {
    resolve: { conditions: ['homebook:source', ...defaultServerConditions] },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@homebook/ui/styles/abstracts.scss" as *;\n',
      },
    },
  },
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  build: {
    outDir: 'dist',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vue', test: /node_modules[\\/](vue|@vue|vue-router|pinia|vue-i18n|@intlify)[\\/]/ },
            { name: 'primevue', test: /node_modules[\\/](primevue|@primevue|@primeuix)[\\/]/ },
          ],
        },
      },
    },
  },
});
