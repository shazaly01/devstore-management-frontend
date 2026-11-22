<!-- src/views/dashboard/components/CustomerDebtsTable.vue -->
<template>
  <article
    class="dashboard-enter dashboard-luminous-card relative flex flex-col rounded-xl border border-surface-border bg-surface-card p-5 transition-all duration-300 hover:border-amber-500/55"
    :style="{
      '--stagger-index': staggerIndex,
      '--accent-rgb': '245, 158, 11',
    }"
    dir="rtl"
  >
    <!-- رأس البطاقة -->
    <div class="relative z-10 flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="dashboard-icon-gem flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        >
          <UsersIcon class="h-5 w-5" stroke-width="1.85" />
        </div>
        <div class="min-w-0">
          <h3 class="text-sm sm:text-base font-extrabold text-text-primary truncate">
            مديونيات العملاء اللحظية
          </h3>
          <p class="mt-0.5 text-xs text-text-muted truncate">
            العملاء أصحاب الأرصدة المدينة المستحقة للمنشأة
          </p>
        </div>
      </div>

      <!-- شارة إجمالي المديونيات -->
      <div
        class="shrink-0 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-left dark:bg-amber-400/15"
      >
        <span class="block text-[10px] font-bold text-text-muted">إجمالي الذمم</span>
        <span class="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-300 tabular-nums">
          {{ formatCurrency(grandTotal) }}
        </span>
      </div>
    </div>

    <!-- حالة عدم وجود مديونيات -->
    <div
      v-if="!itemsList.length"
      class="relative z-10 flex flex-col items-center justify-center text-center px-4 py-10 rounded-xl border border-dashed border-emerald-500/35 bg-emerald-500/[0.04]"
    >
      <div
        class="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2.5 ring-1 ring-emerald-500/30"
      >
        <CheckCircleIcon class="h-6 w-6" />
      </div>
      <p class="text-sm font-bold text-text-primary">لا توجد مديونيات مستحقة على العملاء</p>
      <p class="mt-1 text-xs text-text-muted max-w-xs">
        جميع حسابات العملاء مسددة بالكامل ولا توجد أرصدة مدينة حالياً.
      </p>
    </div>

    <!-- جدول مديونيات العملاء -->
    <div v-else class="relative z-10 overflow-x-auto max-h-[360px] overflow-y-auto">
      <table class="w-full text-right border-collapse">
        <thead class="sticky top-0 z-10 bg-surface-card">
          <tr
            class="border-b border-surface-border text-[11px] font-extrabold text-text-muted uppercase tracking-wider"
          >
            <th class="py-2.5 px-2 w-10 text-center">#</th>
            <th class="py-2.5 px-3">اسم العميل</th>
            <th class="py-2.5 px-3 text-center w-24">الحصة</th>
            <th class="py-2.5 px-3 text-left">الرصيد المستحق</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/60 text-xs sm:text-sm">
          <tr
            v-for="(customer, index) in itemsList"
            :key="customer.customer_id"
            class="transition-colors duration-150 hover:bg-amber-500/[0.05] dark:hover:bg-amber-500/[0.1]"
          >
            <td class="py-2.5 px-2 text-center font-bold text-text-muted tabular-nums">
              {{ index + 1 }}
            </td>

            <td class="py-2.5 px-3">
              <p class="font-bold text-text-primary">{{ customer.customer_name }}</p>
              <div
                class="mt-1.5 h-1.5 w-full max-w-[190px] rounded-full bg-surface-ground overflow-hidden"
              >
                <div
                  class="h-full rounded-full bg-gradient-to-l from-amber-500 to-orange-400 transition-all duration-500"
                  :style="{ width: `${getPercentage(customer.current_balance)}%` }"
                ></div>
              </div>
            </td>

            <td class="py-2.5 px-3 text-center whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-md border border-surface-border bg-surface-ground/80 px-2 py-0.5 text-[11px] font-extrabold text-text-secondary tabular-nums"
              >
                {{ getPercentage(customer.current_balance) }}%
              </span>
            </td>

            <td class="py-2.5 px-3 text-left whitespace-nowrap">
              <span class="font-black text-amber-700 dark:text-amber-300 tabular-nums">
                {{ formatCurrency(customer.current_balance) }}
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
import { UsersIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  customers: {
    type: Object,
    default: () => ({ list: [], grand_total: 0 }),
  },
  staggerIndex: {
    type: Number,
    default: 12,
  },
})

const itemsList = computed(() => props.customers?.list || [])
const grandTotal = computed(() => Number(props.customers?.grand_total) || 0)

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
