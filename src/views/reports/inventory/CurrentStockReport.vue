<!--src/views/reports/inventory/CurrentStockReport.vue-->
<template>
  <div class="space-y-6 print:hidden text-right font-sans" dir="rtl">
    <!-- الترويسة العلوية -->
    <div>
      <h1 class="text-2xl font-black text-text-primary tracking-tight">تقرير الأرصدة اللحظية</h1>
      <p class="text-xs text-text-muted mt-1">
        جرد شامل وتقييم للكميات المتوفرة والقيمة المالية وهوامش الربحية
      </p>
    </div>

    <!-- شريط الفلاتر والإجراءات -->
    <AppCard>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div class="w-full">
          <StoresDropdown
            id="filter-store-id"
            label="تصفية حسب المخزن"
            v-model="filters.store_id"
          />
        </div>

        <div class="w-full">
          <CategoriesDropdown
            id="filter-category-id"
            label="تصفية حسب التصنيف"
            v-model="filters.category_id"
          />
        </div>

        <div class="flex gap-2 w-full lg:col-span-2 justify-end">
          <AppButton
            @click="handleRefresh"
            :disabled="loading"
            variant="secondary"
            class="flex-1 md:flex-none px-4"
          >
            <ArrowPathIcon class="w-4 h-4 ml-1.5" :class="{ 'animate-spin': loading }" />
            تحديث البيانات
          </AppButton>

          <AppButton
            @click="handlePrint"
            :disabled="displaySummary.total_items === 0 || currentStockList.length === 0"
            class="flex-1 md:flex-none px-4"
          >
            <PrinterIcon class="w-4 h-4 ml-1.5" />
            طباعة التقرير
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- بطاقات ملخص الأرصدة والمخزون -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AppCard class="p-4 border-r-4 border-r-primary bg-surface-section shadow-sm">
        <div class="text-[10px] text-primary uppercase tracking-widest mb-1 font-bold">
          إجمالي الأصناف
        </div>
        <div class="text-xl font-black text-primary font-mono">
          {{ displaySummary.total_items }}
          <span class="text-xs font-normal text-text-muted">صنف</span>
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-info bg-surface-section shadow-sm">
        <div class="text-[10px] text-info uppercase tracking-widest mb-1 font-bold">
          إجمالي كميات المخزون
        </div>
        <div class="text-xl font-black text-info font-mono">
          {{ formatNumber(displaySummary.grand_total_quantity) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-warning bg-surface-section shadow-sm">
        <div class="text-[10px] text-warning uppercase tracking-widest mb-1 font-bold">
          إجمالي قيمة التكلفة
        </div>
        <div class="text-xl font-black text-warning font-mono">
          {{ formatNumber(displaySummary.grand_total_cost_value) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-success bg-surface-section shadow-sm">
        <div class="text-[10px] text-success uppercase tracking-widest mb-1 font-bold">
          إجمالي القيمة البيعية
        </div>
        <div class="text-xl font-black text-success font-mono">
          {{ formatNumber(displaySummary.grand_total_sale_value) }}
        </div>
      </AppCard>
    </div>

    <!-- جدول الأرصدة اللحظية التفصيلي -->
    <AppCard>
      <AppTable :headers="tableHeaders" :items="currentStockList" :is-loading="loading">
        <template #cell-stock_id="{ item }">
          <span class="font-mono text-xs text-text-muted">#{{ item.stock_id }}</span>
        </template>

        <template #cell-item_name="{ item }">
          <div class="flex flex-col">
            <span class="font-bold text-text-primary text-xs">
              {{ item.item_name }}
            </span>
            <span class="text-[10px] text-text-muted font-mono">كود: #{{ item.item_id }}</span>
          </div>
        </template>

        <template #cell-store_name="{ item }">
          <span class="text-text-secondary font-medium text-xs">{{
            item.store_name ?? 'غير محدد'
          }}</span>
        </template>

        <template #cell-current_quantity_base="{ item }">
          <span class="text-text-primary font-bold font-mono text-xs">
            {{ formatNumber(item.current_quantity_base) }}
            <span class="text-[11px] font-normal text-text-muted">({{ item.unit1_name }})</span>
          </span>
        </template>

        <template #cell-unit_cost="{ item }">
          <span class="text-text-secondary font-mono text-xs font-medium">{{
            formatNumber(item.unit_cost)
          }}</span>
        </template>

        <template #cell-profit_margin_percentage="{ item }">
          <span
            :class="item.profit_margin_percentage >= 0 ? 'text-success' : 'text-danger'"
            class="font-bold font-mono text-xs"
          >
            {{ formatNumber(item.profit_margin_percentage) }}%
          </span>
        </template>

        <template #cell-unit_price="{ item }">
          <span class="text-primary font-bold font-mono text-xs">{{
            formatNumber(item.unit_price)
          }}</span>
        </template>

        <template #cell-total_cost_value="{ item }">
          <span class="text-text-primary font-black font-mono text-xs">
            {{ formatNumber(item.total_cost_value) }}
          </span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { PrinterIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import CategoriesDropdown from '@/components/forms/CategoriesDropdown.vue'

const router = useRouter()
const reportStore = useReportStore()

const filters = ref({
  store_id: '',
  category_id: '',
})

const { currentStockList, currentStockSummary, loading } = storeToRefs(reportStore)

const displaySummary = computed(() => {
  if (currentStockSummary.value && currentStockSummary.value.total_items > 0) {
    return currentStockSummary.value
  }

  const list = currentStockList.value || []
  return {
    total_items: list.length,
    grand_total_quantity: list.reduce(
      (sum, item) => sum + Number(item.current_quantity_base || 0),
      0,
    ),
    grand_total_cost_value: list.reduce((sum, item) => sum + Number(item.total_cost_value || 0), 0),
    grand_total_sale_value: list.reduce((sum, item) => sum + Number(item.total_sale_value || 0), 0),
  }
})

const tableHeaders = [
  { key: 'stock_id', label: '#' },
  { key: 'item_name', label: 'الصنف' },
  { key: 'store_name', label: 'المستودع' },
  { key: 'current_quantity_base', label: 'الكمية' },
  { key: 'unit_cost', label: 'التكلفة' },
  { key: 'profit_margin_percentage', label: 'الربح %' },
  { key: 'unit_price', label: 'البيع' },
  { key: 'total_cost_value', label: 'إجمالي التكلفة' },
]

const handleRefresh = () => {
  const cleanedFilters = {}
  if (filters.value.store_id) {
    cleanedFilters.store_id = filters.value.store_id
  }
  if (filters.value.category_id) {
    cleanedFilters.category_id = filters.value.category_id
  }

  reportStore.fetchCurrentStock(cleanedFilters)
}

watch(
  () => [filters.value.store_id, filters.value.category_id],
  () => {
    handleRefresh()
  },
)

const handlePrint = () => {
  if (displaySummary.value.total_items === 0 || currentStockList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      reportTitle: 'تقرير جرد الأرصدة وتقييم المخزون اللحظي',
      summary: {
        total_items: displaySummary.value.total_items,
        grand_total_quantity: displaySummary.value.grand_total_quantity,
        grand_total_cost_value: displaySummary.value.grand_total_cost_value,
        grand_total_sale_value: displaySummary.value.grand_total_sale_value,
      },
      items: currentStockList.value.map((stock) => ({
        stock_id: stock.stock_id,
        item_id: stock.item_id,
        item_name: stock.item_name,
        store_name: stock.store_name ?? 'غير محدد',
        current_quantity_base: stock.current_quantity_base,
        unit1_name: stock.unit1_name || '',
        unit_cost: stock.unit_cost,
        profit_margin_percentage: stock.profit_margin_percentage,
        unit_price: stock.unit_price,
        total_cost_value: stock.total_cost_value,
      })),
    }),
  )

  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

const formatNumber = (value) => {
  if (value === undefined || value === null || isNaN(Number(value))) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value)))
}

onMounted(() => {
  handleRefresh()
})
</script>
