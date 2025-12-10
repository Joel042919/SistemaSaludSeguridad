<template>
  <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6">Agendar Cita</h1>
    
    <div v-if="patient" class="mb-6 bg-blue-50 p-4 rounded-md">
        <p class="font-bold text-blue-800">Paciente: {{ patient.nombres }} {{ patient.apellidos }}</p>
        <p class="text-sm text-blue-600">DNI: {{ patient.numDoc }}</p>
    </div>

    <form @submit.prevent="scheduleAppointment" class="space-y-6">
        <div>
            <label class="block text-sm font-medium text-gray-700">Protocolo</label>
            <select v-model="form.protocoloId" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                <option :value="null">-- Seleccionar --</option>
                <option v-for="proto in protocols" :key="proto.id" :value="proto.id">
                    {{ proto.nombre }} ({{ proto.empresa.razonSocial }})
                </option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Médico</label>
            <select v-model="form.medicoId" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                <option :value="null">-- Seleccionar --</option>
                <option v-for="doc in doctors" :key="doc.id" :value="doc.medicoPerfil?.id">
                    {{ doc.nombres }} {{ doc.apellidos }} - {{ doc.medicoPerfil?.especialidad }}
                </option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Fecha y Hora</label>
            <input v-model="form.fechaProgramada" type="datetime-local" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea v-model="form.observaciones" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
        </div>

        <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50">
            {{ loading ? 'Agendando...' : 'Confirmar Cita' }}
        </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const patientId = route.query.patientId as string
const patient = ref<any>(null)
const doctors = ref<any[]>([])
const protocols = ref<any[]>([])
const loading = ref(false)

const form = ref({
    pacienteId: patientId,
    medicoId: null,
    protocoloId: null,
    fechaProgramada: '',
    observaciones: ''
})

onMounted(async () => {
    if (!patientId) {
        alert('No patient selected')
        router.push('/admissions')
        return
    }
    
    // Fetch Patient Details first to get Company ID
    try {
        const { data: patData } = await useFetch(`/api/admissions/patients/${patientId}`)
        patient.value = patData.value
    } catch (e) {
        console.error('Error fetching patient', e)
        router.push('/admissions')
        return
    }

    if (!patient.value) {
        alert('Paciente no encontrado')
        router.push('/admissions')
        return
    }

    // Fetch Doctors and Protocols (Filtered)
    const [{ data: docs }, { data: protos }] = await Promise.all([
        useFetch('/api/admissions/doctors'),
        useFetch('/api/admissions/protocols', {
            params: { companyId: patient.value.empresaId }
        })
    ])
    
    doctors.value = (docs.value as any[]) || []
    protocols.value = (protos.value as any[]) || []
})

const scheduleAppointment = async () => {
    loading.value = true
    try {
        await $fetch('/api/admissions/appointments', {
            method: 'POST',
            body: form.value
        })
        alert('Cita agendada correctamente. Notificación enviada.')
        router.push('/admissions/calendar')
    } catch (e: any) {
        const msg = e.response?._data?.statusMessage || e.message || 'Error al agendar cita'
        alert(msg)
    } finally {
        loading.value = false
    }
}
</script>
