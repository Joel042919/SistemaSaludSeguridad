<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-indigo-900 text-white flex flex-col transition-all duration-300">
      <div class="h-16 flex items-center justify-center border-b border-indigo-800">
        <h1 class="text-xl font-bold">Salud Laboral</h1>
      </div>
      
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink to="/" class="block px-4 py-2 hover:bg-indigo-800 transition-colors" active-class="bg-indigo-800">
              Dashboard
            </NuxtLink>
          </li>
          
          <!-- Role Based Links -->
          <li v-if="isAdmin">
            <span class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider block mt-2">
              Administración
            </span>
            <NuxtLink to="/admin/users" class="block px-4 py-2 hover:bg-indigo-800 transition-colors">
              Usuarios
            </NuxtLink>
            <NuxtLink to="/admin/settings" class="block px-4 py-2 hover:bg-indigo-800 transition-colors">
              Configuración
            </NuxtLink>
            <NuxtLink to="/admin/templates" class="block px-4 py-2 hover:bg-indigo-800 transition-colors">
              Plantillas
            </NuxtLink>
          </li>

          <li v-if="isAdmision || isAdmin">
            <span class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Admisión
            </span>
            <NuxtLink to="/admissions/calendar" class="block px-4 py-2 hover:bg-indigo-800 transition-colors">
              Citas & Turnos
            </NuxtLink>
             <NuxtLink to="/admissions" class="block px-4 py-2 hover:bg-indigo-800 transition-colors">
              Pacientes
            </NuxtLink>
          </li>

          <li v-if="isMedico">
            <span class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Médico
            </span>
            <NuxtLink to="/medical" class="block px-4 py-2 hover:bg-indigo-800 transition-colors">
              Dashboard Médico
            </NuxtLink>
          </li>

          <li v-if="isTesoreria || isLogistica">
            <!-- Tesorería -->
            <span v-if="isTesoreria" class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Tesorería
            </span>
            <NuxtLink v-if="isTesoreria || isAdmin" to="/billing/pos" class="block px-4 py-2 hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-800': $route.path === '/billing/pos' }">
              Punto de Venta (POS)
            </NuxtLink>
            <NuxtLink v-if="isTesoreria || isAdmin" to="/billing/daily-report" class="block px-4 py-2 hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-800': $route.path === '/billing/daily-report' }">
              Reporte / Cierre
            </NuxtLink>

            <!-- Logística & Inventario -->
            <span v-if="isLogistica" class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mt-2">
              Logística & Inventario
            </span>
            <NuxtLink v-if="isLogistica || isAdmin" to="/inventory" class="block px-4 py-2 hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-800': $route.path === '/inventory' }">
              Inventario
            </NuxtLink>
            <NuxtLink v-if="isLogistica || isAdmin" to="/logistics/tracking" class="block px-4 py-2 hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-800': $route.path === '/logistics/tracking' }">
              Logística
            </NuxtLink>

            <!-- Analítica -->
            <span v-if="isAdmin" class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mt-2">
              Analítica
            </span>
            <NuxtLink v-if="isAdmin" to="/analytics" class="block px-4 py-2 hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-800': $route.path === '/analytics' }">
              Dashboard
            </NuxtLink>
            <NuxtLink v-if="isAdmin" to="/analytics/builder" class="block px-4 py-2 hover:bg-indigo-800 transition-colors" :class="{ 'bg-indigo-800': $route.path === '/analytics/builder' }">
              Reportes
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-indigo-800">
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                {{ userInitials }}
            </div>
            <div>
                <p class="text-sm font-medium">{{ userName }}</p>
                <p class="text-xs text-indigo-300">{{ userRole }}</p>
            </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white shadow flex items-center justify-between px-6 z-10">
        <div class="flex items-center">
            <!-- Breadcrumbs or Title could go here -->
            <h2 class="text-xl font-semibold text-gray-800">Panel Principal</h2>
        </div>
        
        <div class="flex items-center space-x-4">
          <button @click="logout" class="text-gray-600 hover:text-red-500 transition-colors text-sm font-medium">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const userName = computed(() => {
    if (!authStore.user) return 'Usuario'
    return `${authStore.user.nombres} ${authStore.user.apellidos}`
})

const userRole = computed(() => {
    return authStore.user?.rol || 'Invitado'
})

const userInitials = computed(() => {
    if (!authStore.user || !authStore.user.nombres || !authStore.user.apellidos) return '?'
    return `${authStore.user.nombres.charAt(0)}${authStore.user.apellidos.charAt(0)}`
})

// Role Checks
const isAdmin = computed(() => authStore.user?.rol === 'ADMINISTRADOR')
const isAdmision = computed(() => authStore.user?.rol === 'ADMISION' || authStore.user?.rol === 'ADMINISTRADOR')
const isMedico = computed(() => authStore.user?.rol === 'MEDICO' || authStore.user?.rol === 'ADMINISTRADOR')
const isTesoreria = computed(() => authStore.user?.rol === 'TESORERIA')
const isLogistica = computed(() => authStore.user?.rol === 'LOGISTICA' || authStore.user?.rol === 'ADMINISTRADOR')

const logout = () => {
    authStore.logout()
}
</script>
