<!--src/views/reports/financial/TrialBalanceReport.vue-->
<template>
  <div class="space-y-6 print:hidden text-right font-sans" dir="rtl">
    <!-- الترويسة العلوية -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary tracking-tight">ميزان المراجعة الشامل</h1>
        <p class="text-xs text-text-muted mt-1">
          تجميع الحركات والأرصدة الافتتاحية والختامية لكافة مستويات دليل الحسابات
        </p>
      </div>
    </div>

    <!-- بطاقة الفلاتر -->
    <AppCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-text-secondary uppercase mb-2">
            من تاريخ الحركة
          </label>
          <input
            type="date"
            v-model="filters.from_date"
            class="block w-full h-10 px-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono outline-none transition-all cursor-pointer shadow-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-text-secondary uppercase mb-2">
            إلى تاريخ الحركة
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
            توليد ومطابقة الميزان
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- بطاقات مؤشرات ميزان المراجعة -->
    <div v-if="trialBalanceSummary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppCard class="p-4 border-r-4 border-r-success bg-surface-section shadow-sm">
        <div class="text-[10px] text-success uppercase tracking-widest mb-1 font-bold">
          إجمالي الحركات المدينة
        </div>
        <div class="text-xl font-black text-success font-mono">
          {{ formatCurrency(trialBalanceSummary.total_period_debit) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-danger bg-surface-section shadow-sm">
        <div class="text-[10px] text-danger uppercase tracking-widest mb-1 font-bold">
          إجمالي الحركات الدائنة
        </div>
        <div class="text-xl font-black text-danger font-mono">
          {{ formatCurrency(trialBalanceSummary.total_period_credit) }}
        </div>
      </AppCard>

      <AppCard
        class="p-4 border-r-4 bg-surface-section transition-all duration-300 shadow-sm"
        :class="trialBalanceSummary.is_balanced ? 'border-r-success' : 'border-r-danger'"
      >
        <div
          class="text-[10px] uppercase tracking-widest mb-1 font-bold"
          :class="trialBalanceSummary.is_balanced ? 'text-success' : 'text-danger'"
        >
          حالة اتزان الدفتري العام
        </div>
        <div
          class="text-xl font-black"
          :class="trialBalanceSummary.is_balanced ? 'text-success' : 'text-danger'"
        >
          {{ trialBalanceSummary.is_balanced ? 'متزن تماماً ✓' : 'غير متزن دفترياً' }}
        </div>
      </AppCard>
    </div>

    <!-- جدول ميزان المراجعة التفصيلي -->
    <AppCard>
      <AppTable :headers="tableHeaders" :items="trialBalanceList" :is-loading="loading">
        <template #cell-code="{ item }">
          <span
            class="font-mono text-xs"
            :class="item.is_parent ? 'text-primary font-black tracking-wider' : 'text-text-muted'"
          >
            #{{ item.code }}
          </span>
        </template>

        <template #cell-name="{ item }">
          <span
            :class="
              item.is_parent
                ? 'text-text-primary font-black pr-0 text-sm'
                : 'text-text-secondary font-medium pr-4 text-xs border-r border-surface-border'
            "
          >
            {{ item.name }}
          </span>
        </template>

        <template #cell-nature="{ item }">
          <span
            class="text-xs font-bold"
            :class="item.nature === 'مدين' ? 'text-success' : 'text-danger'"
          >
            {{ item.nature }}
          </span>
        </template>

        <template #cell-opening_balance="{ item }">
          <span
            class="font-mono text-xs font-bold"
            :class="[
              item.is_parent ? 'text-text-primary' : 'text-text-muted',
              item.opening_balance < 0 ? 'text-warning' : '',
            ]"
          >
            {{ formatCurrency(item.opening_balance) }}
          </span>
        </template>

        <template #cell-period_debit="{ item }">
          <span
            class="font-mono text-xs font-bold"
            :class="item.is_parent ? 'text-success font-black' : 'text-success/90'"
          >
            {{ item.period_debit > 0 ? formatCurrency(item.period_debit) : '-' }}
          </span>
        </template>

        <template #cell-period_credit="{ item }">
          <span
            class="font-mono text-xs font-bold"
            :class="item.is_parent ? 'text-danger font-black' : 'text-danger/90'"
          >
            {{ item.period_credit > 0 ? formatCurrency(item.period_credit) : '-' }}
          </span>
        </template>

        <template #cell-closing_balance="{ item }">
          <span
            class="font-mono text-xs font-bold rounded px-2 py-0.5"
            :class="
              item.is_parent
                ? 'text-text-primary bg-surface-ground border border-surface-border font-black'
                : 'text-primary bg-primary/10'
            "
          >
            {{ formatCurrency(item.closing_balance) }}
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

const router = useRouter()
const reportStore = useReportStore()

const filters = ref({
  from_date: '',
  to_date: '',
})

const { trialBalanceList, trialBalanceSummary, loading } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'code', label: 'كود الحساب' },
  { key: 'name', label: 'الحساب المالي والبيان الدفتري' },
  { key: 'nature', label: 'طبيعة الحساب' },
  { key: 'opening_balance', label: 'الرصيد الافتتاحي' },
  { key: 'period_debit', label: 'حركة مدين فترة' },
  { key: 'period_credit', label: 'حركة دائن فترة' },
  { key: 'closing_balance', label: 'الرصيد الختامي الصافي' },
]

const handleFetch = () => {
  const cleanFilters = {}
  if (filters.value.from_date) cleanFilters.from_date = filters.value.from_date
  if (filters.value.to_date) cleanFilters.to_date = filters.value.to_date

  reportStore.fetchTrialBalance(cleanFilters)
}

const handlePrint = () => {
  if (!trialBalanceSummary.value || trialBalanceList.value.length === 0) return

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: trialBalanceSummary.value.total_period_debit,
        grand_total_due_value: trialBalanceSummary.value.total_period_credit,
        grand_total_paid: trialBalanceSummary.value.is_balanced ? 1 : 0,
        grand_total_remaining: 0,
        total_companies: trialBalanceList.value.filter((a) => !a.is_parent).length,
        total_projects: trialBalanceList.value.filter((a) => a.is_parent).length,
        title_override: 'تقرير ميزان المراجعة المحاسبي العام للأرصدة والحركات',
      },
      companiesSummary: trialBalanceList.value.map((acc) => ({
        id: acc.id,
        name: acc.is_parent ? `[رئيسي] ${acc.name}` : `    ${acc.name}`,
        license_number: acc.code,
        projects_count: acc.nature,
        total_contract_value: acc.opening_balance,
        total_due_value: acc.period_debit,
        total_paid: acc.period_credit,
        total_remaining: acc.closing_balance,
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
