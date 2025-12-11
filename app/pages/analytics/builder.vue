<template>
    <div class="flex flex-col h-full space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">Generador de Reportes</h1>

        <div class="bg-white p-6 rounded shadow space-y-4">
            <h2 class="font-bold text-lg">Configuración del Reporte</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo de Reporte</label>
                    <select v-model="form.reportType" class="w-full border p-2 rounded mt-1">
                        <option value="FACTURAS">Facturas e Ingresos</option>
                        <option value="EXAMENES">Exámenes Realizados</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                    <input v-model="form.startDate" type="date" class="w-full border p-2 rounded mt-1">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Fecha Fin</label>
                    <input v-model="form.endDate" type="date" class="w-full border p-2 rounded mt-1">
                </div>
            </div>

            <div class="flex justify-end pt-4">
                <button @click="downloadReport" :disabled="loading" class="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-green-700 disabled:opacity-50">
                    <span v-if="loading">⏳ Generando...</span>
                    <span v-else>📥 Exportar a Excel</span>
                </button>
            </div>
        </div>

        <!-- Saved Reports List (Future Feature) -->
        <div class="bg-white p-6 rounded shadow flex-1">
            <h2 class="font-bold text-lg mb-4">Reportes Guardados</h2>
            <p class="text-gray-500 italic">No hay reportes personalizados guardados.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
const form = ref({
    reportType: 'FACTURAS',
    startDate: '',
    endDate: ''
})

async function downloadReport() {
    loading.value = true
    try {
        const response: any = await $fetch('/api/analytics/exportar-data', {
            method: 'POST',
            body: {
                reportType: form.value.reportType,
                filters: {
                    fechaInicio: form.value.startDate,
                    fechaFin: form.value.endDate
                }
            },
            responseType: 'blob'
        })

        // Download Blob
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `reporte-${form.value.reportType.toLowerCase()}.xlsx`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (e) {
        alert('Error generando reporte')
        console.error(e)
    } finally {
        loading.value = false
    }
}
</script>
