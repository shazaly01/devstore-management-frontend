<!-- src/views/pricing/components/BulkRepriceTable.vue -->
<template>
  <AppCard>
    <!-- رأس الجدول والإحصائيات السريعة -->
    <div
      class="p-4 border-b border-surface-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-lg font-bold text-text-primary">معاينة نتائج التسعير الجماعي</h2>
        <p class="text-xs text-text-muted mt-0.5">
          راجع الأسعار المقترحة، يمكنك تعديل أي سعر مباشرة في الجدول قبل الحفظ والاعتماد.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div
          class="text-xs bg-surface-ground px-3 py-1.5 rounded-lg border border-surface-border font-medium"
        >
          إجمالي الأصناف: <span class="font-bold text-primary">{{ editableItems.length }}</span>
        </div>
      </div>
    </div>

    <!-- جدول المعاينة -->
    <AppTable
      :headers="tableHeaders"
      :items="editableItems"
      :is-loading="isLoading"
      :row-clickable="false"
    >
      <!-- اسم الصنف والتصنيف -->
      <template #cell-item_info="{ item }">
        <div class="flex flex-col py-1">
          <span class="font-bold text-text-primary text-sm">{{ item.item_name }}</span>
          <span class="text-xs text-text-muted">{{ item.category_name || 'عام' }}</span>
        </div>
      </template>

      <!-- الوحدة -->
      <template #cell-unit_name="{ item }">
        <div class="flex flex-col items-start gap-0.5">
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded bg-surface-ground border border-surface-border"
          >
            {{ item.unit_name }}
          </span>
          <span v-if="item.conversion_factor > 1" class="text-[10px] text-text-muted font-mono">
            معامل: {{ item.conversion_factor }}
          </span>
        </div>
      </template>

      <!-- التكلفة الحالية والتكلفة المتوقعة -->
      <template #cell-cost_info="{ item }">
        <div class="flex flex-col text-xs font-mono">
          <span class="font-bold text-text-primary">
            الحالية: {{ formatNumber(item.current_cost) }}
          </span>
          <span
            v-if="item.expected_cost !== item.current_cost"
            class="text-emerald-600 dark:text-emerald-400 font-semibold"
          >
            الجديدة: {{ formatNumber(item.expected_cost) }}
          </span>
          <span v-if="item.reference_foreign_cost" class="text-text-muted text-[11px]">
            {{ formatNumber(item.reference_foreign_cost) }} {{ item.foreign_currency_code }}
          </span>
        </div>
      </template>

      <!-- السعر الحالي -->
      <template #cell-current_price="{ item }">
        <span class="font-mono text-sm text-text-secondary font-bold">
          {{ formatNumber(item.current_price) }}
        </span>
      </template>

      <!-- السعر المقترح (قابل للتعديل المباشر) -->
      <template #cell-suggested_price="{ item }">
        <div class="w-36">
          <AppCurrencyInput
            :id="`suggested-price-${item.item_id}-${item.item_unit_id}`"
            v-model="item.suggested_price"
            :precision="2"
            input-class="!py-1 text-xs"
            @update:model-value="recalculateItemMargin(item)"
          />
        </div>
      </template>

      <!-- مقارنة الهامش (الحالي مقابل المتوقع) -->
      <template #cell-margin_comparison="{ item }">
        <div class="flex items-center gap-2 text-xs font-mono">
          <span
            :class="
              item.current_margin_percentage <= 0
                ? 'text-rose-500 font-bold'
                : 'text-text-secondary'
            "
          >
            {{ formatNumber(item.current_margin_percentage) }}%
          </span>
          <span class="text-text-muted">&larr;</span>
          <span
            :class="[
              'font-bold px-1.5 py-0.5 rounded',
              item.expected_margin_percentage > item.current_margin_percentage
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : item.expected_margin_percentage < item.current_margin_percentage
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-surface-ground text-text-primary',
            ]"
          >
            {{ formatNumber(item.expected_margin_percentage) }}%
          </span>
        </div>
      </template>

      <!-- فرق السعر وقاعدة التقريب -->
      <template #cell-difference="{ item }">
        <div class="flex flex-col text-xs font-mono">
          <span
            :class="[
              'font-bold',
              item.suggested_price - item.current_price > 0
                ? 'text-emerald-600'
                : item.suggested_price - item.current_price < 0
                  ? 'text-rose-600'
                  : 'text-text-muted',
            ]"
          >
            {{ item.suggested_price - item.current_price > 0 ? '+' : '' }}
            {{ formatNumber(item.suggested_price - item.current_price) }}
          </span>
          <span class="text-[10px] text-text-muted">{{ item.rounding_rule }}</span>
        </div>
      </template>
    </AppTable>

    <!-- شريط تأكيد واعتماد التسعير النهائي -->
    <div
      v-if="editableItems.length > 0"
      class="p-4 bg-surface-ground border-t border-surface-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
    >
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
        <div class="w-full md:w-64">
          <AppInput
            id="apply-notes"
            v-model="notes"
            placeholder="ملاحظات أو سبب التعديل (اختياري)..."
          />
        </div>
      </div>

      <div class="flex items-center gap-3 justify-end">
        <AppButton type="button" variant="secondary" @click="$emit('cancel')" :disabled="isSaving">
          إلغاء المعاينة
        </AppButton>

        <AppButton
          type="button"
          @click="handleApply"
          :disabled="isSaving || editableItems.length === 0"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          <span v-if="isSaving">جاري اعتماد وحفظ الأسعار...</span>
          <span v-else>اعتماد وتطبيق الأسعار الجديدة ({{ editableItems.length }})</span>
        </AppButton>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  previewData: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false },
  selectedCurrencyId: { type: [Number, String], default: null },
  selectedExchangeRate: { type: [Number, String], default: null },
})

const emit = defineEmits(['apply', 'cancel'])

const editableItems = ref([])
const notes = ref('')

const tableHeaders = [
  { key: 'item_info', label: 'بيانات الصنف' },
  { key: 'unit_name', label: 'الوحدة' },
  { key: 'cost_info', label: 'التكلفة (الحالية / الجديدة)' },
  { key: 'current_price', label: 'السعر الحالي' },
  { key: 'suggested_price', label: 'السعر الجديد المقترح', class: 'w-36' },
  { key: 'margin_comparison', label: 'الهامش (الحالي ← المتوقع)' },
  { key: 'difference', label: 'فارق السعر' },
]

// مزامنة البيانات عند ورود نتائج معاينة جديدة
watch(
  () => props.previewData,
  (newData) => {
    editableItems.value = (newData || []).map((row) => ({
      ...row,
      suggested_price: Number(row.suggested_price) || 0,
      expected_cost:
        row.expected_cost !== undefined && row.expected_cost !== null
          ? Number(row.expected_cost)
          : Number(row.current_cost) || 0,
      expected_margin_percentage: Number(row.expected_margin_percentage) || 0,
      current_margin_percentage: Number(row.current_margin_percentage) || 0,
      conversion_factor: Number(row.conversion_factor) || 1,
    }))
  },
  { immediate: true, deep: true },
)

// إعادة احتساب هامش الإضافة على التكلفة (Markup) عند قيام المستخدم بتعديل السعر يدوياً
const recalculateItemMargin = (item) => {
  const price = Number(item.suggested_price) || 0
  const cost = Number(item.expected_cost ?? item.current_cost) || 0

  if (cost > 0) {
    const margin = ((price - cost) / cost) * 100
    item.expected_margin_percentage = Math.round(margin * 100) / 100
  } else {
    item.expected_margin_percentage = 0
  }
}

// تنسيق الأرقام
const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// تجهيز الـ Payload واعتماد التعديلات مع تمرير التكلفة الجديدة المعتمدة
const handleApply = () => {
  const payload = {
    currency_id: props.selectedCurrencyId ? Number(props.selectedCurrencyId) : null,
    exchange_rate: props.selectedExchangeRate ? Number(props.selectedExchangeRate) : null,
    change_type: 'bulk_reprice',
    notes: notes.value ? notes.value.trim() : null,
    items: editableItems.value.map((item) => ({
      item_id: Number(item.item_id),
      item_unit_id: Number(item.item_unit_id),
      old_price: Number(item.current_price),
      new_price: Number(item.suggested_price),
      old_cost: item.current_cost !== null ? Number(item.current_cost) : null,
      new_cost:
        item.expected_cost !== null
          ? Number(item.expected_cost)
          : item.current_cost !== null
            ? Number(item.current_cost)
            : null,
      new_foreign_cost:
        item.reference_foreign_cost !== null ? Number(item.reference_foreign_cost) : null,
    })),
  }

  emit('apply', payload)
}
</script>
