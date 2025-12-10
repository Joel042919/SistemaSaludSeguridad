// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
    DATABASE_URL: process.env.DATABASE_URL,
    public: {
      // public vars
    }
  },
  css: ['~/assets/css/main.css']
})
