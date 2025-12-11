<template>
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar and Nav assumed from Layout -->
        
        <main class="flex-1 flex overflow-hidden">
            <!-- Left: Catalog / Search -->
            <div class="flex-1 flex flex-col p-4 overflow-y-auto">
                <div class="mb-4 bg-white p-4 rounded shadow">
                    <h2 class="text-xl font-bold mb-4">Punto de Venta</h2>
                    <div class="flex gap-4 mb-4 relative">
                        <input v-model="searchQuery" @keyup.enter="searchPatient" type="text" placeholder="Buscar Paciente (DNI/Nombre)" class="flex-1 border p-2 rounded" />
                        <button @click="searchPatient" class="bg-indigo-600 text-white px-4 rounded">Buscar</button>
                        
                        <!-- Search Dropdown -->
                        <div v-if="searchResults.length > 0" class="absolute top-12 left-0 w-full bg-white shadow-lg border rounded flex flex-col z-50 max-h-60 overflow-y-auto">
                            <div v-for="p in searchResults" :key="p.id" @click="selectPatient(p)" class="p-2 hover:bg-indigo-50 cursor-pointer border-b">
                                <p class="font-bold">{{ p.nombres }} {{ p.apellidos }}</p>
                                <p class="text-xs text-gray-500">{{ p.numDoc }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Products/Services Grid (Mocked for now) -->
                <div class="grid grid-cols-3 gap-4">
                    <div v-for="item in catalog" :key="item.id" @click="addToCart(item)" class="bg-white p-4 rounded shadow cursor-pointer hover:bg-indigo-50">
                        <h3 class="font-bold">{{ item.descripcion }}</h3>
                        <p class="text-indigo-600">S/ {{ item.precio.toFixed(2) }}</p>
                    </div>
                </div>
            </div>

            <!-- Right: Cart & Payment -->
            <div class="w-96 bg-white border-l flex flex-col">
                <div class="p-4 bg-gray-50 border-b">
                    <h3 class="font-bold">Cliente</h3>
                    <div v-if="cliente" class="text-sm">
                        <p>{{ cliente.nombres }} {{ cliente.apellidos }}</p>
                        <p class="text-gray-500">{{ cliente.numDoc }}</p>
                    </div>
                    <div v-else class="text-sm text-gray-400 italic">Cliente General / Sin Seleccionar</div>
                </div>

                <div class="flex-1 overflow-y-auto p-4">
                    <div v-for="(item, idx) in cart" :key="idx" class="flex justify-between mb-2 border-b pb-2">
                        <div>
                            <p class="font-medium">{{ item.descripcion }}</p>
                            <p class="text-xs text-gray-500">cant: {{ item.cantidad }}</p>
                        </div>
                        <div class="text-right">
                            <p>S/ {{ (item.precio * item.cantidad).toFixed(2) }}</p>
                            <button @click="removeFromCart(idx)" class="text-red-500 text-xs">x</button>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-gray-100 mt-auto">
                    <div class="flex justify-between text-lg font-bold mb-4">
                        <span>Total:</span>
                        <span>S/ {{ total.toFixed(2) }}</span>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-xs font-bold uppercase text-gray-700">Comprobante</label>
                        <select v-model="tipoComprobante" class="w-full border p-2 rounded">
                            <option value="03">BOLETA</option>
                            <option value="01">FACTURA</option>
                        </select>
                    </div>

                    <div class="mb-4">
                         <label class="block text-xs font-bold uppercase text-gray-700">Pago</label>
                         <select v-model="medioPago" class="w-full border p-2 rounded">
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TARJETA">Tarjeta</option>
                            <option value="YAPE">Yape</option>
                        </select>
                    </div>
                    
                    <button @click="processSale" :disabled="cart.length === 0 || !cajaAbierta" class="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50">
                        COBRAR (F5)
                    </button>
                </div>
            </div>
        </main>
        
        <CashModal :show="showOpenModal" mode="OPEN" @processed="handleOpenBox" />

        <!-- Success/Download Modal -->
        <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded shadow-lg text-center max-w-sm w-full">
                <div class="mb-4 text-green-500">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="text-xl font-bold mb-2">¡Venta Exitosa!</h3>
                <p class="text-gray-600 mb-6">El comprobante se ha generado correctamente.</p>
                
                <div class="space-y-3">
                    <button @click="downloadInvoice" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-bold flex items-center justify-center gap-2">
                        <span>📄</span> Descargar PDF
                    </button>
                    <button @click="closeSuccessModal" class="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50">
                        Nueva Venta
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import CashModal from '~/components/billing/CashModal.vue'

// State
const searchQuery = ref('')
const cliente = ref<any>(null)
const cart = ref<any[]>([])
const tipoComprobante = ref('03')
const medioPago = ref('EFECTIVO')

// Mock Catalog (In real app, fetch from /api/products)
const catalog = [
    { id: '1', descripcion: 'Consulta Médica General', precio: 50.00 },
    { id: '2', descripcion: 'Examen de Colesterol', precio: 25.00 },
    { id: '3', descripcion: 'Rayos X Torax', precio: 80.00 },
    { id: 'P1', descripcion: 'EMO Administrativo', precio: 100.00 },
    { id: 'P2', descripcion: 'EMO Operario', precio: 150.00 }
]

// Cashbox Logic
const cajaAbierta = ref<any>(null) // Object if open, null if closed
const showOpenModal = ref(false)

onMounted(async () => {
    await checkCashStatus()
})

async function checkCashStatus() {
    const { data } = await useFetch<any>('/api/billing/cash/status')
    if (data.value) {
        cajaAbierta.value = data.value
        if (data.value.estado === 'CERRADA') {
            alert('La caja del día ya ha sido cerrada. No se pueden procesar más ventas hoy.')
             // Potentially disable UI
        }
    } else {
        showOpenModal.value = true
    }
}

async function handleOpenBox(amount: number) {
    try {
        const { data } = await useFetch<any>('/api/billing/cash/open', {
            method: 'POST',
            body: { montoApertura: amount }
        })
        cajaAbierta.value = data.value
        showOpenModal.value = false
    } catch (e) {
        alert('Error abriendo caja')
    }
}

// POS Logic
function addToCart(product: any) {
    cart.value.push({ ...product, cantidad: 1 })
}

function removeFromCart(idx: number) {
    cart.value.splice(idx, 1)
}

const total = computed(() => cart.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0))

const searchResults = ref<any[]>([])

async function searchPatient() {
    if (searchQuery.value.length < 3) return
    const { data } = await useFetch<any>('/api/admissions/patients/search', {
        query: { q: searchQuery.value }
    })
    searchResults.value = data.value || []
}

async function selectPatient(p: any) {
    cliente.value = p
    searchResults.value = []
    
    // Fetch debts
    const { data: debts } = await useFetch<any>('/api/billing/pending', {
        query: { patientId: p.id }
    })
    
    if (debts.value && debts.value.length > 0) {
        // Merge with existing cart? Or replace? 
        // POS usually accumulates.
        debts.value.forEach((d: any) => {
            const exists = cart.value.find(c => c.id === d.id && c.tipo === d.tipo)
            if (!exists) {
                cart.value.push(d)
            }
        })
        alert(`Se cargaron ${debts.value.length} items pendientes.`)
    }
}

async function processSale() {
    if (!cliente.value) {
        alert('Seleccione un cliente')
        return
    }

    try {
        // Buscar si hay una Cita en el carrito para vincularla
        const citaItem = cart.value.find(i => i.tipo === 'CITA')
        const citaId = citaItem ? citaItem.id : null

        const payload = {
            citaId, // Send the link!
            tipoComprobante: tipoComprobante.value,
            clienteNombre: `${cliente.value.nombres} ${cliente.value.apellidos}`,
            clienteDoc: cliente.value.numDoc,
            items: cart.value.map(i => ({ 
                descripcion: i.descripcion, 
                cantidad: i.cantidad, 
                precioUnitario: i.precio 
            })),
            pagos: [
                { medioPago: medioPago.value, monto: total.value }
            ],
            cajaId: cajaAbierta.value?.id
        }

        const { data, error } = await useFetch<any>('/api/billing/invoice/create', {
            method: 'POST',
            body: payload
        })
        
        if (error.value) throw error.value

        // SAVE INVOICE ID FOR DOWNLOAD
        lastInvoiceId.value = data.value.id
        showSuccessModal.value = true
        
        // Reset Cart
        cart.value = []
        cliente.value = null
        searchResults.value = []
    } catch (e) {
        alert('Error procesando venta: ' + e)
    }
}

// Success Modal Logic
const lastInvoiceId = ref<string | null>(null)
const showSuccessModal = ref(false)

function closeSuccessModal() {
    showSuccessModal.value = false
    lastInvoiceId.value = null
}

function downloadInvoice() {
    if (!lastInvoiceId.value) return
    window.open(`/api/billing/invoice/${lastInvoiceId.value}/pdf`, '_blank')
}
</script>
