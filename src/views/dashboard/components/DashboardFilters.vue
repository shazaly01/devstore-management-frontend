<!-- src/views/dashboard/components/DashboardFilters.vue -->
<template>
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3" dir="rtl">
    <!-- أزرار الفترات الزمنية السريعة -->
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        :disabled="loading"
        @click="applyPreset(preset)"
        class="rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all duration-150 cursor-pointer disabled:opacity-50"
        :class="
          activePreset === preset.key
            ? 'bg-primary text-white shadow-md shadow-primary/30'
            : 'border border-surface-border bg-surface-card/90 text-text-secondary hover:border-primary/60 hover:text-primary'
        "
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- تحديد نطاق تاريخ مخصص (من - إلى) -->
    <form @submit.prevent="applyCustomRange" class="flex flex-wrap items-center gap-2">
      <div
        class="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-card/95 px-2.5 py-1.5 shadow-sm"
      >
        <CalendarDaysIcon class="h-4 w-4 text-primary shrink-0" />
        <label for="dash-from-date" class="text-[11px] font-bold text-text-muted">من:</label>
        <input
          id="dash-from-date"
          v-model="fromDate"
          type="date"
          :disabled="loading"
          @change="activePreset = 'custom'"
          class="bg-transparent text-xs font-extrabold text-text-primary focus:outline-none tabular-nums"
        />
      </div>

      <div
        class="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-card/95 px-2.5 py-1.5 shadow-sm"
      >
        <CalendarDaysIcon class="h-4 w-4 text-primary shrink-0" />
        <label for="dash-to-date" class="text-[11px] font-bold text-text-muted">إلى:</label>
        <input
          id="dash-to-date"
          v-model="toDate"
          type="date"
          :disabled="loading"
          @change="activePreset = 'custom'"
          class="bg-transparent text-xs font-extrabold text-text-primary focus:outline-none tabular-nums"
        />
      </div>

      <button
        type="submit"
        :disabled="loading || (!fromDate && !toDate)"
        class="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3.5 py-1.5 text-xs font-extrabold text-primary hover:bg-primary hover:text-white transition-all duration-150 disabled:opacity-45 cursor-pointer dark:bg-primary/25 dark:text-primary-light dark:hover:bg-primary dark:hover:text-white"
      >
        <FunnelIcon class="h-3.5 w-3.5" />
        <span>تطبيق النطاق</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CalendarDaysIcon, FunnelIcon } from '@heroicons/vue/24/outline'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['filter'])

const fromDate = ref('')
const toDate = ref('')
const activePreset = ref('current_month')

const presets = [
  { key: 'today', label: 'اليوم' },
  { key: 'this_week', label: 'هذا الأسبوع' },
  { key: 'current_month', label: 'هذا الشهر' },
  { key: 'last_month', label: 'الشهر السابق' },
  { key: 'this_year', label: 'هذا العام' },
]

const formatDateLocal = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const applyPreset = (preset) => {
  activePreset.value = preset.key
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)

  if (preset.key === 'today') {
    start = new Date(now)
    end = new Date(now)
  } else if (preset.key === 'this_week') {
    // بداية الأسبوع (السبت) حتى اليوم
    const dayOfWeek = now.getDay()
    const diffToSaturday = (dayOfWeek + 1) % 7
    start = new Date(now)
    start.setDate(now.getDate() - diffToSaturday)
    end = new Date(now)
  } else if (preset.key === 'current_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  } else if (preset.key === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    end = new Date(now.getFullYear(), now.getMonth(), 0)
  } else if (preset.key === 'this_year') {
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now)
  }

  fromDate.value = formatDateLocal(start)
  toDate.value = formatDateLocal(end)

  emit('filter', {
    from_date: fromDate.value,
    to_date: toDate.value,
  })
}

const applyCustomRange = () => {
  if (!fromDate.value && !toDate.value) return
  emit('filter', {
    from_date: fromDate.value,
    to_date: toDate.value,
  })
}
</script>
