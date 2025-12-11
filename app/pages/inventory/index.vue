<template>
    <div class="flex flex-col h-full">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">Gestión de Inventario</h1>
        
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                <p class="text-gray-500">Total Ítems</p>
                <p class="text-2xl font-bold">{{ items.length }}</p>
            </div>
            <div class="bg-white p-4 rounded shadow border-l-4 border-green-500">
                <p class="text-gray-500">Valor Inventario</p>
                <p class="text-2xl font-bold">S/ {{ totalValue.toFixed(2) }}</p>
            </div>
            <div class="bg-white p-4 rounded shadow border-l-4 border-red-500">
                <p class="text-gray-500">Stock Crítico</p>
                <p class="text-2xl font-bold">{{ criticalStockCount }}</p>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between mb-4">
            <div class="flex gap-2">
                <input v-model="search" type="text" placeholder="Buscar..." class="border p-2 rounded w-64">
                <select v-model="categoryFilter" class="border p-2 rounded">
                    <option value="TODOS">Todas las Categorías</option>
                    <option value="MEDICAMENTO">Medicamento</option>
                    <option value="INSUMO">Insumo</option>
                    <option value="REACTIVO">Reactivo</option>
                </select>
            </div>
            <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded">Nuevo Ítem</button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded shadow overflow-hidden flex-1 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Prom.</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in filteredItems" :key="item.id">
                        <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.codigo }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ item.nombre }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.categoria }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold">{{ item.stockActual }} {{ item.unidadMedida }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">S/ {{ Number(item.costoPromedio).toFixed(2) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span v-if="Number(item.stockActual) <= Number(item.stockMinimo)" class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Crítico</span>
                            <span v-else class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Adecuado</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button @click="openModal(item)" class="text-indigo-600 hover:text-indigo-900 mr-2">Editar</button>
                            <button @click="openMovementModal(item)" class="text-green-600 hover:text-green-900">Movimiento</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Item -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Editar Item' : 'Nuevo Item' }}</h2>
                <div class="space-y-4">
                    <input v-model="form.codigo" placeholder="Código / SKU" class="w-full border p-2 rounded">
                    <input v-model="form.nombre" placeholder="Nombre del Producto" class="w-full border p-2 rounded">
                    <select v-model="form.categoria" class="w-full border p-2 rounded">
                        <option value="MEDICAMENTO">MEDICAMENTO</option>
                        <option value="INSUMO">INSUMO</option>
                        <option value="EPP">EPP</option>
                        <option value="REACTIVO">REACTIVO</option>
                    </select>
                    <input v-model="form.unidadMedida" placeholder="Unidad (UNIDAD, CAJA)" class="w-full border p-2 rounded">
                    <div class="flex gap-2">
                        <input v-model.number="form.stockMinimo" type="number" placeholder="Stock Mínimo" class="w-1/2 border p-2 rounded">
                        <input v-model.number="form.stockMaximo" type="number" placeholder="Stock Máximo" class="w-1/2 border p-2 rounded">
                    </div>
                    <input v-model.number="form.precioVenta" type="number" placeholder="Precio Venta (Opcional)" class="w-full border p-2 rounded">
                    <input v-model="form.ubicacion" placeholder="Ubicación (Estante)" class="w-full border p-2 rounded">
                </div>
                <div class="flex justify-end gap-2 mt-6">
                    <button @click="showModal = false" class="text-gray-600">Cancelar</button>
                    <button @click="saveItem" class="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
                </div>
            </div>
        </div>
        
        <!-- Modal Movimiento -->
        <div v-if="showMovementModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 class="text-xl font-bold mb-4">Registrar Movimiento: {{ selectedItem?.nombre }}</h2>
                <div class="space-y-4">
                    <select v-model="moveForm.tipo" class="w-full border p-2 rounded font-bold">
                        <option value="INGRESO">INGRESO (Compra)</option>
                        <option value="SALIDA">SALIDA (Consumo/Venta)</option>
                    </select>
                    <input v-model.number="moveForm.cantidad" type="number" placeholder="Cantidad" class="w-full border p-2 rounded">
                    <div v-if="moveForm.tipo === 'INGRESO'">
                        <input v-model.number="moveForm.costoUnitario" type="number" placeholder="Costo Unitario (S/)" class="w-full border p-2 rounded">
                        <input v-model="moveForm.lote" placeholder="Lote" class="w-full border p-2 rounded mt-2">
                        <input v-model="moveForm.fechaVencimiento" type="date" placeholder="Vencimiento" class="w-full border p-2 rounded mt-2">
                    </div>
                    <input v-model="moveForm.motivo" placeholder="Motivo / Referencia" class="w-full border p-2 rounded">
                </div>
                <div class="flex justify-end gap-2 mt-6">
                    <button @click="showMovementModal = false" class="text-gray-600">Cancelar</button>
                    <button @click="saveMovement" class="bg-green-600 text-white px-4 py-2 rounded">Registrar</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const items = ref<any[]>([])
const search = ref('')
const categoryFilter = ref('TODOS')
const showModal = ref(false)
const showMovementModal = ref(false)
const isEditing = ref(false)
const selectedItem = ref<any>(null)

const form = ref<any>({
    id: null, codigo: '', nombre: '', categoria: 'MEDICAMENTO', unidadMedida: 'UNIDAD',
    stockMinimo: 0, stockMaximo: 0, precioVenta: 0, ubicacion: ''
})

const moveForm = ref<any>({
    tipo: 'INGRESO', cantidad: 0, costoUnitario: 0, motivo: '', lote: '', fechaVencimiento: null
})

// Fetch Data
const { data, refresh } = await useFetch<any[]>('/api/inventory/items')
if (data.value) items.value = data.value

// Computed
const filteredItems = computed(() => {
    return items.value.filter(i => {
        const matchesSearch = i.nombre.toLowerCase().includes(search.value.toLowerCase()) || i.codigo.toLowerCase().includes(search.value.toLowerCase())
        const matchesCat = categoryFilter.value === 'TODOS' || i.categoria === categoryFilter.value
        return matchesSearch && matchesCat
    })
})

const totalValue = computed(() => items.value.reduce((sum, i) => sum + (Number(i.stockActual) * Number(i.costoPromedio)), 0))
const criticalStockCount = computed(() => items.value.filter(i => Number(i.stockActual) <= Number(i.stockMinimo)).length)

// Actions
function openModal(item: any = null) {
    if (item) {
        isEditing.value = true
        form.value = { ...item }
    } else {
        isEditing.value = false
        form.value = { categoria: 'MEDICAMENTO', unidadMedida: 'UNIDAD' }
    }
    showModal.value = true
}

async function saveItem() {
    try {
        await $fetch('/api/inventory/items/save', { method: 'POST', body: form.value })
        showModal.value = false
        refresh()
    } catch (e) {
        alert('Error guardando item')
    }
}

function openMovementModal(item: any) {
    selectedItem.value = item
    moveForm.value = { tipo: 'INGRESO', cantidad: 0, costoUnitario: 0, itemId: item.id }
    showMovementModal.value = true
}

async function saveMovement() {
    try {
        await $fetch('/api/inventory/movements', { 
            method: 'POST', 
            body: { ...moveForm.value, itemId: selectedItem.value.id } 
        })
        showMovementModal.value = false
        refresh()
        alert('Movimiento registrado')
    } catch (e: any) {
        alert(e.statusMessage || e)
    }
}
</script>
