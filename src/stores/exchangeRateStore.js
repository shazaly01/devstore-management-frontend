// src/stores/exchangeRateStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import exchangeRateService from '@/services/exchangeRateService'

export const useExchangeRateStore = defineStore('exchangeRate', () => {
  // --- State ---
  const currencies = ref([])
  const currencyHistory = ref([])
  const currencyHistoryPagination = ref({})
  const activeCurrency = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // --- Helper to clean filters ---
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '' && filters[key] !== undefined) {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // --- Actions ---

  /**
   * جلب قائمة العملات النشطة مع أحدث أسعار صرفها
   */
  async function fetchCurrencies() {
    loading.value = true
    error.value = null
    try {
      const response = await exchangeRateService.getCurrencies()
      currencies.value = response.data.data || response.data
      return currencies.value
    } catch (err) {
      error.value = 'فشل في جلب قائمة العملات وأسعار الصرف.'
      console.error(err)
      currencies.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تسجيل سعر صرف جديد
   */
  async function createExchangeRate(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await exchangeRateService.store(payload)
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

  /**
   * جلب السجل التاريخي لأسعار صرف عملة معينة
   */
  async function fetchCurrencyHistory(currencyId, page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await exchangeRateService.getCurrencyHistory(currencyId, page, cleaned)
      currencyHistory.value = response.data.rates?.data || []
      currencyHistoryPagination.value = {
        current_page: response.data.rates?.current_page,
        last_page: response.data.rates?.last_page,
        per_page: response.data.rates?.per_page,
        total: response.data.rates?.total,
      }
      activeCurrency.value = response.data.currency || null
      return response.data
    } catch (err) {
      error.value = 'فشل في جلب سجل أسعار الصرف لهذه العملة.'
      console.error(err)
      currencyHistory.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    currencies,
    currencyHistory,
    currencyHistoryPagination,
    activeCurrency,
    loading,
    error,
    validationErrors,
    fetchCurrencies,
    createExchangeRate,
    fetchCurrencyHistory,
  }
})
