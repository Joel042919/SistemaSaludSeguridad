<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Admisión de Pacientes</h1>

    <!-- Search Box -->
    <div class="max-w-3xl mx-auto mb-10">
      <div class="relative rounded-md shadow-sm">
        <input 
          v-model="searchQuery" 
          @keyup.enter="searchPatients"
          type="text" 
          class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-lg border-gray-300 rounded-md py-4 shadow-lg border" 
          placeholder="Buscar por DNI o Nombres..."
        >
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div class="mt-2 flex justify-center">
         <button @click="searchPatients" class="mr-2 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Buscar</button>
         <NuxtLink to="/admissions/register" class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Registrar Nuevo</NuxtLink>
      </div>
    </div>

    <!-- Results -->
    <div v-if="hasSearched && patients.length === 0" class="text-center py-10">
      <p class="text-xl text-gray-500">No se encontraron pacientes.</p>
      <NuxtLink to="/admissions/register" class="mt-4 inline-block text-indigo-600 font-medium hover:underline">Registrar nuevo paciente &rarr;</NuxtLink>
    </div>

    <div v-if="patients.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="patient in patients" :key="patient.id" class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-100">
        <div class="flex items-center space-x-4 mb-4">
          <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
            {{ patient.nombres.charAt(0) }}{{ patient.apellidos.charAt(0) }}
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ patient.nombres }} {{ patient.apellidos }}</h3>
            <p class="text-sm text-gray-500">{{ patient.tipoDoc }}: {{ patient.numDoc }}</p>
          </div>
        </div>
        
        <div class="text-sm text-gray-600 space-y-1 mb-6">
          <p><span class="font-medium">Empresa:</span> {{ patient.empresa?.razonSocial || 'Particular' }}</p>
          <p><span class="font-medium">Edad:</span> {{ calculateAge(patient.fechaNacimiento) }} años</p>
        </div>

        <button @click="openAppointmentModal(patient)" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
          Nueva Cita
        </button>
      </div>
    </div>

    <!-- Appointment Modal Component (Reuse logic if complex or keep inline) -->
    <!-- Ideally creating a separate page or component for Appointment creation is better -->
    <!-- For now, redirect to appointment page with patient ID could be cleaner -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const patients = ref<any[]>([])
const hasSearched = ref(false)
const router = useRouter()

const searchPatients = async () => {
    if (searchQuery.value.length < 3) return
    hasSearched.value = true
    try {
        const { data } = await useFetch('/api/admissions/patients/search', {
            params: { q: searchQuery.value }
        })
        patients.value = (data.value as any[]) || []
    } catch (e) {
        console.error(e)
    }
}

const calculateAge = (dateString: string) => {
    const birthday = new Date(dateString)
    const ageDifMs = Date.now() - birthday.getTime()
    const ageDate = new Date(ageDifMs)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
}

const openAppointmentModal = (patient: any) => {
    // Redirect to appointment wizard with patient pre-selected
    router.push({ path: '/admissions/appointments/new', query: { patientId: patient.id } })
}
</script>
