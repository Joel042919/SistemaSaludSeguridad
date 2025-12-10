import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app"
import { useAuthStore } from "../../stores/auth"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    // Try to hydrate user if missing but cookie exists
    if (!authStore.user) {
        await authStore.fetchUser()
    }

    // If user is logged in and trying to go to login, redirect to home
    if (authStore.isAuthenticated && to.path === '/login') {
        return navigateTo('/')
    }

    // If user is NOT logged in and trying to go elsewhere, redirect to login
    if (!authStore.isAuthenticated && to.path !== '/login') {
        return navigateTo('/login')
    }
})
