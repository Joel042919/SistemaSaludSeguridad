import { navigateTo, useCookie, useFetch } from 'nuxt/app'
import { defineStore } from 'pinia'

interface UserState {
    id: string
    email: string
    nombres: string
    apellidos: string
    rol: string
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as UserState | null,
        token: null as string | null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
        isAdmin: (state) => state.user?.rol === 'ADMINISTRADOR',
    },
    actions: {
        async login(credentials: any) {
            try {
                const { data, error } = await useFetch('/api/auth/login', {
                    method: 'POST',
                    body: credentials,
                })

                if (error.value) {
                    throw new Error(error.value.statusMessage || 'Error al iniciar sesión')
                }

                if (data.value) {
                    const { user, token } = data.value as any
                    this.user = user
                    this.token = token

                    // Manually set cookie client-side if needed for client-side fetches, 
                    // though httpOnly cookie handles server requests.
                    // For Nuxt, useCookie is the way to share state.
                    const authCookie = useCookie('auth_token')
                    authCookie.value = token // Sync cookie state

                    return true
                }
            } catch (err) {
                throw err
            }
        },
        async logout() {
            try {
                await useFetch('/api/auth/logout', { method: 'POST' })
            } catch (e) {
                console.error('Error logging out:', e)
            } finally {
                this.user = null
                this.token = null
                const authCookie = useCookie('auth_token')
                authCookie.value = null
                navigateTo('/login')
            }
        },
        // Initialize store from cookie if present (simple client-side check)
        // For robust hydration, we'd verify token endpoint, but for now we trust the cookie presence on init
        // or rely on middleware to fetch user context if missing.
        // simpler: rely on persisted state or cookie reading.
        async fetchUser() {
            try {
                const { data } = await useFetch('/api/auth/me')
                if (data.value) {
                    // @ts-ignore
                    this.user = data.value.user
                }
            } catch (e) {
                this.user = null
                this.token = null
            }
        }
    },
})
