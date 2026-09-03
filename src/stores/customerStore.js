import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerService from '@/services/customerService'

export const useCustomerStore = defineStore('customer', () => {
  // --- State (الحالات التفاعلية للعملاء) ---
  const customers = ref([])
  const pagination = ref({})
  const currentCustomer = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // --- Helper to clean filters (دالة مساعدة لتنظيف حقول الفلترة الفارغة) ---
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // --- Actions (العمليات وسير البيانات) ---

  // 1. جلب قائمة العملاء من السيرفر وتحديث المظهر والتنقل الرقمي
  async function fetchCustomers(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)
    try {
      const response = await customerService.get(page, cleaned)
      customers.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب بيانات العملاء المسجلين.'
      console.error(err)
      customers.value = []
    } finally {
      loading.value = false
    }
  }

  // 2. جلب بيانات عميل منفرد لتفاصيل العرض أو التهيئة المعمقة
  async function fetchCustomer(id) {
    loading.value = true
    error.value = null
    currentCustomer.value = null
    try {
      const response = await customerService.find(id)
      currentCustomer.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات العميل المطلوبة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 3. إنشاء عميل جديد مع إدراجه فوراً في الذاكرة المحلية وضبط حقل العرض للقائمة المنسدلة
  async function createCustomer(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await customerService.create(payload)
      const createdCustomer = response.data?.data || response.data

      if (createdCustomer && createdCustomer.id) {
        if (!createdCustomer.display_label) {
          createdCustomer.display_label =
            createdCustomer.name + (createdCustomer.phone ? ` - ${createdCustomer.phone}` : '')
        }
        customers.value.unshift(createdCustomer)
      }

      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تسجيل العميل الجديد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 4. تحديث العميل وتحديث السجل المقابل داخل الذاكرة المحلية
  async function updateCustomer(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await customerService.update(id, payload)
      const updatedCustomer = response.data?.data || response.data

      if (updatedCustomer && updatedCustomer.id) {
        if (!updatedCustomer.display_label) {
          updatedCustomer.display_label =
            updatedCustomer.name + (updatedCustomer.phone ? ` - ${updatedCustomer.phone}` : '')
        }
        const index = customers.value.findIndex((c) => c.id === updatedCustomer.id)
        if (index !== -1) {
          customers.value[index] = updatedCustomer
        }
      }

      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات العميل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 5. حذف العميل واستبعاده من مصفوفة الذاكرة المحلية
  async function deleteCustomer(id) {
    loading.value = true
    error.value = null
    try {
      const response = await customerService.delete(id)
      customers.value = customers.value.filter((c) => c.id !== id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف العميل من قاعدة البيانات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 6. التحقق والبحث عن العميل برقم الهاتف (محلياً أولاً ثم من الخادم)
  async function findByPhone(phone) {
    if (!phone || !phone.trim()) return null
    const cleanPhone = phone.trim()

    // فحص محلي أولاً لتوفير طلبات الشبكة
    const localMatch = customers.value.find((c) => c.phone && c.phone.trim() === cleanPhone)
    if (localMatch) return localMatch

    // فحص سحابي من الخادم في حال لم يتم تحميل العميل مسبقاً
    try {
      const response = await customerService.get(1, { search: cleanPhone })
      const results = response.data?.data || []
      const serverMatch =
        results.find((c) => c.phone && c.phone.trim() === cleanPhone) ||
        (results.length === 1 ? results[0] : null)

      if (serverMatch) {
        if (!serverMatch.display_label) {
          serverMatch.display_label =
            serverMatch.name + (serverMatch.phone ? ` - ${serverMatch.phone}` : '')
        }
        if (!customers.value.some((c) => c.id === serverMatch.id)) {
          customers.value.unshift(serverMatch)
        }
        return serverMatch
      }
      return null
    } catch (err) {
      console.error('فشل في فحص وتتبع رقم هاتف العميل من الخادم:', err)
      return null
    }
  }

  return {
    customers,
    pagination,
    currentCustomer,
    loading,
    error,
    validationErrors,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    findByPhone,
  }
})
