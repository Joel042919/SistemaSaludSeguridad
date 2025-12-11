<template>
    <div class="flex flex-col h-full space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">Panel de Analítica</h1>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4" v-if="kpis">
            <div class="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                <p class="text-gray-500 text-sm">Pacientes Hoy</p>
                <p class="text-3xl font-bold">{{ kpis.pacientesHoy }}</p>
            </div>
            <div class="bg-white p-4 rounded shadow border-l-4 border-green-500">
                <p class="text-gray-500 text-sm">Ingresos Mes</p>
                <p class="text-3xl font-bold">S/ {{ parseFloat(kpis.ingresosMes).toFixed(2) }}</p>
            </div>
            <div class="bg-white p-4 rounded shadow border-l-4 border-red-500">
                <p class="text-gray-500 text-sm">Stock Crítico</p>
                <p class="text-3xl font-bold">{{ kpis.stockCritico }}</p>
            </div>
            <div class="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                <p class="text-gray-500 text-sm">Pendientes Lab.</p>
                <p class="text-3xl font-bold">{{ kpis.pendientesLaboratorio }}</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
                <button @click="currentTab = 'GENERAL'" :class="currentTab === 'GENERAL' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Resumen General
                </button>
                <button v-if="canViewMedical" @click="currentTab = 'MEDICO'" :class="currentTab === 'MEDICO' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Salud Ocupacional
                </button>
                <button v-if="canViewFinancial" @click="currentTab = 'FINANCIERO'" :class="currentTab === 'FINANCIERO' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Financiero
                </button>
            </nav>
        </div>

        <!-- Content -->
        <div class="bg-white p-6 rounded shadow flex-1 overflow-y-auto">
            
            <!-- GENERAL TAB -->
            <div v-if="currentTab === 'GENERAL'">
                <p class="text-gray-500">Seleccione una pestaña específica para ver más detalles.</p>
                <div class="mt-4 p-4 bg-blue-50 rounded">
                    <h3 class="font-bold">Bienvenido al Módulo de Analítica</h3>
                    <p>Aquí podrá visualizar el rendimiento operativo, médico y financiero de la clínica.</p>
                </div>
            </div>

            <!-- MEDICO TAB -->
            <div v-if="currentTab === 'MEDICO' && medicalStats">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="font-bold mb-4">Distribución de Aptitudes</h3>
                        <div class="h-64 bg-gray-50 flex items-center justify-center border rounded">
                            <!-- CHART PLACEHOLDER: Aptitudes -->
                            <p class="text-xs text-gray-400">Gráfico de Aptitudes (Doughnut)</p>
                            <ul>
                                <li v-for="s in medicalStats.aptitudes" :key="s.status">{{ s.status }}: {{ s.count }}</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold mb-4">Top 5 Exámenes Realizados</h3>
                        <ul>
                            <li v-for="e in medicalStats.topExams" :key="e.name" class="flex justify-between py-2 border-b">
                                <span>{{ e.name }}</span>
                                <span class="font-bold">{{ e.count }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- FINANCIERO TAB -->
            <div v-if="currentTab === 'FINANCIERO' && financialStats">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="font-bold mb-4">Ingresos por Cliente (Top 10)</h3>
                        <ul>
                            <li v-for="c in financialStats.topClients" :key="c.name" class="flex justify-between py-2 border-b">
                                <span>{{ c.name || 'Sin Nombre' }}</span>
                                <span class="font-bold">S/ {{ c.total.toFixed(2) }}</span>
                            </li>
                        </ul>
                    </div>
                     <div>
                        <h3 class="font-bold mb-4">Tendencia de Ingresos (30 días)</h3>
                         <div class="h-64 bg-gray-50 flex items-center justify-center border rounded">
                            <!-- CHART PLACEHOLDER: Line Chart -->
                            <p class="text-xs text-gray-400">Gráfico de Línea (Ingresos)</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~~/stores/auth'

const currentTab = ref('GENERAL')
const { user } = useAuthStore() // Assuming auto-import store

const canViewMedical = computed(() => user?.rol === 'ADMINISTRADOR' || user?.rol === 'MEDICO')
const canViewFinancial = computed(() => user?.rol === 'ADMINISTRADOR' || user?.rol === 'TESORERIA')

// Fetch KPIs
const { data: kpis } = await useFetch<any>('/api/analytics/kpi-dashboard')

// Fetch Specific Stats (Lazy load could be better, but simple is fine)
const { data: medicalStats } = canViewMedical.value ? await useFetch<any>('/api/analytics/salud-ocupacional') : { data: ref(null) }
const { data: financialStats } = canViewFinancial.value ? await useFetch<any>('/api/analytics/financiero') : { data: ref(null) }

</script>
