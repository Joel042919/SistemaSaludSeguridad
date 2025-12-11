<template>
    <div class="flex flex-col h-full space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">Laboratorio - Gestión de Exámenes</h1>
        <!-- DEBUG INFO -->
        <div v-if="true" class="bg-yellow-100 p-2 text-xs font-mono">
             User Role: {{ authStore.user?.rol || 'No User' }} | Exams Count: {{ pendingExams?.length || 0 }}
        </div>

        <!-- Pending List -->
        <div class="bg-white rounded shadow overflow-hidden flex-1 overflow-y-auto">
            <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 class="font-bold text-lg text-gray-700">Exámenes Pendientes</h2>
                <button @click="refresh()" class="text-indigo-600 hover:text-indigo-900 text-sm">Actualizar</button>
            </div>

            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Examen</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitado Por</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="exam in pendingExams" :key="exam.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ new Date(exam.createdAt).toLocaleString() }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ exam.historia.paciente.nombres }} {{ exam.historia.paciente.apellidos }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{{ exam.tipoExamen }}</td>
                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ exam.medico?.usuario?.nombres || 'Sistema' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button @click="openProcessModal(exam)" class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Procesar</button>
                        </td>
                    </tr>
                    <tr v-if="!pendingExams || pendingExams.length === 0">
                        <td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay exámenes pendientes.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Process Modal -->
        <div v-if="selectedExam" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 class="text-xl font-bold mb-4">Procesar Examen: {{ selectedExam.tipoExamen }}</h2>
                <div class="mb-4 text-sm text-gray-600 border-b pb-2">
                    <p><strong>Paciente:</strong> {{ selectedExam.historia.paciente.nombres }} {{ selectedExam.historia.paciente.apellidos }}</p>
                    <p><strong>Indicaciones:</strong> {{ selectedExam.observaciones || 'Ninguna' }}</p>
                </div>
                
                <div class="space-y-4">
                    <!-- Dynamic Form based on Exam Type could go here. For now, generic JSON editor or Fields -->
                    
                    <div v-if="selectedExam.tipoExamen === 'AUDIOMETRIA'" class="grid grid-cols-2 gap-4">
                        <div class="col-span-2 font-bold text-gray-700 border-b">Oído Derecho</div>
                         <input v-model="resultsForm.od_500" placeholder="500Hz (dB)" type="number" class="border p-2 rounded">
                         <input v-model="resultsForm.od_1000" placeholder="1000Hz (dB)" type="number" class="border p-2 rounded">
                         <input v-model="resultsForm.od_2000" placeholder="2000Hz (dB)" type="number" class="border p-2 rounded">
                         <input v-model="resultsForm.od_3000" placeholder="3000Hz (dB)" type="number" class="border p-2 rounded">

                         <div class="col-span-2 font-bold text-gray-700 border-b mt-2">Oído Izquierdo</div>
                         <input v-model="resultsForm.oi_500" placeholder="500Hz (dB)" type="number" class="border p-2 rounded">
                         <input v-model="resultsForm.oi_1000" placeholder="1000Hz (dB)" type="number" class="border p-2 rounded">
                         <input v-model="resultsForm.oi_2000" placeholder="2000Hz (dB)" type="number" class="border p-2 rounded">
                         <input v-model="resultsForm.oi_3000" placeholder="3000Hz (dB)" type="number" class="border p-2 rounded">
                    </div>

                    <div v-else-if="selectedExam.tipoExamen === 'ESPIROMETRIA'" class="grid grid-cols-2 gap-4">
                         <input v-model="resultsForm.fvc" placeholder="FVC (%)" type="number" class="border p-2 rounded">
                         <input v-model="resultsForm.fev1" placeholder="FEV1 (%)" type="number" class="border p-2 rounded">
                         <input v-model="resultsForm.ratio" placeholder="FEV1/FVC" type="number" class="border p-2 rounded">
                    </div>

                    <div v-else>
                         <textarea v-model="resultsForm.generic_result" rows="5" class="w-full border p-2 rounded" placeholder="Ingrese resultados detallados..."></textarea>
                    </div>

                    <div>
                         <label class="block text-sm font-medium text-gray-700">Conclusiones</label>
                        <textarea v-model="conclusions" rows="3" class="w-full border p-2 rounded mt-1"></textarea>
                    </div>

                     <!-- File Upload Placeholder -->
                     <div class="border-2 border-dashed border-gray-300 p-4 text-center rounded">
                         <p class="text-gray-500 text-sm">Subir Archivos (PDF/IMG) - Próximamente</p>
                     </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button @click="selectedExam = null" class="text-gray-600">Cancelar</button>
                    <button @click="submitResults" class="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">
                        {{ submitting ? 'Guardando...' : 'Finalizar y Guardar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~~/stores/auth'
const authStore = useAuthStore()
// const { $auth } = useNuxtApp() // Removed unused variable causing TS issues if untyped

const { data: pendingExams, refresh } = await useFetch<any[]>('/api/laboratory/pending')

const selectedExam = ref<any>(null)
const resultsForm = ref<any>({})
const conclusions = ref('')
const submitting = ref(false)

function openProcessModal(exam: any) {
    selectedExam.value = exam
    resultsForm.value = {}
    conclusions.value = ''
}

async function submitResults() {
    if(!confirm('¿Confirmar resultados? El examen pasará a estado COMPLETADO.')) return

    submitting.value = true
    try {
        await $fetch('/api/laboratory/result', {
            method: 'POST',
            body: {
                id: selectedExam.value.id,
                resultados: resultsForm.value,
                conclusiones: conclusions.value,
                archivosUrl: [] 
            }
        })
        selectedExam.value = null
        refresh()
        alert('Examen procesado correctamente')
    } catch (e) {
        alert('Error guardando resultados')
        console.error(e)
    } finally {
        submitting.value = false
    }
}
</script>
