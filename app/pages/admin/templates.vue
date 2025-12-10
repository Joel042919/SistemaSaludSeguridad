<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Gestión de Plantillas</h2>
      <button @click="openModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Nueva Plantilla
      </button>
    </div>

    <!-- Templates List -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="template in templates" :key="template.id" class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
                 <div class="flex justify-between items-start">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">{{ template.titulo }}</h3>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {{ template.tipo }}
                    </span>
                 </div>
                 <div class="mt-2 text-sm text-gray-500 truncate">
                    {{ template.contenido.substring(0, 100) }}...
                 </div>
                 <div v-if="template.rutaArchivo" class="mt-2 text-xs text-gray-400">
                    Archivo: {{ template.rutaArchivo }}
                 </div>
            </div>
            <div class="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-3">
                <button @click="openModal(template)" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Editar</button>
                <button @click="deleteTemplate(template.id)" class="text-red-600 hover:text-red-900 text-sm font-medium">Eliminar</button>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ isEditing ? 'Editar Plantilla' : 'Nueva Plantilla' }}
            </h3>
            <form @submit.prevent="saveTemplate" class="mt-4 space-y-4">
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Título</label>
                <input v-model="form.titulo" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo</label>
                <select v-model="form.tipo" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
                  <option value="CONSENTIMIENTO">CONSENTIMIENTO</option>
                  <option value="INFORME">INFORME</option>
                  <option value="RECETA">RECETA</option>
                  <option value="CERTIFICADO">CERTIFICADO</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Contenido (Texto)</label>
                <textarea v-model="form.contenido" rows="5" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Ruta Archivo (Opcional)</label>
                <input v-model="form.rutaArchivo" type="text" placeholder="/files/plantillas/ejemplo.pdf" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
              </div>

              <div class="flex items-center">
                <input v-model="form.activo" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label class="ml-2 block text-sm text-gray-900">Activa</label>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm">
                  Guardar
                </button>
                <button @click="closeModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const templates = ref<any[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const form = ref<any>({})
const editingId = ref<string | null>(null)

// Fetch
const fetchTemplates = async () => {
    try {
        const { data } = await useFetch('/api/admin/templates')
        if (data.value) {
            templates.value = data.value
        }
    } catch (e) {
        console.error('Error fetching templates', e)
    }
}

// Modal
const openModal = (template: any = null) => {
    if (template) {
        isEditing.value = true
        editingId.value = template.id
        form.value = { ...template }
    } else {
        isEditing.value = false
        editingId.value = null
        form.value = {
            titulo: '',
            contenido: '',
            tipo: 'GENERAL',
            rutaArchivo: '',
            activo: true
        }
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

// Save
const saveTemplate = async () => {
    try {
        if (isEditing.value && editingId.value) {
            await useFetch(`/api/admin/templates/${editingId.value}`, {
                method: 'PUT',
                body: form.value
            })
        } else {
            await useFetch('/api/admin/templates', {
                method: 'POST',
                body: form.value
            })
        }
        await fetchTemplates()
        closeModal()
    } catch (e: any) {
        alert(e.statusMessage || 'Error al guardar plantilla')
    }
}

// Delete
const deleteTemplate = async (id: string) => {
    if (!confirm('¿Eliminar plantilla?')) return
    try {
        await useFetch(`/api/admin/templates/${id}`, { method: 'DELETE' })
        await fetchTemplates()
    } catch (e) {
        alert('Error al eliminar')
    }
}

onMounted(() => {
    fetchTemplates()
})
</script>
