<!-- src/views/pricing/components/ForeignCostTable.vue -->
<template>
  <AppCard>
    <!-- رأس الجدول والإحصائيات -->
    <div
      class="p-4 border-b border-surface-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-lg font-bold text-text-primary">معاينة ومطابقة التكلفة بالعملة الأجنبية</h2>
        <p class="text-xs text-text-muted mt-0.5">
          راجع التكلفة الأجنبية المحسوبة لكل صنف ووحدة، ويمكنك تعديل أي قيمة يدوياً قبل الاعتماد
          النهائي.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div
          class="text-xs bg-surface-ground px-3 py-1.5 rounded-lg border border-surface-border font-medium"
        >
          عدد الوحدات المعروضة:
          <span class="font-bold text-primary">{{ editableItems.length }}</span>
        </div>
      </div>
    </div>

    <!-- جدول المعاينة والتعديل -->
    <AppTable
      :headers="tableHeaders"
      :items="editableItems"
      :is-loading="isLoading"
      :row-clickable="false"
    >
      <!-- بيانات الصنف والتصنيف -->
      <template #cell-item_info="{ item }">
        <div class="flex flex-col py-1">
          <span class="font-bold text-text-primary text-sm">{{ item.item_name }}</span>
          <span class="text-xs text-text-muted">{{ item.category_name || 'عام' }}</span>
        </div>
      </template>

      <!-- الوحدة ومعامل التحويل -->
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

      <!-- التكلفة المحلية وسعر البيع الحالي -->
      <template #cell-local_prices="{ item }">
        <div class="flex flex-col text-xs font-mono">
          <span class="font-bold text-text-primary">
            التكلفة: {{ formatNumber(item.current_cost) }}
          </span>
          <span class="text-text-secondary"> البيع: {{ formatNumber(item.current_price) }} </span>
        </div>
      </template>

      <!-- التكلفة الأجنبية السابقة إن وجدت -->
      <template #cell-current_foreign="{ item }">
        <span class="font-mono text-xs text-text-muted">
          {{
            item.current_foreign_cost !== null
              ? formatNumber(item.current_foreign_cost)
              : 'غير محددة'
          }}
        </span>
      </template>

      <!-- التكلفة الأجنبية المقترحة (حقل إدخال فوري قابل للتعديل) -->
      <template #cell-suggested_foreign="{ item }">
        <div class="w-32">
          <input
            type="number"
            step="0.0001"
            min="0"
            v-model.number="item.suggested_foreign_cost"
            class="w-full text-left font-mono font-bold px-2.5 py-1 text-sm border-2 rounded-md bg-white dark:bg-surface-ground border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </template>

      <!-- التكلفة المعاد تقديرها بالعملة المحلية بناءً على الصرف المدخل -->
      <template #cell-calculated_cost="{ item }">
        <div class="flex flex-col text-xs font-mono">
          <span class="font-bold text-emerald-600 dark:text-emerald-400">
            {{ formatNumber(item.suggested_foreign_cost * (selectedExchangeRate || 1)) }}
          </span>
          <span class="text-[10px] text-text-muted">بسعر الصرف المعتمد</span>
        </div>
      </template>
    </AppTable>

    <!-- شريط تثبيت واعتماد التكلفة الأجنبية -->
    <div
      v-if="editableItems.length > 0"
      class="p-4 bg-surface-ground border-t border-surface-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
    >
      <div class="text-xs text-text-muted">
        سيتم تثبيت التكلفة بالعملة الأجنبية لجميع الوحدات المذكورة وربط الصنف بالعملة المحددة.
      </div>

      <div class="flex items-center gap-3 justify-end">
        <AppButton type="button" variant="secondary" @click="$emit('cancel')" :disabled="isSaving">
          إلغاء المعاينة
        </AppButton>

        <AppButton
          type="button"
          @click="handleApply"
          :disabled="isSaving || editableItems.length === 0"
          class="bg-primary hover:bg-primary-hover text-white font-bold"
        >
          <span v-if="isSaving">جاري التثبيت والحفظ...</span>
          <span v-else>اعتماد وتثبيت التكلفة الأجنبية ({{ editableItems.length }})</span>
        </AppButton>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  previewData: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false },
  selectedCurrencyId: { type: [Number, String], default: null },
  selectedExchangeRate: { type: [Number, String], default: 1 },
})

const emit = defineEmits(['apply', 'cancel'])

const editableItems = ref([])

const tableHeaders = [
  { key: 'item_info', label: 'بيانات الصنف' },
  { key: 'unit_name', label: 'الوحدة' },
  { key: 'local_prices', label: 'الأسعار المحلية الحالية' },
  { key: 'current_foreign', label: 'التكلفة الأجنبية السابقة' },
  { key: 'suggested_foreign', label: 'التكلفة الأجنبية المعتمدة', class: 'w-36' },
  { key: 'calculated_cost', label: 'المقابل المحلي بالصرف' },
]

watch(
  () => props.previewData,
  (newData) => {
    editableItems.value = (newData || []).map((row) => ({
      ...row,
      suggested_foreign_cost:
        row.suggested_foreign_cost !== undefined && row.suggested_foreign_cost !== null
          ? Number(row.suggested_foreign_cost)
          : 0,
      current_cost: Number(row.current_cost) || 0,
      current_price: Number(row.current_price) || 0,
      conversion_factor: Number(row.conversion_factor) || 1,
    }))
  },
  { immediate: true, deep: true },
)

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

const handleApply = () => {
  const payload = {
    currency_id: Number(props.selectedCurrencyId),
    items: editableItems.value.map((item) => ({
      item_unit_id: Number(item.item_unit_id),
      foreign_cost: Number(item.suggested_foreign_cost),
    })),
  }

  emit('apply', payload)
}
</script>
