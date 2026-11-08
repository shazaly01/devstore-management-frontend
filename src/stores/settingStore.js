import { defineStore } from 'pinia'
import { ref } from 'vue'
import settingService from '@/services/settingService'

export const useSettingStore = defineStore('setting', () => {
  // --- State ---
  const settings = ref([])
  const groupedSettings = ref({})
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // --- Getters / Helper ---
  /**
   * استرجاع قيمة إعداد محدد مباشرة بواسطة المفتاح مع دعم قيمة افتراضية
   */
  function get(key, defaultValue = null) {
    const item = settings.value.find((s) => s.key === key)
    return item && item.value !== null && item.value !== undefined ? item.value : defaultValue
  }

  // --- Actions ---
  /**
   * جلب الإعدادات من الخادم وتخزينها بالشكل المسطح والمبوب
   */
  async function fetchSettings(group = null) {
    loading.value = true
    error.value = null
    try {
      const response = await settingService.getSettings(group)
      settings.value = response.data.data || []
      groupedSettings.value = response.data.grouped || {}
      return response.data
    } catch (err) {
      error.value = 'فشل في جلب إعدادات النظام.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حفظ وتحديث حزمة الإعدادات دفعة واحدة
   */
  async function updateSettings(settingsPayload) {
    saving.value = true
    error.value = null
    validationErrors.value = null
    try {
      const response = await settingService.updateSettings({
        settings: settingsPayload,
      })
      settings.value = response.data.data || []
      groupedSettings.value = response.data.grouped || {}
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في حفظ وتحديث الإعدادات.'
      console.error(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  return {
    settings,
    groupedSettings,
    loading,
    saving,
    error,
    validationErrors,
    get,
    fetchSettings,
    updateSettings,
  }
})
