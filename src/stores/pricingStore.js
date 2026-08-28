import { defineStore } from 'pinia'
import { ref } from 'vue'
import pricingService from '@/services/pricingService'

export const usePricingStore = defineStore('pricing', () => {
  // --- State ---
  const previewItems = ref([])
  const foreignCostPreviewItems = ref([])
  const radarItems = ref([])
  const batches = ref([])
  const batchesPagination = ref({})
  const currentBatch = ref(null)
  const historyItems = ref([])
  const historyPagination = ref({})
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
   * جلب معاينة التسعير الجماعي بناءً على المعايير المدخلة
   */
  async function fetchPreview(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await pricingService.preview(payload)
      previewItems.value = response.data.data || response.data
      return previewItems.value
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في توليد معاينة التسعير.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * اعتماد وتطبيق دفعة الأسعار الجديدة
   */
  async function applyReprice(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await pricingService.apply(payload)
      previewItems.value = []
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تطبيق وتحديث الأسعار.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب أرشيف مجموعات التسعير (Batches) مع الفلترة والترقيم
   */
  async function fetchBatches(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await pricingService.getBatches(page, cleaned)
      batches.value = response.data.data || []
      batchesPagination.value = response.data.meta || {}
      return response.data
    } catch (err) {
      error.value = 'فشل في جلب أرشيف مجموعات التسعير.'
      console.error(err)
      batches.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تفاصيل مجموعة تسعير محددة مع الأصناف التابعة لها
   */
  async function fetchBatchDetails(id) {
    loading.value = true
    error.value = null
    try {
      const response = await pricingService.getBatchDetails(id)
      currentBatch.value = response.data.data || response.data
      return currentBatch.value
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل مجموعة التسعير.'
      console.error(err)
      currentBatch.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * التراجع عن مجموعة تسعير كاملة
   */
  async function rollbackBatch(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await pricingService.rollback(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في التراجع عن مجموعة التسعير.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب معاينة احتساب وتأصيل التكلفة الأجنبية
   */
  async function fetchForeignCostPreview(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await pricingService.previewForeignCost(payload)
      foreignCostPreviewItems.value = response.data.data || response.data
      return foreignCostPreviewItems.value
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في توليد معاينة التكلفة الأجنبية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * اعتماد وتثبيت التكلفة الأجنبية والعملة المرجعية للأصناف
   */
  async function applyForeignCost(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await pricingService.applyForeignCost(payload)
      foreignCostPreviewItems.value = []
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تثبيت التكلفة الأجنبية للأصناف.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تقرير رادار تآكل الهوامش للأصناف
   */
  async function fetchRadar(filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await pricingService.getRadar(cleaned)
      radarItems.value = response.data.data || response.data
      return radarItems.value
    } catch (err) {
      error.value = 'فشل في جلب بيانات رادار الهوامش.'
      console.error(err)
      radarItems.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب سجل تاريخ تعديلات الأسعار الفردي مع الترقيم والفلترة
   */
  async function fetchHistory(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await pricingService.getHistory(page, cleaned)
      historyItems.value = response.data.data || []
      historyPagination.value = response.data.meta || {}
      return response.data
    } catch (err) {
      error.value = 'فشل في جلب سجل تعديلات الأسعار.'
      console.error(err)
      historyItems.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تفريغ جداول المعاينة وتفاصيل الدفعة المحددة
   */
  function clearPreview() {
    previewItems.value = []
    foreignCostPreviewItems.value = []
    currentBatch.value = null
    validationErrors.value = null
    error.value = null
  }

  return {
    previewItems,
    foreignCostPreviewItems,
    radarItems,
    batches,
    batchesPagination,
    currentBatch,
    historyItems,
    historyPagination,
    loading,
    error,
    validationErrors,
    fetchPreview,
    applyReprice,
    fetchBatches,
    fetchBatchDetails,
    rollbackBatch,
    fetchForeignCostPreview,
    applyForeignCost,
    fetchRadar,
    fetchHistory,
    clearPreview,
  }
})
