// src/stores/authStore.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'
import apiClient from '@/services/apiClient'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    license: JSON.parse(localStorage.getItem('license')) || null,
    returnUrl: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isReadOnly: (state) => Boolean(state.license?.is_read_only),
    licenseStatus: (state) => state.license?.status || 'active',
    daysRemaining: (state) => state.license?.days_remaining ?? 0,
    licenseMessage: (state) => state.license?.message || '',
    // قراءة بصمة العتاد مباشرة من حمولة الترخيص الحالية
    hardwareId: (state) => state.license?.hardware_id || null,
    permissions: (state) => {
      if (state.user && state.user.roles) {
        const allPermissions = state.user.roles.flatMap((role) =>
          role.permissions.map((p) => p.name),
        )
        return [...new Set(allPermissions)]
      }
      return []
    },
  },

  actions: {
    async login(credentials) {
      const response = await authService.login(credentials)
      const { access_token, user, license } = response.data

      this.token = access_token
      this.user = user
      this.license = license || null

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))

      if (license) {
        localStorage.setItem('license', JSON.stringify(license))
      }
    },

    setLicense(licenseData) {
      this.license = licenseData
      localStorage.setItem('license', JSON.stringify(licenseData))
    },

    /**
     * جلب وتحديث حالة الترخيص وبصمة العتاد الحالية من الـ API مباشرة
     */
    async fetchLicenseStatus() {
      try {
        const response = await apiClient.get('/license/status')
        this.setLicense(response.data)
        return response.data
      } catch (error) {
        console.error('فشل جلب حالة الترخيص:', error)
        return null
      }
    },

    async logout() {
      try {
        // محاولة استدعاء الـ API لتسجيل الخروج من السيرفر
        await authService.logout()
      } catch (error) {
        console.error('Logout API call failed, but clearing local state anyway:', error)
      } finally {
        // --- تنظيف الحالة المحلية ---
        this.user = null
        this.token = null
        this.license = null
        this.returnUrl = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('license')

        // --- التوجيه الإجباري لصفحة الدخول ---
        window.location.href = '/login'
      }
    },

    can(permissionName) {
      if (this.user && this.user.roles.some((role) => role.name === 'Super Admin')) {
        return true
      }
      return this.permissions.includes(permissionName)
    },
  },
})
