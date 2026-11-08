<!--src/components/layout/TheHeader.vue-->
<template>
  <header
    class="flex h-16 items-center justify-between bg-surface-section border-b border-surface-border px-4 sm:px-6 lg:px-8 flex-shrink-0 transition-colors duration-200"
  >
    <!-- زر فتح القائمة على الشاشات الصغيرة -->
    <button
      @click="$emit('open-sidebar')"
      class="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-ground transition-colors"
      aria-label="فتح القائمة"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>

    <!-- شريط تنبيه الترخيص التفاعلي في منتصف الرأس -->
    <div class="flex-1 flex justify-center px-2">
      <!-- 1. حالة وضع القراءة فقط (انتهى الترخيص، انتهت التجربة، أو تم التلاعب بالساعة) -->
      <button
        v-if="authStore.isReadOnly"
        @click="showActivationModal = true"
        type="button"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer animate-pulse"
        title="اضغط هنا لإدخال كود التفعيل"
      >
        <LockClosedIcon class="w-4 h-4" />
        <span v-if="authStore.licenseStatus === 'trial_expired'"
          >انتهت الفترة التجريبية (14 يوماً) - اضغط للتفعيل</span
        >
        <span v-else-if="authStore.licenseStatus === 'clock_tampered'"
          >تنبيه: تراجع توقيت الجهاز - اضغط للتحقق</span
        >
        <span v-else>وضع القراءة فقط (الترخيص غير مفعل) - اضغط للتفعيل</span>
      </button>

      <!-- 2. حالة الفترة التجريبية النشطة (14 يوماً مجانية) -->
      <button
        v-else-if="authStore.licenseStatus === 'trial'"
        @click="showActivationModal = true"
        type="button"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all cursor-pointer"
        title="اضغط هنا لإدخال كود الترخيص وتفعيل النسخة الدائمة"
      >
        <SparklesIcon class="w-4 h-4" />
        <span>نسخة تجريبية: - تفعيل النسخة الكاملة</span>
      </button>

      <!-- 3. حالة التحذير عند اقتراب انتهاء الترخيص الفعال (فترة السماح) -->
      <button
        v-else-if="authStore.licenseStatus === 'grace_period'"
        @click="showActivationModal = true"
        type="button"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer"
        title="اضغط هنا لتجديد الترخيص"
      >
        <ExclamationTriangleIcon class="w-4 h-4" />
        <span>متبقي {{ authStore.daysRemaining }} يوم على انتهاء الترخيص - تجديد الآن</span>
      </button>
    </div>

    <!-- عناصر التحكم ومعلومات المستخدم -->
    <div class="flex items-center gap-3">
      <!-- زر التبديل بين الوضع الفاتح والداكن -->
      <button
        @click="themeStore.toggleTheme"
        type="button"
        class="relative p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-ground border border-surface-border/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        :title="
          themeStore.currentTheme === 'dark'
            ? 'التبديل إلى الوضع الفاتح'
            : 'التبديل إلى الوضع الداكن'
        "
        aria-label="تبديل وضع المظهر"
      >
        <SunIcon
          v-if="themeStore.currentTheme === 'dark'"
          class="h-5 w-5 text-amber-400 transform transition-transform duration-300 rotate-0 hover:rotate-45"
        />
        <MoonIcon
          v-else
          class="h-5 w-5 text-text-secondary transform transition-transform duration-300 hover:-rotate-12"
        />
      </button>

      <div class="h-6 w-[1px] bg-surface-border hidden sm:block"></div>

      <!-- معلومات المستخدم -->
      <div class="flex items-center gap-2">
        <span class="font-medium text-sm text-text-primary hidden sm:inline">
          {{ authStore.user?.full_name }}
        </span>
      </div>
    </div>

    <!-- نافذة تفعيل الترخيص المنبثقة -->
    <LicenseActivationModal v-model:isOpen="showActivationModal" />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import LicenseActivationModal from '@/components/ui/LicenseActivationModal.vue'
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  LockClosedIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

defineEmits(['open-sidebar'])
const authStore = useAuthStore()
const themeStore = useThemeStore()

const showActivationModal = ref(false)
</script>
