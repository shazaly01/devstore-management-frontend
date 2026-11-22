<!--src/views/stock-adjustments/components/StockAdjustmentHeader.vue-->
<template>
  <div
    class="p-3 bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      <!-- 1. اختيار المستودع -->
      <div class="relative w-full">
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span
            class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>

          <select
            v-model="formData.store_id"
            :disabled="isEdit"
            class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="" class="bg-surface-section text-text-muted">
              اختر المستودع المعني بالدورة الجردية... *
            </option>
            <option
              v-for="store in storeStore.stores"
              :key="store.id"
              :value="store.id"
              class="bg-surface-section text-text-primary"
            >
              {{ store.name }}
            </option>
          </select>

          <span
            class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
          >
            ▼
          </span>
        </div>
        <p v-if="getFieldError('store_id')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
          {{ getFieldError('store_id') }}
        </p>
      </div>

      <!-- 2. تاريخ التقييم الجردي -->
      <div class="relative w-full">
        <div
          class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <input
            type="date"
            v-model="formData.adjustment_date"
            class="block w-full h-full pr-3 pl-24 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
          />

          <span
            class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none gap-1 text-xs z-10"
          >
            <span class="font-medium text-[10px]">تاريخ الجرد</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
        <p
          v-if="getFieldError('adjustment_date')"
          class="text-danger text-[10px] font-bold mt-0.5 pr-1"
        >
          {{ getFieldError('adjustment_date') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStoreStore } from '@/stores/storeStore'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
  isEdit: { type: Boolean, default: false },
})

const storeStore = useStoreStore()

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

onMounted(async () => {
  await storeStore.fetchStores(1, { is_active: 1 })
})
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
