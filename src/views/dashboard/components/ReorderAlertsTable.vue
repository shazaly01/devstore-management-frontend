<!-- src/views/dashboard/components/ReorderAlertsTable.vue -->
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
          <ExclamationTriangleIcon class="h-5 w-5" stroke-width="1.85" />
        </div>
        <div class="min-w-0">
          <h3 class="text-sm sm:text-base font-extrabold text-text-primary truncate">
            تنبيهات حد الطلب ونواقص المخزون
          </h3>
          <p class="mt-0.5 text-xs text-text-muted truncate">
            الأصناف التي وصلت أرصدتها إلى الحد الأدنى أو نفدت
          </p>
        </div>
      </div>

      <span
        class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-black tabular-nums"
        :class="
          items.length
            ? 'bg-amber-500/15 text-amber-700 border border-amber-500/35 dark:bg-amber-400/20 dark:text-amber-200'
            : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/35 dark:bg-emerald-400/20 dark:text-emerald-200'
        "
      >
        {{ items.length }} صنف
      </span>
    </div>

    <!-- حالة عدم وجود نواقص -->
    <div
      v-if="!items.length"
      class="relative z-10 flex flex-col items-center justify-center text-center px-4 py-10 rounded-xl border border-dashed border-emerald-500/35 bg-emerald-500/[0.04]"
    >
      <div
        class="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2.5 ring-1 ring-emerald-500/30"
      >
        <CheckCircleIcon class="h-6 w-6" />
      </div>
      <p class="text-sm font-bold text-text-primary">جميع أرصدة المخازن في المستوى الآمن</p>
      <p class="mt-1 text-xs text-text-muted max-w-xs">
        لا توجد أصناف بلغت حد الطلب المحدد في أي مخزن حالياً.
      </p>
    </div>

    <!-- جدول الأصناف الناقصة -->
    <div v-else class="relative z-10 overflow-x-auto max-h-[380px] overflow-y-auto">
      <table class="w-full text-right border-collapse">
        <thead class="sticky top-0 z-10 bg-surface-card">
          <tr
            class="border-b border-surface-border text-[11px] font-extrabold text-text-muted uppercase tracking-wider"
          >
            <th class="py-2.5 px-2.5">الصنف والمخزن</th>
            <th class="py-2.5 px-2.5 text-center">الرصيد الحالي</th>
            <th class="py-2.5 px-2.5 text-center">حد الطلب</th>
            <th class="py-2.5 px-2.5 text-left">الحالة</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/60 text-xs">
          <tr
            v-for="item in items"
            :key="`${item.item_id}-${item.store_name}`"
            class="transition-colors duration-150 hover:bg-amber-500/[0.05] dark:hover:bg-amber-500/[0.1]"
          >
            <td class="py-2.5 px-2.5">
              <p class="font-bold text-text-primary">{{ item.item_name }}</p>
              <p class="mt-0.5 text-[11px] font-medium text-text-muted">
                المخزن: {{ item.store_name }}
              </p>
            </td>

            <td class="py-2.5 px-2.5 text-center whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-md px-2 py-0.5 font-black tabular-nums"
                :class="
                  Number(item.current_quantity) <= 0
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                "
              >
                {{ formatQuantity(item.current_quantity) }}
              </span>
            </td>

            <td
              class="py-2.5 px-2.5 text-center whitespace-nowrap font-bold text-text-secondary tabular-nums"
            >
              {{ formatQuantity(item.reorder_level) }}
            </td>

            <td class="py-2.5 px-2.5 text-left whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-extrabold"
                :class="
                  Number(item.current_quantity) <= 0
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                    : 'bg-amber-500/20 text-amber-700 border border-amber-500/40 dark:bg-amber-400/25 dark:text-amber-200'
                "
              >
                {{ Number(item.current_quantity) <= 0 ? 'نفد الرصيد' : 'بلغ حد الطلب' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<script setup>
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  staggerIndex: {
    type: Number,
    default: 12,
  },
})

const formatQuantity = (value) => {
  const num = Number(value) || 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num)
}
</script>
