<!--src/views/reports/components/SubLedgerSummaryCards.vue-->
<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-right font-sans" dir="rtl">
    <!-- الرصيد الافتتاحي -->
    <AppCard class="p-4 border-r-4 border-r-surface-border bg-surface-section shadow-sm">
      <div class="text-[10px] text-text-muted font-bold uppercase mb-1">
        الرصيد الافتتاحي السابق
      </div>
      <div class="text-xl font-black text-text-primary font-mono">
        {{ formatCurrency(summary.opening_balance) }}
      </div>
    </AppCard>

    <!-- إجمالي الحركات المدينة -->
    <AppCard class="p-4 border-r-4 border-r-success bg-surface-section shadow-sm">
      <div class="text-[10px] text-success font-bold uppercase mb-1">
        إجمالي الحركات المدينة (+)
      </div>
      <div class="text-xl font-black text-success font-mono">
        {{ formatCurrency(summary.total_period_debit || 0) }}
      </div>
    </AppCard>

    <!-- إجمالي الحركات الدائنة -->
    <AppCard class="p-4 border-r-4 border-r-danger bg-surface-section shadow-sm">
      <div class="text-[10px] text-danger font-bold uppercase mb-1">إجمالي الحركات الدائنة (-)</div>
      <div class="text-xl font-black text-danger font-mono">
        {{ formatCurrency(summary.total_period_credit || 0) }}
      </div>
    </AppCard>

    <!-- صافي رصيد كشف الحساب -->
    <AppCard
      class="p-4 border-r-4 bg-surface-section shadow-sm"
      :class="summary.closing_balance >= 0 ? 'border-r-primary' : 'border-r-warning'"
    >
      <div class="text-[10px] font-bold uppercase mb-1 text-text-muted">صافي رصيد كشف الحساب</div>
      <div
        class="text-xl font-black font-mono"
        :class="summary.closing_balance >= 0 ? 'text-primary' : 'text-warning'"
      >
        {{ formatCurrency(summary.closing_balance) }}
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'
import AppCard from '@/components/ui/AppCard.vue'

defineProps({
  summary: {
    type: Object,
    required: true,
    default: () => ({
      opening_balance: 0,
      total_period_debit: 0,
      total_period_credit: 0,
      closing_balance: 0,
    }),
  },
})
</script>
