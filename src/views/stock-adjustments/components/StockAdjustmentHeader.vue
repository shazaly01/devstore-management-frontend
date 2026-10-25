<!--src/views/stock-adjustments/components/StockAdjustmentHeader.vue-->
<template>
  <div
    class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-right items-end font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- اختيار المستودع -->
    <div class="flex flex-col space-y-1.5">
      <label class="text-[11px] font-black text-text-secondary">مستودع الجرد والتسوية *</label>
      <div class="relative w-full">
        <select
          v-model="formData.store_id"
          :disabled="isEdit"
          class="block w-full h-10 pr-3 pl-8 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold outline-none transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <option value="" class="bg-surface-section text-text-muted">
            اختر المستودع المعني بالدورة الجردية...
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
          class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[10px]"
        >
          ▼
        </span>
      </div>
      <p v-if="getFieldError('store_id')" class="text-danger text-[10px] font-bold mt-0.5">
        {{ getFieldError('store_id') }}
      </p>
    </div>

    <!-- تاريخ التقييم الجردي -->
    <div class="flex flex-col space-y-1.5">
      <label class="text-[11px] font-black text-text-secondary">تاريخ التقييم الجردي *</label>
      <input
        type="date"
        v-model="formData.adjustment_date"
        class="block w-full h-10 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono outline-none transition-all cursor-pointer shadow-sm"
      />
      <p v-if="getFieldError('adjustment_date')" class="text-danger text-[10px] font-bold mt-0.5">
        {{ getFieldError('adjustment_date') }}
      </p>
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
