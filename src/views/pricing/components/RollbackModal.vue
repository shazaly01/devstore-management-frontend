<!-- src/views/pricing/components/RollbackModal.vue -->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-xl shadow-2xl p-6 w-full max-w-lg border border-surface-border transform"
          role="dialog"
          aria-modal="true"
        >
          <!-- رأس النافذة المنبثقة -->
          <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-text-primary">التراجع عن دفعة التسعير</h3>
                <p class="text-xs text-text-muted">
                  استعادة جميع الأسعار السابقة المرتبطة بهذه الدفعة
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-ground transition-colors"
              aria-label="إغلاق"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- نموذج التراجع -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- تنبيه تحذيري -->
            <div
              class="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-400 text-xs leading-relaxed"
            >
              <span class="font-bold">تنبيه هام:</span> هذا الإجراء سيقوم بإلغاء الأسعار المطبقة
              وإعادة الأسعار القديمة لجميع أصناف هذه الدفعة تلقائياً.
            </div>

            <div>
              <AppInput
                id="rollback-batch-id"
                label="رقم دفعة التسعير *"
                v-model="form.batch_id"
                placeholder="BATCH-..."
                required
                disabled
              />
              <div v-if="validationErrors?.batch_id">
                <p
                  v-for="(error, index) in validationErrors.batch_id"
                  :key="index"
                  class="text-rose-500 text-xs mt-1 font-bold"
                >
                  {{ error }}
                </p>
              </div>
            </div>

            <div>
              <label
                for="rollback-notes"
                class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
              >
                سبب التراجع / الملاحظات
              </label>
              <textarea
                id="rollback-notes"
                rows="3"
                v-model="form.notes"
                placeholder="اكتب سبب إلغاء هذه الدفعة (مثال: خطأ في إدخال سعر الصرف)..."
                class="block w-full rounded-md shadow-sm py-2 px-3 transition-all duration-200 text-sm focus:outline-none bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:placeholder:text-text-muted"
              ></textarea>
              <div v-if="validationErrors?.notes">
                <p
                  v-for="(error, index) in validationErrors.notes"
                  :key="index"
                  class="text-rose-500 text-xs mt-1 font-bold"
                >
                  {{ error }}
                </p>
              </div>
            </div>

            <!-- أزرار التحكم -->
            <div
              class="mt-6 flex justify-end items-center gap-3 pt-4 border-t border-surface-border"
            >
              <AppButton type="button" variant="secondary" @click="close" :disabled="isSaving">
                إلغاء
              </AppButton>
              <AppButton
                type="submit"
                :disabled="isSaving || !form.batch_id"
                class="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                <span v-if="isSaving">جاري استرجاع الأسعار...</span>
                <span v-else>تأكيد التراجع الآن</span>
              </AppButton>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  batchId: { type: String, default: '' },
  isSaving: { type: Boolean, default: false },
  validationErrors: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'rollback'])

const form = ref({
  batch_id: '',
  notes: '',
})

watch(
  () => props.batchId,
  (newVal) => {
    form.value.batch_id = newVal || ''
    form.value.notes = ''
  },
  { immediate: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!form.value.batch_id) return
  emit('rollback', {
    batch_id: form.value.batch_id,
    notes: form.value.notes ? form.value.notes.trim() : null,
  })
}
</script>
