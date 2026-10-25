<!-- src/views/pricing/components/ForeignCostTable.vue -->
<template>
  <AppCard class="!p-0 overflow-hidden" dir="rtl">
    <!-- رأس الجدول والإحصائيات -->
    <div
      class="p-4 border-b border-surface-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-right"
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
          إجمالي الوحدات المستهدفة:
          <span class="font-bold text-primary">{{ editableItems.length }}</span>
        </div>
      </div>
    </div>

    <!-- جدول المعاينة والتعديل -->
    <AppTable
      :headers="tableHeaders"
      :items="paginatedItems"
      :is-loading="isLoading"
      :row-clickable="false"
    >
      <!-- بيانات الصنف والتصنيف -->
      <template #cell-item_info="{ item }">
        <div class="flex flex-col py-1 text-right">
          <span class="font-bold text-text-primary text-sm">{{ item.item_name }}</span>
          <span class="text-xs text-text-muted">{{ item.category_name || 'عام' }}</span>
        </div>
      </template>

      <!-- الوحدة ومعامل التحويل -->
      <template #cell-unit_name="{ item }">
        <div class="flex flex-col items-start gap-0.5 text-right">
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded bg-surface-ground border border-surface-border text-text-secondary"
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
        <div class="flex flex-col text-xs font-mono text-right">
          <span class="font-bold text-text-primary">
            التكلفة: {{ formatNumber(item.current_cost) }}
          </span>
          <span class="text-text-secondary"> البيع: {{ formatNumber(item.current_price) }} </span>
        </div>
      </template>

      <!-- التكلفة الأجنبية السابقة مع نوع العملة -->
      <template #cell-current_foreign="{ item }">
        <div
          v-if="item.current_foreign_cost !== null"
          class="flex items-center gap-1.5 font-mono text-xs text-right"
        >
          <span class="text-text-primary font-bold">
            {{ formatNumber(item.current_foreign_cost) }}
          </span>
          <span
            v-if="item.purchase_currency_code"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-ground border border-surface-border text-primary"
          >
            {{ item.purchase_currency_code }}
          </span>
        </div>
        <span v-else class="text-xs text-text-muted font-mono text-right block"> غير محددة </span>
      </template>

      <!-- التكلفة الأجنبية المقترحة (حقل إدخال فوري قابل للتعديل) -->
      <template #cell-suggested_foreign="{ item }">
        <div class="w-36">
          <AppCurrencyInput
            :id="`suggested-foreign-cost-${item.item_unit_id}`"
            v-model="item.suggested_foreign_cost"
            :precision="4"
            input-class="!py-1 text-xs font-bold font-mono text-primary"
          />
        </div>
      </template>

      <!-- التكلفة المعاد تقديرها بالعملة المحلية بناءً على الصرف المدخل -->
      <template #cell-calculated_cost="{ item }">
        <div class="flex flex-col text-xs font-mono text-right">
          <span class="font-bold text-success">
            {{ formatNumber(item.suggested_foreign_cost * (selectedExchangeRate || 1)) }}
          </span>
          <span class="text-[10px] text-text-muted">بسعر الصرف المعتمد</span>
        </div>
      </template>
    </AppTable>

    <!-- شريط الترقيم والتنقل بين الصفحات -->
    <div
      v-if="editableItems.length > 0"
      class="px-4 py-3 border-t border-surface-border flex flex-col sm:flex-row justify-between items-center gap-3 bg-surface-card text-xs text-text-muted"
    >
      <div class="flex items-center gap-2">
        <span>عرض</span>
        <select
          v-model="perPage"
          @change="currentPage = 1"
          class="bg-surface-ground border border-surface-border rounded-lg text-xs font-bold py-1 px-2 text-text-primary outline-none focus:border-primary cursor-pointer"
        >
          <option :value="25" class="bg-surface-section text-text-primary">25</option>
          <option :value="50" class="bg-surface-section text-text-primary">50</option>
          <option :value="100" class="bg-surface-section text-text-primary">100</option>
          <option :value="editableItems.length" class="bg-surface-section text-text-primary">
            الكل ({{ editableItems.length }})
          </option>
        </select>
        <span>عنصر |</span>
        <span>
          عرض <strong class="text-text-primary">{{ startIndex + 1 }}</strong> -
          <strong class="text-text-primary">{{ endIndex }}</strong> من أصل
          <strong class="text-text-primary">{{ editableItems.length }}</strong> وحدة
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span class="font-medium">
          صفحة <strong class="text-text-primary">{{ currentPage }}</strong> من
          <strong class="text-text-primary">{{ totalPages }}</strong>
        </span>

        <div class="flex items-center gap-1">
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="!px-2.5 !py-1 !text-xs font-bold"
          >
            السابق
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
            class="!px-2.5 !py-1 !text-xs font-bold"
          >
            التالي
          </AppButton>
        </div>
      </div>
    </div>

    <!-- شريط تثبيت واعتماد التكلفة الأجنبية -->
    <div
      v-if="editableItems.length > 0"
      class="p-4 bg-surface-ground border-t border-surface-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
    >
      <div class="text-xs text-text-muted">
        سيتم تثبيت التكلفة بالعملة الأجنبية لجميع الوحدات المذكورة في كافة الصفحات وربط الصنف
        بالعملة المحددة.
      </div>

      <div class="flex items-center gap-3 justify-end">
        <AppButton type="button" variant="secondary" @click="$emit('cancel')" :disabled="isSaving">
          إلغاء المعاينة
        </AppButton>

        <AppButton
          type="button"
          @click="handleApply"
          :disabled="isSaving || editableItems.length === 0"
        >
          <span v-if="isSaving">جاري التثبيت والحفظ...</span>
          <span v-else
            >اعتماد وتثبيت التكلفة الأجنبية لكافة الأصناف ({{ editableItems.length }})</span
          >
        </AppButton>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
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
const currentPage = ref(1)
const perPage = ref(25)

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
    currentPage.value = 1
    editableItems.value = (newData || []).map((row) => ({
      ...row,
      purchase_currency_code: row.purchase_currency_code || null,
      purchase_currency_name: row.purchase_currency_name || null,
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

const totalPages = computed(() => {
  if (!editableItems.value.length || perPage.value >= editableItems.value.length) return 1
  return Math.ceil(editableItems.value.length / perPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * perPage.value)

const endIndex = computed(() => {
  const calculatedEnd = startIndex.value + perPage.value
  return calculatedEnd > editableItems.value.length ? editableItems.value.length : calculatedEnd
})

const paginatedItems = computed(() => {
  return editableItems.value.slice(startIndex.value, endIndex.value)
})

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
