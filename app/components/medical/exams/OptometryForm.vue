<template>
  <div class="mt-4 border rounded p-4">
    <h4 class="font-bold text-sm mb-4">Agudeza Visual</h4>
    <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
            <tr>
                <th></th>
                <th>OD (Derecho)</th>
                <th>OI (Izquierdo)</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
            <tr>
                <td class="font-medium p-2">Lejos (Sin Corr.)</td>
                <td class="p-2"><input v-model="modelValue.far_sc_od" class="border w-full p-1 rounded"></td>
                <td class="p-2"><input v-model="modelValue.far_sc_oi" class="border w-full p-1 rounded"></td>
            </tr>
            <tr>
                <td class="font-medium p-2">Lejos (Con Corr.)</td>
                <td class="p-2"><input v-model="modelValue.far_cc_od" class="border w-full p-1 rounded"></td>
                <td class="p-2"><input v-model="modelValue.far_cc_oi" class="border w-full p-1 rounded"></td>
            </tr>
            <tr>
                <td class="font-medium p-2">Cerca</td>
                <td class="p-2"><input v-model="modelValue.near_od" class="border w-full p-1 rounded"></td>
                <td class="p-2"><input v-model="modelValue.near_oi" class="border w-full p-1 rounded"></td>
            </tr>
        </tbody>
    </table>
    
    <div class="mt-4">
        <label class="block text-sm font-medium">Visión de Colores (Ishihara)</label>
        <select v-model="modelValue.colors" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="NORMAL">Normal</option>
            <option value="ALTERADO">Alterado</option>
        </select>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>
