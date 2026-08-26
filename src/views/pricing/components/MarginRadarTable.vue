<!-- src/views/pricing/components/MarginRadarTable.vue -->
<template>
  <div class="space-y-4">
    <!-- بطاقة الفلترة والملخص -->
    <AppCard>
      <div class="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="w-full md:w-72">
          <AppDropdown
            id="radar-category-filter"
            label="تصفية حسب التصنيف"
            v-model="selectedCategory"
            :options="categoryOptions"
            placeholder="جميع التصنيفات"
            :show-clear="true"
            @change="handleCategoryFilter"
          />
        </div>

        <div class="flex items-center gap-2 self-end md:self-center">
          <div
            class="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5"
          >
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            أصناف بهامش سالب: {{ negativeMarginCount }}
          </div>

          <div
            class="px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-bold"
          >
            إجمالي الأصناف المهددة: {{ items.length }}
          </div>

          <AppButton
            type="button"
            variant="secondary"
            @click="$emit('refresh')"
            :disabled="isLoading"
            class="text-xs"
          >
            تحديث الرادار
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- جدول الرادار -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="filteredItems"
        :is-loading="isLoading"
        :row-clickable="false"
      >
        <!-- اسم الصنف والتصنيف -->
        <template #cell-item_info="{ item }">
          <div class="flex flex-col py-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-text-primary text-sm">{{ item.item_name }}</span>
              <span
                v-if="item.is_negative_margin"
                class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500 text-white"
              >
                هامش سالب
              </span>
            </div>
            <span class="text-xs text-text-muted">{{ item.category_name || 'عام' }}</span>
          </div>
        </template>

        <!-- الوحدة -->
        <template #cell-unit_name="{ item }">
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded bg-surface-ground border border-surface-border"
          >
            {{ item.unit_name }}
          </span>
        </template>

        <!-- السعر الحالي -->
        <template #cell-current_price="{ item }">
          <span class="font-mono text-sm font-bold text-text-primary">
            {{ formatNumber(item.current_price) }}
          </span>
        </template>

        <!-- التكلفة الحالية وتكلفة الاستبدال -->
        <template #cell-cost_details="{ item }">
          <div class="flex flex-col text-xs font-mono">
            <span class="font-semibold text-text-secondary">
              الحالية: {{ formatNumber(item.current_cost) }}
            </span>
            <span class="text-text-muted text-[11px]">
              الاستبدال: {{ formatNumber(item.replacement_cost) }}
            </span>
          </div>
        </template>

        <!-- الهامش الحالي -->
        <template #cell-current_margin="{ item }">
          <span
            :class="[
              'font-mono font-bold text-xs px-2 py-1 rounded',
              item.current_margin_percentage <= 0
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
            ]"
          >
            {{ formatNumber(item.current_margin_percentage) }}%
          </span>
        </template>

        <!-- الحد الأدنى المطلوب -->
        <template #cell-min_margin_percentage="{ item }">
          <span class="font-mono text-xs text-text-secondary">
            {{ formatNumber(item.min_margin_percentage) }}%
          </span>
        </template>

        <!-- فجوة التآكل -->
        <template #cell-margin_gap_percentage="{ item }">
          <span class="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
            -{{ formatNumber(item.margin_gap_percentage) }}%
          </span>
        </template>

        <!-- سياسة التسعير -->
        <template #cell-pricing_policy="{ item }">
          <span class="text-xs text-text-muted">
            {{ item.pricing_policy || 'افتراضي' }}
          </span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
})

const emit = defineEmits(['filter-change', 'refresh'])

const selectedCategory = ref(null)

const categoryOptions = computed(() => {
  return props.categories.map((c) => ({
    id: c.id,
    name: c.full_path || c.name,
  }))
})

const filteredItems = computed(() => {
  if (!selectedCategory.value) {
    return props.items
  }
  return props.items.filter((i) => i.category_id === Number(selectedCategory.value))
})

const negativeMarginCount = computed(() => {
  return props.items.filter((i) => i.is_negative_margin || i.current_margin_percentage <= 0).length
})

const tableHeaders = [
  { key: 'item_info', label: 'الصنف' },
  { key: 'unit_name', label: 'الوحدة' },
  { key: 'current_price', label: 'سعر البيع الحالي' },
  { key: 'cost_details', label: 'التكلفة الحالية / الاستبدال' },
  { key: 'current_margin', label: 'الهامش الحالي' },
  { key: 'min_margin_percentage', label: 'الحد الأدنى' },
  { key: 'margin_gap_percentage', label: 'مقدار العجز (الفجوة)' },
  { key: 'pricing_policy', label: 'سياسة التسعير' },
]

const handleCategoryFilter = () => {
  emit('filter-change', {
    category_id: selectedCategory.value ? Number(selectedCategory.value) : null,
  })
}

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
