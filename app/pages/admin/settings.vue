<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Configuración de la Clínica</h2>
    
    <div class="bg-white shadow rounded-lg p-6">
      <form @submit.prevent="saveConfig" class="space-y-6">
        
        <!-- General Info -->
        <div>
            <h3 class="text-lg font-medium text-gray-900 border-b pb-2">Información General</h3>
            <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-4">
                    <label class="block text-sm font-medium text-gray-700">Nombre de la Clínica</label>
                     <div class="mt-1">
                        <input v-model="form.nombreClinica" type="text" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2">
                    </div>
                </div>

                <div class="sm:col-span-3">
                    <label class="block text-sm font-medium text-gray-700">RUC</label>
                    <div class="mt-1">
                        <input v-model="form.ruc" type="text" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2">
                    </div>
                </div>

                <div class="sm:col-span-6">
                    <label class="block text-sm font-medium text-gray-700">Dirección</label>
                    <div class="mt-1">
                        <input v-model="form.direccion" type="text" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2">
                    </div>
                </div>

                <div class="sm:col-span-6">
                    <label class="block text-sm font-medium text-gray-700">Logo URL</label>
                     <div class="mt-1">
                        <input v-model="form.logoUrl" type="text" placeholder="https://..." class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2">
                    </div>
                </div>
            </div>
        </div>

        <!-- Integration Info -->
        <div class="pt-6">
            <h3 class="text-lg font-medium text-gray-900 border-b pb-2">Integraciones (SUNAT/API)</h3>
            <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                 <div class="sm:col-span-3">
                    <label class="block text-sm font-medium text-gray-700">Usuario API Sunat</label>
                    <div class="mt-1">
                        <input v-model="form.apiSunatUser" type="text" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2">
                    </div>
                </div>
                 <div class="sm:col-span-3">
                    <label class="block text-sm font-medium text-gray-700">Clave API Sunat</label>
                    <div class="mt-1">
                         <input v-model="form.apiSunatPass" type="password" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2">
                    </div>
                </div>
            </div>
        </div>
        
        <div class="pt-5">
            <div class="flex justify-end">
                <button type="submit" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Guardar Configuración
                </button>
            </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const form = ref<any>({
    nombreClinica: '',
    ruc: '',
    direccion: '',
    logoUrl: '',
    apiSunatUser: '',
    apiSunatPass: ''
})

const fetchConfig = async () => {
    try {
        const { data } = await useFetch('/api/admin/config')
        if (data.value && Object.keys(data.value).length > 0) {
            form.value = data.value
        }
    } catch (e) {
        console.error('Error fetching config', e)
    }
}

const saveConfig = async () => {
    try {
        await useFetch('/api/admin/config', {
            method: 'POST',
            body: form.value
        })
        alert('Configuración guardada correctamente')
    } catch (e) {
        alert('Error al guardar configuración')
    }
}

onMounted(() => {
    fetchConfig()
})
</script>
