<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
      <button @click="openModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Nuevo Usuario
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">{{ user.nombres }} {{ user.apellidos }}</div>
              </div>
              <div class="text-sm text-gray-500">{{ user.dni }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                :class="{
                    'bg-green-100 text-green-800': user.rol === 'ADMINISTRADOR',
                    'bg-blue-100 text-blue-800': user.rol === 'MEDICO',
                    'bg-yellow-100 text-yellow-800': user.rol === 'ADMISION',
                    'bg-gray-100 text-gray-800': user.rol === 'PACIENTE'
                }">
                {{ user.rol }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="user.activo" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Activo
              </span>
              <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                Inactivo
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openModal(user)" class="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
              <button @click="deleteUser(user.id)" class="text-red-600 hover:text-red-900">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h3>
            <form @submit.prevent="saveUser" class="mt-4 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nombres</label>
                  <input v-model="form.nombres" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Apellidos</label>
                  <input v-model="form.apellidos" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="form.email" type="email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
              </div>

              <div>
                 <label class="block text-sm font-medium text-gray-700">DNI</label>
                 <input v-model="form.dni" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Rol</label>
                <select v-model="form.rol" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="ADMISION">ADMISION</option>
                  <option value="MEDICO">MEDICO</option>
                  <option value="LABORATORIO">LABORATORIO</option>
                </select>
              </div>

               <div v-if="!isEditing">
                <label class="block text-sm font-medium text-gray-700">Contraseña</label>
                <input v-model="form.password" type="password" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
              </div>
               <!-- Optional password update for edit -->
               <div v-else>
                <label class="block text-sm font-medium text-gray-700">Nueva Contraseña (Opcional)</label>
                <input v-model="form.password" type="password" placeholder="Dejar en blanco para mantener actual" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
              </div>

               <div class="flex items-center">
                <input v-model="form.activo" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label class="ml-2 block text-sm text-gray-900">Usuario Activo</label>
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
import { ref } from 'vue'

const showModal = ref(false)
const isEditing = ref(false)
const form = ref<any>({
  nombres: '',
  apellidos: '',
  email: '',
  dni: '',
  password: '',
  rol: 'MEDICO',
  activo: true
})
const editingId = ref<string | null>(null)

// 1. Fetch Users (Reactive & Top Level)
const { data: users, refresh, error } = await useFetch<any[]>('/api/admin/users')

// Debug potential errors
if (error.value) {
    console.error('Error loading users:', error.value)
}

// 2. Open Modal
const openModal = (user: any = null) => {
    if (user) {
        isEditing.value = true
        editingId.value = user.id
        form.value = { ...user, password: '' } // Clear pass for edit
    } else {
        isEditing.value = false
        editingId.value = null
        form.value = {
            nombres: '',
            apellidos: '',
            email: '',
            dni: '',
            password: '',
            rol: 'MEDICO',
            activo: true
        }
    }
    showModal.value = true
}

// 3. Close Modal
const closeModal = () => {
    showModal.value = false
}

// 4. Save User (Use $fetch for mutations)
const saveUser = async () => {
    try {
        if (isEditing.value && editingId.value) {
            await $fetch(`/api/admin/users/${editingId.value}`, {
                method: 'PUT',
                body: form.value
            })
        } else {
            await $fetch('/api/admin/users', {
                method: 'POST',
                body: form.value
            })
        }
        await refresh() // Refresh the list
        closeModal()
    } catch (e: any) {
        // Handle Nuxt 3 fetch errors
        const msg = e.response?._data?.statusMessage || e.message || 'Error al guardar usuario'
        alert(msg)
    }
}

// 5. Delete User (Use $fetch for mutations)
const deleteUser = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    try {
        await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
        await refresh() // Refresh the list
    } catch (e: any) {
        const msg = e.response?._data?.statusMessage || e.message || 'Error al eliminar usuario'
        alert(msg)
    }
}
</script>
