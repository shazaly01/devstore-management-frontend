<!--src/views/reports/financial/BalanceSheetReport.vue-->
<template>
  <div class="space-y-6 print:hidden text-right font-sans" dir="rtl">
    <!-- الترويسة العلوية -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary tracking-tight">
          الميزانية العمومية / المركز المالي
        </h1>
        <p class="text-xs text-text-muted mt-1">
          عرض الموقف المالي للمنشأة وتقييم الأصول مقابل الخصوم وحقوق الملكية
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!balanceSheetSummary"
          class="flex items-center gap-2"
        >
          <PrinterIcon class="w-4 h-4 ml-1" />
          طباعة المركز المالي
        </AppButton>
      </div>
    </div>

    <!-- بطاقة الفلاتر -->
    <AppCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-text-secondary uppercase mb-2">
            الميزانية موقوفة حتى تاريخ
          </label>
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
            توليد الميزانية العمومية
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- بطاقات مؤشرات المركز المالي -->
    <div v-if="balanceSheetSummary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AppCard class="p-4 border-r-4 border-r-primary bg-surface-section shadow-sm">
        <div class="text-[10px] text-primary font-bold uppercase mb-1">
          إجمالي الأصول والجرود (+)
        </div>
        <div class="text-xl font-black text-primary font-mono">
          {{ formatCurrency(balanceSheetSummary.total_assets) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-info bg-surface-section shadow-sm">
        <div class="text-[10px] text-info font-bold uppercase mb-1">
          أرباح النشاط للفترة الحالية
        </div>
        <div class="text-xl font-black text-info font-mono">
          {{ formatCurrency(balanceSheetSummary.current_period_net_profit) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-warning bg-surface-section shadow-sm">
        <div class="text-[10px] text-warning font-bold uppercase mb-1">
          إجمالي الخصوم وحقوق الملكية
        </div>
        <div class="text-xl font-black text-warning font-mono">
          {{ formatCurrency(balanceSheetSummary.total_liabilities_and_equity) }}
        </div>
      </AppCard>

      <AppCard
        class="p-4 border-r-4 bg-surface-section transition-all duration-300 shadow-sm"
        :class="balanceSheetSummary.is_perfectly_balanced ? 'border-r-success' : 'border-r-danger'"
      >
        <div
          class="text-[10px] font-bold uppercase mb-1"
          :class="balanceSheetSummary.is_perfectly_balanced ? 'text-success' : 'text-danger'"
        >
          حالة توازن المركز المالي
        </div>
        <div
          class="text-lg font-black"
          :class="balanceSheetSummary.is_perfectly_balanced ? 'text-success' : 'text-danger'"
        >
          {{ balanceSheetSummary.is_perfectly_balanced ? 'ميزانية متزنة ✓' : 'يوجد فارق غير متزن' }}
        </div>
      </AppCard>
    </div>

    <!-- جداول المقارنة الثنائية (الأصول مقابل الخصوم) -->
    <div v-if="balanceSheetData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- جانب الأصول -->
      <AppCard class="p-4">
        <div class="flex justify-between items-center mb-3 border-b border-surface-border pb-2">
          <h3 class="text-sm font-bold text-primary flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            الأصــــول / الـمـوجــودات (1)
          </h3>
          <span class="text-xs font-mono font-bold text-text-muted" v-if="balanceSheetSummary">
            الكامل: {{ formatCurrency(balanceSheetSummary.total_assets) }}
          </span>
        </div>
        <AppTable :headers="tableHeaders" :items="balanceSheetData.assets" :is-loading="loading">
          <template #cell-code="{ item }">
            <span class="font-mono text-xs text-text-muted">#{{ item.code }}</span>
          </template>
          <template #cell-name="{ item }">
            <span class="font-bold text-text-primary text-xs">{{ item.name }}</span>
          </template>
          <template #cell-balance="{ item }">
            <span class="font-mono text-xs font-bold text-primary">
              {{ formatCurrency(item.balance) }}
            </span>
          </template>
        </AppTable>
      </AppCard>

      <!-- جانب الخصوم وحقوق الملكية -->
      <AppCard class="p-4">
        <div class="flex justify-between items-center mb-3 border-b border-surface-border pb-2">
          <h3 class="text-sm font-bold text-warning flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
            الخصوم والالتزامات ورأس المال (2)
          </h3>
          <span class="text-xs font-mono font-bold text-text-muted" v-if="balanceSheetSummary">
            الكامل: {{ formatCurrency(balanceSheetSummary.total_liabilities_and_equity) }}
          </span>
        </div>
        <AppTable
          :headers="tableHeaders"
          :items="balanceSheetData.liabilities_and_equity"
          :is-loading="loading"
        >
          <template #cell-code="{ item }">
            <span class="font-mono text-xs text-text-muted">#{{ item.code }}</span>
          </template>
          <template #cell-name="{ item }">
            <span class="font-bold text-text-primary text-xs">{{ item.name }}</span>
          </template>
          <template #cell-balance="{ item }">
            <span class="font-mono text-xs font-bold text-warning">
              {{ formatCurrency(item.balance) }}
            </span>
          </template>
        </AppTable>

        <div
          v-if="balanceSheetSummary"
          class="mt-3 p-2.5 bg-info/10 border border-info/30 rounded-lg flex justify-between items-center text-xs shadow-xs"
        >
          <span class="text-info font-bold"> (+) صافي أرباح النشاط الدورية المحتجزة للخصوم: </span>
          <span class="font-mono font-bold text-info">
            {{ formatCurrency(balanceSheetSummary.current_period_net_profit) }}
          </span>
        </div>
      </AppCard>
    </div>
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

const router = useRouter()
const reportStore = useReportStore()

const filters = ref({
  to_date: '',
})

const { balanceSheetData, balanceSheetSummary, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'code', label: 'كود الحساب' },
  { key: 'name', label: 'بند المركز المالي' },
  { key: 'balance', label: 'صافي الرصيد الدفتري' },
]

const handleFetch = () => {
  reportStore.fetchBalanceSheet(filters.value)
}

const handlePrint = () => {
  if (!balanceSheetSummary.value) return

  const printItems = []

  if (balanceSheetData.value?.assets) {
    balanceSheetData.value.assets.forEach((asset) => {
      printItems.push({
        id: asset.code,
        name: asset.name,
        license_number: 'أصول وموجودات تداولية/ثابتة',
        projects_count: 'جانب (1)',
        total_contract_value: asset.balance,
        total_due_value: 0,
        total_paid: asset.balance,
        total_remaining: 0,
      })
    })
  }

  if (balanceSheetData.value?.liabilities_and_equity) {
    balanceSheetData.value.liabilities_and_equity.forEach((liab) => {
      printItems.push({
        id: liab.code,
        name: liab.name,
        license_number: 'التزامات وحقوق ملكية دائنة',
        projects_count: 'جانب (2)',
        total_contract_value: 0,
        total_due_value: liab.balance,
        total_paid: 0,
        total_remaining: liab.balance,
      })
    })
  }

  printItems.push({
    id: '3999',
    name: 'صافي أرباح النشاط المالية للفترة الجارية',
    license_number: 'حقوق ملكية محتجزة',
    projects_count: 'جانب (2)',
    total_contract_value: 0,
    total_due_value: balanceSheetSummary.value.current_period_net_profit,
    total_paid: 0,
    total_remaining: balanceSheetSummary.value.current_period_net_profit,
  })

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: balanceSheetSummary.value.total_assets,
        grand_total_due_value: balanceSheetSummary.value.total_liabilities_and_equity,
        grand_total_paid: balanceSheetSummary.value.is_perfectly_balanced ? 1 : 0,
        grand_total_remaining: balanceSheetSummary.value.current_period_net_profit,
        total_companies: printItems.length,
        total_projects: 0,
        title_override: `تقرير الميزانية العمومية والمركز المالي موقوفاً حتى تاريخ: (${balanceSheetSummary.value.as_of_date})`,
      },
      companiesSummary: printItems,
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
