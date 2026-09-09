<!-- src/views/dashboard/components/MaterialConsumptionTable.vue -->
<template>
  <div
    class="bg-surface-section border border-surface-border/60 rounded-xl p-5 shadow-sm relative overflow-hidden"
  >
    <!-- عنوان الجدول والمؤشر البصري -->
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-surface-border/40">
      <div class="flex items-center gap-2.5">
        <span
          class="w-2 h-5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.4)]"
        ></span>
        <h3 class="text-base font-bold text-text-primary">تقرير استهلاك الأصناف</h3>
      </div>
      <span
        class="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20"
      >
        {{ items.length }} صنف
      </span>
    </div>

    <!-- جدول عرض الأصناف المستهلكة -->
    <div class="overflow-x-auto">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr class="border-b border-surface-border/40 text-xs font-bold text-text-muted">
            <th class="pb-3 pr-2 font-black">اسم الصنف</th>
            <th class="pb-3 pl-2 text-left font-black">إجمالي الاستهلاك</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/30">
          <tr
            v-for="item in items"
            :key="item.item_id"
            class="text-sm hover:bg-surface-ground/30 transition-colors group"
          >
            <td
              class="py-3.5 pr-2 font-medium text-text-primary group-hover:text-primary transition-colors"
            >
              {{ item.item_name }}
            </td>
            <td class="py-3.5 pl-2 text-left font-mono font-bold text-emerald-400">
              {{ formatQuantity(item.consumed_meters) }}
            </td>
          </tr>

          <!-- في حال عدم وجود حركات -->
          <tr v-if="items.length === 0">
            <td colspan="2" class="text-center py-10 text-sm text-text-muted">
              لا توجد حركات استهلاك مسجلة للأصناف خلال النطاق الزمني المحدد.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const formatQuantity = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}
</script>
