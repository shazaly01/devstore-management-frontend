<!-- src/views/dashboard/components/TopSellingItemsTable.vue -->
<template>
  <article
    class="dashboard-enter dashboard-luminous-card relative flex flex-col rounded-xl border border-surface-border bg-surface-card p-5 transition-all duration-300 hover:border-primary/55"
    :style="{
      '--stagger-index': staggerIndex,
      '--accent-rgb': '255, 125, 20',
    }"
    dir="rtl"
  >
    <!-- رأس البطاقة -->
    <div class="relative z-10 flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="dashboard-icon-gem flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        >
          <FireIcon class="h-5 w-5" stroke-width="1.85" />
        </div>
        <div class="min-w-0">
          <h3 class="text-sm sm:text-base font-extrabold text-text-primary truncate">
            الأصناف الأكثر مبيعاً
          </h3>
          <p class="mt-0.5 text-xs text-text-muted truncate">
            أعلى الأصناف تحقيقاً للإيرادات والكميات خلال الفترة المحددة
          </p>
        </div>
      </div>

      <span
        v-if="items.length"
        class="shrink-0 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary tabular-nums dark:bg-primary/20 dark:text-primary-light"
      >
        أعلى {{ items.length }}
      </span>
    </div>

    <!-- حالة عدم وجود بيانات -->
    <div
      v-if="!items.length"
      class="relative z-10 flex flex-col items-center justify-center text-center px-4 py-12 rounded-xl border border-dashed border-surface-border/80 bg-surface-ground/40"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-section text-text-muted mb-3 ring-1 ring-surface-border"
      >
        <ShoppingBagIcon class="h-6 w-6" />
      </div>
      <p class="text-sm font-bold text-text-secondary">لا توجد مبيعات مسجلة في هذه الفترة</p>
      <p class="mt-1 text-xs text-text-muted max-w-xs">
        ستظهر قائمة الأصناف الأكثر مبيعاً تلقائياً عند تسجيل فواتير مبيعات ضمن النطاق الزمني.
      </p>
    </div>

    <!-- جدول الأصناف الأكثر مبيعاً -->
    <div v-else class="relative z-10 overflow-x-auto">
      <table class="w-full text-right border-collapse">
        <thead>
          <tr
            class="border-b border-surface-border text-[11px] font-extrabold text-text-muted uppercase tracking-wider"
          >
            <th class="py-2.5 px-2 w-10 text-center">#</th>
            <th class="py-2.5 px-3">اسم الصنف</th>
            <th class="py-2.5 px-3 text-center">الكمية المباعة</th>
            <th class="py-2.5 px-3 text-left">إجمالي المبيعات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/60 text-xs sm:text-sm">
          <tr
            v-for="(item, index) in items"
            :key="item.item_id"
            class="group transition-colors duration-150 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.1]"
          >
            <!-- شارة الترتيب -->
            <td class="py-3 px-2 text-center">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black tabular-nums"
                :class="getRankBadgeClass(index)"
              >
                {{ index + 1 }}
              </span>
            </td>

            <!-- اسم الصنف وشريط النسبة -->
            <td class="py-3 px-3 min-w-[160px]">
              <p class="font-bold text-text-primary group-hover:text-primary transition-colors">
                {{ item.item_name }}
              </p>
              <div
                class="mt-1.5 h-1.5 w-full max-w-[180px] rounded-full bg-surface-ground overflow-hidden"
              >
                <div
                  class="h-full rounded-full bg-gradient-to-l from-primary to-amber-400 transition-all duration-500"
                  :style="{ width: `${getRelativePercentage(item.total_amount)}%` }"
                ></div>
              </div>
            </td>

            <!-- الكمية المباعة مع الوحدة -->
            <td class="py-3 px-3 text-center whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-surface-ground/80 px-2.5 py-0.5 text-xs font-extrabold text-text-primary tabular-nums"
              >
                <span>{{ formatQuantity(item.total_quantity) }}</span>
                <span class="text-[11px] font-semibold text-text-muted">{{ item.unit_name }}</span>
              </span>
            </td>

            <!-- إجمالي قيمة المبيعات -->
            <td class="py-3 px-3 text-left whitespace-nowrap">
              <span class="font-black text-text-primary tabular-nums">
                {{ formatCurrency(item.total_amount) }}
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
import { FireIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  staggerIndex: {
    type: Number,
    default: 10,
  },
})

const maxAmount = computed(() => {
  if (!props.items.length) return 1
  const max = Math.max(...props.items.map((i) => Number(i.total_amount) || 0))
  return max > 0 ? max : 1
})

const getRelativePercentage = (amount) => {
  const val = Number(amount) || 0
  if (val <= 0) return 0
  return Math.min(100, Math.max(6, Math.round((val / maxAmount.value) * 100)))
}

const getRankBadgeClass = (index) => {
  if (index === 0) {
    return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-orange-500/35'
  }
  if (index === 1) {
    return 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100'
  }
  if (index === 2) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-400/30'
  }
  return 'bg-surface-ground text-text-muted border border-surface-border'
}

const formatQuantity = (value) => {
  const num = Number(value) || 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}
</script>
