<!-- src/views/dashboard/components/ExpiringItemsTable.vue -->
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
    <div class="relative z-10 flex flex-col gap-3.5 mb-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="dashboard-icon-gem flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          >
            <ClockIcon class="h-5 w-5" stroke-width="1.85" />
          </div>
          <div class="min-w-0">
            <h3 class="text-sm sm:text-base font-extrabold text-text-primary truncate">
              تنبيهات انتهاء الصلاحية
            </h3>
            <p class="mt-0.5 text-xs text-text-muted truncate">
              الأصناف المتوفرة التي تنتهي صلاحيتها خلال
              <span class="font-extrabold text-text-primary tabular-nums">{{ expiryDays }}</span>
              يوم
            </p>
          </div>
        </div>

        <span
          class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-black tabular-nums"
          :class="
            items.length
              ? 'bg-rose-500/15 text-rose-700 border border-rose-500/35 dark:bg-rose-400/20 dark:text-rose-200'
              : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/35 dark:bg-emerald-400/20 dark:text-emerald-200'
          "
        >
          {{ items.length }} صنف
        </span>
      </div>

      <!-- شريط فلترة مدة انتهاء الصلاحية (أزرار سريعة + إدخال بالأيام) -->
      <div
        class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-surface-border/80 bg-surface-ground/70 p-2"
      >
        <!-- أزرار الفترات السريعة -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="preset in dayPresets"
            :key="preset.days"
            type="button"
            :disabled="loading"
            @click="selectPreset(preset.days)"
            class="rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition-all duration-150 cursor-pointer disabled:opacity-50"
            :class="
              Number(expiryDays) === preset.days
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'bg-surface-card text-text-secondary border border-surface-border hover:border-primary/50 hover:text-primary'
            "
          >
            {{ preset.label }}
          </button>
        </div>

        <!-- إدخال عدد الأيام يدوياً -->
        <form @submit.prevent="applyCustomDays" class="flex items-center gap-1.5">
          <label for="expiry-days-input" class="text-[11px] font-bold text-text-muted">
            بالأيام:
          </label>
          <input
            id="expiry-days-input"
            v-model.number="customDaysInput"
            type="number"
            min="1"
            max="3650"
            placeholder="30"
            :disabled="loading"
            class="w-16 rounded-lg border border-surface-border bg-surface-card px-2 py-1 text-center text-xs font-extrabold text-text-primary tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            :disabled="loading || !isValidCustomDays"
            class="inline-flex items-center gap-1 rounded-lg bg-surface-card border border-surface-border px-2.5 py-1 text-[11px] font-extrabold text-text-primary hover:border-primary hover:text-primary disabled:opacity-45 cursor-pointer transition-colors"
            title="تطبيق عدد الأيام"
          >
            <FunnelIcon class="h-3.5 w-3.5 text-primary" />
            <span>تطبيق</span>
          </button>
        </form>
      </div>
    </div>

    <!-- حالة عدم وجود أصناف قريبة الانتهاء -->
    <div
      v-if="!items.length"
      class="relative z-10 flex flex-col items-center justify-center text-center px-4 py-10 rounded-xl border border-dashed border-emerald-500/35 bg-emerald-500/[0.04]"
    >
      <div
        class="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2.5 ring-1 ring-emerald-500/30"
      >
        <CheckBadgeIcon class="h-6 w-6" />
      </div>
      <p class="text-sm font-bold text-text-primary">
        لا توجد أصناف تنتهي صلاحيتها خلال {{ expiryDays }} يوم
      </p>
      <p class="mt-1 text-xs text-text-muted max-w-xs">
        يمكنك زيادة عدد الأيام من الشريط أعلاه لفحص فترة زمنية أطول.
      </p>
    </div>

    <!-- جدول الأصناف المنتهية وقريبة الانتهاء -->
    <div v-else class="relative z-10 overflow-x-auto max-h-[380px] overflow-y-auto">
      <table class="w-full text-right border-collapse">
        <thead class="sticky top-0 z-10 bg-surface-card">
          <tr
            class="border-b border-surface-border text-[11px] font-extrabold text-text-muted uppercase tracking-wider"
          >
            <th class="py-2.5 px-2.5">الصنف والمخزن</th>
            <th class="py-2.5 px-2.5 text-center">الرصيد</th>
            <th class="py-2.5 px-2.5 text-center">تاريخ الانتهاء</th>
            <th class="py-2.5 px-2.5 text-left">الحالة</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border/60 text-xs">
          <tr
            v-for="item in items"
            :key="`${item.item_id}-${item.store_name}`"
            class="transition-colors duration-150 hover:bg-rose-500/[0.04] dark:hover:bg-rose-500/[0.08]"
          >
            <!-- اسم الصنف والمخزن -->
            <td class="py-2.5 px-2.5">
              <p class="font-bold text-text-primary">{{ item.item_name }}</p>
              <p class="mt-0.5 text-[11px] font-medium text-text-muted">
                المخزن: {{ item.store_name }}
              </p>
            </td>

            <!-- الرصيد المتاح -->
            <td class="py-2.5 px-2.5 text-center whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1 rounded-md border border-surface-border bg-surface-ground/80 px-2 py-0.5 font-extrabold text-text-primary tabular-nums"
              >
                <span>{{ formatQuantity(item.current_quantity) }}</span>
                <span class="text-[10px] font-semibold text-text-muted">{{ item.unit_name }}</span>
              </span>
            </td>

            <!-- تاريخ الانتهاء -->
            <td
              class="py-2.5 px-2.5 text-center whitespace-nowrap font-bold text-text-secondary tabular-nums"
            >
              {{ item.expiry_date }}
            </td>

            <!-- شارة المدة المتبقية -->
            <td class="py-2.5 px-2.5 text-left whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-extrabold tabular-nums"
                :class="getUrgencyBadgeClass(item)"
              >
                {{ getUrgencyLabel(item) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ClockIcon, CheckBadgeIcon, FunnelIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  expiryDays: {
    type: Number,
    default: 30,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  staggerIndex: {
    type: Number,
    default: 11,
  },
})

const emit = defineEmits(['change-days'])

const dayPresets = [
  { label: 'أسبوع', days: 7 },
  { label: 'شهر', days: 30 },
  { label: 'شهرين', days: 60 },
  { label: '3 أشهر', days: 90 },
]

const customDaysInput = ref(props.expiryDays)

watch(
  () => props.expiryDays,
  (newVal) => {
    customDaysInput.value = newVal
  },
)

const isValidCustomDays = computed(() => {
  const val = Number(customDaysInput.value)
  return Number.isInteger(val) && val >= 1 && val <= 3650
})

const selectPreset = (days) => {
  customDaysInput.value = days
  if (Number(props.expiryDays) !== days) {
    emit('change-days', days)
  }
}

const applyCustomDays = () => {
  if (!isValidCustomDays.value) return
  const days = Number(customDaysInput.value)
  if (Number(props.expiryDays) !== days) {
    emit('change-days', days)
  }
}

const getUrgencyBadgeClass = (item) => {
  const days = Number(item.days_remaining)
  if (item.is_expired || days < 0) {
    return 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
  }
  if (days <= 7) {
    return 'bg-rose-500/20 text-rose-700 border border-rose-500/40 dark:bg-rose-400/25 dark:text-rose-200'
  }
  if (days <= 30) {
    return 'bg-amber-500/20 text-amber-700 border border-amber-500/40 dark:bg-amber-400/25 dark:text-amber-200'
  }
  return 'bg-sky-500/15 text-sky-700 border border-sky-500/35 dark:bg-sky-400/20 dark:text-sky-200'
}

const getUrgencyLabel = (item) => {
  const days = Number(item.days_remaining)
  if (days < 0) {
    return `منتهي منذ ${Math.abs(days)} يوم`
  }
  if (days === 0) {
    return 'ينتهي اليوم'
  }
  if (days === 1) {
    return 'متبقي يوم واحد'
  }
  return `متبقي ${days} يوم`
}

const formatQuantity = (value) => {
  const num = Number(value) || 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num)
}
</script>
