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

    <!-- مسافة فارغة لدفع المحتوى التالي إلى الطرف الآخر -->
    <div class="flex-1"></div>

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
        <!-- أيقونة الشمس عند تفعيل الوضع الداكن للتحويل إلى الوضع الفاتح -->
        <SunIcon
          v-if="themeStore.currentTheme === 'dark'"
          class="h-5 w-5 text-amber-400 transform transition-transform duration-300 rotate-0 hover:rotate-45"
        />
        <!-- أيقونة القمر عند تفعيل الوضع الفاتح للتحويل إلى الوضع الداكن -->
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
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { Bars3Icon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

defineEmits(['open-sidebar'])
const authStore = useAuthStore()
const themeStore = useThemeStore()
</script>
