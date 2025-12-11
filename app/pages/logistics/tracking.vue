<template>
    <div class="flex flex-col h-full">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">Seguimiento Logístico de Servicios</h1>
        
        <!-- Stats -->
         <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div v-for="status in statuses" :key="status.key" class="bg-white p-3 rounded shadow text-center border-t-4" :class="status.color">
                <p class="text-gray-500 text-xs font-bold uppercase">{{ status.label }}</p>
                <p class="text-xl font-bold">{{ countByStatus(status.key) }}</p>
            </div>
        </div>

        <!-- Kanban Board -->
        <div class="flex-1 overflow-x-auto">
            <div class="flex gap-4 min-w-max h-full">
                <div v-for="status in statuses" :key="status.key" class="w-80 bg-gray-100 rounded-lg p-4 flex flex-col h-full">
                    <h3 class="font-bold text-gray-700 mb-4 flex justify-between">
                        {{ status.label }}
                        <span class="bg-gray-200 text-gray-600 px-2 rounded-full text-xs py-1">{{ countByStatus(status.key) }}</span>
                    </h3>
                    
                    <div class="flex-1 overflow-y-auto space-y-3">
                         <div v-for="item in getItemsByStatus(status.key)" :key="item.id" class="bg-white p-3 rounded shadow border cursor-pointer hover:shadow-md" @click="selectItem(item)">
                            <div class="flex justify-between items-start mb-2">
                                <span class="font-bold text-indigo-600">#{{ item.cita?.id?.slice(0,6) }}</span>
                                <span class="text-xs text-gray-400">{{ new Date(item.updatedAt).toLocaleTimeString() }}</span>
                            </div>
                            <p class="font-medium text-gray-800 mb-1">{{ item.cita?.paciente?.nombres }} {{ item.cita?.paciente?.apellidos }}</p>
                            <p class="text-xs text-gray-500 mb-2">{{ item.cita?.protocolo?.nombre || 'Particular' }}</p>
                            
                            <div class="flex items-center text-xs text-gray-500">
                                <span class="mr-1">📍</span> {{ item.ubicacionActual || 'N/A' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <div v-if="selectedItem" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                <h2 class="text-xl font-bold mb-4">Actualizar Estado</h2>
                <p class="mb-4 text-gray-700">Paciente: <strong>{{ selectedItem.cita?.paciente?.nombres }} {{ selectedItem.cita?.paciente?.apellidos }}</strong></p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Estado</label>
                        <select v-model="updateForm.estado" class="w-full border p-2 rounded mt-1">
                            <option v-for="s in statuses" :key="s.key" :value="s.key">{{ s.label }}</option>
                        </select>
                    </div>
                    <div>
                         <label class="block text-sm font-medium text-gray-700">Ubicación Actual</label>
                        <input v-model="updateForm.ubicacion" class="w-full border p-2 rounded mt-1">
                    </div>
                    <div>
                         <label class="block text-sm font-medium text-gray-700">Observación</label>
                        <textarea v-model="updateForm.observacion" class="w-full border p-2 rounded mt-1" rows="3"></textarea>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button @click="selectedItem = null" class="text-gray-600">Cerrar</button>
                    <button @click="saveUpdate" class="bg-blue-600 text-white px-4 py-2 rounded">Actualizar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const statuses = [
    { key: 'MUESTRA_TOMADA', label: 'Muestra Tomada', color: 'border-blue-500' },
    { key: 'EN_CAMINO', label: 'En Camino', color: 'border-yellow-500' },
    { key: 'EN_LABORATORIO', label: 'En Laboratorio', color: 'border-purple-500' },
    { key: 'PROCESANDO', label: 'Procesando', color: 'border-orange-500' },
    { key: 'INFORME_DISPONIBLE', label: 'Informe Listo', color: 'border-green-500' }
]

// Mock Data Load (Real implementation needs an endpoint to fetch ALL active trackings)
// For now, let's create a specific endpoint for listing active logistics
const { data, refresh } = await useFetch<any[]>('/api/logistics/active') 

const items = computed(() => data.value || [])

function getItemsByStatus(status: string) {
    return items.value.filter(i => i.estadoActual === status)
}

function countByStatus(status: string) {
    return getItemsByStatus(status).length
}

const selectedItem = ref<any>(null)
const updateForm = ref<any>({})

function selectItem(item: any) {
    selectedItem.value = item
    updateForm.value = {
        estado: item.estadoActual,
        ubicacion: item.ubicacionActual,
        observacion: ''
    }
}

async function saveUpdate() {
    try {
        await $fetch('/api/logistics/update', {
            method: 'POST',
            body: {
                citaId: selectedItem.value.citaId,
                ...updateForm.value
            }
        })
        selectedItem.value = null
        refresh()
    } catch (e) {
        alert('Error actualizando')
    }
}
</script>
