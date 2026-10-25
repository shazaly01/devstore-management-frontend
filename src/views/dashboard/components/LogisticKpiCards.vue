<!-- src/views/dashboard/components/LogisticKpiCards.vue -->
<template>
  <div class="w-full font-sans" dir="rtl">
    <!-- كرت صافي الإيرادات المالية -->
    <AppCard
      class="w-full group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 border border-surface-border bg-surface-section shadow-sm"
    >
      <!-- هالة خلفية ناعمة منسجمة مع المتغير المركزي -->
      <div
        class="absolute -top-20 -left-20 w-48 h-48 bg-success/10 rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-80"
      ></div>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
        <div class="space-y-1.5 text-right">
          <span
            class="text-xs font-black text-success uppercase tracking-wider inline-block bg-success/10 border border-success/20 px-2.5 py-1 rounded-md"
          >
            التقرير المالي الحي
          </span>
          <h4 class="text-base font-bold text-text-primary pt-1">صافي إيرادات الفترة الحالية</h4>
          <p class="text-[11px] text-text-muted font-medium flex items-center gap-1.5 pt-0.5">
            <span class="w-2 h-2 rounded-full bg-success animate-ping"></span>
            محتسب تلقائياً بعد استبعاد كافة مرتجعات المبيعات
          </p>
        </div>

        <div class="flex items-center justify-between md:justify-end gap-6">
          <div class="text-3xl md:text-4xl font-black text-success tracking-tight font-mono">
            {{ formatCurrency(stats.net_sales_amount) }}
          </div>

          <div
            class="p-3.5 bg-success/10 text-success rounded-2xl border border-success/20 transition-all duration-300"
          >
            <svg
              class="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'

defineProps({
  stats: {
    type: Object,
    required: true,
  },
})

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>
