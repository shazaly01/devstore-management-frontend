<!-- src/views/dashboard/components/ExpensesSummaryTable.vue -->
<template>
  <article
    class="dashboard-enter dashboard-luminous-card relative flex flex-col rounded-xl border border-surface-border bg-surface-card p-5 transition-all duration-300 hover:border-rose-500/50"
    :style="{
      '--stagger-index': staggerIndex,
      '--accent-rgb': '244, 63, 94',
    }"
    dir="rtl"
  >
    <!-- رأس البطاقة -->
    <div class="relative z-10 flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="dashboard-icon-gem flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        >
          <ReceiptPercentIcon class="h-5 w-5" stroke-width="1.85" />
        </div>
        <div class="min-w-0">
          <h3 class="text-sm sm:text-base font-extrabold text-text-primary truncate">
            كشف المصروفات التشغيلية
          </h3>
          <p class="mt-0.5 text-xs text-text-muted truncate">
            تفصيل بنود المصروفات المنصرفة خلال الفترة المحددة
          </p>
        </div>
      </div>

      <!-- شارة إجمالي المصروفات -->
      <div
        class="shrink-0 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-1.5 text-left dark:bg-rose-400/15"
      >
        <span class="block text-[10px] font-bold text-text-muted">الإجمالي</span>
        <span class="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-300 tabular-nums">
          {{ formatCurrency(grandTotal) }}
        </span>
      </div>
    </div>

    <!-- حالة عدم وجود مصروفات -->
    <div
      v-if="!itemsList.length"
      class="relative z-10 flex flex-col items-center justify-center text-center px-4 py-10 rounded-xl border border-dashed border-surface-border/80 bg-surface-ground/40"
    >
      <div
        class="flex h-11 w-11 items-center justify-center rounded-full bg-surface-section text-text-muted mb-2.5 ring-1 ring-surface-border"
      >
        <BanknotesIcon class="h-6 w-6" />
      </div>
      <p class="text-sm font-bold text-text-secondary">لا توجد مصروفات مسجلة في هذه الفترة</p>
      <p class="mt-1 text-xs text-text-muted max-w-xs">
        ستظهر بنود المصروفات وسندات الصرف تلقائياً هنا عند تسجيلها ضمن النطاق الزمني.
      </p>
    </div>

    <!-- جدول المصروفات التفصيلي -->
    <div v-else class="relative z-10 overflow-x-auto max-h-[360px] overflow-y-auto">
      <table class="w-full text-right border-collapse">
        <thead class="sticky top-0 z-10 bg-surface-card">
          <tr
            class="border-b border-surface-border text-[11px] font-extrabold text-text-muted uppercase tracking-wider"
          >
            <th class="py-2.5 px-2 w-10 text-center">#</th>
            <th class="py-2.5 px-3">بند / بيان المصروف</th>
            <th class="py-2.5 px-3 text-center w-24">النسبة</th>
            <th class="py-2.5 px-3 text-left">المبلغ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/60 text-xs sm:text-sm">
          <tr
            v-for="(item, index) in itemsList"
            :key="`${item.expense_id || 'exp'}-${index}`"
            class="transition-colors duration-150 hover:bg-rose-500/[0.04] dark:hover:bg-rose-500/[0.08]"
          >
            <td class="py-2.5 px-2 text-center font-bold text-text-muted tabular-nums">
              {{ index + 1 }}
            </td>

            <td class="py-2.5 px-3">
              <p class="font-bold text-text-primary">{{ item.expense_name }}</p>
              <div
                class="mt-1.5 h-1.5 w-full max-w-[190px] rounded-full bg-surface-ground overflow-hidden"
              >
                <div
                  class="h-full rounded-full bg-gradient-to-l from-rose-500 to-amber-400 transition-all duration-500"
                  :style="{ width: `${getPercentage(item.total_spent)}%` }"
                ></div>
              </div>
            </td>

            <td class="py-2.5 px-3 text-center whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-md border border-surface-border bg-surface-ground/80 px-2 py-0.5 text-[11px] font-extrabold text-text-secondary tabular-nums"
              >
                {{ getPercentage(item.total_spent) }}%
              </span>
            </td>

            <td class="py-2.5 px-3 text-left whitespace-nowrap">
              <span class="font-black text-text-primary tabular-nums">
                {{ formatCurrency(item.total_spent) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { ReceiptPercentIcon, BanknotesIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  expenses: {
    type: Object,
    default: () => ({ list: [], grand_total: 0 }),
  },
  staggerIndex: {
    type: Number,
    default: 11,
  },
})

const itemsList = computed(() => props.expenses?.list || [])
const grandTotal = computed(() => Number(props.expenses?.grand_total) || 0)

const getPercentage = (amount) => {
  const total = grandTotal.value
  const val = Number(amount) || 0
  if (total <= 0 || val <= 0) return 0
  return Math.min(100, Math.round((val / total) * 100))
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}
</script>
