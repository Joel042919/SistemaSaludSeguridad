<template>
  <div class="min-h-screen bg-gray-100">
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
    
    <div v-else-if="error" class="max-w-7xl mx-auto py-8">
        <div class="bg-red-50 border-l-4 border-red-400 p-4">
            <p class="text-red-700">Error al cargar historia clínica : {{ error.message }}</p>
        </div>
    </div>

    <div v-else-if="history" class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="bg-white shadow rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <img class="h-24 w-24 rounded-full bg-gray-100" :src="history.paciente.fotoUrl || 'https://ui-avatars.com/api/?name='+history.paciente.nombres+'+'+history.paciente.apellidos" alt="">
            <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-900">{{ history.paciente.nombres }} {{ history.paciente.apellidos }}</h1>
                <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p><span class="font-bold">DNI:</span> {{ history.paciente.numDoc }}</p>
                    <p><span class="font-bold">Edad:</span> {{ calculateAge(history.paciente.fechaNacimiento) }} años</p>
                    <p><span class="font-bold">Empresa:</span> {{ history.paciente.empresa?.razonSocial || 'N/A' }}</p>
                    <p><span class="font-bold">Protocolo:</span> {{ history.cita?.protocolo?.nombre || 'General' }}</p>
                </div>
            </div>
            <div class="flex flex-col space-y-2 text-right">
                 <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium justify-center" :class="history.cita?.estado === 'ATENDIDO' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                     {{ history.cita?.estado }}
                 </span>
                 
                <div v-if="history.concepto" class="border rounded-lg bg-gray-50 overflow-hidden">
                    <div class="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex justify-between items-center">
                        <h3 class="font-bold text-indigo-700">Concepto de Aptitud Vigente</h3>
                        <a :href="history.concepto.pdfGenerado" target="_blank" class="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Descargar PDF
                        </a>
                    </div>
                    <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-bold">Dictamen</p>
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mt-1" :class="{
                                'bg-green-100 text-green-800': history.concepto.aptitud === 'APTO',
                                'bg-yellow-100 text-yellow-800': history.concepto.aptitud === 'APTO_CON_RESTRICCIONES',
                                'bg-red-100 text-red-800': history.concepto.aptitud === 'NO_APTO'
                            }">
                                {{ history.concepto.aptitud.replace(/_/g, ' ') }}
                            </span>

                            <div v-if="history.concepto.restricciones" class="mt-3">
                                <p class="text-xs text-gray-500 uppercase font-bold">Restricciones</p>
                                <p class="text-sm text-gray-700">{{ history.concepto.restricciones }}</p>
                            </div>
                             <div v-if="history.concepto.recomendaciones" class="mt-3">
                                <p class="text-xs text-gray-500 uppercase font-bold">Recomendaciones</p>
                                <p class="text-sm text-gray-700">{{ history.concepto.recomendaciones }}</p>
                            </div>
                        </div>
                        <div class="border-l pl-4 flex flex-col justify-end items-center">
                             <div v-if="history.concepto.firmaImagenUrl" class="mb-2">
                                 <img :src="history.concepto.firmaImagenUrl" alt="Firma Doctor" class="h-20 object-contain mx-auto">
                             </div>
                             <p class="text-xs text-gray-400">Firma del Médico Ocupacional</p>
                             <p class="text-sm font-medium">{{ history.cita?.medico?.usuario?.nombres }} {{ history.cita?.medico?.usuario?.apellidos }}</p>
                        </div>
                    </div>
                 </div>
                 <div v-else class="text-right">
                     <NuxtLink :to="`/medical/concept/${history.cita.id}`" class="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                         Emitir Concepto
                     </NuxtLink>
                 </div>
            </div>
        </div>

        <!-- Labs / Tabs -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex">
                    <button v-for="tab in tabs" :key="tab.name"
                        @click="currentTab = tab.name"
                        :class="[currentTab === tab.name ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm']">
                        {{ tab.label }}
                    </button>
                </nav>
            </div>

            <div class="p-6">
                <!-- Tab 1: Anamnesis -->
                <div v-show="currentTab === 'anamnesis'">
                    <form @submit.prevent="saveAnamnesis" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Antecedentes Laborales</label>
                            <textarea v-model="form.antecedentesLaborales" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Antecedentes Patológicos</label>
                            <textarea v-model="form.antecedentesPatologicos" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                        </div>
                         <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                             <div>
                                <label class="block text-sm font-medium text-gray-700">Alergias</label>
                                <input v-model="form.alergias" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                             </div>
                             <div>
                                <label class="block text-sm font-medium text-gray-700">Hábitos Nocivos</label>
                                <input v-model="form.habitosNocivos" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                             </div>
                         </div>
                         <div class="flex justify-end">
                             <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Guardar Cambios</button>
                         </div>
                    </form>
                </div>

                <!-- Tab 2: Exámenes -->
                <div v-show="currentTab === 'exams'">
                    <div class="mb-4 flex justify-between items-center">
                        <h3 class="text-lg font-medium">Exámenes Realizados</h3>
                        <div class="space-x-2">
                            <button @click="showOrderModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">Solicitar a Laboratorio</button>
                            <button @click="showExamModal = true" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">Registrar Resultado (Directo)</button>
                        </div>
                    </div>
                    
                    <ul v-if="history.examenes && history.examenes.length > 0" class="divide-y divide-gray-200">
                        <li v-for="exam in history.examenes" :key="exam.id" class="py-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-bold text-indigo-600">{{ exam.tipoExamen }}</p>
                                    <p class="text-xs text-gray-500">{{ new Date(exam.createdAt).toLocaleString() }}</p>
                                    <p class="mt-1 text-sm text-gray-700">{{ exam.conclusiones || (exam.estado === 'PENDIENTE' ? 'Esperando resultados...' : 'Sin conclusiones') }}</p>
                                    <p v-if="exam.observaciones" class="text-xs text-gray-500 italic mt-1">Obs: {{ exam.observaciones }}</p>
                                </div>
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                    :class="exam.estado === 'COMPLETADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                                    {{ exam.estado }}
                                </span>
                            </div>
                        </li>
                    </ul>
                    <p v-else class="text-gray-500 italic">No hay exámenes registrados.</p>
                </div>

                <!-- Tab 3: Archivos -->
                <div v-show="currentTab === 'files'">
                    <div class="bg-gray-50 p-4 rounded mb-6">
                        <h4 class="font-bold text-sm mb-2">Subir Nuevo Archivo</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                             <div>
                                 <label class="block text-sm font-medium">Categoría</label>
                                 <select v-model="uploadCategory" class="w-full border p-2 rounded text-sm">
                                     <option value="DNI">DNI</option>
                                     <option value="EXAMEN_PRE">Examen Pre-Ocupacional</option>
                                     <option value="EXAMEN_MEDICO">Examen Médico</option>
                                     <option value="RADIOGRAFIA">Radiografía</option>
                                     <option value="CERTIFICADO">Certificado</option>
                                     <option value="OTROS">Otros</option>
                                 </select>
                             </div>
                             <div class="col-span-2">
                                 <label class="block text-sm font-medium">Archivo</label>
                                 <div class="flex space-x-2">
                                     <input type="file" @change="handleFileSelect" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                                     <button @click="uploadFile" :disabled="!selectedFile || isUploading" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
                                         {{ isUploading ? 'Subiendo...' : 'Subir' }}
                                     </button>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <h3 class="font-medium text-gray-700 mb-4">Documentos del Paciente</h3>
                    <ul v-if="history.paciente.documentos && history.paciente.documentos.length > 0" class="border rounded divide-y bg-white">
                        <li v-for="(doc, idx) in history.paciente.documentos" :key="idx" class="p-4 flex justify-between items-center hover:bg-gray-50">
                            <div class="flex items-center space-x-3">
                                <span class="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">{{ doc.categoria }}</span>
                                <div class="flex flex-col">
                                    <a :href="doc.url" target="_blank" class="text-indigo-600 font-medium hover:underline text-sm">{{ doc.nombreOriginal }}</a>
                                    <span class="text-xs text-gray-400">Clic para ver</span>
                                </div>
                            </div>
                            <button @click="deleteDocument(idx)" class="text-red-500 hover:text-red-700 text-sm font-medium">Eliminar</button>
                        </li>
                    </ul>
                    <p v-else class="text-gray-500 italic text-center py-4">No hay documentos registrados.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal for New Exam (Placeholder for component) -->
    <div v-if="showExamModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 class="text-lg font-bold mb-4">Registrar Examen</h3>
            <!-- Exam Form Component Selector would go here -->
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium">Tipo Examen</label>
                    <select v-model="newExam.tipoExamen" class="w-full border p-2 rounded">
                        <option value="AUDIOMETRIA">Audiometría</option>
                        <option value="OPTOMETRIA">Optometría</option>
                        <option value="MEDICO_GENERAL">Médico General</option>
                    </select>
                </div>
                <div>
                     <label class="block text-sm font-medium">Conclusiones</label>
                     <textarea v-model="newExam.conclusiones" class="w-full border p-2 rounded" rows="3"></textarea>
                </div>
            <!-- Dynamic inputs -->
            <component 
                :is="getExamComponent(newExam.tipoExamen)" 
                v-model="newExam.resultados" 
            />
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
                <button @click="showExamModal = false" class="px-4 py-2 border rounded">Cancelar</button>
                <button @click="saveExam" class="px-4 py-2 bg-indigo-600 text-white rounded">Guardar</button>
            </div>
        </div>
    </div>

    <!-- Modal for Ordering Exam -->
    <div v-if="showOrderModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 class="text-lg font-bold mb-4">Solicitar Examen a Laboratorio</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium">Tipo Examen</label>
                    <select v-model="orderForm.tipoExamen" class="w-full border p-2 rounded">
                        <option value="AUDIOMETRIA">Audiometría</option>
                        <option value="ESPIROMETRIA">Espirometría</option>
                        <option value="OPTOMETRIA">Optometría</option>
                        <option value="PSICOLOGIA">Psicología</option>
                        <option value="LABORATORIO_CLINICO">Laboratorio Clínico</option>
                        <option value="RAYOS_X">Rayos X</option>
                         <option value="IMAGENOLOGIA">Imagenología</option>
                        <option value="MEDICO_GENERAL">Médico General</option>
                        <option value="MUSCULO_ESQUELETICO">Músculo Esquelético</option>
                         <option value="ODONTOLOGIA">Odontología</option>
                    </select>
                </div>
                <div>
                     <label class="block text-sm font-medium">Indicaciones / Observaciones</label>
                     <textarea v-model="orderForm.observaciones" class="w-full border p-2 rounded" rows="3" placeholder="Ej: Énfasis en audiometría tonal..."></textarea>
                </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
                <button @click="showOrderModal = false" class="px-4 py-2 border rounded">Cancelar</button>
                <button @click="orderExam" :disabled="ordering" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {{ ordering ? 'Enviando...' : 'Solicitar' }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AudiometryForm from '~/components/medical/exams/AudiometryForm.vue'
import OptometryForm from '~/components/medical/exams/OptometryForm.vue'

const route = useRoute()
const citaId = route.params.citaId as string

interface HistoryData {
    id: string
    antecedentesLaborales: string
    antecedentesPatologicos: string
    alergias: string
    habitosNocivos: string
    paciente: {
        id: string
        nombres: string
        apellidos: string
        numDoc: string
        fotoUrl: string | null
        fechaNacimiento: string
        empresa?: { razonSocial: string } | null
        documentos?: Array<{ categoria: string; url: string; nombreOriginal: string }>
    }
    cita: {
        id: string
        estado: string
        protocolo?: { nombre: string } | null
        medico?: {
            usuario: {
                nombres: string
                apellidos: string
            }
        }
    }
    examenes: Array<{
        id: string
        tipoExamen: string
        createdAt: string
        conclusiones: string
        estado: string
        observaciones?: string
    }>
    concepto?: {
        aptitud: string
        pdfGenerado: string
        restricciones?: string
        recomendaciones?: string
        firmaImagenUrl?: string
    }
}

const { data: history, pending, error, refresh } = await useFetch<HistoryData>(`/api/medical/history/${citaId}`)

const tabs = [
    { name: 'anamnesis', label: 'Anamnesis' },
    { name: 'exams', label: 'Exámenes' },
    { name: 'files', label: 'Archivos' }
]
const currentTab = ref('anamnesis')

// Wrapper to get component
const getExamComponent = (type: string) => {
    switch(type) {
        case 'AUDIOMETRIA': return AudiometryForm
        case 'OPTOMETRIA': return OptometryForm
        default: return null
    }
}

// Anamnesis Form
const form = ref({
    antecedentesLaborales: '',
    antecedentesPatologicos: '',
    alergias: '',
    habitosNocivos: ''
})

// Populate form when data loads
watchEffect(() => {
    if (history.value) {
        form.value.antecedentesLaborales = history.value.antecedentesLaborales || ''
        form.value.antecedentesPatologicos = history.value.antecedentesPatologicos || ''
        form.value.alergias = history.value.alergias || ''
        form.value.habitosNocivos = history.value.habitosNocivos || ''
    }
})

const calculateAge = (dateString: string) => {
    if(!dateString) return '?'
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const saveAnamnesis = async () => {
    if (!history.value) return
    try {
        await $fetch(`/api/medical/history/${history.value.id}`, {
            method: 'PUT',
            body: form.value
        })
        alert('Anamnesis actualizada')
        refresh()
    } catch (e) {
        alert('Error al guardar')
    }
}

// Exam Logic
const showExamModal = ref(false)
const newExam = ref({
    tipoExamen: 'MEDICO_GENERAL',
    conclusiones: '',
    resultados: {}
})

const saveExam = async () => {
    if (!history.value) return
    try {
        await $fetch('/api/medical/exam', {
            method: 'POST',
            body: {
                historiaId: history.value.id,
                ...newExam.value
            }
        })
        showExamModal.value = false
        newExam.value = { tipoExamen: 'MEDICO_GENERAL', conclusiones: '', resultados: {} }
        refresh() // Reload list
        alert('Examen registrado')
    } catch (e) {
        alert('Error al guardar examen')
    }
}

// File Upload Logic
const uploadCategory = ref('OTROS')
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        selectedFile.value = target.files[0]
    }
}

const uploadFile = async () => {
    if (!selectedFile.value || !history.value) return

    isUploading.value = true
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    try {
        // 1. Upload file itself
        const { urls } = await $fetch<{ urls: string[] }>('/api/upload', {
            method: 'POST',
            body: formData
        })

        if (urls && urls.length > 0) {
            const fileUrl = urls[0]
            
            // 2. Add to patient record
            await $fetch(`/api/medical/patient/${history.value.paciente.id}/documents`, {
                method: 'POST',
                body: {
                    categoria: uploadCategory.value,
                    url: fileUrl,
                    nombreOriginal: selectedFile.value!.name
                }
            })

            alert('Archivo subido correctamente')
            selectedFile.value = null
            refresh()
        }
    } catch (e) {
        console.error(e)
        alert('Error al subir archivo')
    } finally {
        isUploading.value = false
    }
}

const deleteDocument = async (index: number) => {
    if(!history.value || !confirm('¿Estás seguro de eliminar este documento?')) return

    try {
        await $fetch(`/api/medical/patient/${history.value.paciente.id}/documents`, {
            method: 'DELETE',
            body: { index }
        })
        refresh()
    } catch (e) {
        alert('Error al eliminar documento')
    }
}

// Order Logic
const showOrderModal = ref(false)
const ordering = ref(false)
const orderForm = ref({
    tipoExamen: 'LABORATORIO_CLINICO',
    observaciones: ''
})

const orderExam = async () => {
    if (!history.value) return
    ordering.value = true
    try {
        await $fetch('/api/medical/exams/order', {
            method: 'POST',
            body: {
                historiaId: history.value.id,
                tipoExamen: orderForm.value.tipoExamen,
                observaciones: orderForm.value.observaciones
            }
        })
        showOrderModal.value = false
        orderForm.value.observaciones = ''
        alert('Solicitud enviada a Laboratorio')
        refresh()
    } catch (e) {
        alert('Error al solicitar examen')
    } finally {
        ordering.value = false
    }
}
</script>
