<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="flex justify-between items-center px-6 py-4 bg-white shadow-sm bb-1 border-gray-200">
      <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-gray-800">Calendario de Turnos</h1>
          <div class="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button @click="changeWeek(-1)" class="p-2 hover:bg-white rounded-md transition-colors text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span class="font-medium text-gray-700 px-2 min-w-[200px] text-center">{{ dateRangeLabel }}</span>
              <button @click="changeWeek(1)" class="p-2 hover:bg-white rounded-md transition-colors text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
          </div>
      </div>
      <div class="space-x-4">
          <button @click="resetToToday" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Hoy</button>
          <NuxtLink to="/admissions" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Volver a Admisión</NuxtLink>
      </div>
    </div>
    
    <!-- Week Grid -->
    <div class="flex-1 p-6 overflow-hidden flex flex-col">
        <div class="flex-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
            <!-- Days Header -->
            <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50 divide-x divide-gray-200">
               <div v-for="day in weekDates" :key="day.date.toString()" class="py-3 text-center">
                   <p class="text-sm font-medium text-gray-500 uppercase">{{ day.dayName }}</p>
                   <p class="text-lg font-bold text-gray-900" :class="{'text-indigo-600': day.isToday}">{{ day.dayNumber }}</p>
               </div>
            </div>

            <!-- Content -->
            <div class="flex-1 grid grid-cols-7 divide-x divide-gray-200 overflow-y-auto">
               <div v-for="day in weekDates" :key="day.date.toISOString()" class="min-h-[500px] p-2 relative group hover:bg-gray-50 transition-colors">
                   <!-- Add Button Placeholder (could be real) -->
                   
                   <div v-for="appt in getApptsForDate(day.date)" :key="appt.id" 
                        class="mb-2 p-2 rounded border border-l-4 shadow-sm text-xs cursor-pointer hover:shadow-md transition-shadow bg-white"
                        :class="getStatusClass(appt)">
                        <div class="font-bold truncate">{{ appt.time }}</div>
                        <div class="font-medium truncate">{{ appt.patientName }}</div>
                        <div class="text-gray-500 truncate text-[10px]">{{ appt.doctorName }}</div>
                   </div>
                   
                   <div v-if="getApptsForDate(day.date).length === 0" class="h-full flex items-center justify-center text-gray-300 text-sm">
                       Sin citas
                   </div>
               </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const currentDate = ref(new Date())
const appointments = ref<any[]>([])

// Helper to get start of week (Monday)
const getStartOfWeek = (d: Date) => {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    return new Date(date.setDate(diff))
}

const currentWeekStart = computed(() => getStartOfWeek(currentDate.value))
const currentWeekEnd = computed(() => {
    const end = new Date(currentWeekStart.value)
    end.setDate(end.getDate() + 6)
    return end
})

const weekDates = computed(() => {
    const dates = []
    const start = new Date(currentWeekStart.value)
    for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        dates.push({
            date: d,
            dayName: d.toLocaleDateString('es-ES', { weekday: 'short' }),
            dayNumber: d.getDate(),
            isToday: d.toDateString() === new Date().toDateString()
        })
    }
    return dates
})

const dateRangeLabel = computed(() => {
    const start = currentWeekStart.value
    const end = currentWeekEnd.value
    const year = start.getFullYear()
    // Format: 10 Dic - 16 Dic 2024
    const format = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    return `${format(start)} - ${format(end)} ${year}`
})

const fetchAppointments = async () => {
    const start = currentWeekStart.value.toISOString()
    const end = currentWeekEnd.value.toISOString()
    
    // Slight buffer for TZ
    const query = { start, end }
    
    const { data } = await useFetch('/api/admissions/appointments/calendar', {
        params: query,
        key: start // Force refresh on date change
    })
    
    // Map data for easy display
    const raw = (data.value as any[]) || []
    appointments.value = raw.map(a => ({
        ...a,
        dateObj: new Date(a.start),
        time: new Date(a.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        patientName: a.title.split('(')[0].trim(),
        doctorName: a.title.split('(')[1]?.replace(')', '') || ''
    }))
}

const changeWeek = (dir: number) => {
    const newDate = new Date(currentDate.value)
    newDate.setDate(newDate.getDate() + (dir * 7))
    currentDate.value = newDate
    fetchAppointments()
}

const resetToToday = () => {
    currentDate.value = new Date()
    fetchAppointments()
}

const getApptsForDate = (date: Date) => {
    return appointments.value.filter(a => a.dateObj.toDateString() === date.toDateString())
        .sort((a,b) => a.dateObj.getTime() - b.dateObj.getTime())
}

const getStatusClass = (appt: any) => {
    // Assuming backend passes 'class' color directly or we map 'estado'
    // Map class from backend response which was: 'bg-yellow-500' etc.
    // Changing to border colors for cleaner look
    if (appt.class?.includes('yellow')) return 'border-yellow-500 bg-yellow-50'
    if (appt.class?.includes('blue')) return 'border-blue-500 bg-blue-50'
    if (appt.class?.includes('green')) return 'border-green-500 bg-green-50'
    return 'border-gray-500 bg-gray-50'
}

onMounted(() => {
    fetchAppointments()
})
</script>
