// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        },
      ],
    },
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  server: {
    host: 'localhost', // default
    port: 3001         // ← pick any free port
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    // …other modules
  ],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    viewer:   false, // disable the visual config preview if you like
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  }


})
