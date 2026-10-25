<!-- src/views/dashboard/components/ReorderAlertsTable.vue -->
<template>
  <AppCard class="flex flex-col h-full font-sans" dir="rtl">
    <!-- رأس الكرت: العنوان وشارات التنبيه الضوئية للمخازن -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <!-- أيقونة تنبيهية تعبر عن نواقص الأصناف وضرورة إعادة الطلب -->
        <div
          class="p-2.5 bg-warning/10 text-warning rounded-xl border border-warning/20 shadow-sm animate-pulse"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-black text-text-primary tracking-tight">نواقص الأصناف</h3>
          <p class="text-xs text-text-muted mt-0.5">الأصناف التي بلغت أو تجاوزت حد الطلب الآمن</p>
        </div>
      </div>

      <!-- شارة رقمية توضح عدد الأصناف التي بلغت حد الطلب -->
      <div
        class="text-[11px] font-bold text-warning bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/20"
      >
        {{ items?.length || 0 }} أصناف حرجة
      </div>
    </div>

    <!-- حاوية الجدول: متجاوبة مع الجوال عبر التمرير الأفقي -->
    <div
      class="flex-1 overflow-x-auto rounded-xl border border-surface-border bg-surface-ground mb-2"
    >
      <table class="w-full text-right whitespace-nowrap">
        <thead class="bg-surface-section text-xs text-text-secondary sticky top-0 z-10">
          <tr>
            <th class="px-4 py-3.5 font-bold border-b border-surface-border">اسم الصنف</th>
            <th class="px-4 py-3.5 font-bold border-b border-surface-border">المخزن المعني</th>
            <th class="px-4 py-3.5 font-bold border-b border-surface-border text-center">
              الرصيد الحالي
            </th>
            <th class="px-4 py-3.5 font-bold border-b border-surface-border text-center">
              حد الطلب
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border text-sm bg-surface-section">
          <!-- حالة الأمان الكامل: تظهر عندما تكون كافة الأصناف أعلى من حد الطلب -->
          <tr v-if="!items || items.length === 0">
            <td colspan="4" class="px-4 py-12 text-center text-text-muted">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="p-3 rounded-full bg-success/10 text-success border border-success/20 shadow-sm"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                </div>
                <span class="text-sm font-semibold text-success">المخزون آمن ومستقر تماماً</span>
                <span class="text-xs text-text-muted max-w-xs leading-relaxed"
                  >كافة أرصدة الأصناف بالمخازن أعلى من حدود الطلب والحدود الحرجة.</span
                >
              </div>
            </td>
          </tr>

          <!-- تكرار الأصناف التي بلغت حد الطلب -->
          <tr
            v-for="stock in items"
            :key="stock.item_id"
            class="hover:bg-surface-ground transition-colors duration-150 group text-text-secondary"
          >
            <!-- اسم الصنف -->
            <td class="px-4 py-3.5 text-text-primary font-bold flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-warning"></span>
              {{ stock.item_name }}
            </td>

            <!-- المخزن -->
            <td class="px-4 py-3.5 text-xs font-semibold text-text-muted">
              {{ stock.store_name }}
            </td>

            <!-- الرصيد الحالي الفعلي -->
            <td class="px-4 py-3.5 text-center font-bold text-warning font-mono">
              {{ formatNumber(stock.current_quantity) }}
            </td>

            <!-- حد الطلب -->
            <td class="px-4 py-3.5 text-center font-bold text-text-muted font-mono opacity-80">
              {{ formatNumber(stock.reorder_level) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'

defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const formatNumber = (value) => {
  if (value === undefined || value === null) return '0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
  }).format(value)
}
</script>
