<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">Reporte de Caja Diario</h1>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div v-for="res in resumen" :key="res.medio" class="bg-white p-4 rounded shadow">
                <p class="text-gray-500 text-sm uppercase">{{ res.medio }}</p>
                <p class="text-2xl font-bold text-indigo-600">S/ {{ parseFloat(res.total).toFixed(2) }}</p>
            </div>
             <div class="bg-indigo-900 p-4 rounded shadow text-white">
                <p class="text-indigo-200 text-sm uppercase">Total Día</p>
                <p class="text-2xl font-bold">S/ {{ totalDia.toFixed(2) }}</p>
            </div>
        </div>

        <div class="mb-8">
            <h2 class="text-xl font-bold mb-4">Sesiones de Caja (Turnos)</h2>
            <div class="bg-white rounded shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apertura</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cierre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Inicio</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Cierre</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="c in cajas" :key="c.id">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ new Date(c.fechaApertura).toLocaleTimeString() }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ c.fechaCierre ? new Date(c.fechaCierre).toLocaleTimeString() : '-' }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">S/ {{ parseFloat(c.montoApertura).toFixed(2) }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ c.montoCierre ? 'S/ ' + parseFloat(c.montoCierre).toFixed(2) : '-' }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span :class="c.estado === 'ABIERTA' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                    {{ c.estado }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="cajas.length === 0">
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay cajas registradas hoy.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <h2 class="text-xl font-bold mb-4">Detalle de Ingresos (Facturación)</h2>
        <div class="bg-white rounded shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                         <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SUNAT</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="f in movimientos" :key="f.id">
                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ new Date(f.createdAt).toLocaleTimeString() }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ f.serie }}-{{ f.numero }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ f.clienteNombre }}
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ f.usuario.nombres }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                            S/ {{ f.total }}
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {{ f.estadoSunat }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
const resumen = ref<any[]>([])
const movimientos = ref<any[]>([])
const cajas = ref<any[]>([])

const { data, refresh } = await useFetch<any>('/api/billing/report/daily')

if (data.value) {
    resumen.value = data.value.resumen
    movimientos.value = data.value.movimientos
    cajas.value = data.value.cajas
}

const totalDia = computed(() => resumen.value.reduce((acc, curr) => acc + parseFloat(curr.total), 0))
</script>
