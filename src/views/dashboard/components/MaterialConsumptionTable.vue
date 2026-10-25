<!-- src/views/dashboard/components/MaterialConsumptionTable.vue -->
<template>
  <div
    class="bg-surface-section border border-surface-border rounded-xl p-5 shadow-sm relative overflow-hidden font-sans"
    dir="rtl"
  >
    <!-- عنوان الجدول والمؤشر البصري -->
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-surface-border">
      <div class="flex items-center gap-2.5">
        <span class="w-2 h-5 bg-success rounded-full"></span>
        <h3 class="text-base font-bold text-text-primary">تقرير استهلاك الأصناف</h3>
      </div>
      <span
        class="text-xs font-semibold px-2.5 py-1 bg-success/10 text-success rounded-md border border-success/20"
      >
        {{ items.length }} صنف
      </span>
    </div>

    <!-- جدول عرض الأصناف المستهلكة -->
    <div class="overflow-x-auto rounded-lg border border-surface-border bg-surface-ground">
      <table class="w-full text-right border-collapse whitespace-nowrap">
        <thead class="bg-surface-section text-xs font-bold text-text-secondary">
          <tr class="border-b border-surface-border">
            <th class="py-3 px-3 font-black">اسم الصنف</th>
            <th class="py-3 px-3 text-left font-black">إجمالي الاستهلاك</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border bg-surface-section text-sm">
          <tr
            v-for="item in items"
            :key="item.item_id"
            class="hover:bg-surface-ground transition-colors duration-150 group"
          >
            <td
              class="py-3.5 px-3 font-medium text-text-primary group-hover:text-primary transition-colors"
            >
              {{ item.item_name }}
            </td>
            <td class="py-3.5 px-3 text-left font-mono font-bold text-success">
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
