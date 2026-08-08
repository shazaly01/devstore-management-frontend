import { defineStore } from 'pinia'
import { ref } from 'vue'
import materialConsumptionService from '@/services/materialConsumptionService'

export const useMaterialConsumptionStore = defineStore('materialConsumption', () => {
  // --- State ---
  const consumptions = ref([])
  const pagination = ref({})
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
  async function fetchConsumptions(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await materialConsumptionService.get(page, cleaned)
      // تماشياً مع استجابة الـ Controller: البيانات ممررة داخل الكائن data مباشرة
      consumptions.value = response.data.data.data || response.data.data
      pagination.value = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
      }
    } catch (err) {
      error.value = 'فشل في جلب سجلات استهلاك الخامات.'
      console.error(err)
      consumptions.value = []
    } finally {
      loading.value = false
    }
  }

  async function createConsumption(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await materialConsumptionService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تسجيل حركة استهلاك الخامة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteConsumption(id) {
    loading.value = true
    error.value = null
    try {
      const response = await materialConsumptionService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف وعكس مستند الاستهلاك.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    consumptions,
    pagination,
    loading,
    error,
    validationErrors,
    fetchConsumptions,
    createConsumption,
    deleteConsumption,
  }
})
