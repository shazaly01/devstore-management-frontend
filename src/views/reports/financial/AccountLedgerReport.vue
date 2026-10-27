<!--src/views/reports/AccountLedgerReport.vue-->
<template>
  <div class="space-y-6 print:hidden text-right font-sans" dir="rtl">
    <!-- الترويسة العلوية -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary tracking-tight">كشف الحساب التفصيلي</h1>
        <p class="text-xs text-text-muted mt-1">
          عرض حركة الحسابات التفصيلية مع احتساب الأرصدة المتوالية والافتتاحية
        </p>
      </div>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          :disabled="!accountLedgerSummary?.account_id || accountLedgerList.length === 0"
          class="flex items-center gap-2"
        >
          <PrinterIcon class="w-4 h-4 ml-1" />
          طباعة كشف الحساب
        </AppButton>
      </div>
    </div>

    <!-- بطاقة الفلاتر -->
    <AppCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-xs font-bold text-text-secondary uppercase mb-2">
            الحساب المالي (إجباري)
          </label>
          <AppDropdown
            id="filter-account-id"
            v-model="filters.account_id"
            :options="formattedAccounts"
            option-label="displayName"
            option-value="id"
            placeholder="اختر الحساب المحاسبي..."
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
            :disabled="loading || !filters.account_id"
            class="w-full h-10 flex items-center justify-center font-bold shadow-sm"
          >
            <ArrowPathIcon class="w-4 h-4 ml-2" :class="{ 'animate-spin': loading }" />
            تحليل وقراءة كشف الحساب
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- بطاقات ملخص الأرصدة -->
    <div
      v-if="accountLedgerSummary && accountLedgerSummary.account_id"
      class="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      <AppCard class="p-4 border-r-4 border-r-surface-border bg-surface-section shadow-sm">
        <div class="text-[10px] text-text-muted font-bold uppercase mb-1">
          الرصيد الافتتاحي الساكن
        </div>
        <div class="text-xl font-black text-text-primary font-mono">
          {{ formatCurrency(accountLedgerSummary.opening_balance || 0) }}
          <span class="text-xs font-normal text-text-muted">
            ({{ accountLedgerSummary.nature_lbl }})
          </span>
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-success bg-surface-section shadow-sm">
        <div class="text-[10px] text-success font-bold uppercase mb-1">إجمالي مدين للفترة (+)</div>
        <div class="text-xl font-black text-success font-mono">
          {{ formatCurrency(accountLedgerSummary.total_period_debit || 0) }}
        </div>
      </AppCard>

      <AppCard class="p-4 border-r-4 border-r-danger bg-surface-section shadow-sm">
        <div class="text-[10px] text-danger font-bold uppercase mb-1">إجمالي دائن للفترة (-)</div>
        <div class="text-xl font-black text-danger font-mono">
          {{ formatCurrency(accountLedgerSummary.total_period_credit || 0) }}
        </div>
      </AppCard>

      <AppCard
        class="p-4 border-r-4 bg-surface-section shadow-sm"
        :class="accountLedgerSummary.closing_balance >= 0 ? 'border-r-primary' : 'border-r-warning'"
      >
        <div class="text-[10px] font-bold uppercase mb-1 text-text-muted">
          الرصيد الختامي الجاري
        </div>
        <div
          class="text-xl font-black font-mono"
          :class="accountLedgerSummary.closing_balance >= 0 ? 'text-primary' : 'text-warning'"
        >
          {{ formatCurrency(accountLedgerSummary.closing_balance || 0) }}
        </div>
      </AppCard>
    </div>

    <!-- جدول حركة الحساب -->
    <AppCard v-if="accountLedgerList.length > 0 || loading">
      <AppTable :headers="tableHeaders" :items="accountLedgerList" :is-loading="loading">
        <template #cell-entry_date="{ item }">
          <span class="text-xs text-text-muted font-mono">{{ item.entry_date ?? '-' }}</span>
        </template>

        <template #cell-entry_number="{ item }">
          <span class="font-mono text-primary text-xs font-bold">
            {{ item.entry_number ?? '-' }}
          </span>
        </template>

        <template #cell-line_notes="{ item }">
          <span class="text-xs text-text-primary font-medium">{{ item.line_notes ?? '-' }}</span>
        </template>

        <template #cell-debit="{ item }">
          <span class="font-mono text-xs font-bold text-success" v-if="item.debit > 0">
            {{ formatCurrency(item.debit) }}
          </span>
          <span v-else class="text-text-muted text-xs">-</span>
        </template>

        <template #cell-credit="{ item }">
          <span class="font-mono text-xs font-bold text-danger" v-if="item.credit > 0">
            {{ formatCurrency(item.credit) }}
          </span>
          <span v-else class="text-text-muted text-xs">-</span>
        </template>

        <template #cell-running_balance="{ item }">
          <span
            class="font-black text-xs text-text-primary bg-surface-ground px-2 py-1 rounded border border-surface-border font-mono"
          >
            {{ formatCurrency(item.running_balance) }}
          </span>
        </template>
      </AppTable>
    </AppCard>

    <!-- تنبيه عند عدم وجود حركات للحساب المختار -->
    <AppCard
      v-else-if="
        accountLedgerSummary &&
        accountLedgerSummary.account_id &&
        !loading &&
        accountLedgerList.length === 0
      "
      class="p-8 text-center"
    >
      <div class="text-text-muted text-sm font-bold">
        لا توجد أي حركات مالية مسجلة لهذا الحساب خلال النطاق الزمني المحدد.
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const filters = ref({
  account_id: '',
  from_date: '',
  to_date: '',
})

const { accountLedgerList, accountLedgerSummary, accountsList, loading } = storeToRefs(reportStore)

const formattedAccounts = computed(() => {
  if (!Array.isArray(accountsList.value)) return []
  return accountsList.value.map((acc) => ({
    ...acc,
    displayName: acc.code ? `[${acc.code}] ${acc.name}` : acc.name,
  }))
})

const tableHeaders = [
  { key: 'id', label: 'المعرف الرقمي' },
  { key: 'entry_date', label: 'تاريخ القيد' },
  { key: 'entry_number', label: 'رقم السند المحاسبي' },
  { key: 'line_notes', label: 'البيان والشرح التفصيلي' },
  { key: 'debit', label: 'مدين (+)' },
  { key: 'credit', label: 'دائن (-)' },
  { key: 'running_balance', label: 'الرصيد المتوالي' },
]

const handleFetch = () => {
  if (!filters.value.account_id) return

  const cleanFilters = { account_id: filters.value.account_id }
  if (filters.value.from_date) cleanFilters.from_date = filters.value.from_date
  if (filters.value.to_date) cleanFilters.to_date = filters.value.to_date

  reportStore.fetchAccountLedger(cleanFilters)
}

const handlePrint = () => {
  if (!accountLedgerSummary.value?.account_id || accountLedgerList.value.length === 0) return

  const isCredit = accountLedgerSummary.value.nature === 'credit'
  const fromLbl = filters.value.from_date || 'بداية النشاط'
  const toLbl = filters.value.to_date || 'اللحظة الحالية'

  sessionStorage.setItem(
    'printData',
    JSON.stringify({
      grandSummary: {
        grand_total_contract_value: accountLedgerSummary.value.opening_balance || 0,
        grand_total_due_value: accountLedgerSummary.value.total_period_debit || 0,
        grand_total_paid: accountLedgerSummary.value.total_period_credit || 0,
        grand_total_remaining: accountLedgerSummary.value.closing_balance || 0,
        total_companies: 1,
        total_projects: accountLedgerList.value.length,
        title_override: `كشف حساب تفصيلي للحساب: [ ${accountLedgerSummary.value.account_code} ] - ${accountLedgerSummary.value.account_name} للفترة من (${fromLbl}) إلى (${toLbl})`,
      },
      companiesSummary: accountLedgerList.value.map((line) => {
        const netChange = isCredit ? line.credit - line.debit : line.debit - line.credit
        return {
          id: line.id,
          name: line.line_notes ?? 'قيد محاسبي عمومي',
          license_number: line.entry_date ?? '-',
          projects_count: line.entry_number ? `سند رقم: ${line.entry_number}` : 'قيد تسوية',
          total_contract_value: line.debit,
          total_due_value: line.credit,
          total_paid: netChange,
          total_remaining: line.running_balance,
        }
      }),
    }),
  )

  const routeData = router.resolve({ name: 'PrintSummary' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  if (reportStore.fetchFinancialLookups) {
    reportStore.fetchFinancialLookups()
  }
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
