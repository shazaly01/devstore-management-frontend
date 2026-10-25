<!--src/views/reports/inventory/StockValuationReport.vue-->
<template>
  <div class="space-y-6 print:hidden text-right font-sans" dir="rtl">
    <!-- الترويسة العلوية -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary tracking-tight">
          تقرير تقييم المخزون المالي
        </h1>
        <p class="text-xs text-text-muted mt-1">
          احتساب القيمة الرأسمالية الحالية للبضاعة المخزنة بناءً على التكلفة
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!stockValuationSummary || stockValuationList.length === 0"
          class="flex items-center gap-2"
        >
          <PrinterIcon class="w-4 h-4 ml-1" />
          طباعة التقييم المالي
        </AppButton>
      </div>
    </div>

    <!-- بطاقة الفلاتر والإجراءات -->
    <AppCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-text-secondary uppercase mb-2">
            تصفية حسب المستودع
          </label>
          <AppDropdown
            id="filter-store-id"
            v-model="storeId"
            :options="storesList"
            option-label="name"
            option-value="id"
            placeholder="كل المستودعات والفروع التخزينية"
            :show-clear="true"
          />
        </div>

        <div>
          <AppButton
            @click="handleFetch"
            :disabled="loading"
            class="w-full h-10 flex items-center justify-center font-bold shadow-sm"
          >
            <ArrowPathIcon class="w-4 h-4 ml-2" :class="{ 'animate-spin': loading }" />
            تحديث وتوليد القيمة
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- بطاقات مؤشرات التقييم الرأسمالي -->
    <div v-if="stockValuationSummary" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AppCard class="p-4 border-r-4 border-r-surface-border bg-surface-section shadow-sm">
        <div class="text-[10px] text-text-muted uppercase tracking-widest mb-1 font-bold">
          عدد الأصناف المقيّمة مخزنياً
        </div>
        <div class="text-xl font-black text-text-primary font-mono">
          {{ stockValuationSummary.total_items }}
          <span class="text-xs font-normal text-text-muted">صنف مسجل</span>
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-success bg-surface-section shadow-sm">
        <div class="text-[10px] text-success uppercase tracking-widest mb-1 font-bold">
          إجمالي القيمة الرأسمالية النقدية (تكلفة)
        </div>
        <div class="text-xl font-black text-success font-mono">
          {{ formatCurrency(stockValuationSummary.grand_total_inventory_value) }}
        </div>
      </AppCard>
    </div>

    <!-- جدول التقييم المالي للمخزون -->
    <AppCard>
      <AppTable :headers="tableHeaders" :items="stockValuationList" :is-loading="loading">
        <template #cell-item_id="{ item }">
          <span class="font-mono text-xs text-text-muted">#{{ item.item_id }}</span>
        </template>

        <template #cell-item_name="{ item }">
          <span class="font-bold text-text-primary text-xs">
            {{ item.item_name }}
          </span>
        </template>

        <template #cell-store_name="{ item }">
          <span class="text-xs text-text-secondary font-medium">
            {{ item.store_name ?? 'المركز الرئيسي' }}
          </span>
        </template>

        <template #cell-current_quantity="{ item }">
          <span class="font-bold text-text-primary font-mono text-xs">
            {{ item.current_quantity }}
            <span class="text-[10px] text-text-muted font-normal"> {{ item.unit_name }}</span>
          </span>
        </template>

        <template #cell-unit_cost="{ item }">
          <span class="font-mono text-text-secondary text-xs font-medium">
            {{ formatCurrency(item.unit_cost) }}
          </span>
        </template>

        <template #cell-total_value="{ item }">
          <span class="font-mono font-black text-success text-xs">
            {{ formatCurrency(item.total_value) }}
          </span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'
import { PrinterIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const router = useRouter()
const reportStore = useReportStore()

const storeId = ref('')

const { stockValuationList, stockValuationSummary, storesList, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'item_id', label: 'كود الصنف' },
  { key: 'item_name', label: 'الاسم والبيان المخزني' },
  { key: 'store_name', label: 'المستودع الجاري' },
  { key: 'current_quantity', label: 'الكمية المتوفرة' },
  { key: 'unit_cost', label: 'تكلفة الوحدة' },
  { key: 'total_value', label: 'القيمة الرأسمالية الكلية' },
]

const handleFetch = () => {
  reportStore.fetchStockValuation({ store_id: storeId.value })
}

const handlePrint = () => {
  if (!stockValuationSummary.value || stockValuationList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: stockValuationSummary.value.grand_total_inventory_value,
        grand_total_due_value: stockValuationSummary.value.total_items,
        grand_total_paid: stockValuationSummary.value.grand_total_inventory_value,
        grand_total_remaining: 0,
        total_companies: stockValuationSummary.value.total_items,
        total_projects: 0,
        title_override: 'تقرير تقييم رأس المال المخزني والقيمة النقدية للبضاعة الشاملة',
      },
      companiesSummary: stockValuationList.value.map((stock) => ({
        id: stock.item_id,
        name: stock.item_name,
        license_number: stock.store_name ?? 'كل المخازن',
        projects_count: stock.current_quantity + ' ' + stock.unit_name,
        total_contract_value: stock.unit_cost,
        total_due_value: stock.total_value,
        total_paid: stock.total_value,
        total_remaining: 0,
      })),
    }),
  )

  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  handleFetch()
})
</script>
