<!--src/views/reports/financial/IncomeStatementReport.vue-->
<template>
  <div class="space-y-6 print:hidden text-right font-sans" dir="rtl">
    <!-- الترويسة العلوية -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary tracking-tight">قائمة الدخل الشاملة</h1>
        <p class="text-xs text-text-muted mt-1">
          تحليل النشاط المالي وقياس كفاءة الأداء التشغيلي والأرباح والخسائر للشركة
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!incomeStatementSummary"
          class="flex items-center gap-2"
        >
          <PrinterIcon class="w-4 h-4 ml-1" />
          طباعة قائمة الدخل
        </AppButton>
      </div>
    </div>

    <!-- بطاقة الفلاتر -->
    <AppCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
            تحليل وقراءة المورد المالي
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- بطاقات مؤشرات قائمة الدخل -->
    <div v-if="incomeStatementSummary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppCard class="p-4 border-r-4 border-r-success bg-surface-section shadow-sm">
        <div class="text-[10px] text-success uppercase tracking-widest mb-1 font-bold">
          إجمالي الإيرادات والمبيعات (+)
        </div>
        <div class="text-xl font-black text-success font-mono">
          {{ formatCurrency(incomeStatementSummary.total_revenues) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-danger bg-surface-section shadow-sm">
        <div class="text-[10px] text-danger uppercase tracking-widest mb-1 font-bold">
          إجمالي المصروفات والتكاليف (-)
        </div>
        <div class="text-xl font-black text-danger font-mono">
          {{ formatCurrency(incomeStatementSummary.total_expenses) }}
        </div>
      </AppCard>

      <AppCard
        class="p-4 border-r-4 transition-all duration-300 bg-surface-section shadow-sm"
        :class="
          incomeStatementSummary.outcome_type === 'profit' ? 'border-r-success' : 'border-r-danger'
        "
      >
        <div
          class="text-[10px] uppercase tracking-widest mb-1 font-bold"
          :class="incomeStatementSummary.outcome_type === 'profit' ? 'text-success' : 'text-danger'"
        >
          {{ incomeStatementSummary.outcome_lbl }}
        </div>
        <div
          class="text-xl font-black font-mono"
          :class="incomeStatementSummary.outcome_type === 'profit' ? 'text-success' : 'text-danger'"
        >
          {{ formatCurrency(incomeStatementSummary.net_profit) }}
        </div>
      </AppCard>
    </div>

    <!-- جداول بنود الإيرادات والمصروفات -->
    <div v-if="incomeStatementData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- بنود الإيرادات -->
      <AppCard class="p-4">
        <h3
          class="text-sm font-bold text-success mb-3 flex items-center gap-2 border-b border-surface-border pb-2"
        >
          <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          بـنـود الإيــرادات (الحسابات الدائنة)
        </h3>
        <AppTable
          :headers="tableHeaders"
          :items="incomeStatementData.revenues"
          :is-loading="loading"
        >
          <template #cell-code="{ item }">
            <span class="font-mono text-xs text-text-muted">#{{ item.code }}</span>
          </template>
          <template #cell-name="{ item }">
            <span class="font-bold text-text-primary text-xs">{{ item.name }}</span>
          </template>
          <template #cell-balance="{ item }">
            <span class="font-mono text-xs font-bold text-success">
              {{ formatCurrency(item.balance) }}
            </span>
          </template>
        </AppTable>
      </AppCard>

      <!-- بنود المصروفات -->
      <AppCard class="p-4">
        <h3
          class="text-sm font-bold text-danger mb-3 flex items-center gap-2 border-b border-surface-border pb-2"
        >
          <span class="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
          بـنـود الـمـصـروفـات (الحسابات المدينة)
        </h3>
        <AppTable
          :headers="tableHeaders"
          :items="incomeStatementData.expenses"
          :is-loading="loading"
        >
          <template #cell-code="{ item }">
            <span class="font-mono text-xs text-text-muted">#{{ item.code }}</span>
          </template>
          <template #cell-name="{ item }">
            <span class="font-bold text-text-primary text-xs">{{ item.name }}</span>
          </template>
          <template #cell-balance="{ item }">
            <span class="font-mono text-xs font-bold text-danger">
              {{ formatCurrency(item.balance) }}
            </span>
          </template>
        </AppTable>
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
  from_date: '',
  to_date: '',
})

const { incomeStatementData, incomeStatementSummary, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'code', label: 'كود الحساب' },
  { key: 'name', label: 'اسم البند المالي' },
  { key: 'balance', label: 'صافي رصيد البند' },
]

const handleFetch = () => {
  const cleanFilters = {}
  if (filters.value.from_date) cleanFilters.from_date = filters.value.from_date
  if (filters.value.to_date) cleanFilters.to_date = filters.value.to_date

  reportStore.fetchIncomeStatement(cleanFilters)
}

const handlePrint = () => {
  if (!incomeStatementSummary.value) return

  const printItems = []

  if (incomeStatementData.value?.revenues) {
    incomeStatementData.value.revenues.forEach((rev) => {
      printItems.push({
        id: rev.code,
        name: rev.name,
        license_number: 'إيرادات مبيعات',
        projects_count: 'دائن',
        total_contract_value: rev.balance,
        total_due_value: 0,
        total_paid: rev.balance,
        total_remaining: 0,
      })
    })
  }

  if (incomeStatementData.value?.expenses) {
    incomeStatementData.value.expenses.forEach((exp) => {
      printItems.push({
        id: exp.code,
        name: exp.name,
        license_number: 'مصروفات تشغيلية',
        projects_count: 'مدين',
        total_contract_value: 0,
        total_due_value: exp.balance,
        total_paid: 0,
        total_remaining: exp.balance,
      })
    })
  }

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: incomeStatementSummary.value.total_revenues,
        grand_total_due_value: incomeStatementSummary.value.total_expenses,
        grand_total_paid: incomeStatementSummary.value.net_profit,
        grand_total_remaining: 0,
        total_companies: printItems.length,
        total_projects: 0,
        title_override: `تقرير قائمة الدخل الشاملة من تاريخ (${incomeStatementSummary.value.from_date}) إلى (${incomeStatementSummary.value.to_date})`,
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
