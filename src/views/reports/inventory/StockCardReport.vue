<!--src/views/reports/inventory/StockCardReport.vue-->
<template>
  <div class="space-y-6 print:hidden text-right font-sans" dir="rtl">
    <!-- الترويسة العلوية -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary tracking-tight">كارت حركة الصنف</h1>
        <p class="text-xs text-text-muted mt-1">
          تتبع المسار التاريخي لحركات الوارد والصادر والرصيد التراكمي
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!stockCardSummary || stockCardList.length === 0"
          class="flex items-center gap-2"
        >
          <PrinterIcon class="w-4 h-4 ml-1" />
          طباعة الكارت
        </AppButton>
      </div>
    </div>

    <!-- بطاقة الفلاتر -->
    <AppCard>
      <div class="space-y-5">
        <!-- البحث يأخذ عرض بطاقة الفلاتر بالكامل -->
        <div class="w-full flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">
            الصنف المستهدف (إجباري)
          </label>
          <SmartSearchGrid
            class="stock-card-item-search"
            :data="stockCardItemSearchResults"
            :columns="itemSearchColumns"
            :search-keys="itemSearchKeys"
            :server-search="true"
            :loading="stockCardItemSearchLoading"
            :error="stockCardItemSearchError"
            :min-search-length="2"
            :debounce-ms="300"
            display-key="name"
            placeholder="ابحث عن الصنف بالاسم أو الباركود..."
            @search="handleItemSearch"
            @clear="handleItemClear"
            @select="handleItemSelect"
          />
        </div>

        <!-- المستودع والتواريخ بارتفاع موحد، وتُحدّث النتائج تلقائيًا عند تغييرها -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-end">
          <div class="flex flex-col space-y-1">
            <label class="text-[11px] font-bold text-text-secondary pr-1">المستودع</label>
            <div
              class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
            >
              <span class="absolute right-3 text-text-muted pointer-events-none z-10">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </span>
              <div class="w-full h-full pr-10 pl-2 flex items-center">
                <AppDropdown
                  id="filter-store-id"
                  v-model="filters.store_id"
                  :options="storesList"
                  option-label="name"
                  option-value="id"
                  placeholder="كل المستودعات"
                  :show-clear="true"
                  variant="sales"
                  class="w-full bg-transparent"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-col space-y-1">
            <label class="text-[11px] font-bold text-text-secondary pr-1">من تاريخ</label>
            <div
              class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
            >
              <input
                type="date"
                v-model="filters.from_date"
                class="block w-full h-full pr-4 pl-14 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
              />
              <span
                class="absolute left-3 text-text-muted pointer-events-none flex items-center gap-1.5 text-xs z-10"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div class="flex flex-col space-y-1">
            <label class="text-[11px] font-bold text-text-secondary pr-1">إلى تاريخ</label>
            <div
              class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
            >
              <input
                type="date"
                v-model="filters.to_date"
                class="block w-full h-full pr-4 pl-14 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
              />
              <span
                class="absolute left-3 text-text-muted pointer-events-none flex items-center gap-1.5 text-xs z-10"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <p
          v-if="loading && filters.item_id"
          class="text-xs text-text-muted font-semibold"
          role="status"
        >
          جارٍ تحديث تقرير حركة الصنف...
        </p>
      </div>
    </AppCard>

    <!-- بطاقات ملخص حركة الصنف -->
    <div v-if="stockCardSummary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AppCard class="p-4 border-r-4 border-r-surface-border bg-surface-section shadow-sm">
        <div class="text-[10px] text-text-muted font-bold uppercase mb-1">
          الرصيد الافتتاحي السابق
        </div>
        <div class="text-xl font-black text-text-primary font-mono">
          {{ stockCardSummary.opening_balance }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-success bg-surface-section shadow-sm">
        <div class="text-[10px] text-success font-bold uppercase mb-1">إجمالي حركات الوارد (+)</div>
        <div class="text-xl font-black text-success font-mono">
          {{ stockCardSummary.total_incoming }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-danger bg-surface-section shadow-sm">
        <div class="text-[10px] text-danger font-bold uppercase mb-1">إجمالي حركات الصادر (-)</div>
        <div class="text-xl font-black text-danger font-mono">
          {{ stockCardSummary.total_outgoing }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-primary bg-surface-section shadow-sm">
        <div class="text-[10px] text-primary font-bold uppercase mb-1">الرصيد الختامي الصافي</div>
        <div class="text-xl font-black text-primary font-mono">
          {{ stockCardSummary.closing_balance }}
        </div>
      </AppCard>
    </div>

    <!-- جدول تتبع حركات الصنف -->
    <AppCard v-if="stockCardList.length > 0 || loading">
      <AppTable :headers="tableHeaders" :items="stockCardList" :is-loading="loading">
        <template #cell-id="{ item }">
          <span class="font-mono text-xs text-text-muted">#{{ item.id }}</span>
        </template>

        <template #cell-date="{ item }">
          <span class="text-xs text-text-muted font-mono">{{ item.date }}</span>
        </template>

        <template #cell-movement_type="{ item }">
          <AppBadge variant="neutral" size="xs">
            {{ item.movement_type }}
          </AppBadge>
        </template>

        <template #cell-document_no="{ item }">
          <span class="font-mono text-primary text-xs font-bold">
            #{{ item.document_no ?? '-' }}
          </span>
        </template>

        <template #cell-store_name="{ item }">
          <span class="text-xs font-bold text-text-primary">
            {{ item.store_name ?? 'المستودع الرئيسي' }}
          </span>
        </template>

        <template #cell-quantity="{ item }">
          <span
            class="font-mono font-bold text-xs"
            :class="item.direction === 'in' ? 'text-success' : 'text-danger'"
          >
            {{ item.direction === 'in' ? '+' : '-' }} {{ item.quantity }}
            <span class="text-[10px] font-normal text-text-muted">({{ item.unit_name_used }})</span>
          </span>
        </template>

        <template #cell-direction_lbl="{ item }">
          <AppBadge :variant="item.direction === 'in' ? 'success' : 'danger'" size="xs" pill dot>
            {{ item.direction_lbl }}
          </AppBadge>
        </template>

        <template #cell-cost_price="{ item }">
          <span class="font-mono text-text-secondary text-xs font-medium">
            {{ formatCurrency(item.cost_price) }}
          </span>
        </template>

        <template #cell-running_balance="{ item }">
          <span
            class="font-mono font-black text-xs text-text-primary bg-surface-ground px-2 py-1 rounded border border-surface-border"
          >
            {{ item.running_balance }}
          </span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'
import { PrinterIcon } from '@heroicons/vue/24/outline'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'

const router = useRouter()
const reportStore = useReportStore()

const {
  stockCardList,
  stockCardSummary,
  stockCardItemSearchResults,
  stockCardItemSearchLoading,
  stockCardItemSearchError,
  storesList,
  loading,
} = storeToRefs(reportStore)

const filters = ref({
  item_id: '',
  store_id: '',
  from_date: '',
  to_date: '',
})

const itemSearchColumns = [{ key: 'name', label: 'اسم الصنف' }]
const itemSearchKeys = ['name']

const tableHeaders = [
  { key: 'id', label: 'المعرف' },
  { key: 'date', label: 'التاريخ والوقت' },
  { key: 'movement_type', label: 'نوع الحركة' },
  { key: 'document_no', label: 'رقم السند' },
  { key: 'store_name', label: 'المستودع' },
  { key: 'quantity', label: 'الكمية الحركة' },
  { key: 'direction_lbl', label: 'طبيعة الحركة' },
  { key: 'cost_price', label: 'تكلفة الحركة' },
  { key: 'running_balance', label: 'الرصيد الجاري' },
]

const handleItemSearch = (search) => {
  reportStore.searchStockCardItems(search)
}

const handleItemClear = () => {
  filters.value.item_id = ''
}

const handleItemSelect = (item) => {
  filters.value.item_id = item.id
}

watch(
  () => [
    filters.value.item_id,
    filters.value.store_id,
    filters.value.from_date,
    filters.value.to_date,
  ],
  ([itemId]) => {
    if (!itemId) return
    reportStore.fetchStockCard({ ...filters.value })
  },
)

const handlePrint = () => {
  if (!stockCardSummary.value || stockCardList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: stockCardSummary.value.opening_balance,
        grand_total_due_value: stockCardSummary.value.total_incoming,
        grand_total_paid: stockCardSummary.value.total_outgoing,
        grand_total_remaining: stockCardSummary.value.closing_balance,
        total_companies: 1,
        total_projects: stockCardList.value.length,
        title_override: `تقرير كارت الحركة التفصيلي للصنف: ${stockCardSummary.value.item_name}`,
      },
      companiesSummary: stockCardList.value.map((move) => ({
        id: move.id,
        name: `${move.movement_type} [سند: ${move.document_no ?? '-'}]`,
        license_number: move.date,
        projects_count: move.store_name ?? 'الرئيسي',
        total_contract_value: move.quantity,
        total_due_value: move.cost_price,
        total_paid: move.base_quantity,
        total_remaining: move.running_balance,
      })),
    }),
  )

  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  reportStore.fetchStockCardLookups()
})
</script>

<style scoped>
.stock-card-item-search :deep(input[type='text']) {
  height: 2.75rem;
  min-height: 2.75rem;
}

:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
