import tailwindcss from "@tailwindcss/vite";
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const piniaEsm = join(dirname(require.resolve('pinia/package.json')), 'dist/pinia.mjs');
// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: {
        pinia: piniaEsm,
      },
    },
  },

  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseTenantId: process.env.FIREBASE_TENANT_ID || '',
      clientId: process.env.CLIENT_ID || '',
    },
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/icon',
    'shadcn-nuxt',
  ],

  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },

  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },
})