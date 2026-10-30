import { defineStore } from 'pinia'
import { ref } from 'vue'
import disassemblyService from '@/services/disassemblyService'

export const useDisassemblyStore = defineStore('disassembly', () => {
  // --- State ---
  const disassemblies = ref([])
  const pagination = ref({})
  const currentDisassembly = ref(null)
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
  async function fetchDisassemblies(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await disassemblyService.get(page, cleaned)
      disassemblies.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب أذونات التفكيك والتجزئة من الخادم.'
      console.error(err)
      disassemblies.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchDisassembly(id) {
    loading.value = true
    error.value = null
    currentDisassembly.value = null
    try {
      const response = await disassemblyService.find(id)
      currentDisassembly.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات إذن التفكيك.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createDisassembly(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await disassemblyService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في حفظ إذن التفكيك.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateDisassembly(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await disassemblyService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث إذن التفكيك.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteDisassembly(id) {
    loading.value = true
    error.value = null
    try {
      const response = await disassemblyService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف إذن التفكيك.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    disassemblies,
    pagination,
    currentDisassembly,
    loading,
    error,
    validationErrors,
    fetchDisassemblies,
    fetchDisassembly,
    createDisassembly,
    updateDisassembly,
    deleteDisassembly,
  }
})
