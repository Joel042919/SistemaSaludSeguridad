<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">{{ title }}</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500 mb-4">{{ message }}</p>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Monto (PEN)</label>
            <input v-model="amount" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="0.00" />
          </div>
          
          <button @click="confirm" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" :disabled="loading">
            {{ loading ? 'Procesando...' : actionLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    show: boolean
    mode: 'OPEN' | 'CLOSE'
}>()

const emit = defineEmits(['processed'])

const amount = ref(0)
const loading = ref(false)

const title = computed(() => props.mode === 'OPEN' ? 'Apertura de Caja' : 'Cierre de Caja')
const message = computed(() => props.mode === 'OPEN' ? 'Ingrese el monto inicial en caja.' : 'Ingrese el monto final contado en caja.')
const actionLabel = computed(() => props.mode === 'OPEN' ? 'Abrir Caja' : 'Cerrar Caja')

const confirm = async () => {
    loading.value = true
    try {
        const endpoint = props.mode === 'OPEN' ? '/api/billing/cash/open' : '/api/billing/cash/close'
        const body = props.mode === 'OPEN' ? { montoApertura: amount.value } : { montoCierre: amount.value }
        
        // Note: Closing requires cajaId, assumed to be handled by parent or context finding active box
        // Ideally we pass it or the endpoint finds the active one.
        // My close endpoint expects `cajaId`.
        // Let's modify the flow: The parent calls the API. This component just emits.
        emit('processed', amount.value)
    } catch (e) {
        alert('Error: ' + e)
    } finally {
        loading.value = false
    }
}
</script>
