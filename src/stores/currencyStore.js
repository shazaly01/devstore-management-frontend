import { defineStore } from 'pinia'
import { ref } from 'vue'
import currencyService from '@/services/currencyService'

export const useCurrencyStore = defineStore('currency', () => {
  // --- State ---
  const currencies = ref([])
  const rateHistory = ref([])
  const historyPagination = ref({})
  const selectedCurrency = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // --- Helper to clean filters ---
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // --- Actions ---
  async function fetchCurrencies() {
    loading.value = true
    error.value = null
    try {
      const response = await currencyService.getCurrencies()
      currencies.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب قائمة العملات وأسعار الصرف.'
      console.error(err)
      currencies.value = []
    } finally {
      loading.value = false
    }
  }

  async function storeExchangeRate(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await currencyService.storeExchangeRate(payload)
      // إعادة تحديث قائمة العملات لضمان مزامنة أحدث سعر صرف فوري
      await fetchCurrencies()
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تسجيل سعر الصرف.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRateHistory(currencyId, page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await currencyService.getHistory(currencyId, page, cleaned)
      selectedCurrency.value = response.data.currency
      rateHistory.value = response.data.rates.data
      historyPagination.value = {
        current_page: response.data.rates.current_page,
        last_page: response.data.rates.last_page,
        per_page: response.data.rates.per_page,
        total: response.data.rates.total,
      }
    } catch (err) {
      error.value = 'فشل في جلب السجل التاريخي لأسعار الصرف.'
      console.error(err)
      rateHistory.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    currencies,
    rateHistory,
    historyPagination,
    selectedCurrency,
    loading,
    error,
    validationErrors,
    fetchCurrencies,
    storeExchangeRate,
    fetchRateHistory,
  }
})
