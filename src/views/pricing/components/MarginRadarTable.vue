<!-- src/views/pricing/components/MarginRadarTable.vue -->
<template>
  <div class="space-y-4 text-right" dir="rtl">
    <!-- بطاقة الفلترة والملخص -->
    <AppCard>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

        <div class="flex items-center gap-2 self-end md:self-center flex-wrap">
          <div
            class="px-3 py-1.5 rounded-lg border border-danger/30 bg-danger/10 text-danger text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span class="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
            أصناف بهامش سالب: {{ negativeMarginCount }}
          </div>

          <div
            class="px-3 py-1.5 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs font-bold shadow-sm"
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
          <div class="flex flex-col py-1 text-right">
            <div class="flex items-center gap-2">
              <span class="font-bold text-text-primary text-sm">{{ item.item_name }}</span>
              <AppBadge v-if="item.is_negative_margin" variant="danger" size="xs">
                هامش سالب
              </AppBadge>
            </div>
            <span class="text-xs text-text-muted">{{ item.category_name || 'عام' }}</span>
          </div>
        </template>

        <!-- الوحدة -->
        <template #cell-unit_name="{ item }">
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded bg-surface-ground border border-surface-border text-text-secondary"
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
          <div class="flex flex-col text-xs font-mono text-right">
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
              'font-mono font-bold text-xs px-2 py-0.5 rounded border inline-block',
              item.current_margin_percentage <= 0
                ? 'bg-danger/10 text-danger border-danger/30'
                : 'bg-warning/10 text-warning border-warning/30',
            ]"
          >
            {{ formatNumber(item.current_margin_percentage) }}%
          </span>
        </template>

        <!-- الحد الأدنى المطلوب -->
        <template #cell-min_margin_percentage="{ item }">
          <span class="font-mono text-xs text-text-secondary font-semibold">
            {{ formatNumber(item.min_margin_percentage) }}%
          </span>
        </template>

        <!-- فجوة التآكل -->
        <template #cell-margin_gap_percentage="{ item }">
          <span class="font-mono text-xs font-bold text-danger">
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
import AppBadge from '@/components/ui/AppBadge.vue'

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
