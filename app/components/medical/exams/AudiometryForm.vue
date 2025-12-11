<template>
  <div class="mt-4 border rounded p-4">
    <h4 class="font-bold text-sm mb-4">Audiometría (Vía Aérea)</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Right Ear -->
      <div>
        <h5 class="font-bold text-xs text-red-600 mb-2">Oído Derecho (OD)</h5>
        <div class="grid grid-cols-2 gap-2">
            <div v-for="freq in frequencies" :key="'r-'+freq">
                <label class="text-xs text-gray-500">{{ freq }}Hz</label>
                <input type="number" v-model="modelValue.right[freq]" class="w-full border p-1 text-sm rounded" placeholder="dB">
            </div>
        </div>
      </div>
      <!-- Left Ear -->
      <div>
        <h5 class="font-bold text-xs text-blue-600 mb-2">Oído Izquierdo (OI)</h5>
        <div class="grid grid-cols-2 gap-2">
            <div v-for="freq in frequencies" :key="'l-'+freq">
                <label class="text-xs text-gray-500">{{ freq }}Hz</label>
                <input type="number" v-model="modelValue.left[freq]" class="w-full border p-1 text-sm rounded" placeholder="dB">
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const frequencies = [250, 500, 1000, 2000, 3000, 4000, 8000]

// Initialize structure if missing
if (!props.modelValue.right) props.modelValue.right = {}
if (!props.modelValue.left) props.modelValue.left = {}

</script>
