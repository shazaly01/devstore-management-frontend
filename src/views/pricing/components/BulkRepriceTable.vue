<!-- src/views/pricing/components/BulkRepriceTable.vue -->
<template>
  <AppCard class="!p-0 overflow-hidden" dir="rtl">
    <div
      class="p-4 border-b border-surface-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-right"
    >
      <div>
        <h2 class="text-lg font-bold text-text-primary">معاينة نتائج التسعير الجماعي</h2>
        <p class="text-xs text-text-muted mt-0.5">
          راجع الأسعار المقترحة، يمكنك تعديل هامش الربح أو السعر مباشرة في الجدول قبل الحفظ
          والاعتماد.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <span>عرض:</span>
          <select
            v-model.number="perPage"
            @change="currentPage = 1"
            class="bg-surface-ground border border-surface-border rounded-lg px-2 py-1 text-text-primary font-medium focus:outline-none focus:border-primary cursor-pointer"
          >
            <option :value="10" class="bg-surface-section text-text-primary">10</option>
            <option :value="20" class="bg-surface-section text-text-primary">20</option>
            <option :value="50" class="bg-surface-section text-text-primary">50</option>
            <option :value="100" class="bg-surface-section text-text-primary">100</option>
          </select>
        </div>

        <div
          class="text-xs bg-surface-ground px-3 py-1.5 rounded-lg border border-surface-border font-medium"
        >
          إجمالي الأصناف: <span class="font-bold text-primary">{{ editableItems.length }}</span>
        </div>
      </div>
    </div>

    <AppTable
      :headers="tableHeaders"
      :items="paginatedItems"
      :is-loading="isLoading"
      :row-clickable="false"
    >
      <template #cell-item_unit="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right">
          <span class="font-bold text-text-primary text-sm leading-snug">{{ item.item_name }}</span>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-text-muted">{{ item.category_name || 'عام' }}</span>
            <span class="text-text-muted text-[10px]">•</span>
            <span
              class="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-ground border border-surface-border text-text-secondary"
            >
              {{ item.unit_name }}
              <span
                v-if="item.conversion_factor > 1"
                class="text-[10px] text-primary mr-1 font-mono"
              >
                (معامل: {{ item.conversion_factor }})
              </span>
            </span>
          </div>
        </div>
      </template>

      <template #cell-cost_details="{ item }">
        <div class="flex flex-col gap-1 py-1 font-mono text-xs w-44 text-right">
          <div class="flex items-center justify-between gap-2">
            <span class="text-text-muted text-[11px]">الحالية:</span>
            <span class="text-text-secondary font-medium">{{
              formatNumber(item.current_cost)
            }}</span>
          </div>

          <div
            v-if="item.expected_cost !== item.current_cost"
            class="flex items-center justify-between gap-2 text-success font-bold"
          >
            <span class="text-[11px]">الجديدة:</span>
            <span>{{ formatNumber(item.expected_cost) }}</span>
          </div>

          <div
            v-if="item.reference_foreign_cost"
            class="flex items-center justify-between gap-2 text-text-muted text-[10px] border-t border-surface-border/60 pt-1 mt-0.5"
          >
            <span>المرجع:</span>
            <span class="font-semibold text-text-secondary">
              {{ formatNumber(item.reference_foreign_cost) }} {{ item.foreign_currency_code }}
            </span>
          </div>
        </div>
      </template>

      <!-- 3. هامش الربح وتتبع العائد (%) -->
      <template #cell-margin_details="{ item }">
        <div class="flex flex-col gap-1.5 py-1 w-36">
          <div class="relative flex items-center">
            <AppInput
              :id="`profit-margin-${item.item_id}-${item.item_unit_id}`"
              type="number"
              step="0.1"
              min="0"
              v-model="item.profit_margin"
              input-class="!py-1 pl-6 pr-2 text-xs text-center font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              @input="handleMarginChange(item)"
            />
            <span class="absolute left-2 text-xs text-text-muted font-bold pointer-events-none"
              >%</span
            >
          </div>

          <!-- مسار التغير في الهامش -->
          <div class="flex items-center justify-between gap-1 text-[11px] font-mono">
            <span
              :class="
                item.current_margin_percentage <= 0 ? 'text-danger font-bold' : 'text-text-muted'
              "
            >
              {{ formatNumber(item.current_margin_percentage) }}%
            </span>
            <span class="text-text-muted text-[10px]">&larr;</span>
            <span
              :class="[
                'font-bold px-1.5 py-0.5 rounded text-[10px] border',
                item.expected_margin_percentage > item.current_margin_percentage
                  ? 'bg-success/10 text-success border-success/30'
                  : item.expected_margin_percentage < item.current_margin_percentage
                    ? 'bg-warning/10 text-warning border-warning/30'
                    : 'bg-surface-ground text-text-primary border-surface-border',
              ]"
            >
              {{ formatNumber(item.expected_margin_percentage) }}%
            </span>
          </div>
        </div>
      </template>

      <!-- 4. التسعير المقترح وفارق السعر -->
      <template #cell-price_details="{ item }">
        <div class="flex flex-col gap-1.5 py-1 w-44 text-right">
          <div>
            <AppCurrencyInput
              :id="`suggested-price-${item.item_id}-${item.item_unit_id}`"
              v-model="item.suggested_price"
              :precision="2"
              input-class="!py-1 text-xs font-bold text-primary"
              @update:model-value="handlePriceChange(item)"
            />
          </div>

          <div class="flex items-center justify-between gap-2 text-xs font-mono">
            <span class="text-text-muted text-[11px]">
              السابق:
              <span class="font-medium text-text-secondary">{{
                formatNumber(item.current_price)
              }}</span>
            </span>

            <span
              dir="ltr"
              :class="[
                'font-bold text-[11px]',
                item.suggested_price - item.current_price > 0
                  ? 'text-success'
                  : item.suggested_price - item.current_price < 0
                    ? 'text-danger'
                    : 'text-text-muted',
              ]"
            >
              {{ item.suggested_price - item.current_price > 0 ? '+' : ''
              }}{{ formatNumber(item.suggested_price - item.current_price) }}
            </span>
          </div>

          <span
            v-if="item.rounding_rule && item.rounding_rule !== 'none'"
            class="text-[10px] text-text-muted"
          >
            تقريب: {{ item.rounding_rule }}
          </span>
        </div>
      </template>
    </AppTable>

    <!-- الترقيم والصفحات -->
    <div
      v-if="editableItems.length > 0"
      class="px-4 py-3 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted bg-surface-card"
    >
      <div>
        عرض من <span class="font-bold text-text-primary">{{ paginationFrom }}</span> إلى
        <span class="font-bold text-text-primary">{{ paginationTo }}</span> من إجمالي
        <span class="font-bold text-text-primary">{{ editableItems.length }}</span> صنف
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="px-2.5 py-1 rounded border border-surface-border bg-surface-ground hover:bg-surface-section text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          &laquo;
        </button>

        <button
          type="button"
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-2.5 py-1 rounded border border-surface-border bg-surface-ground hover:bg-surface-section text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          السابق
        </button>

        <div class="flex items-center gap-1 mx-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            @click="currentPage = page"
            :class="[
              'w-7 h-7 rounded border font-bold text-xs flex items-center justify-center transition-colors cursor-pointer',
              currentPage === page
                ? 'bg-primary text-white border-primary'
                : 'border-surface-border bg-surface-ground hover:bg-surface-section text-text-secondary',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          type="button"
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-2.5 py-1 rounded border border-surface-border bg-surface-ground hover:bg-surface-section text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          التالي
        </button>

        <button
          type="button"
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="px-2.5 py-1 rounded border border-surface-border bg-surface-ground hover:bg-surface-section text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          &raquo;
        </button>
      </div>
    </div>

    <!-- شريط الإجراءات السفلي -->
    <div
      v-if="editableItems.length > 0"
      class="p-4 bg-surface-ground border-t border-surface-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
    >
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
        <div class="w-full md:w-80">
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
          variant="success"
          @click="handleApply"
          :disabled="isSaving || editableItems.length === 0"
        >
          <span v-if="isSaving">جاري اعتماد وحفظ الأسعار...</span>
          <span v-else>اعتماد وتطبيق الأسعار الجديدة ({{ editableItems.length }})</span>
        </AppButton>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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

const currentPage = ref(1)
const perPage = ref(20)

const tableHeaders = [
  { key: 'item_unit', label: 'الصنف والوحدة' },
  { key: 'cost_details', label: 'التكلفة (الحالية / المتوقعة)' },
  { key: 'margin_details', label: 'هامش الربح (%) والمقارنة' },
  { key: 'price_details', label: 'السعر المقترح وفارق السعر' },
]

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
      profit_margin:
        row.profit_margin !== undefined && row.profit_margin !== null
          ? Number(row.profit_margin)
          : Number(row.expected_margin_percentage) || 0,
      expected_margin_percentage: Number(row.expected_margin_percentage) || 0,
      current_margin_percentage: Number(row.current_margin_percentage) || 0,
      conversion_factor: Number(row.conversion_factor) || 1,
    }))
    currentPage.value = 1
  },
  { immediate: true, deep: true },
)

const totalPages = computed(() => {
  return Math.ceil(editableItems.value.length / perPage.value) || 1
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return editableItems.value.slice(start, end)
})

const paginationFrom = computed(() => {
  if (editableItems.value.length === 0) return 0
  return (currentPage.value - 1) * perPage.value + 1
})

const paginationTo = computed(() => {
  const to = currentPage.value * perPage.value
  return to > editableItems.value.length ? editableItems.value.length : to
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2

  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, start + 4)
    } else if (end === total) {
      start = Math.max(1, end - 4)
    }
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const handleMarginChange = (item) => {
  const cost = Number(item.expected_cost ?? item.current_cost) || 0
  const margin = Number(item.profit_margin) || 0

  if (cost > 0) {
    const calculatedPrice = cost * (1 + margin / 100)
    item.suggested_price = Math.round(calculatedPrice * 100) / 100
    item.expected_margin_percentage = Math.round(margin * 100) / 100
  }
}

const handlePriceChange = (item) => {
  const price = Number(item.suggested_price) || 0
  const cost = Number(item.expected_cost ?? item.current_cost) || 0

  if (cost > 0) {
    const margin = ((price - cost) / cost) * 100
    const roundedMargin = Math.round(margin * 100) / 100
    item.profit_margin = roundedMargin
    item.expected_margin_percentage = roundedMargin
  } else {
    item.profit_margin = 0
    item.expected_margin_percentage = 0
  }
}

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00'
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

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
      profit_margin:
        item.profit_margin !== undefined && item.profit_margin !== null
          ? Number(item.profit_margin)
          : null,
      new_foreign_cost:
        item.reference_foreign_cost !== null ? Number(item.reference_foreign_cost) : null,
    })),
  }

  emit('apply', payload)
}
</script>
