<!-- src/views/dashboard/components/LogisticKpiCards.vue -->
<template>
  <div class="w-full">
    <!-- كرت صافي الإيرادات المالية -->
    <AppCard
      class="w-full group relative overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1 border border-emerald-500/20 bg-gradient-to-br from-surface-card via-surface-card to-emerald-950/10 shadow-[0_20px_50px_rgba(16,185,129,0.05)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]"
    >
      <!-- تأثير النيون المتوهج في الخلفية -->
      <div
        class="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 duration-700"
      ></div>
      <div
        class="absolute -right-10 -bottom-10 w-36 h-36 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-2xl"
      ></div>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
        <div class="space-y-1.5">
          <span
            class="text-xs font-black text-emerald-400/80 uppercase tracking-widest block bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-md w-max"
          >
            التقرير المالي الحي
          </span>
          <h4 class="text-base font-bold text-text-muted/90 pt-1">صافي إيرادات الفترة الحالية</h4>
          <p class="text-[11px] text-text-muted/60 font-medium flex items-center gap-1.5 pt-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            محتسب تلقائياً بعد استبعاد كافة مرتجعات المبيعات
          </p>
        </div>

        <div class="flex items-center justify-between md:justify-end gap-6">
          <div
            class="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight font-mono drop-shadow-[0_2px_10px_rgba(52,211,153,0.2)]"
          >
            {{ formatCurrency(stats.net_sales_amount) }}
          </div>

          <div
            class="p-3.5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 text-emerald-400 rounded-2xl border border-emerald-500/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300"
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
import { defineProps } from 'vue'
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
