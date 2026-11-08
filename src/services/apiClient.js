// src/services/apiClient.js
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// اعتراض الطلبات الصادرة لإرفاق التوكن تلقائياً
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// اعتراض الردود الواردة للتعامل المركزي مع حالة القراءة فقط وانتهاء الترخيص
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 402) {
      const authStore = useAuthStore()
      const licenseStatus = error.response.data?.license_status

      if (licenseStatus) {
        authStore.setLicense(licenseStatus)
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
