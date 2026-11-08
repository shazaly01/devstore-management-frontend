<!-- src/components/ui/LicenseActivationModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
  >
    <div
      class="bg-surface-section border border-surface-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-right"
      dir="rtl"
    >
      <!-- رأس النافذة -->
      <div class="flex items-center justify-between border-b border-surface-border pb-3">
        <div class="flex items-center gap-2 text-primary">
          <KeyIcon class="w-6 h-6" />
          <h3 class="text-lg font-bold text-text-primary">تفعيل ترخيص النظام</h3>
        </div>
        <button
          @click="closeModal"
          class="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-ground transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- حالة النظام الحالية -->
      <div
        :class="[
          'p-3.5 rounded-xl border text-sm leading-relaxed',
          authStore.isReadOnly
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
            : authStore.licenseStatus === 'trial'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600',
        ]"
      >
        <p class="font-medium">
          {{
            authStore.licenseMessage || 'يرجى إدخال كود الترخيص لمتابعة استخدام كامل مميزات النظام.'
          }}
        </p>
      </div>

      <!-- قسم بصمة عتاد الجهاز (Hardware ID) للنسخ السريع -->
      <div class="bg-surface-ground p-3.5 rounded-xl border border-surface-border space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-text-secondary flex items-center gap-1.5">
            <CpuChipIcon class="w-4 h-4 text-primary" />
            بصمة عتاد هذا الجهاز (Hardware ID):
          </span>
          <button
            type="button"
            @click="copyHardwareId"
            :disabled="isFetchingHardwareId || !authStore.hardwareId"
            class="text-xs font-bold px-2.5 py-1 rounded-lg bg-surface-section border border-surface-border hover:bg-primary/10 hover:text-primary disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
            :title="isCopied ? 'تم النسخ بنجاح' : 'نسخ كود الجهاز'"
          >
            <CheckIcon v-if="isCopied" class="w-3.5 h-3.5 text-emerald-500" />
            <ClipboardDocumentIcon v-else class="w-3.5 h-3.5" />
            <span>{{ isCopied ? 'تم النسخ!' : 'نسخ الكود' }}</span>
          </button>
        </div>
        <div
          class="font-mono text-sm font-bold tracking-wider text-primary text-center select-all py-1 bg-surface-section/60 rounded-lg border border-surface-border/50 flex items-center justify-center min-h-[34px]"
        >
          <span
            v-if="isFetchingHardwareId"
            class="text-xs text-text-muted flex items-center gap-1.5 font-sans"
          >
            <span
              class="animate-spin w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full"
            ></span>
            جاري قراءة بصمة العتاد...
          </span>
          <span v-else>
            {{ authStore.hardwareId || 'تعذر استخراج كود العتاد' }}
          </span>
        </div>
        <p class="text-[11px] text-text-muted">
          * قم بنسخ هذا الكود وإرساله إلى الدعم الفني لإصدار كود التفعيل المخصص لجهازك.
        </p>
      </div>

      <!-- حقل إدخال الكود -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-text-secondary"> كود التفعيل المستلم: </label>
        <textarea
          v-model="licenseKey"
          rows="3"
          placeholder="قم بلصق كود الترخيص هنا بالكامل..."
          class="w-full p-3 rounded-xl border border-surface-border bg-surface-ground text-text-primary text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all"
          :disabled="isLoading"
        ></textarea>
      </div>

      <!-- رسالة الخطأ -->
      <div
        v-if="errorMessage"
        class="text-xs text-rose-500 font-medium bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20"
      >
        {{ errorMessage }}
      </div>

      <!-- أزرار الإجراءات -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="closeModal"
          class="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-ground transition-colors"
          :disabled="isLoading"
        >
          إلغاء
        </button>
        <button
          type="button"
          @click="handleActivate"
          class="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          :disabled="isLoading || !licenseKey.trim()"
        >
          <span
            v-if="isLoading"
            class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          ></span>
          <span>{{ isLoading ? 'جاري التحقق...' : 'تفعيل الترخيص' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/services/apiClient'
import {
  KeyIcon,
  XMarkIcon,
  CpuChipIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:isOpen', 'activated'])
const authStore = useAuthStore()

const licenseKey = ref('')
const isLoading = ref(false)
const isFetchingHardwareId = ref(false)
const errorMessage = ref('')
const isCopied = ref(false)

// مراقبة فتح النافذة لضمان تحديث كود العتاد تلقائياً فوراً
watch(
  () => props.isOpen,
  async (isOpenNow) => {
    if (isOpenNow) {
      errorMessage.value = ''
      if (!authStore.hardwareId) {
        isFetchingHardwareId.value = true
        try {
          await authStore.fetchLicenseStatus()
        } finally {
          isFetchingHardwareId.value = false
        }
      }
    }
  },
  { immediate: true },
)

const copyHardwareId = async () => {
  if (!authStore.hardwareId) return

  try {
    await navigator.clipboard.writeText(authStore.hardwareId)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  } catch (err) {
    console.error('فشل النسخ إلى الحافظة:', err)
  }
}

const closeModal = () => {
  errorMessage.value = ''
  licenseKey.value = ''
  isCopied.value = false
  emit('update:isOpen', false)
}

const handleActivate = async () => {
  if (!licenseKey.value.trim()) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 1. إرسال الكود للباك إند
    await apiClient.post('/license/activate', {
      license_key: licenseKey.value.trim(),
    })

    // 2. تحديث الحالة المركزية للترخيص فورياً
    const statusResponse = await apiClient.get('/license/status')
    authStore.setLicense(statusResponse.data)

    emit('activated')
    closeModal()
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'فشل تفعيل الترخيص. تأكد من صحة الكود واكتماله.'
  } finally {
    isLoading.value = false
  }
}
</script>
