<!--src/views/reports/inventory/StockAdjustmentsReport.vue-->
<template>
  <div class="space-y-6 print:hidden text-right font-sans" dir="rtl">
    <!-- الترويسة العلوية -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary tracking-tight">
          ملخص التسويات وفروقات الجرد
        </h1>
        <p class="text-xs text-text-muted mt-1">
          مراجعة دورية لمستندات تسوية المخزون وحجم العجز والفائض المكتشف بالفترات
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!adjustmentsSummary || adjustmentsList.length === 0"
          class="flex items-center gap-2"
        >
          <PrinterIcon class="w-4 h-4 ml-1" />
          طباعة ملخص الجرد
        </AppButton>
      </div>
    </div>

    <!-- بطاقة الفلاتر -->
    <AppCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-text-secondary uppercase mb-2">
            المستودع المحتسب
          </label>
          <AppDropdown
            id="filter-store-id"
            v-model="filters.store_id"
            :options="storesList"
            option-label="name"
            option-value="id"
            placeholder="كل المستودعات والفروع"
            :show-clear="true"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-text-secondary uppercase mb-2">من تاريخ</label>
          <input
            type="date"
            v-model="filters.from_date"
            class="block w-full h-10 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono outline-none transition-all cursor-pointer shadow-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-text-secondary uppercase mb-2"
            >إلى تاريخ</label
          >
          <input
            type="date"
            v-model="filters.to_date"
            class="block w-full h-10 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono outline-none transition-all cursor-pointer shadow-sm"
          />
        </div>

        <div>
          <AppButton
            @click="handleFetch"
            :disabled="loading"
            class="w-full h-10 flex items-center justify-center font-bold shadow-sm"
          >
            <ArrowPathIcon class="w-4 h-4 ml-2" :class="{ 'animate-spin': loading }" />
            فلترة وتحليل
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- بطاقات مؤشرات التسويات وفروقات الجرد -->
    <div v-if="adjustmentsSummary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppCard class="p-4 border-r-4 border-r-surface-border bg-surface-section shadow-sm">
        <div class="text-[10px] text-text-muted uppercase tracking-widest mb-1 font-bold">
          إجمالي مستندات التسوية
        </div>
        <div class="text-xl font-black text-text-primary font-mono">
          {{ adjustmentsSummary.total_adjustments_count }}
          <span class="text-xs font-normal text-text-muted">عملية جردية</span>
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-danger bg-surface-section shadow-sm">
        <div class="text-[10px] text-danger uppercase tracking-widest mb-1 font-bold">
          إجمالي قيمة الفقد والعجز (-)
        </div>
        <div class="text-xl font-black text-danger font-mono">
          {{ formatCurrency(adjustmentsSummary.grand_total_shortage) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-success bg-surface-section shadow-sm">
        <div class="text-[10px] text-success uppercase tracking-widest mb-1 font-bold">
          إجمالي قيمة الفائض المكتشف (+)
        </div>
        <div class="text-xl font-black text-success font-mono">
          {{ formatCurrency(adjustmentsSummary.grand_total_surplus) }}
        </div>
      </AppCard>
    </div>

    <!-- جدول مستندات التسوية -->
    <AppCard>
      <AppTable :headers="tableHeaders" :items="adjustmentsList" :is-loading="loading">
        <template #cell-adjustment_number="{ item }">
          <AppBadge variant="primary" size="sm">
            {{ item.adjustment_number }}
          </AppBadge>
        </template>

        <template #cell-date="{ item }">
          <span class="text-xs text-text-muted font-mono">{{ item.date }}</span>
        </template>

        <template #cell-store_name="{ item }">
          <span class="text-xs font-bold text-text-primary">
            {{ item.store_name ?? 'المركز العام' }}
          </span>
        </template>

        <template #cell-created_by="{ item }">
          <span class="text-xs text-text-secondary">{{ item.created_by ?? 'نظام آلي' }}</span>
        </template>

        <template #cell-shortage_value="{ item }">
          <span
            class="font-mono font-bold text-xs"
            :class="item.shortage_value > 0 ? 'text-danger' : 'text-text-muted'"
          >
            {{ item.shortage_value > 0 ? formatCurrency(item.shortage_value) : '-' }}
          </span>
        </template>

        <template #cell-surplus_value="{ item }">
          <span
            class="font-mono font-bold text-xs"
            :class="item.surplus_value > 0 ? 'text-success' : 'text-text-muted'"
          >
            {{ item.surplus_value > 0 ? formatCurrency(item.surplus_value) : '-' }}
          </span>
        </template>

        <template #cell-items_count="{ item }">
          <AppBadge variant="neutral" size="xs"> {{ item.items_count }} أصناف </AppBadge>
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
import AppBadge from '@/components/ui/AppBadge.vue'

const router = useRouter()
const reportStore = useReportStore()

const filters = ref({
  store_id: '',
  from_date: '',
  to_date: '',
})

const { adjustmentsList, adjustmentsSummary, storesList, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'adjustment_number', label: 'رقم مستند التسوية' },
  { key: 'date', label: 'تاريخ المستند' },
  { key: 'store_name', label: 'المستودع المتأثر' },
  { key: 'created_by', label: 'منظم الحركة' },
  { key: 'shortage_value', label: 'قيمة العجز (-)' },
  { key: 'surplus_value', label: 'قيمة الفائض (+)' },
  { key: 'items_count', label: 'الأصناف المجرودة' },
]

const handleFetch = () => {
  reportStore.fetchAdjustmentsSummary(filters.value)
}

const handlePrint = () => {
  if (!adjustmentsSummary.value || adjustmentsList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: adjustmentsSummary.value.grand_total_shortage,
        grand_total_due_value: adjustmentsSummary.value.grand_total_surplus,
        grand_total_paid: adjustmentsSummary.value.total_adjustments_count,
        grand_total_remaining: 0,
        total_companies: adjustmentsSummary.value.total_adjustments_count,
        total_projects: adjustmentsList.value.length,
        title_override: 'تقرير ملخص تسويات المخازن وفروقات الجرد الدورية البنيوية',
      },
      companiesSummary: adjustmentsList.value.map((adj) => ({
        id: adj.id,
        name: `مستند تسوية رقم [ ${adj.adjustment_number} ]`,
        license_number: adj.date,
        projects_count: adj.store_name ?? 'المخزن العام',
        total_contract_value: adj.shortage_value,
        total_due_value: adj.surplus_value,
        total_paid: adj.items_count,
        total_remaining: adj.notes ?? '',
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

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
