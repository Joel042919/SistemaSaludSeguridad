<template>
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard Médico</h1>

        <!-- Stats / Filter -->
        <div class="mb-6 flex space-x-4">
            <div class="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                <p class="text-sm text-gray-500">Citas Hoy</p>
                <p class="text-2xl font-bold">{{ appointments?.length || 0 }}</p>
            </div>
        </div>

        <!-- Appointments Table -->
        <div class="bg-white shadow overflow-hidden rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Pacientes Asignados</h3>
                <button @click="() => refresh()" class="text-sm text-indigo-600 hover:text-indigo-900 font-medium">Actualizar</button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocolo</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Atender</span></th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="app in appointments" :key="app.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ new Date(app.fechaProgramada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <img class="h-10 w-10 rounded-full bg-gray-100" :src="app.paciente.fotoUrl || 'https://ui-avatars.com/api/?name='+app.paciente.nombres+'+'+app.paciente.apellidos" alt="">
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">{{ app.paciente.nombres }} {{ app.paciente.apellidos }}</div>
                                        <div class="text-sm text-gray-500">{{ app.paciente.numDoc }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ app.paciente.empresa?.razonSocial || 'N/A' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ app.protocolo?.nombre || 'General' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="getStatusClass(app.estado)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                    {{ app.estado }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <NuxtLink :to="`/medical/history/${app.id}`" class="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-3 py-1 rounded">
                                    Atender
                                </NuxtLink>
                            </td>
                        </tr>
                        <tr v-if="!appointments || appointments.length === 0">
                            <td colspan="6" class="px-6 py-10 text-center text-gray-500 italic">
                                No hay citas programadas para hoy.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Appointment {
    id: string
    fechaProgramada: string
    estado: string
    paciente: {
        nombres: string
        apellidos: string
        numDoc: string
        fotoUrl?: string | null
        empresa?: { razonSocial: string } | null
    }
    protocolo?: { nombre: string } | null
}

const { data: appointments, refresh } = await useFetch<Appointment[]>('/api/medical/appointments')

const getStatusClass = (status: string) => {
    switch (status) {
        case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800'
        case 'EN_ATENCION': return 'bg-blue-100 text-blue-800'
        case 'ATENDIDO': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}
</script>
