<!--src/views/stock-adjustments/components/StockAdjustmentFooter.vue-->
<template>
  <div
    class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-start text-right font-sans transition-all duration-200"
    dir="rtl"
  >
    <!-- 1. الملاحظات والبيان الجردي -->
    <div class="flex flex-col space-y-1.5 md:col-span-1">
      <label class="text-[11px] font-black text-text-secondary">
        ملاحظات وبيان التسوية الجردية
      </label>
      <textarea
        v-model="notesModel"
        rows="3"
        placeholder="سجل أسباب الفروقات الجردية أو تفاصيل تسوية المستودع الحالية..."
        class="block w-full p-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted text-xs font-semibold focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
      ></textarea>
    </div>

    <!-- 2. تفاصيل الفحص وفروقات الكميات -->
    <div
      class="p-3 bg-surface-ground rounded-xl border border-surface-border grid grid-cols-2 gap-3 md:col-span-1"
    >
      <div class="flex flex-col space-y-1 col-span-2">
        <div class="flex justify-between items-center text-xs font-semibold text-text-secondary">
          <span>إجمالي بنود الفحص الجردي:</span>
          <span
            class="font-mono font-bold text-text-primary bg-surface-section px-2 py-0.5 rounded-lg border border-surface-border shadow-xs"
          >
            {{ totalItems }} أصناف
          </span>
        </div>
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-danger">إجمالي قيمة العجز (-)</label>
        <div
          class="block w-full px-2 py-2 border border-danger/30 rounded-lg bg-danger/10 font-mono text-left font-bold text-xs text-danger shadow-xs"
        >
          {{ formatCurrency(totalShortage) }}
        </div>
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-[11px] font-black text-success">إجمالي قيمة الفائض (+)</label>
        <div
          class="block w-full px-2 py-2 border border-success/30 rounded-lg bg-success/10 font-mono text-left font-bold text-xs text-success shadow-xs"
        >
          {{ formatCurrency(totalSurplus) }}
        </div>
      </div>
    </div>

    <!-- 3. الأثر المالي الإجمالي -->
    <div
      class="p-3 bg-surface-ground rounded-xl border border-surface-border space-y-2 md:col-span-1 font-semibold text-xs h-full flex flex-col justify-between"
    >
      <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-danger">
        <span>خسائر عجز المخزون الحالية:</span>
        <span class="font-mono font-bold">{{ formatCurrency(totalShortage) }}</span>
      </div>

      <div class="flex justify-between border-b border-surface-border/60 pb-1.5 text-success">
        <span>أرباح فائض المخزون الحالية:</span>
        <span class="font-mono font-bold">{{ formatCurrency(totalSurplus) }}</span>
      </div>

      <div
        class="flex justify-between items-center p-2 rounded-lg border transition-all duration-200 shadow-sm"
        :class="netImpactClass"
      >
        <span class="font-black text-[11px]">صافي تأثير التسوية المالي:</span>
        <span class="text-base font-mono font-black tracking-wide">
          {{ formatCurrency(netImpact) }}
        </span>
      </div>

      <p v-if="getFieldError('items')" class="text-danger text-[10px] text-center font-bold mt-1">
        {{ getFieldError('items') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const notesModel = defineModel('notes', { type: String, default: '' })

const props = defineProps({
  totalItems: { type: Number, default: 0 },
  totalShortage: { type: Number, default: 0 },
  totalSurplus: { type: Number, default: 0 },
  validationErrors: { type: Object, default: () => null },
})

const netImpact = computed(() => {
  return props.totalSurplus - props.totalShortage
})

const netImpactClass = computed(() => {
  if (netImpact.value > 0) {
    return 'bg-success/10 border-success/30 text-success'
  } else if (netImpact.value < 0) {
    return 'bg-danger/10 border-danger/30 text-danger'
  }
  return 'bg-surface-section border-surface-border text-text-primary'
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
