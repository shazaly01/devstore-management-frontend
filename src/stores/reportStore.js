// src/stores/reportStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import reportsService from '@/services/reportsService'

export const useReportStore = defineStore('report', () => {
  // ==========================================
  // 1. الحالات العامة والتحكم (General States)
  // ==========================================
  const loading = ref(false)
  const error = ref(null)

  // ==========================================
  // 2. حالات تقارير المخازن والمستودعات (Inventory)
  // ==========================================
  const currentStockList = ref([])
  const currentStockSummary = ref({
    total_items: 0,
    grand_total_quantity: 0,
    grand_total_cost_value: 0,
  })

  const stockCardList = ref([])
  const stockCardSummary = ref({
    item_id: 0,
    item_name: '',
    opening_balance: 0,
    total_incoming: 0,
    total_outgoing: 0,
    closing_balance: 0,
  })

  const stockCardItemSearchResults = ref([])
  const stockCardItemSearchLoading = ref(false)
  const stockCardItemSearchError = ref(null)
  let stockCardItemSearchRequestId = 0

  const stockValuationList = ref([])
  const stockValuationSummary = ref({
    total_items: 0,
    grand_total_inventory_value: 0,
  })

  const adjustmentsList = ref([])
  const adjustmentsSummary = ref({
    total_adjustments_count: 0,
    grand_total_shortage: 0,
    grand_total_surplus: 0,
  })

  // ==========================================
  // 3. حالات التقارير المالية والمحاسبية (Financial)
  // ==========================================
  const accountLedgerList = ref([])
  const accountLedgerSummary = ref({
    account_id: 0,
    account_name: '',
    account_code: '',
    nature: 'debit',
    nature_lbl: 'مدين',
    opening_balance: 0,
    total_period_debit: 0,
    total_period_credit: 0,
    closing_balance: 0,
  })

  const subLedgerList = ref([])
  const subLedgerSummary = ref({
    sub_ledger_type: '',
    sub_ledger_id: 0,
    opening_balance: 0,
    total_period_debit: 0,
    total_period_credit: 0,
    closing_balance: 0,
  })

  const trialBalanceList = ref([])
  const trialBalanceSummary = ref({
    total_period_debit: 0,
    total_period_credit: 0,
    is_balanced: true,
  })

  const incomeStatementData = ref({
    revenues: [],
    expenses: [],
  })
  const incomeStatementSummary = ref({
    from_date: '',
    to_date: '',
    total_revenues: 0,
    total_expenses: 0,
    net_profit: 0,
    outcome_type: 'profit',
    outcome_lbl: '',
  })

  const balanceSheetData = ref({
    assets: [],
    liabilities_and_equity: [],
  })
  const balanceSheetSummary = ref({
    as_of_date: '',
    total_assets: 0,
    current_period_net_profit: 0,
    total_liabilities_and_equity: 0,
    is_perfectly_balanced: true,
  })

  // ==========================================
  // 4. قوائم المساعدة والتصفية (Lookups)
  // ==========================================
  const itemsList = ref([])
  const storesList = ref([])
  const accountsList = ref([])
  const lookupsCustomers = ref([])
  const lookupsSuppliers = ref([])
  const lookupsBanks = ref([])

  // ==========================================
  // 5. التوابع المساعدة (Helpers)
  // ==========================================
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // ==========================================
  // 6. إجراءات تقارير المخازن (Inventory Actions)
  // ==========================================
  async function fetchCurrentStock(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getCurrentStock(cleaned)
      if (response.data && response.data.success) {
        currentStockList.value = response.data.data || []
        currentStockSummary.value = response.data.grandSummary || {
          total_items: 0,
          grand_total_quantity: 0,
          grand_total_cost_value: 0,
        }
      }
    } catch (err) {
      error.value = 'فشل في جلب تقرير الأرصدة اللحظية.'
      console.error(err)
      currentStockList.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchStockCard(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getStockCard(cleaned)
      if (response.data && response.data.success) {
        stockCardList.value = response.data.data || []
        stockCardSummary.value = response.data.grandSummary || null
      }
    } catch (err) {
      error.value = 'فشل في جلب تقرير كارت حركة الصنف.'
      console.error(err)
      stockCardList.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchStockValuation(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getStockValuation(cleaned)
      if (response.data && response.data.success) {
        stockValuationList.value = response.data.data || []
        stockValuationSummary.value = response.data.grandSummary || null
      }
    } catch (err) {
      error.value = 'فشل في جلب تقرير تقييم المخزون المالي.'
      console.error(err)
      stockValuationList.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchAdjustmentsSummary(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getAdjustmentsSummary(cleaned)
      if (response.data && response.data.success) {
        adjustmentsList.value = response.data.data || []
        adjustmentsSummary.value = response.data.grandSummary || null
      }
    } catch (err) {
      error.value = 'فشل في جلب تقرير ملخص التسويات.'
      console.error(err)
      adjustmentsList.value = []
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // 7. إجراءات التقارير المالية (Financial Actions)
  // ==========================================
  async function fetchAccountLedger(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getAccountLedger(cleaned)
      if (response.data && response.data.success) {
        accountLedgerList.value = response.data.data || []
        accountLedgerSummary.value = response.data.grandSummary || response.data.meta || null
      }
    } catch (err) {
      error.value = 'فشل في جلب دفتر الأستاذ العام التفصيلي.'
      console.error(err)
      accountLedgerList.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchSubLedgerStatement(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getSubLedger(cleaned)
      if (response.data && response.data.success) {
        subLedgerList.value = response.data.data || []
        subLedgerSummary.value = response.data.grandSummary || response.data.meta || null
      }
    } catch (err) {
      error.value = 'فشل في جلب كشف الحساب المساعد.'
      console.error(err)
      subLedgerList.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchTrialBalance(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getTrialBalance(cleaned)
      if (response.data && response.data.success) {
        trialBalanceList.value = response.data.data || []
        trialBalanceSummary.value = response.data.grandSummary || response.data.totals || null
      }
    } catch (err) {
      error.value = 'فشل في توليد ميزان المراجعة.'
      console.error(err)
      trialBalanceList.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchIncomeStatement(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getIncomeStatement(cleaned)
      if (response.data && response.data.success) {
        const rawData = response.data.data || {}
        const revenues = rawData.revenues || response.data.revenues || []
        const expenses = rawData.expenses || response.data.expenses || []

        incomeStatementData.value = {
          revenues: Array.isArray(revenues) ? revenues : [],
          expenses: Array.isArray(expenses) ? expenses : [],
        }

        incomeStatementSummary.value = response.data.grandSummary || {
          from_date: response.data.meta?.from || '',
          to_date: response.data.meta?.to || '',
          total_revenues: response.data.total_revenues || 0,
          total_expenses: response.data.total_expenses || 0,
          net_profit: response.data.net_profit || 0,
          outcome_type: response.data.outcome_type || 'profit',
          outcome_lbl: response.data.outcome_lbl || '',
        }
      }
    } catch (err) {
      error.value = 'فشل في جلب قائمة الدخل الختامية.'
      console.error(err)
      incomeStatementData.value = { revenues: [], expenses: [] }
    } finally {
      loading.value = false
    }
  }

  async function fetchBalanceSheet(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await reportsService.getBalanceSheet(cleaned)
      if (response.data && response.data.success) {
        const rawData = response.data.data || {}
        const assets = rawData.assets || response.data.assets?.items || response.data.assets || []
        const liabilities =
          rawData.liabilities_and_equity ||
          response.data.liabilities_and_equity?.items ||
          response.data.liabilities_and_equity ||
          []

        balanceSheetData.value = {
          assets: Array.isArray(assets) ? assets : [],
          liabilities_and_equity: Array.isArray(liabilities) ? liabilities : [],
        }

        balanceSheetSummary.value = response.data.grandSummary || {
          as_of_date: response.data.as_of_date || '',
          total_assets: response.data.assets?.total_assets || 0,
          current_period_net_profit:
            response.data.liabilities_and_equity?.current_period_net_profit || 0,
          total_liabilities_and_equity:
            response.data.liabilities_and_equity?.total_liabilities_and_equity || 0,
          is_perfectly_balanced: response.data.is_perfectly_balanced ?? true,
        }
      }
    } catch (err) {
      error.value = 'فشل في جلب تقرير الميزانية العمومية.'
      console.error(err)
      balanceSheetData.value = { assets: [], liabilities_and_equity: [] }
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // 8. إجراءات جلب الفلاتر المساعدة عبر الـ Service
  // ==========================================
  async function searchStockCardItems(search) {
    const requestId = ++stockCardItemSearchRequestId
    const normalizedSearch = String(search ?? '').trim()

    if (normalizedSearch.length < 2) {
      stockCardItemSearchResults.value = []
      stockCardItemSearchError.value = null
      stockCardItemSearchLoading.value = false
      return []
    }

    stockCardItemSearchLoading.value = true
    stockCardItemSearchError.value = null

    try {
      const response = await reportsService.searchStockCardItems(normalizedSearch)

      if (requestId !== stockCardItemSearchRequestId) {
        return []
      }

      const results = response.data?.data
      stockCardItemSearchResults.value = Array.isArray(results) ? results : []
      return stockCardItemSearchResults.value
    } catch (err) {
      if (requestId === stockCardItemSearchRequestId) {
        stockCardItemSearchError.value = 'فشل في البحث عن الأصناف.'
        stockCardItemSearchResults.value = []
      }
      console.error(err)
      return []
    } finally {
      if (requestId === stockCardItemSearchRequestId) {
        stockCardItemSearchLoading.value = false
      }
    }
  }

  async function fetchStockCardLookups() {
    try {
      const storesRes = await reportsService.getStores()
      storesList.value = storesRes.data.data || storesRes.data || []
    } catch (err) {
      console.error('Error fetching stock card lookups:', err)
    }
  }

  async function fetchLookups() {
    try {
      const [itemsRes, storesRes] = await Promise.all([
        reportsService.getItems(),
        reportsService.getStores(),
      ])
      itemsList.value = itemsRes.data.data || itemsRes.data || []
      storesList.value = storesRes.data.data || storesRes.data || []
    } catch (err) {
      console.error('Error fetching inventory lookups:', err)
    }
  }

  async function fetchFinancialLookups() {
    try {
      const [accountsRes, customersRes, suppliersRes, banksRes, storesRes] = await Promise.all([
        reportsService.getAccounts(),
        reportsService.getCustomers(),
        reportsService.getSuppliers(),
        reportsService.getBanks(),
        reportsService.getStores(),
      ])
      accountsList.value = accountsRes.data.data || accountsRes.data || []
      lookupsCustomers.value = customersRes.data.data || customersRes.data || []
      lookupsSuppliers.value = suppliersRes.data.data || suppliersRes.data || []
      lookupsBanks.value = banksRes.data.data || banksRes.data || []
      storesList.value = storesRes.data.data || storesRes.data || []
    } catch (err) {
      console.error(err)
    }
  }

  return {
    loading,
    error,
    currentStockList,
    currentStockSummary,
    stockCardList,
    stockCardSummary,
    stockCardItemSearchResults,
    stockCardItemSearchLoading,
    stockCardItemSearchError,
    stockValuationList,
    stockValuationSummary,
    adjustmentsList,
    adjustmentsSummary,
    accountLedgerList,
    accountLedgerSummary,
    subLedgerList,
    subLedgerSummary,
    trialBalanceList,
    trialBalanceSummary,
    incomeStatementData,
    incomeStatementSummary,
    balanceSheetData,
    balanceSheetSummary,
    itemsList,
    storesList,
    accountsList,
    lookupsCustomers,
    lookupsSuppliers,
    lookupsBanks,
    fetchCurrentStock,
    fetchStockCard,
    searchStockCardItems,
    fetchStockCardLookups,
    fetchStockValuation,
    fetchAdjustmentsSummary,
    fetchAccountLedger,
    fetchSubLedgerStatement,
    fetchTrialBalance,
    fetchIncomeStatement,
    fetchBalanceSheet,
    fetchLookups,
    fetchFinancialLookups,
  }
})
