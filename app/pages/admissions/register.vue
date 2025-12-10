<template>
  <div class="max-w-4xl mx-auto py-8">
    <!-- Stepper -->
    <nav aria-label="Progress">
      <ol role="list" class="flex items-center">
        <li v-for="(step, index) in steps" :key="step.name" :class="[index !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative']">
          <div class="flex items-center" v-if="step.status === 'complete'">
             <div class="bg-indigo-600 h-8 w-8 rounded-full flex items-center justify-center">
               <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
             </div>
             <span class="ml-4 text-sm font-medium text-indigo-600">{{ step.name }}</span>
          </div>
          <div class="flex items-center" v-else-if="step.status === 'current'">
             <div class="bg-white border-2 border-indigo-600 h-8 w-8 rounded-full flex items-center justify-center">
                <span class="text-indigo-600 font-bold">{{ index + 1 }}</span>
             </div>
             <span class="ml-4 text-sm font-medium text-indigo-600">{{ step.name }}</span>
          </div>
           <div class="flex items-center" v-else>
             <div class="bg-white border-2 border-gray-300 h-8 w-8 rounded-full flex items-center justify-center">
                <span class="text-gray-500 font-bold">{{ index + 1 }}</span>
             </div>
             <span class="ml-4 text-sm font-medium text-gray-500">{{ step.name }}</span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Form Content -->
    <div class="mt-8 bg-white shadow rounded-lg p-8">
        
        <!-- Step 1: Personal Data -->
        <div v-show="currentStep === 0">
            <h2 class="text-xl font-bold mb-6">Datos Personales</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700">DNI / Documento</label>
                    <input v-model="form.numDoc" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo Doc</label>
                    <select v-model="form.tipoDoc" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="DNI">DNI</option>
                        <option value="CE">CE</option>
                        <option value="PASAPORTE">Pasaporte</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nombres</label>
                    <input v-model="form.nombres" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Apellidos</label>
                    <input v-model="form.apellidos" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Fecha Nacimiento</label>
                    <input v-model="form.fechaNacimiento" type="date" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                     <label class="block text-sm font-medium text-gray-700">Sexo</label>
                     <select v-model="form.sexo" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                     </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input v-model="form.email" type="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input v-model="form.telefono" type="tel" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
            </div>
        </div>

        <!-- Step 2: Company -->
        <div v-show="currentStep === 1">
            <h2 class="text-xl font-bold mb-6">Datos de Empresa</h2>
            
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700">Buscar Empresa (RUC o Nombre)</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                    <input v-model="companySearch" type="text" class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 border p-2 my-2" placeholder="Empresa SAC...">
                    <button @click="searchCompany" type="button" class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none">
                        Buscar
                    </button>
                    <!-- Small Add Button -->
                     <button @click="showCompanyModal = true" type="button" class="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                        + Nueva
                    </button>
                </div>
            </div>

            <!-- Results -->
             <ul v-if="companies.length > 0" class="border border-gray-200 rounded-md divide-y divide-gray-200">
                <li v-for="comp in companies" :key="comp.id" class="pl-3 pr-4 py-3 flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50" @click="selectCompany(comp)">
                    <div class="w-0 flex-1 flex items-center">
                        <span class="font-bold truncate">{{ comp.razonSocial }}</span>
                        <span class="ml-2 text-gray-500">RUC: {{ comp.ruc }}</span>
                    </div>
                    <div v-if="form.empresaId === comp.id" class="ml-4 flex-shrink-0">
                         <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    </div>
                </li>
             </ul>
             <p v-if="selectedCompanyName" class="mt-4 text-green-600 font-bold">Empresa Seleccionada: {{ selectedCompanyName }}</p>
        </div>

        <!-- Step 3: Documents (Placeholders) -->
        <div v-show="currentStep === 2">
             <h2 class="text-xl font-bold mb-6">Documentos (Opcional)</h2>
             
             <!-- Add Document Form -->
             <div class="bg-gray-50 p-4 rounded mb-4">
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                     <div>
                         <label class="block text-sm font-medium">Categoría</label>
                         <select v-model="currentDoc.category" class="w-full border p-2 rounded">
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
                         <input type="file" ref="fileInput" @change="handleFileSelect" class="w-full border p-1 bg-white rounded">
                     </div>
                 </div>
                 <button @click="uploadCurrentDoc" :disabled="!currentFile || isUploading" class="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
                     {{ isUploading ? 'Subiendo...' : 'Subir y Agregar' }}
                 </button>
             </div>

             <!-- List -->
             <h3 class="font-medium text-gray-700 mb-2">Documentos Cargados</h3>
             <ul v-if="form.documentos?.length > 0" class="border rounded divide-y">
                 <li v-for="(doc, idx) in form.documentos" :key="idx" class="p-3 flex justify-between items-center">
                     <div>
                         <span class="font-bold text-sm bg-gray-200 px-2 py-1 rounded mr-2">{{ doc.categoria }}</span>
                         <span class="text-sm text-gray-600">{{ doc.nombreOriginal }}</span>
                     </div>
                     <button @click="removeDoc(idx)" class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                 </li>
             </ul>
             <p v-else class="text-gray-500 italic text-sm">No hay documentos cargados.</p>
        </div>

        <!-- Navigation -->
        <div class="mt-8 flex justify-between">
            <button v-if="currentStep > 0" @click="prevStep" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                Atrás
            </button>
            <div v-else></div>

            <button v-if="currentStep < steps.length - 1" @click="nextStep" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                Siguiente
            </button>
            <button v-else @click="savePatient" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                Finalizar Registro
            </button>
        </div>
    </div>

    <!-- Company Creation Modal -->
    <div v-if="showCompanyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
             <h3 class="text-lg font-bold mb-4">Nueva Empresa</h3>
             <!-- Enforcing standard HTML form submit prevention -->
             <div class="space-y-4">
                 <input v-model="newCompany.ruc" placeholder="RUC" class="w-full border p-2 rounded">
                 <input v-model="newCompany.razonSocial" placeholder="Razón Social" class="w-full border p-2 rounded">
                 <input v-model="newCompany.direccion" placeholder="Dirección" class="w-full border p-2 rounded">
                 
                 <!-- Protocols -->
                 <div class="border-t pt-4">
                     <div class="flex justify-between mb-2">
                         <label class="font-bold text-sm">Protocolos</label>
                         <button type="button" @click="addProtocolRow" class="text-xs text-indigo-600 font-bold">+ Agregar</button>
                     </div>
                     <div class="space-y-2 max-h-40 overflow-y-auto">
                        <div v-for="(p, idx) in newCompany.protocols" :key="idx" class="flex space-x-2">
                            <input v-model="p.nombre" placeholder="Nombre (ej. EMO)" class="flex-1 border p-1 rounded text-sm">
                            <input v-model="p.precioBase" type="number" placeholder="Precio" class="w-20 border p-1 rounded text-sm">
                            <button type="button" @click="removeProtocolRow(idx)" class="text-red-500">&times;</button>
                        </div>
                        <p v-if="!newCompany.protocols || newCompany.protocols.length === 0" class="text-xs text-gray-400 italic">Sin protocolos definidos.</p>
                     </div>
                 </div>
             </div>
             <div class="mt-4 flex justify-end space-x-2">
                 <button type="button" @click="showCompanyModal = false" class="px-4 py-2 border rounded">Cancelar</button>
                 <button type="button" @click="createCompany" class="px-4 py-2 bg-indigo-600 text-white rounded">Guardar</button>
             </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()
// const { uploadFile, error: uploadError } = useFileUpload() // Uncomment when implementing real upload

const steps = ref([
    { name: 'Datos Personales', status: 'current' },
    { name: 'Empresa', status: 'upcoming' },
    { name: 'Documentos', status: 'upcoming' },
])
const currentStep = ref(0)
const form = ref<any>({
    numDoc: '', tipoDoc: 'DNI', nombres: '', apellidos: '',
    fechaNacimiento: '', sexo: 'M', email: '', telefono: '',
    empresaId: null,
    fotoUrl: null
})

// Company Logic
const companySearch = ref('')
const companies = ref<any[]>([])
const showCompanyModal = ref(false)
const selectedCompanyName = ref('')
const newCompany = ref({ ruc: '', razonSocial: '', direccion: '', protocols: [] as any[] })

const addProtocolRow = () => {
    if (!newCompany.value.protocols) newCompany.value.protocols = []
    newCompany.value.protocols.push({ nombre: '', precioBase: 0 })
}

const removeProtocolRow = (idx: number) => {
    newCompany.value.protocols.splice(idx, 1)
}

// File
const uploadedFile = ref<string | null>(null)

// Methods
const nextStep = () => {
    if (currentStep.value < steps.value.length - 1) {
        const current = steps.value[currentStep.value]
        if (current) current.status = 'complete'
        
        currentStep.value++
        
        const next = steps.value[currentStep.value]
        if (next) next.status = 'current'
    }
}

const prevStep = () => {
    if (currentStep.value > 0) {
        const current = steps.value[currentStep.value]
        if (current) current.status = 'upcoming'
        
        currentStep.value--
        
        const prev = steps.value[currentStep.value]
        if (prev) prev.status = 'current'
    }
}

const searchCompany = async () => {
    if(!companySearch.value) return
    const { data } = await useFetch('/api/admissions/companies/search', {
        params: { q: companySearch.value }
    })
    companies.value = (data.value as any[]) || []
}

const selectCompany = (comp: any) => {
    form.value.empresaId = comp.id
    selectedCompanyName.value = comp.razonSocial
}

const createCompany = async () => {
    try {
        const { data } = await useFetch('/api/admissions/companies', {
            method: 'POST',
            body: newCompany.value
        })
        if (data.value) {
            selectCompany(data.value)
            showCompanyModal.value = false
            alert('Empresa creada y seleccionada')
        }
    } catch (e) {
        alert('Error al crear empresa')
    }
}

// File Upload State
const currentDoc = ref({ category: 'DNI' })
const currentFile = ref<File | null>(null)
const isUploading = ref(false)
const fileInput = ref(null)

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        currentFile.value = target.files[0]
    }
}

const uploadCurrentDoc = async () => {
    if (!currentFile.value) return

    isUploading.value = true
    const formData = new FormData()
    formData.append('file', currentFile.value)

    try {
        const { data } = await useFetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        
        if (data.value && (data.value as any).urls && (data.value as any).urls.length > 0) {
            if (!form.value.documentos) form.value.documentos = []
            
            form.value.documentos.push({
                categoria: currentDoc.value.category,
                url: (data.value as any).urls[0],
                nombreOriginal: currentFile.value.name
            })
            
            // Reset
            currentFile.value = null
            // Reset input manually if needed (using ref)
            if(fileInput.value) (fileInput.value as any).value = ''
            alert('Archivo subido')
        }
    } catch (e) {
        console.error(e)
        alert('Error al subir archivo')
    } finally {
        isUploading.value = false
    }
}

const removeDoc = (idx: number) => {
    form.value.documentos.splice(idx, 1)
}

const savePatient = async () => {
    try {
        // Create Patient API (Need to implement or use generic user create?? No, patient is specific)
        // Wait, I missed creating `api/admissions/patients/index.post.ts`. 
        // I will assume it exists or use $fetch to it.
        
        // Actually I need to create that endpoint first or now. 
        // I'll create it in the next step.
        
        const { data } = await useFetch('/api/admissions/patients', {
            method: 'POST',
            body: form.value
        })
        alert('Paciente registrado con éxito')
        router.push('/admissions')
    } catch (e: any) {
        alert(e.statusMessage || 'Error al guardar paciente')
    }
}
</script>
