<!---src\views\reports\inventory\CurrentStockReport.vue--->
<template>
  <div class="space-y-6 print:hidden">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-black text-white tracking-tight">تقرير الأرصدة اللحظية</h1>
      <p class="text-sm text-gray-400 mt-1">
        جرد شامل وتقييم للكميات المتوفرة والقيمة المالية وهوامش الربحية
      </p>
    </div>

    <!-- Filters & Actions Bar -->
    <AppCard class="border border-gray-800 bg-surface-section/30 backdrop-blur-sm p-4">
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
            :loading="loading"
            variant="secondary"
            class="border-gray-700 hover:border-gray-600 text-gray-200 flex-1 md:flex-none px-5"
          >
            <ArrowPathIcon class="w-5 h-5 ml-2" :class="{ 'animate-spin': loading }" />
            تحديث البيانات
          </AppButton>

          <AppButton
            @click="handlePrint"
            class="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] flex-1 md:flex-none px-5"
          >
            <PrinterIcon class="w-5 h-5 ml-2" />
            طباعة التقرير
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-fuchsia-500 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-fuchsia-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي الأصناف
        </div>
        <div
          class="text-2xl font-black text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]"
        >
          {{ displaySummary.total_items }}
          <span class="text-sm font-normal text-gray-400">صنف</span>
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-cyan-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-cyan-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي كميات المخزون
        </div>
        <div class="text-2xl font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          {{ formatNumber(displaySummary.grand_total_quantity) }}
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-emerald-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-emerald-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي قيمة التكلفة
        </div>
        <div
          class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
        >
          {{ formatNumber(displaySummary.grand_total_cost_value) }}
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-blue-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-blue-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي القيمة البيعية
        </div>
        <div class="text-2xl font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
          {{ formatNumber(displaySummary.grand_total_sale_value) }}
        </div>
      </AppCard>
    </div>

    <!-- Data Table -->
    <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm">
      <AppTable :headers="tableHeaders" :items="currentStockList" :is-loading="loading">
        <template #cell-item_name="{ item }">
          <div class="flex flex-col">
            <span class="font-bold text-cyan-300 transition-all duration-300">
              {{ item.item_name }}
            </span>
            <span class="text-[10px] text-gray-500">كود: #{{ item.item_id }}</span>
          </div>
        </template>

        <template #cell-store_name="{ item }">
          <span class="text-gray-300 font-medium">{{ item.store_name ?? 'غير محدد' }}</span>
        </template>

        <template #cell-current_quantity_base="{ item }">
          <span class="text-gray-200 font-bold">
            {{ formatNumber(item.current_quantity_base) }}
            <span class="text-xs font-normal text-gray-400">({{ item.unit1_name }})</span>
          </span>
        </template>

        <template #cell-unit_cost="{ item }">
          <span class="text-gray-300 font-medium">{{ formatNumber(item.unit_cost) }}</span>
        </template>

        <template #cell-profit_margin_percentage="{ item }">
          <span
            :class="item.profit_margin_percentage >= 0 ? 'text-emerald-400' : 'text-rose-400'"
            class="font-bold text-xs"
          >
            {{ formatNumber(item.profit_margin_percentage) }}%
          </span>
        </template>

        <template #cell-unit_price="{ item }">
          <span class="text-blue-400 font-semibold">{{ formatNumber(item.unit_price) }}</span>
        </template>

        <template #cell-total_cost_value="{ item }">
          <span class="text-emerald-400 font-black drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
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
      grandSummary: {
        grand_total_contract_value: displaySummary.value.grand_total_cost_value,
        grand_total_due_value: displaySummary.value.grand_total_quantity,
        grand_total_paid: displaySummary.value.total_items,
        grand_total_remaining: 0,
        total_companies: displaySummary.value.total_items,
        total_projects: 0,
        title_override: 'تقرير جرد الأرصدة وتقييم المخزون اللحظي',
      },
      companiesSummary: currentStockList.value.map((stock) => ({
        id: stock.stock_id,
        name: stock.item_name,
        license_number: stock.store_name,
        projects_count: stock.current_quantity_base + ' ' + (stock.unit1_name || ''),
        total_contract_value: stock.unit_cost,
        total_due_value: stock.total_cost_value,
        total_paid: 0,
        total_remaining: 0,
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

<style scoped>
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}

:deep(.AppTable td) {
  @apply py-4 border-b border-gray-800/50;
}
</style>
